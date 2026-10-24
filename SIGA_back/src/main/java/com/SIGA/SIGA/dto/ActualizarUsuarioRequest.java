package com.SIGA.SIGA.dto;

import com.SIGA.SIGA.model.Rol;
import jakarta.validation.constraints.Size;

public record ActualizarUsuarioRequest(
        @Size(max = 160, message = "El nombre no puede exceder 160 caracteres")
        String nombre,

        Rol rol,

        Boolean activo,

        @Size(max = 500, message = "La URL de la foto no puede exceder 500 caracteres")
        String fotoUrl
) {}
