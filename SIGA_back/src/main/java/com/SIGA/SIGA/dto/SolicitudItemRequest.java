package com.SIGA.SIGA.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;

public record SolicitudItemRequest(
        @NotNull(message = "El ID del producto es obligatorio")
        Long productoId,

        @NotNull(message = "La cantidad solicitada es obligatoria")
        @DecimalMin(value = "0.01", message = "La cantidad solicitada debe ser mayor a 0")
        BigDecimal cantidadSolicitada
) {}
