package com.SIGA.SIGA.services;

import com.SIGA.SIGA.dto.DetalleSolicitudResponse;
import com.SIGA.SIGA.dto.SolicitudItemRequest;
import com.SIGA.SIGA.dto.SolicitudRequest;
import com.SIGA.SIGA.dto.SolicitudResponse;
import com.SIGA.SIGA.exception.RecursoNoEncontradoException;
import com.SIGA.SIGA.exception.ReglaNegocioException;
import com.SIGA.SIGA.model.Beneficiario;
import com.SIGA.SIGA.model.DetalleSolicitud;
import com.SIGA.SIGA.model.EstadoLote;
import com.SIGA.SIGA.model.EstadoSolicitud;
import com.SIGA.SIGA.model.Lote;
import com.SIGA.SIGA.model.Producto;
import com.SIGA.SIGA.model.Solicitud;
import com.SIGA.SIGA.model.Usuario;
import com.SIGA.SIGA.repository.BeneficiarioRepository;
import com.SIGA.SIGA.repository.LoteRepository;
import com.SIGA.SIGA.repository.ProductoRepository;
import com.SIGA.SIGA.repository.SolicitudRepository;
import com.SIGA.SIGA.repository.UsuarioRepository;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Slf4j
public class SolicitudService {

    private final SolicitudRepository solicitudRepository;
    private final BeneficiarioRepository beneficiarioRepository;
    private final ProductoRepository productoRepository;
    private final LoteRepository loteRepository;
    private final UsuarioRepository usuarioRepository;

    @Transactional(readOnly = true)
    public List<SolicitudResponse> listarTodas() {
        return solicitudRepository.findAllByOrderByFechaSolicitudDesc()
                .stream()
                .map(SolicitudResponse::from)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<SolicitudResponse> listarPorBeneficiario(Long beneficiarioId) {
        return solicitudRepository.findByBeneficiarioIdOrderByFechaSolicitudDesc(beneficiarioId)
                .stream()
                .map(SolicitudResponse::from)
                .toList();
    }

    @Transactional(readOnly = true)
    public SolicitudResponse obtenerPorId(Long id) {
        return SolicitudResponse.from(buscarSolicitud(id));
    }

    @Transactional
    public SolicitudResponse crearSolicitud(SolicitudRequest request) {
        Beneficiario beneficiario = beneficiarioRepository.findById(request.beneficiarioId())
                .filter(Beneficiario::isActivo)
                .orElseThrow(() -> new RecursoNoEncontradoException("Beneficiario no encontrado o inactivo con id: " + request.beneficiarioId()));

        if (request.items() == null || request.items().isEmpty()) {
            throw new ReglaNegocioException("La solicitud debe incluir al menos un producto");
        }

        Solicitud solicitud = new Solicitud();
        solicitud.setBeneficiario(beneficiario);
        solicitud.setFechaSolicitud(LocalDate.now());
        solicitud.setEstado(EstadoSolicitud.PENDIENTE);
        solicitud.setObservaciones(request.observaciones());

        List<DetalleSolicitud> detalles = new ArrayList<>();
        for (SolicitudItemRequest item : request.items()) {
            Producto producto = productoRepository.findById(item.productoId())
                    .filter(Producto::isActivo)
                    .orElseThrow(() -> new RecursoNoEncontradoException("Producto no encontrado o inactivo con id: " + item.productoId()));

            DetalleSolicitud detalle = new DetalleSolicitud();
            detalle.setSolicitud(solicitud);
            detalle.setProducto(producto);
            detalle.setCantidadSolicitada(item.cantidadSolicitada());
            detalle.setCantidadAsignada(BigDecimal.ZERO);
            detalles.add(detalle);
        }

        solicitud.setDetalles(detalles);
        Solicitud guardada = solicitudRepository.save(solicitud);
        return SolicitudResponse.from(guardada);
    }

    /**
     * Algoritmo de Despacho FEFO (First Expired, First Out)
     * Descuenta automáticamente las existencias de los lotes más próximos a vencer.
     */
    @Transactional
    public SolicitudResponse despacharConFefo(Long solicitudId, String emailEncargado) {
        Solicitud solicitud = buscarSolicitud(solicitudId);

        if (solicitud.getEstado() == EstadoSolicitud.DESPACHADA) {
            throw new ReglaNegocioException("La solicitud ya ha sido despachada previamente");
        }
        if (solicitud.getEstado() == EstadoSolicitud.RECHAZADA || solicitud.getEstado() == EstadoSolicitud.CANCELADA) {
            throw new ReglaNegocioException("No se puede despachar una solicitud que se encuentra " + solicitud.getEstado());
        }

        Usuario encargado = usuarioRepository.findByEmailIgnoreCase(emailEncargado)
                .orElse(null);

        for (DetalleSolicitud detalle : solicitud.getDetalles()) {
            BigDecimal cantidadPendiente = detalle.getCantidadSolicitada();
            BigDecimal cantidadAsignada = BigDecimal.ZERO;

            // Buscar lotes disponibles del producto ordenados por fecha de vencimiento ASC (FEFO)
            List<Lote> lotesFefo = loteRepository.findLotesDisponiblesParaFefo(detalle.getProducto().getId());

            for (Lote lote : lotesFefo) {
                if (cantidadPendiente.compareTo(BigDecimal.ZERO) <= 0) {
                    break;
                }

                BigDecimal disponible = lote.getCantidadDisponible();
                if (disponible.compareTo(BigDecimal.ZERO) <= 0) {
                    continue;
                }

                if (disponible.compareTo(cantidadPendiente) <= 0) {
                    // El lote se consume por completo
                    cantidadAsignada = cantidadAsignada.add(disponible);
                    cantidadPendiente = cantidadPendiente.subtract(disponible);
                    lote.setCantidadDisponible(BigDecimal.ZERO);
                    lote.setEstado(EstadoLote.AGOTADO);
                } else {
                    // El lote cubre lo restante
                    lote.setCantidadDisponible(disponible.subtract(cantidadPendiente));
                    cantidadAsignada = cantidadAsignada.add(cantidadPendiente);
                    cantidadPendiente = BigDecimal.ZERO;
                }

                loteRepository.save(lote);
            }

            detalle.setCantidadAsignada(cantidadAsignada);
        }

        solicitud.setEstado(EstadoSolicitud.DESPACHADA);
        solicitud.setUsuarioResponsable(encargado);
        return SolicitudResponse.from(solicitudRepository.save(solicitud));
    }

    @Transactional
    public SolicitudResponse rechazarSolicitud(Long solicitudId, String motivo, String emailEncargado) {
        Solicitud solicitud = buscarSolicitud(solicitudId);

        if (solicitud.getEstado() == EstadoSolicitud.DESPACHADA) {
            throw new ReglaNegocioException("No se puede rechazar una solicitud que ya fue despachada");
        }

        Usuario encargado = usuarioRepository.findByEmailIgnoreCase(emailEncargado).orElse(null);
        solicitud.setEstado(EstadoSolicitud.RECHAZADA);
        solicitud.setUsuarioResponsable(encargado);
        if (motivo != null && !motivo.isBlank()) {
            String obsActual = solicitud.getObservaciones() != null ? solicitud.getObservaciones() + " | " : "";
            solicitud.setObservaciones(obsActual + "Motivo de rechazo: " + motivo.trim());
        }

        return SolicitudResponse.from(solicitudRepository.save(solicitud));
    }

    private Solicitud buscarSolicitud(Long id) {
        return solicitudRepository.findById(id)
                .orElseThrow(() -> new RecursoNoEncontradoException("Solicitud no encontrada con id: " + id));
    }
}
