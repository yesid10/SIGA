package com.SIGA.SIGA.dto;

import com.SIGA.SIGA.model.Donacion;
import com.SIGA.SIGA.model.EstadoDonacion;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

public record DonacionResponse(
        Long id,
        Long donanteId,
        String donanteNombre,
        String donanteIdentificacion,
        String usuarioResponsableEmail,
        LocalDate fechaRecepcion,
        String observaciones,
        EstadoDonacion estado,
        List<LoteResponse> items,
        int totalProductos,
        BigDecimal totalCantidad,
        LocalDateTime createdAt
) {
    public static DonacionResponse from(Donacion donacion) {
        List<LoteResponse> lotes = donacion.getLotes() != null
                ? donacion.getLotes().stream().map(LoteResponse::from).toList()
                : List.of();

        BigDecimal sumaCantidad = lotes.stream()
                .map(LoteResponse::cantidadInicial)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        return new DonacionResponse(
                donacion.getId(),
                donacion.getDonante().getId(),
                donacion.getDonante().getNombre(),
                donacion.getDonante().getIdentificacion(),
                donacion.getUsuarioResponsable() != null ? donacion.getUsuarioResponsable().getEmail() : null,
                donacion.getFechaRecepcion(),
                donacion.getObservaciones(),
                donacion.getEstado(),
                lotes,
                lotes.size(),
                sumaCantidad,
                donacion.getCreatedAt()
        );
    }
}
