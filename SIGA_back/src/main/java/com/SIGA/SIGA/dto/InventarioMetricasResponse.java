package com.SIGA.SIGA.dto;

import java.util.List;

public record InventarioMetricasResponse(
        long productosDisponibles,
        long lotesRegistrados,
        long proximosAVencer,
        long donacionesRegistradas,
        long alertasVencimiento,
        List<CategoriaEstadistica> productosPorCategoria,
        EstadoLotesEstadistica estadoLotes,
        List<DonacionPorTipoEstadistica> donacionesPorTipo,
        LotesPorTiempoEstadistica lotesPorTiempo,
        List<DonacionResponse> ultimasDonaciones,
        List<AlertaResumen> alertasRecientes
) {}
