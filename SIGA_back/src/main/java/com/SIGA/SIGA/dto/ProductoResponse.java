package com.SIGA.SIGA.dto;

import com.SIGA.SIGA.model.Producto;

public record ProductoResponse(
        Long id,
        String nombre,
        String descripcion,
        Long categoriaId,
        String categoriaNombre,
        boolean esPerecedero,
        String unidadMedida,
        boolean activo
) {
    public static ProductoResponse from(Producto producto) {
        return new ProductoResponse(
                producto.getId(),
                producto.getNombre(),
                producto.getDescripcion(),
                producto.getCategoria() != null ? producto.getCategoria().getId() : null,
                producto.getCategoria() != null ? producto.getCategoria().getNombre() : null,
                producto.isEsPerecedero(),
                producto.getUnidadMedida(),
                producto.isActivo()
        );
    }
}
