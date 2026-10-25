package com.SIGA.SIGA.services;

import com.SIGA.SIGA.model.EstadoLote;
import com.SIGA.SIGA.model.Lote;
import com.SIGA.SIGA.repository.LoteRepository;
import jakarta.annotation.PostConstruct;
import java.time.LocalDate;
import java.util.List;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Tarea programada para actualización automática de estados de lotes (RF-06).
 * Al cumplirse la fecha de vencimiento, marca el lote como VENCIDO
 * excluyéndolo automáticamente de futuros despachos FEFO.
 * Asimismo, marca como PROXIMO_A_VENCER los lotes con <= 30 días restantes.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class LoteSchedulerService {

    private final LoteRepository loteRepository;

    @PostConstruct
    public void alIniciarAplicacion() {
        log.info("Verificando estados de caducidad de lotes al iniciar la aplicación...");
        actualizarEstadosLotes();
    }

    @Scheduled(cron = "0 0 0 * * ?")
    @Transactional
    public void tareaProgramadaDiaria() {
        log.info("Ejecutando revisión programada diaria de vencimiento de lotes (RF-06)...");
        actualizarEstadosLotes();
    }

    @Transactional
    public void actualizarEstadosLotes() {
        LocalDate hoy = LocalDate.now();

        // 1. Marcar como VENCIDO cualquier lote con fechaVencimiento anterior a hoy que no esté ya VENCIDO ni AGOTADO
        List<Lote> caducados = loteRepository.findByFechaVencimientoBeforeAndEstadoNot(hoy, EstadoLote.VENCIDO);
        int vencidosActualizados = 0;
        for (Lote lote : caducados) {
            if (lote.getEstado() != EstadoLote.AGOTADO) {
                lote.setEstado(EstadoLote.VENCIDO);
                loteRepository.save(lote);
                vencidosActualizados++;
            }
        }

        // 2. Marcar como PROXIMO_A_VENCER los lotes entre hoy y hoy + 30 días con estado DISPONIBLE
        LocalDate enTreintaDias = hoy.plusDays(30);
        List<Lote> proximos = loteRepository.findByFechaVencimientoBetweenAndEstado(hoy, enTreintaDias, EstadoLote.DISPONIBLE);
        int proximosActualizados = 0;
        for (Lote lote : proximos) {
            lote.setEstado(EstadoLote.PROXIMO_A_VENCER);
            loteRepository.save(lote);
            proximosActualizados++;
        }

        log.info("Revisión de vencimientos completada: {} lotes marcados como VENCIDO, {} lotes marcados como PROXIMO_A_VENCER.",
                vencidosActualizados, proximosActualizados);
    }
}
