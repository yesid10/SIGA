package com.SIGA.SIGA.dto;

public record AlertaResumen(
        Long loteId,
        String numeroLote,
        String productoNombre,
        String fechaVencimiento,
        long diasRestantes,
        String urgencia
) {}
