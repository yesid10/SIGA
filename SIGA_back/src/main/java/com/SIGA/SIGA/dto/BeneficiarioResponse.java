package com.SIGA.SIGA.dto;

import com.SIGA.SIGA.model.Beneficiario;

public record BeneficiarioResponse(
        Long id,
        String documento,
        String nombre,
        String email,
        String telefono,
        String direccion,
        int numPersonasHogar,
        Long usuarioId,
        boolean activo
) {
    public static BeneficiarioResponse from(Beneficiario b) {
        return new BeneficiarioResponse(
                b.getId(),
                b.getDocumento(),
                b.getNombre(),
                b.getEmail(),
                b.getTelefono(),
                b.getDireccion(),
                b.getNumPersonasHogar(),
                b.getUsuario() != null ? b.getUsuario().getId() : null,
                b.isActivo()
        );
    }
}
