package com.SIGA.SIGA.model;

public record LoginResponse(
        String token,
        String tipo,
        long expiraEn,
        UsuarioResponse usuario
) {}
