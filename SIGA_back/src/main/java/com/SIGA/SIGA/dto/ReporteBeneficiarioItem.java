package com.SIGA.SIGA.dto;

import java.math.BigDecimal;

public record ReporteBeneficiarioItem(
        String beneficiario,
        long totalSolicitudes,
        BigDecimal kgRecibidos
) {}
