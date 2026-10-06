package com.SIGA.SIGA.model;

public record CategoriaResponse(
        Long id,
        String nombre,
        String descripcion,
        boolean activo
) {
    public static CategoriaResponse from(Categoria categoria) {
        return new CategoriaResponse(
                categoria.getId(),
                categoria.getNombre(),
                categoria.getDescripcion(),
                categoria.isActivo()
        );
    }
}
