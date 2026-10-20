package com.SIGA.SIGA.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.time.LocalDate;
import java.util.List;

public record DonacionRequest(
        @NotNull(message = "El donante es obligatorio")
        Long donanteId,

        @NotNull(message = "La fecha de recepción es obligatoria")
        LocalDate fechaRecepcion,

        @Size(max = 500, message = "Las observaciones no pueden exceder 500 caracteres")
        String observaciones,

        @NotEmpty(message = "La donación debe contener al menos un producto/lote")
        List<@Valid LoteItemRequest> items
) {}
