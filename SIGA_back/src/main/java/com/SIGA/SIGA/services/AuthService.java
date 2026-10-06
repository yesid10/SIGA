package com.SIGA.SIGA.services;

import com.SIGA.SIGA.exception.EmailAlreadyExistsException;
import com.SIGA.SIGA.model.LoginRequest;
import com.SIGA.SIGA.model.LoginResponse;
import com.SIGA.SIGA.model.RegisterRequest;
import com.SIGA.SIGA.model.Rol;
import com.SIGA.SIGA.model.Usuario;
import com.SIGA.SIGA.model.UsuarioResponse;
import com.SIGA.SIGA.repository.UsuarioRepository;
import com.SIGA.SIGA.security.JwtService;
import java.util.Locale;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final AuthenticationManager authenticationManager;
    private final UsuarioRepository usuarioRepository;
    private final JwtService jwtService;
    private final PasswordEncoder passwordEncoder;

    public LoginResponse login(LoginRequest request) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.email(), request.password()));

        UserDetails userDetails = (UserDetails) authentication.getPrincipal();
        Usuario usuario = usuarioRepository.findByEmailIgnoreCase(userDetails.getUsername())
                .orElseThrow(() -> new IllegalStateException("Usuario autenticado no encontrado"));

        return new LoginResponse(
                jwtService.generateToken(userDetails),
                "Bearer",
                jwtService.getExpirationMs(),
                UsuarioResponse.from(usuario));
    }

    @Transactional
    public LoginResponse register(RegisterRequest request) {
        String email = request.email().trim().toLowerCase(Locale.ROOT);
        if (usuarioRepository.existsByEmailIgnoreCase(email)) {
            throw new EmailAlreadyExistsException("Ya existe una cuenta registrada con este correo electrónico.");
        }

        Usuario usuario = new Usuario();
        usuario.setNombre(request.nombre().trim());
        usuario.setEmail(email);
        usuario.setPassword(passwordEncoder.encode(request.password()));
        usuario.setRol(Rol.BENEFICIARIO);
        usuario.setActivo(true);

        Usuario saved = usuarioRepository.save(usuario);

        UserDetails userDetails = User.withUsername(saved.getEmail())
                .password(saved.getPassword())
                .authorities(new SimpleGrantedAuthority("ROLE_" + saved.getRol().name()))
                .build();

        return new LoginResponse(
                jwtService.generateToken(userDetails),
                "Bearer",
                jwtService.getExpirationMs(),
                UsuarioResponse.from(saved));
    }
}
