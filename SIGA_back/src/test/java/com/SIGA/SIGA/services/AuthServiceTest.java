package com.SIGA.SIGA.services;

import com.SIGA.SIGA.exception.EmailAlreadyExistsException;
import com.SIGA.SIGA.dto.LoginResponse;
import com.SIGA.SIGA.dto.RegisterRequest;
import com.SIGA.SIGA.model.Rol;
import com.SIGA.SIGA.model.Usuario;
import com.SIGA.SIGA.repository.UsuarioRepository;
import com.SIGA.SIGA.security.JwtService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private AuthenticationManager authenticationManager;

    @Mock
    private UsuarioRepository usuarioRepository;

    @Mock
    private JwtService jwtService;

    @Mock
    private PasswordEncoder passwordEncoder;

    private AuthService authService;

    @BeforeEach
    void setUp() {
        authService = new AuthService(authenticationManager, usuarioRepository, jwtService, passwordEncoder);
    }

    @Test
    void register_Exito() {
        RegisterRequest request = new RegisterRequest("Carlos Gómez", "carlos@example.com", "Password123!");

        when(usuarioRepository.existsByEmailIgnoreCase("carlos@example.com")).thenReturn(false);
        when(passwordEncoder.encode("Password123!")).thenReturn("hashedPassword");
        when(usuarioRepository.save(any(Usuario.class))).thenAnswer(invocation -> {
            Usuario u = invocation.getArgument(0);
            u.setId(10L);
            return u;
        });
        when(jwtService.generateToken(any(UserDetails.class))).thenReturn("fake-jwt-token");
        when(jwtService.getExpirationMs()).thenReturn(3600000L);

        LoginResponse response = authService.register(request);

        assertNotNull(response);
        assertEquals("fake-jwt-token", response.token());
        assertEquals("Bearer", response.tipo());
        assertEquals(3600000L, response.expiraEn());
        assertNotNull(response.usuario());
        assertEquals(10L, response.usuario().id());
        assertEquals("carlos@example.com", response.usuario().email());
        assertEquals("Carlos Gómez", response.usuario().nombre());
        assertEquals(Rol.BENEFICIARIO, response.usuario().rol());

        ArgumentCaptor<Usuario> captor = ArgumentCaptor.forClass(Usuario.class);
        verify(usuarioRepository).save(captor.capture());
        Usuario savedUser = captor.getValue();
        assertEquals("Carlos Gómez", savedUser.getNombre());
        assertEquals("carlos@example.com", savedUser.getEmail());
        assertEquals("hashedPassword", savedUser.getPassword());
        assertEquals(Rol.BENEFICIARIO, savedUser.getRol());
        assertTrue(savedUser.isActivo());
    }

    @Test
    void register_EmailDuplicado_LanzaExcepcion() {
        RegisterRequest request = new RegisterRequest("Carlos Gómez", "carlos@example.com", "Password123!");

        when(usuarioRepository.existsByEmailIgnoreCase("carlos@example.com")).thenReturn(true);

        assertThrows(EmailAlreadyExistsException.class, () -> authService.register(request));
        verify(usuarioRepository, never()).save(any(Usuario.class));
    }
}
