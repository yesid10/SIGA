package com.SIGA.SIGA.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.math.BigDecimal;
import java.time.LocalDate;

public record LoteItemRequest(
        @NotNull(message = "El ID del producto es obligatorio")
        Long productoId,

        @NotBlank(message = "El número de lote es obligatorio")
        @Size(max = 60, message = "El número de lote no puede exceder 60 caracteres")
        String numeroLote,

        @NotNull(message = "La cantidad es obligatoria")
        @DecimalMin(value = "0.01", message = "La cantidad debe ser mayor a cero")
        BigDecimal cantidad,

        @NotBlank(message = "La unidad de medida es obligatoria")
        @Size(max = 30, message = "La unidad de medida no puede exceder 30 caracteres")
        String unidadMedida,

        @NotNull(message = "La fecha de vencimiento es obligatoria")
        LocalDate fechaVencimiento,

        Long ubicacionId
) {}
