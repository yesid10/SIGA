package com.SIGA.SIGA.dto;

import com.SIGA.SIGA.model.Rol;
import com.SIGA.SIGA.model.Usuario;

public record UsuarioResponse(Long id, String email, String nombre, Rol rol) {
    public static UsuarioResponse from(Usuario usuario) {
        return new UsuarioResponse(usuario.getId(), usuario.getEmail(), usuario.getNombre(), usuario.getRol());
    }
}
