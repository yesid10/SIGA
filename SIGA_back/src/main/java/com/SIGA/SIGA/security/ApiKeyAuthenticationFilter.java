package com.SIGA.SIGA.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.Arrays;
import java.util.List;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

/**
 * Filtro de autenticación Machine-to-Machine (M2M) mediante API Key (Token estático de servicio).
 * Permite que unidades de desarrollo externas consuman endpoints autorizados (e.g. productos)
 * aplicando el principio de menor privilegio (exclusivamente consultas de lectura GET).
 */
@Component
public class ApiKeyAuthenticationFilter extends OncePerRequestFilter {

    private final List<String> validApiKeys;

    public ApiKeyAuthenticationFilter(
            @Value("${siga.security.external-api-key:siga-uds-external-access-key-2026,QkwVBVttNYjyshnyoRv3z9QiP7uso5ZQD_kzadrWU6k}") String externalApiKey) {
        if (externalApiKey != null && !externalApiKey.isBlank()) {
            this.validApiKeys = Arrays.stream(externalApiKey.split(","))
                    .map(String::trim)
                    .filter(s -> !s.isBlank())
                    .toList();
        } else {
            this.validApiKeys = List.of("siga-uds-external-access-key-2026", "QkwVBVttNYjyshnyoRv3z9QiP7uso5ZQD_kzadrWU6k");
        }
    }

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain) throws ServletException, IOException {

        String requestApiKey = extractApiKey(request);

        // Si la petición no incluye cabecera de API Key, continúa el flujo normal (e.g. autenticación JWT con Bearer)
        if (requestApiKey == null) {
            filterChain.doFilter(request, response);
            return;
        }

        // Validación criptográfica en tiempo constante (protección contra Timing Attacks)
        if (!isKeyValid(requestApiKey)) {
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            response.setContentType(MediaType.APPLICATION_JSON_VALUE);
            response.setCharacterEncoding("UTF-8");
            response.getWriter().write("""
                    {
                      "error": "Unauthorized",
                      "mensaje": "X-API-KEY inválida o no autorizada para consumir servicios de SIGA"
                    }
                    """);
            return;
        }

        // Principio de menor privilegio: La API Key externa SOLO tiene permisos para operaciones de lectura
        String method = request.getMethod();
        if (!HttpMethod.GET.matches(method) && !HttpMethod.HEAD.matches(method) && !HttpMethod.OPTIONS.matches(method)) {
            response.setStatus(HttpServletResponse.SC_FORBIDDEN);
            response.setContentType(MediaType.APPLICATION_JSON_VALUE);
            response.setCharacterEncoding("UTF-8");
            response.getWriter().write("""
                    {
                      "error": "Forbidden",
                      "mensaje": "El acceso mediante API Key de integración externa está restringido exclusivamente a consultas de lectura (GET)"
                    }
                    """);
            return;
        }

        // Establecer autenticación M2M con el rol especializado ROLE_EXTERNAL_CLIENT
        UsernamePasswordAuthenticationToken authentication = new UsernamePasswordAuthenticationToken(
                "UDS_EXTERNAL_CLIENT",
                null,
                List.of(new SimpleGrantedAuthority("ROLE_EXTERNAL_CLIENT"))
        );
        authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
        SecurityContextHolder.getContext().setAuthentication(authentication);

        filterChain.doFilter(request, response);
    }

    private String extractApiKey(HttpServletRequest request) {
        String key = request.getHeader("X-API-KEY");
        if (key != null && !key.isBlank()) {
            return key.trim();
        }
        key = request.getHeader("x-api-key");
        if (key != null && !key.isBlank()) {
            return key.trim();
        }
        // Soporte para Authorization: ApiKey <token>
        String authHeader = request.getHeader("Authorization");
        if (authHeader != null && authHeader.regionMatches(true, 0, "ApiKey ", 0, 7)) {
            return authHeader.substring(7).trim();
        }
        // Soporte para Authorization: Bearer <token> (si el token coincide con la clave estática externa M2M)
        if (authHeader != null && authHeader.regionMatches(true, 0, "Bearer ", 0, 7)) {
            String candidate = authHeader.substring(7).trim();
            if (isKeyValid(candidate)) {
                return candidate;
            }
        }
        return null;
    }

    private boolean isKeyValid(String providedKey) {
        if (providedKey == null || validApiKeys.isEmpty()) {
            return false;
        }
        byte[] providedBytes = providedKey.getBytes(StandardCharsets.UTF_8);
        for (String validKey : validApiKeys) {
            byte[] validBytes = validKey.getBytes(StandardCharsets.UTF_8);
            if (MessageDigest.isEqual(providedBytes, validBytes)) {
                return true;
            }
        }
        return false;
    }
}
