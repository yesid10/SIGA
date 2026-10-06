package com.SIGA.SIGA.model;

public record DonanteResponse(
        Long id,
        String identificacion,
        String nombre,
        TipoDonante tipo,
        String email,
        String telefono,
        String direccion,
        boolean activo
) {
    public static DonanteResponse from(Donante donante) {
        return new DonanteResponse(
                donante.getId(),
                donante.getIdentificacion(),
                donante.getNombre(),
                donante.getTipo(),
                donante.getEmail(),
                donante.getTelefono(),
                donante.getDireccion(),
                donante.isActivo()
        );
    }
}
