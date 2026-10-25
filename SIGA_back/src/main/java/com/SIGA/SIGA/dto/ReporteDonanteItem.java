package com.SIGA.SIGA.dto;

import java.math.BigDecimal;

public record ReporteDonanteItem(
        String donante,
        long totalDonaciones,
        BigDecimal kgAportados
) {}
