package com.SIGA.SIGA.model;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;

public record UbicacionRequest(
        @NotBlank(message = "El código de la ubicación es obligatorio")
        @Size(max = 60, message = "El código no puede exceder 60 caracteres")
        String codigo,

        @NotBlank(message = "El nombre de la ubicación es obligatorio")
        @Size(max = 120, message = "El nombre no puede exceder 120 caracteres")
        String nombre,

        @NotNull(message = "El tipo de ubicación es obligatorio (SECO o REFRIGERADO)")
        TipoUbicacion tipo,

        @Positive(message = "La capacidad máxima debe ser un valor positivo")
        Double capacidadMaxima
) {}
