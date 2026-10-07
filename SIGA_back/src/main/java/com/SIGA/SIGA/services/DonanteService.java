package com.SIGA.SIGA.services;

import com.SIGA.SIGA.exception.RecursoNoEncontradoException;
import com.SIGA.SIGA.exception.ReglaNegocioException;
import com.SIGA.SIGA.model.Donante;
import com.SIGA.SIGA.dto.DonanteRequest;
import com.SIGA.SIGA.dto.DonanteResponse;
import com.SIGA.SIGA.repository.DonanteRepository;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class DonanteService {

    private final DonanteRepository donanteRepository;

    @Transactional(readOnly = true)
    public List<DonanteResponse> listarTodos() {
        return donanteRepository.findByActivoTrue()
                .stream()
                .map(DonanteResponse::from)
                .toList();
    }

    @Transactional(readOnly = true)
    public DonanteResponse obtenerPorId(Long id) {
        return DonanteResponse.from(buscarDonanteActivo(id));
    }

    @Transactional(readOnly = true)
    public Donante buscarDonanteActivo(Long id) {
        return donanteRepository.findById(id)
                .filter(Donante::isActivo)
                .orElseThrow(() -> new RecursoNoEncontradoException("Donante no encontrado con id: " + id));
    }

    @Transactional
    public DonanteResponse crear(DonanteRequest request) {
        String identificacion = request.identificacion().trim();
        if (donanteRepository.existsByIdentificacion(identificacion)) {
            throw new ReglaNegocioException("Ya existe un donante registrado con identificación '" + identificacion + "'");
        }

        Donante donante = new Donante();
        donante.setIdentificacion(identificacion);
        donante.setNombre(request.nombre().trim());
        donante.setTipo(request.tipo());
        donante.setEmail(request.email() != null ? request.email().trim().toLowerCase() : null);
        donante.setTelefono(request.telefono() != null ? request.telefono().trim() : null);
        donante.setDireccion(request.direccion() != null ? request.direccion().trim() : null);
        donante.setActivo(true);

        return DonanteResponse.from(donanteRepository.save(donante));
    }

    @Transactional
    public DonanteResponse actualizar(Long id, DonanteRequest request) {
        Donante donante = buscarDonanteActivo(id);

        String identificacion = request.identificacion().trim();
        donanteRepository.findByIdentificacion(identificacion).ifPresent(existente -> {
            if (!existente.getId().equals(id)) {
                throw new ReglaNegocioException("Ya existe otro donante con identificación '" + identificacion + "'");
            }
        });

        donante.setIdentificacion(identificacion);
        donante.setNombre(request.nombre().trim());
        donante.setTipo(request.tipo());
        donante.setEmail(request.email() != null ? request.email().trim().toLowerCase() : null);
        donante.setTelefono(request.telefono() != null ? request.telefono().trim() : null);
        donante.setDireccion(request.direccion() != null ? request.direccion().trim() : null);

        return DonanteResponse.from(donanteRepository.save(donante));
    }

    @Transactional
    public void eliminar(Long id) {
        Donante donante = buscarDonanteActivo(id);
        donante.setActivo(false);
        donanteRepository.save(donante);
    }
}
