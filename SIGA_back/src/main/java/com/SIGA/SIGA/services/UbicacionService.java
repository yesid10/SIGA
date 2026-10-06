package com.SIGA.SIGA.services;

import com.SIGA.SIGA.exception.RecursoNoEncontradoException;
import com.SIGA.SIGA.exception.ReglaNegocioException;
import com.SIGA.SIGA.model.Producto;
import com.SIGA.SIGA.model.TipoUbicacion;
import com.SIGA.SIGA.model.Ubicacion;
import com.SIGA.SIGA.model.UbicacionRequest;
import com.SIGA.SIGA.model.UbicacionResponse;
import com.SIGA.SIGA.repository.UbicacionRepository;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class UbicacionService {

    private final UbicacionRepository ubicacionRepository;

    @Transactional(readOnly = true)
    public List<UbicacionResponse> listarTodas() {
        return ubicacionRepository.findByActivoTrue()
                .stream()
                .map(UbicacionResponse::from)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<UbicacionResponse> listarPorTipo(TipoUbicacion tipo) {
        return ubicacionRepository.findByTipoAndActivoTrue(tipo)
                .stream()
                .map(UbicacionResponse::from)
                .toList();
    }

    @Transactional(readOnly = true)
    public UbicacionResponse obtenerPorId(Long id) {
        return UbicacionResponse.from(buscarUbicacionActiva(id));
    }

    @Transactional(readOnly = true)
    public Ubicacion buscarUbicacionActiva(Long id) {
        return ubicacionRepository.findById(id)
                .filter(Ubicacion::isActivo)
                .orElseThrow(() -> new RecursoNoEncontradoException("Ubicación no encontrada con id: " + id));
    }

    @Transactional
    public UbicacionResponse crear(UbicacionRequest request) {
        String codigo = request.codigo().trim().toUpperCase();
        if (ubicacionRepository.existsByCodigoIgnoreCase(codigo)) {
            throw new ReglaNegocioException("Ya existe una ubicación con el código '" + codigo + "'");
        }

        Ubicacion ubicacion = new Ubicacion();
        ubicacion.setCodigo(codigo);
        ubicacion.setNombre(request.nombre().trim());
        ubicacion.setTipo(request.tipo());
        ubicacion.setCapacidadMaxima(request.capacidadMaxima());
        ubicacion.setActivo(true);

        return UbicacionResponse.from(ubicacionRepository.save(ubicacion));
    }

    @Transactional
    public UbicacionResponse actualizar(Long id, UbicacionRequest request) {
        Ubicacion ubicacion = buscarUbicacionActiva(id);

        String codigo = request.codigo().trim().toUpperCase();
        ubicacionRepository.findByCodigoIgnoreCase(codigo).ifPresent(existente -> {
            if (!existente.getId().equals(id)) {
                throw new ReglaNegocioException("Ya existe otra ubicación con el código '" + codigo + "'");
            }
        });

        ubicacion.setCodigo(codigo);
        ubicacion.setNombre(request.nombre().trim());
        ubicacion.setTipo(request.tipo());
        ubicacion.setCapacidadMaxima(request.capacidadMaxima());

        return UbicacionResponse.from(ubicacionRepository.save(ubicacion));
    }

    @Transactional
    public void eliminar(Long id) {
        Ubicacion ubicacion = buscarUbicacionActiva(id);
        ubicacion.setActivo(false);
        ubicacionRepository.save(ubicacion);
    }

    /**
     * Regla de Negocio RF-14 / HU-02:
     * El sistema debe impedir asignar un producto perecedero a una ubicación no refrigerada (tipo SECO).
     */
    public void validarCompatibilidadAlmacenamiento(Producto producto, Ubicacion ubicacion) {
        if (producto == null || ubicacion == null) {
            throw new ReglaNegocioException("Producto y ubicación son requeridos para validar almacenamiento");
        }
        if (producto.isEsPerecedero() && ubicacion.getTipo() == TipoUbicacion.SECO) {
            throw new ReglaNegocioException(
                    "Regla RF-14: No se puede asignar el producto perecedero '" + producto.getNombre() +
                    "' a una ubicación no refrigerada ('" + ubicacion.getNombre() + "', tipo SECO). " +
                    "Debe almacenarse en una ubicación REFRIGERADO."
            );
        }
    }
}
