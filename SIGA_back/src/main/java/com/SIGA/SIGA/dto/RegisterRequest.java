package com.SIGA.SIGA.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record RegisterRequest(
        @NotBlank(message = "El nombre es obligatorio")
        @Size(min = 2, max = 160, message = "El nombre debe tener entre 2 y 160 caracteres")
        String nombre,

        @NotBlank(message = "El correo electrónico es obligatorio")
        @Email(message = "El formato del correo electrónico no es válido")
        @Size(max = 120, message = "El correo no puede exceder 120 caracteres")
        String email,

        @NotBlank(message = "La contraseña es obligatoria")
        @Size(min = 8, max = 100, message = "La contraseña debe tener al menos 8 caracteres")
        String password
) {}
