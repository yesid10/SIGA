package com.SIGA.SIGA.config;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI customOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("SIGA - Sistema Inteligente de Gestión de Alimentos API")
                        .version("1.0.0")
                        .description("""
                                API RESTful para la administración de Bancos de Alimentos, control de inventario FEFO,
                                recepción de donaciones, gestión de beneficiarios e integración M2M con otras unidades de desarrollo (ej. Ghost Kitchen).
                                """)
                        .contact(new Contact()
                                .name("Equipo de Desarrollo SIGA")
                                .email("soporte@siga.local"))
                        .license(new License()
                                .name("UDS 5 - Ingeniería de Software II")
                                .url("https://www.udistrital.edu.co")))
                .components(new Components()
                        // 1. Esquema JWT para usuarios interactivos
                        .addSecuritySchemes("BearerAuth", new SecurityScheme()
                                .name("BearerAuth")
                                .type(SecurityScheme.Type.HTTP)
                                .scheme("bearer")
                                .bearerFormat("JWT")
                                .description("Ingrese el token JWT obtenido en /api/v1/auth/login"))
                        // 2. Esquema API Key para la unidad externa (Ghost Kitchen)
                        .addSecuritySchemes("ApiKeyAuth", new SecurityScheme()
                                .name("X-API-KEY")
                                .type(SecurityScheme.Type.APIKEY)
                                .in(SecurityScheme.In.HEADER)
                                .description("Token estático de servicio para integración externa M2M (Ghost Kitchen). Por defecto: siga-uds-external-access-key-2026")))
                .addSecurityItem(new SecurityRequirement().addList("BearerAuth"))
                .addSecurityItem(new SecurityRequirement().addList("ApiKeyAuth"));
    }
}
