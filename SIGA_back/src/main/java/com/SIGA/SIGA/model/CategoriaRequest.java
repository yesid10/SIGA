package com.SIGA.SIGA.model;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record CategoriaRequest(
        @NotBlank(message = "El nombre de la categoría es obligatorio")
        @Size(max = 80, message = "El nombre no puede exceder 80 caracteres")
        String nombre,

        @Size(max = 255, message = "La descripción no puede exceder 255 caracteres")
        String descripcion
) {}
