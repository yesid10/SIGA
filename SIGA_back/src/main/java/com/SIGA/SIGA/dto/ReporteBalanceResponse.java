package com.SIGA.SIGA.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

public record ReporteBalanceResponse(
        LocalDate desde,
        LocalDate hasta,
        BigDecimal totalKgRecibidos,
        BigDecimal totalKgDistribuidos,
        BigDecimal totalKgVencidos,
        BigDecimal totalKgDisponibles,
        long totalDonaciones,
        long totalSolicitudesAtendidas,
        double tasaAprovechamiento,
        List<ReporteCategoriaItem> desgloseCategorias,
        List<ReporteDonanteItem> desgloseDonantes,
        List<ReporteBeneficiarioItem> desgloseBeneficiarios
) {}
