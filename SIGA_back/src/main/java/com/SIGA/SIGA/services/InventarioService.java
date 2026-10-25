package com.SIGA.SIGA.services;

import com.SIGA.SIGA.dto.AlertaResumen;
import com.SIGA.SIGA.dto.CategoriaEstadistica;
import com.SIGA.SIGA.dto.DonacionPorTipoEstadistica;
import com.SIGA.SIGA.dto.DonacionResponse;
import com.SIGA.SIGA.dto.EstadoLotesEstadistica;
import com.SIGA.SIGA.dto.InventarioMetricasResponse;
import com.SIGA.SIGA.dto.LoteResponse;
import com.SIGA.SIGA.dto.LotesPorTiempoEstadistica;
import com.SIGA.SIGA.model.EstadoLote;
import com.SIGA.SIGA.model.Lote;
import com.SIGA.SIGA.repository.DonacionRepository;
import com.SIGA.SIGA.repository.LoteRepository;
import com.SIGA.SIGA.repository.ProductoRepository;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class InventarioService {

    private final LoteRepository loteRepository;
    private final DonacionRepository donacionRepository;
    private final ProductoRepository productoRepository;

    @Transactional(readOnly = true)
    public InventarioMetricasResponse obtenerMetricas() {
        List<Lote> todosLotes = loteRepository.findAllByOrderByFechaVencimientoAsc();
        LocalDate hoy = LocalDate.now();

        // 1. Productos con existencias disponibles
        long productosDisponibles = todosLotes.stream()
                .filter(l -> l.getCantidadDisponible().compareTo(BigDecimal.ZERO) > 0)
                .map(l -> l.getProducto().getId())
                .distinct()
                .count();

        // 2. Lotes activos en bodega
        long lotesRegistrados = todosLotes.stream()
                .filter(l -> l.getCantidadDisponible().compareTo(BigDecimal.ZERO) > 0)
                .count();

        // 3. Próximos a vencer (30 días o menos)
        long proximosAVencer = todosLotes.stream()
                .filter(l -> l.getCantidadDisponible().compareTo(BigDecimal.ZERO) > 0)
                .filter(l -> {
                    long dias = ChronoUnit.DAYS.between(hoy, l.getFechaVencimiento());
                    return dias >= 0 && dias <= 30;
                })
                .count();

        // 4. Donaciones registradas
        long donacionesRegistradas = donacionRepository.count();

        // 5. Alertas de vencimiento activas (requieren atención <= 7 días o vencidos con stock)
        long alertasVencimiento = todosLotes.stream()
                .filter(l -> l.getCantidadDisponible().compareTo(BigDecimal.ZERO) > 0)
                .filter(l -> ChronoUnit.DAYS.between(hoy, l.getFechaVencimiento()) <= 7)
                .count();

        // 6. Productos por categoría
        Map<String, Long> agrupadosPorCat = todosLotes.stream()
                .collect(Collectors.groupingBy(
                        l -> l.getProducto().getCategoria() != null ? l.getProducto().getCategoria().getNombre() : "Otros",
                        Collectors.counting()
                ));

        long totalLotesParaPorcentaje = todosLotes.isEmpty() ? 1 : todosLotes.size();
        List<CategoriaEstadistica> productosPorCategoria = agrupadosPorCat.entrySet().stream()
                .map(entry -> new CategoriaEstadistica(
                        entry.getKey(),
                        entry.getValue(),
                        Math.round((entry.getValue() * 100.0 / totalLotesParaPorcentaje) * 10.0) / 10.0
                ))
                .sorted(Comparator.comparing(CategoriaEstadistica::cantidad).reversed())
                .toList();

        // 7. Estado de los lotes
        long disponiblesCount = todosLotes.stream()
                .filter(l -> ChronoUnit.DAYS.between(hoy, l.getFechaVencimiento()) > 30 && l.getCantidadDisponible().compareTo(BigDecimal.ZERO) > 0)
                .count();
        long vencidosCount = todosLotes.stream()
                .filter(l -> ChronoUnit.DAYS.between(hoy, l.getFechaVencimiento()) < 0)
                .count();

        EstadoLotesEstadistica estadoLotes = new EstadoLotesEstadistica(disponiblesCount, proximosAVencer, vencidosCount);

        // 8. Donaciones por tipo
        List<DonacionPorTipoEstadistica> donacionesPorTipo = agrupadosPorCat.entrySet().stream()
                .map(entry -> new DonacionPorTipoEstadistica(entry.getKey(), entry.getValue()))
                .sorted(Comparator.comparing(DonacionPorTipoEstadistica::cantidad).reversed())
                .toList();

        // 9. Lotes por tiempo de vencimiento
        long masDe3Meses = todosLotes.stream().filter(l -> ChronoUnit.DAYS.between(hoy, l.getFechaVencimiento()) > 90).count();
        long unoATresMeses = todosLotes.stream().filter(l -> {
            long dias = ChronoUnit.DAYS.between(hoy, l.getFechaVencimiento());
            return dias > 30 && dias <= 90;
        }).count();
        long treintaDiasOMenos = proximosAVencer;

        LotesPorTiempoEstadistica lotesPorTiempo = new LotesPorTiempoEstadistica(masDe3Meses, unoATresMeses, treintaDiasOMenos, vencidosCount);

        // 10. Últimas 5 donaciones
        List<DonacionResponse> ultimasDonaciones = donacionRepository.findTop5ByOrderByFechaRecepcionDesc().stream()
                .map(DonacionResponse::from)
                .toList();

        // 11. Alertas recientes (lotes con <= 30 días ordenados por cercanía)
        List<AlertaResumen> alertasRecientes = todosLotes.stream()
                .filter(l -> l.getCantidadDisponible().compareTo(BigDecimal.ZERO) > 0)
                .map(l -> mapearAlerta(l, hoy))
                .filter(a -> a.diasRestantes() <= 30)
                .sorted(Comparator.comparingLong(AlertaResumen::diasRestantes))
                .limit(10)
                .toList();

        return new InventarioMetricasResponse(
                productosDisponibles,
                lotesRegistrados,
                proximosAVencer,
                donacionesRegistradas,
                alertasVencimiento,
                productosPorCategoria,
                estadoLotes,
                donacionesPorTipo,
                lotesPorTiempo,
                ultimasDonaciones,
                alertasRecientes
        );
    }

    @Transactional(readOnly = true)
    public List<LoteResponse> buscarLotes(
            String query,
            Long categoriaId,
            Long donanteId,
            String estado,
            LocalDate desde,
            LocalDate hasta) {

        List<Lote> lotes = loteRepository.findAllByOrderByFechaVencimientoAsc();
        LocalDate hoy = LocalDate.now();

        return lotes.stream()
                .filter(l -> {
                    if (query != null && !query.isBlank()) {
                        String q = query.toLowerCase(Locale.ROOT).trim();
                        boolean coincideProd = l.getProducto().getNombre().toLowerCase(Locale.ROOT).contains(q);
                        boolean coincideLote = l.getNumeroLote().toLowerCase(Locale.ROOT).contains(q);
                        boolean coincideDonante = l.getDonacion() != null &&
                                l.getDonacion().getDonante() != null &&
                                l.getDonacion().getDonante().getNombre().toLowerCase(Locale.ROOT).contains(q);
                        if (!coincideProd && !coincideLote && !coincideDonante) {
                            return false;
                        }
                    }
                    if (categoriaId != null && (l.getProducto().getCategoria() == null || !l.getProducto().getCategoria().getId().equals(categoriaId))) {
                        return false;
                    }
                    if (donanteId != null && (l.getDonacion() == null || l.getDonacion().getDonante() == null || !l.getDonacion().getDonante().getId().equals(donanteId))) {
                        return false;
                    }
                    if (desde != null && l.getFechaVencimiento().isBefore(desde)) {
                        return false;
                    }
                    if (hasta != null && l.getFechaVencimiento().isAfter(hasta)) {
                        return false;
                    }
                    if (estado != null && !estado.isBlank() && !estado.equalsIgnoreCase("TODOS")) {
                        long dias = ChronoUnit.DAYS.between(hoy, l.getFechaVencimiento());
                        if (estado.equalsIgnoreCase("VENCIDO") && dias >= 0) {
                            return false;
                        }
                        if (estado.equalsIgnoreCase("PROXIMO_A_VENCER") && (dias < 0 || dias > 30)) {
                            return false;
                        }
                        if (estado.equalsIgnoreCase("DISPONIBLE") && (dias <= 30)) {
                            return false;
                        }
                    }
                    return true;
                })
                .map(LoteResponse::from)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<AlertaResumen> obtenerTodasLasAlertas() {
        LocalDate hoy = LocalDate.now();
        List<Lote> lotes = loteRepository.findAllByOrderByFechaVencimientoAsc();
        return lotes.stream()
                .filter(l -> l.getCantidadDisponible().compareTo(BigDecimal.ZERO) > 0)
                .map(l -> mapearAlerta(l, hoy))
                .filter(a -> a.diasRestantes() <= 30)
                .sorted(Comparator.comparingLong(AlertaResumen::diasRestantes))
                .toList();
    }

    private AlertaResumen mapearAlerta(Lote l, LocalDate hoy) {
        long dias = ChronoUnit.DAYS.between(hoy, l.getFechaVencimiento());
        String urgencia;
        if (dias <= 1) {
            urgencia = "CRITICA";
        } else if (dias <= 3) {
            urgencia = "ALTA";
        } else if (dias <= 7) {
            urgencia = "MEDIA";
        } else {
            urgencia = "PREVENTIVA";
        }
        return new AlertaResumen(
                l.getId(),
                l.getNumeroLote(),
                l.getProducto().getNombre(),
                l.getProducto().getCategoria() != null ? l.getProducto().getCategoria().getNombre() : "Sin categoría",
                l.getUbicacion() != null ? l.getUbicacion().getNombre() : "Sin ubicación",
                l.getCantidadDisponible(),
                l.getUnidadMedida(),
                l.getProducto().isEsPerecedero(),
                l.getFechaVencimiento().toString(),
                dias,
                urgencia
        );
    }
}
