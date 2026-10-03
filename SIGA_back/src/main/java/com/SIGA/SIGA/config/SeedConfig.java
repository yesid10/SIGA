package com.SIGA.SIGA.config;

import com.SIGA.SIGA.model.Rol;
import com.SIGA.SIGA.model.Usuario;
import com.SIGA.SIGA.repository.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
@RequiredArgsConstructor
public class SeedConfig {

    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${siga.seed.admin-email}")
    private String adminEmail;

    @Value("${siga.seed.admin-password}")
    private String adminPassword;

    @Bean
    CommandLineRunner seedAdminUser() {
        return args -> {
            if (!usuarioRepository.existsByEmailIgnoreCase(adminEmail)) {
                Usuario admin = new Usuario();
                admin.setEmail(adminEmail.toLowerCase());
                admin.setPassword(passwordEncoder.encode(adminPassword));
                admin.setRol(Rol.ADMINISTRADOR);
                admin.setActivo(true);
                usuarioRepository.save(admin);
            }
        };
    }
}
