package com.SIGA.SIGA.dto;

public record GhostKitchenCategoriaDto(
        Long id,
        String nombre,
        String slug,
        String descripcion,
        Integer orden,
        boolean activa
) {}
