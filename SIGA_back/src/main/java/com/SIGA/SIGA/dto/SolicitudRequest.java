package com.SIGA.SIGA.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.util.List;

public record SolicitudRequest(
        @NotNull(message = "El beneficiario es obligatorio")
        Long beneficiarioId,

        @Size(max = 500, message = "Las observaciones no pueden exceder 500 caracteres")
        String observaciones,

        @NotEmpty(message = "La solicitud debe incluir al menos un producto")
        @Valid
        List<SolicitudItemRequest> items
) {}
