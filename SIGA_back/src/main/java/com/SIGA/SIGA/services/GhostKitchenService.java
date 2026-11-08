package com.SIGA.SIGA.services;

import com.SIGA.SIGA.dto.GhostKitchenCatalogResponse;
import com.SIGA.SIGA.dto.GhostKitchenCategoriaDto;
import com.SIGA.SIGA.dto.GhostKitchenPlatoDto;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.math.BigDecimal;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Slf4j
@Service
public class GhostKitchenService {

    private final String ghostKitchenUrl;
    private final String ghostKitchenToken;
    private final ObjectMapper objectMapper;
    private final HttpClient httpClient;

    private volatile GhostKitchenCatalogResponse cachedCatalog;

    public GhostKitchenService(
            @Value("${siga.integration.ghost-kitchen.url:https://ghost-kitchen-nusq.onrender.com/api/v1/informes/}") String ghostKitchenUrl,
            @Value("${siga.integration.ghost-kitchen.token:QkwVBVttNYjyshnyoRv3z9QiP7uso5ZQD_kzadrWU6k}") String ghostKitchenToken) {
        this.ghostKitchenUrl = ghostKitchenUrl != null ? ghostKitchenUrl.trim() : "https://ghost-kitchen-nusq.onrender.com/api/v1/informes/";
        this.ghostKitchenToken = ghostKitchenToken != null ? ghostKitchenToken.trim() : "QkwVBVttNYjyshnyoRv3z9QiP7uso5ZQD_kzadrWU6k";
        this.objectMapper = new ObjectMapper();
        this.httpClient = HttpClient.newBuilder()
                .connectTimeout(Duration.ofSeconds(15))
                .followRedirects(HttpClient.Redirect.NORMAL)
                .build();
    }

    public GhostKitchenCatalogResponse obtenerCatalogo(boolean forzarRefresco) {
        if (!forzarRefresco && cachedCatalog != null) {
            // Si el cache tiene menos de 2 minutos, retornar directamente
            if (cachedCatalog.fechaSincronizacion().isAfter(LocalDateTime.now().minusMinutes(2))) {
                return cachedCatalog;
            }
        }

        try {
            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(ghostKitchenUrl))
                    .timeout(Duration.ofSeconds(25))
                    .header("Authorization", "Bearer " + ghostKitchenToken)
                    .header("Accept", "application/json")
                    .GET()
                    .build();

            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());

