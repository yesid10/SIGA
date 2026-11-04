package com.SIGA.SIGA.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record BeneficiarioRequest(
        @NotBlank(message = "El documento es obligatorio")
        @Size(max = 30, message = "El documento no puede exceder 30 caracteres")
        String documento,

        @NotBlank(message = "El nombre es obligatorio")
        @Size(max = 160, message = "El nombre no puede exceder 160 caracteres")
        String nombre,

        @Size(max = 120, message = "El correo no puede exceder 120 caracteres")
        String email,

        @Size(max = 30, message = "El teléfono no puede exceder 30 caracteres")
        String telefono,

        @Size(max = 200, message = "La dirección no puede exceder 200 caracteres")
        String direccion,

        @NotNull(message = "El número de personas en el hogar es obligatorio")
        @Min(value = 1, message = "El núcleo del hogar debe ser de al menos 1 persona")
        Integer numPersonasHogar,

        Long usuarioId
) {}
