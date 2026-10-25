package com.SIGA.SIGA.services;

import com.SIGA.SIGA.dto.BeneficiarioRequest;
import com.SIGA.SIGA.dto.BeneficiarioResponse;
import com.SIGA.SIGA.exception.RecursoNoEncontradoException;
import com.SIGA.SIGA.exception.ReglaNegocioException;
import com.SIGA.SIGA.model.Beneficiario;
import com.SIGA.SIGA.model.Usuario;
import com.SIGA.SIGA.repository.BeneficiarioRepository;
import com.SIGA.SIGA.repository.UsuarioRepository;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class BeneficiarioService {

    private final BeneficiarioRepository beneficiarioRepository;
    private final UsuarioRepository usuarioRepository;

    @Transactional(readOnly = true)
    public List<BeneficiarioResponse> listarTodos() {
        return beneficiarioRepository.findByActivoTrue()
                .stream()
                .map(BeneficiarioResponse::from)
                .toList();
    }

    @Transactional(readOnly = true)
    public BeneficiarioResponse obtenerPorId(Long id) {
        return BeneficiarioResponse.from(buscarActivo(id));
    }

    @Transactional(readOnly = true)
    public BeneficiarioResponse obtenerPorUsuarioId(Long usuarioId) {
        Beneficiario b = beneficiarioRepository.findByUsuarioId(usuarioId)
                .filter(Beneficiario::isActivo)
                .orElseThrow(() -> new RecursoNoEncontradoException("No existe registro de beneficiario asociado al usuario: " + usuarioId));
        return BeneficiarioResponse.from(b);
    }

    @Transactional
    public BeneficiarioResponse crear(BeneficiarioRequest request) {
        if (beneficiarioRepository.existsByDocumento(request.documento().trim())) {
            throw new ReglaNegocioException("Ya existe un beneficiario con el documento: " + request.documento());
        }

        Beneficiario beneficiario = new Beneficiario();
        beneficiario.setDocumento(request.documento().trim());
        beneficiario.setNombre(request.nombre().trim());
        beneficiario.setEmail(request.email() != null ? request.email().trim().toLowerCase() : null);
        beneficiario.setTelefono(request.telefono() != null ? request.telefono().trim() : null);
        beneficiario.setDireccion(request.direccion() != null ? request.direccion().trim() : null);
        beneficiario.setNumPersonasHogar(request.numPersonasHogar() != null ? request.numPersonasHogar() : 1);
        beneficiario.setActivo(true);

        if (request.usuarioId() != null) {
            Usuario usuario = usuarioRepository.findById(request.usuarioId())
                    .orElseThrow(() -> new RecursoNoEncontradoException("Usuario no encontrado con id: " + request.usuarioId()));
            beneficiario.setUsuario(usuario);
        }

        return BeneficiarioResponse.from(beneficiarioRepository.save(beneficiario));
    }

    @Transactional
    public BeneficiarioResponse actualizar(Long id, BeneficiarioRequest request) {
        Beneficiario beneficiario = buscarActivo(id);

        if (!beneficiario.getDocumento().equalsIgnoreCase(request.documento().trim())
                && beneficiarioRepository.existsByDocumento(request.documento().trim())) {
            throw new ReglaNegocioException("Ya existe otro beneficiario con el documento: " + request.documento());
        }

        beneficiario.setDocumento(request.documento().trim());
        beneficiario.setNombre(request.nombre().trim());
        beneficiario.setEmail(request.email() != null ? request.email().trim().toLowerCase() : null);
        beneficiario.setTelefono(request.telefono() != null ? request.telefono().trim() : null);
        beneficiario.setDireccion(request.direccion() != null ? request.direccion().trim() : null);
        beneficiario.setNumPersonasHogar(request.numPersonasHogar() != null ? request.numPersonasHogar() : 1);

        if (request.usuarioId() != null) {
            Usuario usuario = usuarioRepository.findById(request.usuarioId())
                    .orElseThrow(() -> new RecursoNoEncontradoException("Usuario no encontrado con id: " + request.usuarioId()));
            beneficiario.setUsuario(usuario);
        }

        return BeneficiarioResponse.from(beneficiarioRepository.save(beneficiario));
    }

    @Transactional
    public void eliminar(Long id) {
        Beneficiario beneficiario = buscarActivo(id);
        beneficiario.setActivo(false);
        beneficiarioRepository.save(beneficiario);
    }

    public Beneficiario buscarActivo(Long id) {
        return beneficiarioRepository.findById(id)
                .filter(Beneficiario::isActivo)
                .orElseThrow(() -> new RecursoNoEncontradoException("Beneficiario no encontrado con id: " + id));
    }
}