            if (response.statusCode() == 200 && response.body() != null && !response.body().isBlank()) {
                GhostKitchenCatalogResponse parsed = parsearRespuesta(response.body(), true);
                this.cachedCatalog = parsed;
                return parsed;
            } else {
                log.warn("Respuesta no exitosa de Ghost Kitchen: HTTP {}", response.statusCode());
            }
        } catch (Exception ex) {
            log.error("Error al consultar la API de Ghost Kitchen ({}) : {}", ghostKitchenUrl, ex.getMessage());
        }

        // Si falló la consulta remota, utilizar caché previo o fallback de contingencia
        if (cachedCatalog != null) {
            return new GhostKitchenCatalogResponse(
                    cachedCatalog.proveedor(),
                    cachedCatalog.moneda(),
                    cachedCatalog.zonaHoraria(),
                    cachedCatalog.fechaSincronizacion(),
                    cachedCatalog.totalPlatos(),
                    cachedCatalog.platosDisponibles(),
                    cachedCatalog.categorias(),
                    cachedCatalog.platos(),
                    false // Origen fuera de línea o degradado
            );
        }

        return construirCatalogoFallback();
    }

    private GhostKitchenCatalogResponse parsearRespuesta(String jsonBody, boolean enLinea) throws Exception {
        JsonNode root = objectMapper.readTree(jsonBody);

        String moneda = root.path("moneda").asText("COP");
        String zonaHoraria = root.path("zona_horaria").asText("America/Bogota");

        JsonNode inventarioNode = root.path("inventario");
        JsonNode categoriasNode = inventarioNode.path("categorias");
        JsonNode platosNode = inventarioNode.path("platos");

        Map<Long, String> categoriaMap = new HashMap<>();
        List<GhostKitchenCategoriaDto> categorias = new ArrayList<>();

        if (categoriasNode.isArray()) {
            for (JsonNode cat : categoriasNode) {
                Long id = cat.path("id").asLong();
                String nombre = cat.path("nombre").asText();
                String slug = cat.path("slug").asText();
                String descripcion = cat.path("descripcion").asText();
                int orden = cat.path("orden").asInt();
                boolean activa = cat.path("activa").asBoolean(true);

                categoriaMap.put(id, nombre);
                categorias.add(new GhostKitchenCategoriaDto(id, nombre, slug, descripcion, orden, activa));
            }
        }

        List<GhostKitchenPlatoDto> platos = new ArrayList<>();
        int disponibles = 0;

        if (platosNode.isArray()) {
            for (JsonNode p : platosNode) {
                Long id = p.path("id").asLong();
                String nombre = p.path("nombre").asText();
                String descripcion = p.path("descripcion").asText();
                Long categoriaId = p.path("categoria_id").asLong();
                String categoriaNombre = categoriaMap.getOrDefault(categoriaId, "General");
                BigDecimal precio = new BigDecimal(p.path("precio").asText("0.00"));

                String rawImagen = p.path("imagen_url").asText(null);
                String imagenUrl = normalizarUrlImagen(rawImagen);

                int cantidadDisponible = p.path("cantidad_disponible").asInt(0);
                int cantidadReservada = p.path("cantidad_reservada").asInt(0);
                boolean activo = p.path("activo").asBoolean(true);

                if (cantidadDisponible > 0 && activo) {
                    disponibles++;
                }

                platos.add(new GhostKitchenPlatoDto(
                        id,
                        nombre,
                        descripcion,
                        categoriaId,
                        categoriaNombre,
                        precio,
                        imagenUrl,
                        cantidadDisponible,
                        cantidadReservada,
                        activo
                ));
            }
        }

        return new GhostKitchenCatalogResponse(
                "Ghost Kitchen (UDS Aliada)",
                moneda,
                zonaHoraria,
                LocalDateTime.now(),
                platos.size(),
                disponibles,
                categorias,
                platos,
                enLinea
        );
    }

    private String normalizarUrlImagen(String rawUrl) {
        if (rawUrl == null || rawUrl.isBlank()) {
            return null;
        }
        if (rawUrl.startsWith("http://") || rawUrl.startsWith("https://")) {
            return rawUrl;
        }
        String base = ghostKitchenUrl.replaceAll("/api/.*", "");
        if (!rawUrl.startsWith("/")) {
            rawUrl = "/" + rawUrl;
        }
        return base + rawUrl;
    }

    private GhostKitchenCatalogResponse construirCatalogoFallback() {
        List<GhostKitchenCategoriaDto> categorias = List.of(
                new GhostKitchenCategoriaDto(1L, "Hamburguesas", "hamburguesas", "Hamburguesas artesanales", 1, true),
                new GhostKitchenCategoriaDto(2L, "Parrilla", "parrilla", "Cortes y asados a la brasa", 2, true),
                new GhostKitchenCategoriaDto(3L, "Bowls", "bowls", "Platos saludables y teriyaki", 3, true),
                new GhostKitchenCategoriaDto(4L, "Pastas", "pastas", "Pastas frescas italianas", 4, true),
                new GhostKitchenCategoriaDto(5L, "Bebidas", "bebidas", "Bebidas naturales y refrescantes", 5, true)
        );

        List<GhostKitchenPlatoDto> platos = List.of(
                new GhostKitchenPlatoDto(1L, "Burger de la casa", "Hamburguesa artesanal con queso madurado y papas rústicas.", 1L, "Hamburguesas", new BigDecimal("12345.00"), "https://ghost-kitchen-nusq.onrender.com/media/platos/demo/burger.webp", 16, 0, true),
                new GhostKitchenPlatoDto(2L, "Parrillada para compartir", "Parrillada para compartir: res, cerdo, pollo y chorizo.", 2L, "Parrilla", new BigDecimal("98765.00"), "https://ghost-kitchen-nusq.onrender.com/media/platos/demo/grill.webp", 10, 0, true),
                new GhostKitchenPlatoDto(3L, "Bowl teriyaki", "Bowl de pollo teriyaki con arroz jazmín y vegetales salteados.", 3L, "Bowls", new BigDecimal("24691.00"), "https://ghost-kitchen-nusq.onrender.com/media/platos/demo/bowl.webp", 0, 0, true),
                new GhostKitchenPlatoDto(4L, "Pasta al pesto", "Pasta al pesto con tomates cherry y parmesano.", 4L, "Pastas", new BigDecimal("18500.00"), "https://ghost-kitchen-nusq.onrender.com/media/platos/demo/pasta.webp", 0, 2, true),
                new GhostKitchenPlatoDto(5L, "Limonada de coco", "Limonada de coco natural (500 ml).", 5L, "Bebidas", new BigDecimal("9900.00"), "https://ghost-kitchen-nusq.onrender.com/media/platos/demo/lemonade.webp", 28, 0, true)
        );

        return new GhostKitchenCatalogResponse(
                "Ghost Kitchen (UDS Aliada - Modo Contingencia)",
                "COP",
                "America/Bogota",
                LocalDateTime.now(),
                platos.size(),
                3,
                categorias,
                platos,
                false
        );
    }
}
