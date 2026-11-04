package com.SIGA.SIGA.services;

import com.SIGA.SIGA.dto.LoginResponse;
import com.SIGA.SIGA.dto.UsuarioResponse;
import com.SIGA.SIGA.model.Rol;
import com.SIGA.SIGA.model.Usuario;
import com.SIGA.SIGA.repository.UsuarioRepository;
import com.SIGA.SIGA.security.JwtService;
import com.google.firebase.auth.FirebaseAuth;
import com.google.firebase.auth.FirebaseAuthException;
import com.google.firebase.FirebaseApp;
import com.google.firebase.auth.FirebaseToken;
import java.util.Locale;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Service
@RequiredArgsConstructor
public class FirebaseAuthService {

    private static final Logger logger = LoggerFactory.getLogger(FirebaseAuthService.class);

    private final UsuarioRepository usuarioRepository;
    private final JwtService jwtService;

    @Transactional
    public LoginResponse exchangeToken(String idToken) {
        if (FirebaseApp.getApps().isEmpty()) {
            throw new IllegalStateException("Firebase Admin no está configurado. Agrega FIREBASE_SERVICE_ACCOUNT_JSON_BASE64 y reinicia el backend.");
        }
        try {
            FirebaseToken firebaseToken = FirebaseAuth.getInstance().verifyIdToken(idToken);
            String email = firebaseToken.getEmail();
            if (email == null || email.isBlank() || !Boolean.TRUE.equals(firebaseToken.isEmailVerified())) {
                throw new IllegalArgumentException("El correo debe estar verificado en Firebase");
            }

            Usuario usuario = usuarioRepository.findByFirebaseUid(firebaseToken.getUid())
                    .orElseGet(() -> usuarioRepository.findByEmailIgnoreCase(email).orElseGet(Usuario::new));
            usuario.setFirebaseUid(firebaseToken.getUid());
            usuario.setEmail(email.toLowerCase(Locale.ROOT));
            usuario.setNombre((String) firebaseToken.getClaims().getOrDefault("name", ""));
            usuario.setRol(usuario.getRol() == null ? Rol.BENEFICIARIO : usuario.getRol());
            usuario.setActivo(true);
            Usuario saved = usuarioRepository.save(usuario);

            UserDetails userDetails = User.withUsername(saved.getEmail())
                    .password("")
                    .authorities(new SimpleGrantedAuthority("ROLE_" + saved.getRol().name()))
                    .build();
            return new LoginResponse(jwtService.generateToken(userDetails), "Bearer", jwtService.getExpirationMs(), UsuarioResponse.from(saved));
        } catch (Exception exception) {
            if (exception instanceof FirebaseAuthException firebaseException) {
                logger.warn("Firebase rechazó el ID Token. Código: {}, mensaje: {}",
                        firebaseException.getErrorCode(), firebaseException.getMessage(), firebaseException);
                throw new IllegalArgumentException("Firebase ID Token inválido o no verificable", exception);
            } else if (exception instanceof IllegalArgumentException) {
                logger.warn("El usuario Firebase no puede iniciar sesión: {}", exception.getMessage());
                throw (IllegalArgumentException) exception;
            } else {
                logger.warn("No fue posible intercambiar el Firebase ID Token: {}", exception.getMessage(), exception);
                throw new IllegalArgumentException("Firebase ID Token inválido o no verificable", exception);
            }
        }
    }
}
