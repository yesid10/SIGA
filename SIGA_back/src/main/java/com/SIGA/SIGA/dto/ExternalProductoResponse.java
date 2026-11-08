package com.SIGA.SIGA.dto;

import java.math.BigDecimal;

/**
 * DTO para la integración M2M con unidades de desarrollo externas (ej. Ghost Kitchen).
 * Expone la información del producto junto con su stock real vigente disponible para despacho.
 */
public record ExternalProductoResponse(
        Long id,
        String nombre,
        String descripcion,
        String categoria,
        boolean esPerecedero,
        String unidadMedida,
        BigDecimal stockDisponibleTotal,
        String imagenUrl,
        boolean disponibleParaSolicitud
) {
}
