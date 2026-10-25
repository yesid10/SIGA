package com.SIGA.SIGA.dto;

import java.math.BigDecimal;

public record AlertaResumen(
        Long loteId,
        String numeroLote,
        String productoNombre,
        String categoriaNombre,
        String ubicacionNombre,
        BigDecimal cantidadDisponible,
        String unidadMedida,
        boolean esPerecedero,
        String fechaVencimiento,
        long diasRestantes,
        String urgencia
) {}
