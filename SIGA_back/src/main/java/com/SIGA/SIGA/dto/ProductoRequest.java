package com.SIGA.SIGA.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record ProductoRequest(
        @NotBlank(message = "El nombre del producto es obligatorio")
        @Size(max = 120, message = "El nombre no puede exceder 120 caracteres")
        String nombre,

        @Size(max = 255, message = "La descripción no puede exceder 255 caracteres")
        String descripcion,

        @NotNull(message = "El ID de la categoría es obligatorio")
        Long categoriaId,

        @NotNull(message = "Debe especificar si el producto es perecedero o no")
        Boolean esPerecedero,

        @NotBlank(message = "La unidad de medida es obligatoria")
        @Size(max = 30, message = "La unidad de medida no puede exceder 30 caracteres")
        String unidadMedida
) {}
