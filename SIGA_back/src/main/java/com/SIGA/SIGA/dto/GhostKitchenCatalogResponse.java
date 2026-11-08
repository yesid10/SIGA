package com.SIGA.SIGA.dto;

import java.time.LocalDateTime;
import java.util.List;

public record GhostKitchenCatalogResponse(
        String proveedor,
        String moneda,
        String zonaHoraria,
        LocalDateTime fechaSincronizacion,
        int totalPlatos,
        int platosDisponibles,
        List<GhostKitchenCategoriaDto> categorias,
        List<GhostKitchenPlatoDto> platos,
        boolean origenEnLinea
) {}
