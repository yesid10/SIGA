package com.SIGA.SIGA.dto;

import java.math.BigDecimal;

public record GhostKitchenPlatoDto(
        Long id,
        String nombre,
        String descripcion,
        Long categoriaId,
        String categoriaNombre,
        BigDecimal precio,
        String imagenUrl,
        Integer cantidadDisponible,
        Integer cantidadReservada,
        boolean activo
) {}
