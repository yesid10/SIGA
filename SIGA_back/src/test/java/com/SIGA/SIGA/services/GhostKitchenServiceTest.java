package com.SIGA.SIGA.services;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

import com.SIGA.SIGA.dto.GhostKitchenCatalogResponse;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

public class GhostKitchenServiceTest {

    private GhostKitchenService service;

    @BeforeEach
    void setUp() {
        // Configuramos una URL no alcanzable para evaluar el comportamiento resiliente de contingencia
        service = new GhostKitchenService(
                "http://127.0.0.1:59999/api/v1/informes/",
                "dummy-token"
        );
    }

    @Test
    void obtenerCatalogo_CuandoFallaRed_RetornaCatalogoFallbackValido() {
        GhostKitchenCatalogResponse response = service.obtenerCatalogo(true);

        assertNotNull(response);
        assertFalse(response.origenEnLinea());
        assertNotNull(response.proveedor());
        assertEquals("COP", response.moneda());
        assertFalse(response.categorias().isEmpty());
        assertFalse(response.platos().isEmpty());
        assertTrue(response.totalPlatos() >= 5);
        assertTrue(response.platosDisponibles() >= 1);

        // Verificar que ningún plato tenga nombre o precio nulo
        response.platos().forEach(plato -> {
            assertNotNull(plato.nombre());
            assertNotNull(plato.precio());
            assertNotNull(plato.categoriaNombre());
        });
    }
}
