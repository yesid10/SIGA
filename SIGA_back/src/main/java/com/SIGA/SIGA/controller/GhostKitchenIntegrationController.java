package com.SIGA.SIGA.controller;

import com.SIGA.SIGA.dto.GhostKitchenCatalogResponse;
import com.SIGA.SIGA.services.GhostKitchenService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/integracion/ghost-kitchen")
@RequiredArgsConstructor
@Tag(name = "Integración UDS: Ghost Kitchen", description = "Endpoints BFF para consumo e inspección del catálogo de platos provistos por la unidad externa Ghost Kitchen")
public class GhostKitchenIntegrationController {

    private final GhostKitchenService ghostKitchenService;

    @GetMapping({"/productos", "/productos/", "/catalogo", "/catalogo/"})
    @Operation(
            summary = "Obtener catálogo de platos y productos de Ghost Kitchen",
            description = "Consulta server-to-server el inventario de Ghost Kitchen, normalizando categorías, precios en COP y stock disponible para ser renderizado en el frontend."
    )
    public ResponseEntity<GhostKitchenCatalogResponse> obtenerCatalogo(
            @RequestParam(defaultValue = "false") boolean refrescar) {
        GhostKitchenCatalogResponse catalogo = ghostKitchenService.obtenerCatalogo(refrescar);
        return ResponseEntity.ok(catalogo);
    }
}
