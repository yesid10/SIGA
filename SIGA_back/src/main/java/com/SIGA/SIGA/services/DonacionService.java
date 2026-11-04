package com.SIGA.SIGA.services;

import com.SIGA.SIGA.dto.DonacionRequest;
import com.SIGA.SIGA.dto.DonacionResponse;
import com.SIGA.SIGA.dto.LoteItemRequest;
import com.SIGA.SIGA.dto.LoteResponse;
import com.SIGA.SIGA.exception.RecursoNoEncontradoException;
import com.SIGA.SIGA.exception.ReglaNegocioException;
import com.SIGA.SIGA.model.Donacion;
import com.SIGA.SIGA.model.Donante;
import com.SIGA.SIGA.model.EstadoDonacion;
import com.SIGA.SIGA.model.EstadoLote;
import com.SIGA.SIGA.model.Lote;
import com.SIGA.SIGA.model.Producto;
import com.SIGA.SIGA.model.TipoUbicacion;
import com.SIGA.SIGA.model.Ubicacion;
import com.SIGA.SIGA.model.Usuario;
import com.SIGA.SIGA.repository.DonacionRepository;
import com.SIGA.SIGA.repository.DonanteRepository;
import com.SIGA.SIGA.repository.LoteRepository;
import com.SIGA.SIGA.repository.ProductoRepository;
import com.SIGA.SIGA.repository.UbicacionRepository;
import com.SIGA.SIGA.repository.UsuarioRepository;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class DonacionService {

    private final DonacionRepository donacionRepository;
    private final LoteRepository loteRepository;
    private final DonanteRepository donanteRepository;
    private final ProductoRepository productoRepository;
    private final UbicacionRepository ubicacionRepository;
    private final UsuarioRepository usuarioRepository;

    @Transactional
    public DonacionResponse registrarDonacion(DonacionRequest request, String userEmail) {
        Donante donante = donanteRepository.findById(request.donanteId())
                .filter(Donante::isActivo)
                .orElseThrow(() -> new RecursoNoEncontradoException("Donante no encontrado o inactivo con ID: " + request.donanteId()));

        Usuario usuarioResponsable = null;
        if (userEmail != null && !userEmail.isBlank()) {
            usuarioResponsable = usuarioRepository.findByEmailIgnoreCase(userEmail).orElse(null);
        }

        Donacion donacion = new Donacion();
        donacion.setDonante(donante);
        donacion.setUsuarioResponsable(usuarioResponsable);
        donacion.setFechaRecepcion(request.fechaRecepcion() != null ? request.fechaRecepcion() : LocalDate.now());
        donacion.setObservaciones(request.observaciones());
        donacion.setEstado(EstadoDonacion.RECIBIDA);

        for (LoteItemRequest item : request.items()) {
            Producto producto = productoRepository.findById(item.productoId())
                    .filter(Producto::isActivo)
                    .orElseThrow(() -> new RecursoNoEncontradoException("Producto no encontrado o inactivo con ID: " + item.productoId()));

            if (item.fechaVencimiento().isBefore(LocalDate.now())) {
                throw new ReglaNegocioException("La fecha de vencimiento del producto " + producto.getNombre() +
                        " no puede ser anterior a la fecha actual (" + item.fechaVencimiento() + ")");
            }

            Ubicacion ubicacion = null;
            if (item.ubicacionId() != null) {
                ubicacion = ubicacionRepository.findById(item.ubicacionId())
                        .filter(Ubicacion::isActivo)
                        .orElseThrow(() -> new RecursoNoEncontradoException("Ubicación no encontrada o inactiva con ID: " + item.ubicacionId()));

                // Regla RF-14 / HU-02: Perecederos no pueden ir a ubicaciones secas
                if (producto.isEsPerecedero() && ubicacion.getTipo() == TipoUbicacion.SECO) {
                    throw new ReglaNegocioException("El producto perecedero '" + producto.getNombre() +
                            "' requiere una ubicación refrigerada y no puede almacenarse en '" +
                            ubicacion.getNombre() + "' (" + ubicacion.getTipo() + ").");
                }
            } else {
                // Autoasignar primera ubicación compatible si no se indicó
                TipoUbicacion tipoRequerido = producto.isEsPerecedero() ? TipoUbicacion.REFRIGERADO : TipoUbicacion.SECO;
                ubicacion = ubicacionRepository.findByTipoAndActivoTrue(tipoRequerido).stream().findFirst().orElse(null);
            }

            Lote lote = new Lote();
            lote.setNumeroLote(item.numeroLote().trim());
            lote.setProducto(producto);
            lote.setDonacion(donacion);
            lote.setUbicacion(ubicacion);
            lote.setCantidadInicial(item.cantidad());
            lote.setCantidadDisponible(item.cantidad());
            lote.setUnidadMedida(item.unidadMedida().trim());
            lote.setFechaIngreso(donacion.getFechaRecepcion());
            lote.setFechaVencimiento(item.fechaVencimiento());
            lote.setEstado(EstadoLote.DISPONIBLE);

            donacion.getLotes().add(lote);
        }

        Donacion guardada = donacionRepository.save(donacion);
        return DonacionResponse.from(guardada);
    }

    @Transactional(readOnly = true)
    public List<DonacionResponse> listarDonaciones() {
        return donacionRepository.findAllByOrderByFechaRecepcionDesc().stream()
                .map(DonacionResponse::from)
                .toList();
    }

    @Transactional(readOnly = true)
    public DonacionResponse obtenerPorId(Long id) {
        Donacion donacion = donacionRepository.findById(id)
                .orElseThrow(() -> new RecursoNoEncontradoException("Donación no encontrada con ID: " + id));
        return DonacionResponse.from(donacion);
    }

    @Transactional(readOnly = true)
    public List<LoteResponse> listarLotes(Optional<Long> productoId, Optional<EstadoLote> estado) {
        List<Lote> lotes;
        if (productoId.isPresent() && estado.isPresent()) {
            lotes = loteRepository.findByProductoIdAndEstado(productoId.get(), estado.get());
        } else {
            lotes = loteRepository.findAllByOrderByFechaVencimientoAsc();
            if (productoId.isPresent()) {
                lotes = lotes.stream().filter(l -> l.getProducto().getId().equals(productoId.get())).toList();
            }
            if (estado.isPresent()) {
                lotes = lotes.stream().filter(l -> l.getEstado() == estado.get()).toList();
            }
        }
        return lotes.stream().map(LoteResponse::from).toList();
    }
}
