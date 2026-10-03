package com.SIGA.SIGA.model;

public record UsuarioResponse(Long id, String email, Rol rol) {
    public static UsuarioResponse from(Usuario usuario) {
        return new UsuarioResponse(usuario.getId(), usuario.getEmail(), usuario.getRol());
    }
}
