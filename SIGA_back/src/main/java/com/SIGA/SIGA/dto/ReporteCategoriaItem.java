package com.SIGA.SIGA.dto;

import java.math.BigDecimal;

public record ReporteCategoriaItem(
        String categoria,
        BigDecimal kgRecibidos,
        BigDecimal kgDistribuidos,
        BigDecimal kgVencidos
) {}
