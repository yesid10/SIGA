package com.SIGA.SIGA.dto;

import com.SIGA.SIGA.model.DetalleSolicitud;
import java.math.BigDecimal;

public record DetalleSolicitudResponse(
        Long id,
        Long productoId,
        String productoNombre,
        String categoriaNombre,
        String unidadMedida,
        boolean esPerecedero,
        BigDecimal cantidadSolicitada,
        BigDecimal cantidadAsignada
) {
    public static DetalleSolicitudResponse from(DetalleSolicitud d) {
        return new DetalleSolicitudResponse(
                d.getId(),
                d.getProducto().getId(),
                d.getProducto().getNombre(),
                d.getProducto().getCategoria() != null ? d.getProducto().getCategoria().getNombre() : null,
                d.getProducto().getUnidadMedida(),
                d.getProducto().isEsPerecedero(),
                d.getCantidadSolicitada(),
                d.getCantidadAsignada()
        );
    }
}
