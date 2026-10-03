package com.SIGA.SIGA.services;

import com.SIGA.SIGA.model.LoginRequest;
import com.SIGA.SIGA.model.LoginResponse;
import com.SIGA.SIGA.model.Usuario;
import com.SIGA.SIGA.model.UsuarioResponse;
import com.SIGA.SIGA.repository.UsuarioRepository;
import com.SIGA.SIGA.security.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final AuthenticationManager authenticationManager;
    private final UsuarioRepository usuarioRepository;
    private final JwtService jwtService;

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
}
