package com.SIGA.SIGA.services;

import com.SIGA.SIGA.dto.ReporteBalanceResponse;
import com.SIGA.SIGA.dto.ReporteBeneficiarioItem;
import com.SIGA.SIGA.dto.ReporteCategoriaItem;
import com.SIGA.SIGA.dto.ReporteDonanteItem;
import com.SIGA.SIGA.model.Donacion;
import com.SIGA.SIGA.model.EstadoLote;
import com.SIGA.SIGA.model.EstadoSolicitud;
import com.SIGA.SIGA.model.Lote;
import com.SIGA.SIGA.model.Solicitud;
import com.SIGA.SIGA.repository.DonacionRepository;
import com.SIGA.SIGA.repository.LoteRepository;
import com.SIGA.SIGA.repository.SolicitudRepository;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class ReporteService {

    private final DonacionRepository donacionRepository;
    private final SolicitudRepository solicitudRepository;
    private final LoteRepository loteRepository;

    @Transactional(readOnly = true)
    public ReporteBalanceResponse generarReporteBalance(LocalDate desde, LocalDate hasta) {
        if (hasta == null) {
            hasta = LocalDate.now();
        }
        if (desde == null) {
            desde = hasta.minusDays(30);
        }

        // 1. Donaciones en el rango de fechas
        List<Donacion> donaciones = donacionRepository.findByFechaRecepcionBetweenOrderByFechaRecepcionDesc(desde, hasta);
        BigDecimal totalKgRecibidos = BigDecimal.ZERO;
        Map<String, BigDecimal> recibidosPorCat = new HashMap<>();
        Map<String, Long> donacionesPorDonante = new HashMap<>();
        Map<String, BigDecimal> kgPorDonante = new HashMap<>();

        for (Donacion d : donaciones) {
            String donanteNombre = d.getDonante() != null ? d.getDonante().getNombre() : "Donante Anónimo";
            donacionesPorDonante.put(donanteNombre, donacionesPorDonante.getOrDefault(donanteNombre, 0L) + 1);

            for (Lote l : d.getLotes()) {
                BigDecimal cant = l.getCantidadInicial() != null ? l.getCantidadInicial() : BigDecimal.ZERO;
                totalKgRecibidos = totalKgRecibidos.add(cant);
                kgPorDonante.put(donanteNombre, kgPorDonante.getOrDefault(donanteNombre, BigDecimal.ZERO).add(cant));

                String catNombre = l.getProducto() != null && l.getProducto().getCategoria() != null
                        ? l.getProducto().getCategoria().getNombre() : "Sin Categoría";
                recibidosPorCat.put(catNombre, recibidosPorCat.getOrDefault(catNombre, BigDecimal.ZERO).add(cant));
            }
        }

        // 2. Solicitudes despachadas en el rango de fechas
        List<Solicitud> solicitudes = solicitudRepository.findByFechaSolicitudBetweenOrderByFechaSolicitudDesc(desde, hasta);
        BigDecimal totalKgDistribuidos = BigDecimal.ZERO;
        long totalSolicitudesAtendidas = 0;
        Map<String, BigDecimal> distribuidosPorCat = new HashMap<>();
        Map<String, Long> solPorBeneficiario = new HashMap<>();
        Map<String, BigDecimal> kgPorBeneficiario = new HashMap<>();

        for (Solicitud s : solicitudes) {
            if (s.getEstado() == EstadoSolicitud.DESPACHADA) {
                totalSolicitudesAtendidas++;
                String beneNombre = s.getBeneficiario() != null ? s.getBeneficiario().getNombre() : "Beneficiario No Registrado";
                solPorBeneficiario.put(beneNombre, solPorBeneficiario.getOrDefault(beneNombre, 0L) + 1);

                s.getDetalles().forEach(det -> {
                    BigDecimal asignada = det.getCantidadAsignada() != null ? det.getCantidadAsignada() : BigDecimal.ZERO;
                    kgPorBeneficiario.put(beneNombre, kgPorBeneficiario.getOrDefault(beneNombre, BigDecimal.ZERO).add(asignada));

                    String catNombre = det.getProducto() != null && det.getProducto().getCategoria() != null
                            ? det.getProducto().getCategoria().getNombre() : "Sin Categoría";
                    distribuidosPorCat.put(catNombre, distribuidosPorCat.getOrDefault(catNombre, BigDecimal.ZERO).add(asignada));
                });
            }
        }
        totalKgDistribuidos = distribuidosPorCat.values().stream().reduce(BigDecimal.ZERO, BigDecimal::add);

        // 3. Lotes vencidos en el rango
        List<Lote> lotesVencidos = loteRepository.findByFechaVencimientoBetween(desde, hasta).stream()
                .filter(l -> l.getEstado() == EstadoLote.VENCIDO || l.getFechaVencimiento().isBefore(LocalDate.now()))
                .toList();

        BigDecimal totalKgVencidos = BigDecimal.ZERO;
        Map<String, BigDecimal> vencidosPorCat = new HashMap<>();
        for (Lote l : lotesVencidos) {
            BigDecimal disponible = l.getCantidadDisponible() != null ? l.getCantidadDisponible() : BigDecimal.ZERO;
            if (disponible.compareTo(BigDecimal.ZERO) > 0) {
                totalKgVencidos = totalKgVencidos.add(disponible);
                String catNombre = l.getProducto() != null && l.getProducto().getCategoria() != null
                        ? l.getProducto().getCategoria().getNombre() : "Sin Categoría";
                vencidosPorCat.put(catNombre, vencidosPorCat.getOrDefault(catNombre, BigDecimal.ZERO).add(disponible));
            }
        }

        // 4. Stock disponible total actual en bodega
        BigDecimal totalKgDisponibles = loteRepository.findAll().stream()
                .filter(l -> l.getEstado() != EstadoLote.VENCIDO && l.getEstado() != EstadoLote.AGOTADO)
                .map(l -> l.getCantidadDisponible() != null ? l.getCantidadDisponible() : BigDecimal.ZERO)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        // 5. Tasa de aprovechamiento
        BigDecimal totalGestionado = totalKgDistribuidos.add(totalKgVencidos);
        double tasaAprovechamiento = 100.0;
        if (totalGestionado.compareTo(BigDecimal.ZERO) > 0) {
            tasaAprovechamiento = totalKgDistribuidos.divide(totalGestionado, 4, RoundingMode.HALF_UP)
                    .multiply(new BigDecimal("100"))
                    .setScale(1, RoundingMode.HALF_UP)
                    .doubleValue();
        }

        // 6. Consolidar categorías
        List<ReporteCategoriaItem> desgloseCategorias = new ArrayList<>();
        java.util.Set<String> todasCategorias = new java.util.HashSet<>();
        todasCategorias.addAll(recibidosPorCat.keySet());
        todasCategorias.addAll(distribuidosPorCat.keySet());
        todasCategorias.addAll(vencidosPorCat.keySet());

        for (String cat : todasCategorias) {
            desgloseCategorias.add(new ReporteCategoriaItem(
                    cat,
                    recibidosPorCat.getOrDefault(cat, BigDecimal.ZERO),
                    distribuidosPorCat.getOrDefault(cat, BigDecimal.ZERO),
                    vencidosPorCat.getOrDefault(cat, BigDecimal.ZERO)
            ));
        }
        desgloseCategorias.sort((a, b) -> b.kgRecibidos().compareTo(a.kgRecibidos()));

        // 7. Consolidar donantes
        List<ReporteDonanteItem> desgloseDonantes = new ArrayList<>();
        for (String donante : donacionesPorDonante.keySet()) {
            desgloseDonantes.add(new ReporteDonanteItem(
                    donante,
                    donacionesPorDonante.get(donante),
                    kgPorDonante.getOrDefault(donante, BigDecimal.ZERO)
            ));
        }
        desgloseDonantes.sort((a, b) -> b.kgAportados().compareTo(a.kgAportados()));

        // 8. Consolidar beneficiarios
        List<ReporteBeneficiarioItem> desgloseBeneficiarios = new ArrayList<>();
        for (String bene : solPorBeneficiario.keySet()) {
            desgloseBeneficiarios.add(new ReporteBeneficiarioItem(
                    bene,
                    solPorBeneficiario.get(bene),
                    kgPorBeneficiario.getOrDefault(bene, BigDecimal.ZERO)
            ));
        }
        desgloseBeneficiarios.sort((a, b) -> b.kgRecibidos().compareTo(a.kgRecibidos()));

        return new ReporteBalanceResponse(
                desde,
                hasta,
                totalKgRecibidos,
                totalKgDistribuidos,
                totalKgVencidos,
                totalKgDisponibles,
                donaciones.size(),
                totalSolicitudesAtendidas,
                tasaAprovechamiento,
                desgloseCategorias,
                desgloseDonantes,
                desgloseBeneficiarios
        );
    }
}
