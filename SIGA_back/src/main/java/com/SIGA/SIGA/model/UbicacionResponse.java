package com.SIGA.SIGA.model;

public record UbicacionResponse(
        Long id,
        String codigo,
        String nombre,
        TipoUbicacion tipo,
        Double capacidadMaxima,
        boolean activo
) {
    public static UbicacionResponse from(Ubicacion ubicacion) {
        return new UbicacionResponse(
                ubicacion.getId(),
                ubicacion.getCodigo(),
                ubicacion.getNombre(),
                ubicacion.getTipo(),
                ubicacion.getCapacidadMaxima(),
                ubicacion.isActivo()
        );
    }
}
