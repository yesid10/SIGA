package com.SIGA.SIGA.dto;

import com.SIGA.SIGA.model.EstadoLote;
import com.SIGA.SIGA.model.Lote;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;

public record LoteResponse(
        Long id,
        String numeroLote,
        Long productoId,
        String productoNombre,
        String categoriaNombre,
        boolean esPerecedero,
        BigDecimal cantidadInicial,
        BigDecimal cantidadDisponible,
        String unidadMedida,
        LocalDate fechaIngreso,
        LocalDate fechaVencimiento,
        long diasRestantes,
        EstadoLote estado,
        Long ubicacionId,
        String ubicacionCodigo,
        String ubicacionNombre,
        Long donanteId,
        String donanteNombre
) {
    public static LoteResponse from(Lote lote) {
        long dias = ChronoUnit.DAYS.between(LocalDate.now(), lote.getFechaVencimiento());

        EstadoLote estadoCalculado = lote.getEstado();
        if (dias < 0) {
            estadoCalculado = EstadoLote.VENCIDO;
        } else if (dias <= 30 && estadoCalculado == EstadoLote.DISPONIBLE) {
            estadoCalculado = EstadoLote.PROXIMO_A_VENCER;
        }

        return new LoteResponse(
                lote.getId(),
                lote.getNumeroLote(),
                lote.getProducto().getId(),
                lote.getProducto().getNombre(),
                lote.getProducto().getCategoria() != null ? lote.getProducto().getCategoria().getNombre() : null,
                lote.getProducto().isEsPerecedero(),
                lote.getCantidadInicial(),
                lote.getCantidadDisponible(),
                lote.getUnidadMedida(),
                lote.getFechaIngreso(),
                lote.getFechaVencimiento(),
                dias,
                estadoCalculado,
                lote.getUbicacion() != null ? lote.getUbicacion().getId() : null,
                lote.getUbicacion() != null ? lote.getUbicacion().getCodigo() : null,
                lote.getUbicacion() != null ? lote.getUbicacion().getNombre() : null,
                lote.getDonacion() != null && lote.getDonacion().getDonante() != null ? lote.getDonacion().getDonante().getId() : null,
                lote.getDonacion() != null && lote.getDonacion().getDonante() != null ? lote.getDonacion().getDonante().getNombre() : null
        );
    }
}
