package com.SIGA.SIGA.dto;

import com.SIGA.SIGA.model.TipoDonante;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record DonanteRequest(
        @NotBlank(message = "El número de identificación (cédula o NIT) es obligatorio")
        @Size(max = 30, message = "La identificación no puede exceder 30 caracteres")
        String identificacion,

        @NotBlank(message = "El nombre o razón social es obligatorio")
        @Size(max = 160, message = "El nombre no puede exceder 160 caracteres")
        String nombre,

        @NotNull(message = "El tipo de donante es obligatorio (PERSONA_NATURAL o EMPRESA)")
        TipoDonante tipo,

        @Email(message = "El formato de correo no es válido")
        @Size(max = 120, message = "El correo no puede exceder 120 caracteres")
        String email,

        @Size(max = 30, message = "El teléfono no puede exceder 30 caracteres")
        String telefono,

        @Size(max = 255, message = "La dirección no puede exceder 255 caracteres")
        String direccion
) {}
