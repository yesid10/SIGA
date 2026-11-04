package com.SIGA.SIGA.services;

import com.SIGA.SIGA.dto.ActualizarUsuarioRequest;
import com.SIGA.SIGA.dto.UsuarioResponse;
import com.SIGA.SIGA.exception.RecursoNoEncontradoException;
import com.SIGA.SIGA.exception.ReglaNegocioException;
import com.SIGA.SIGA.model.Rol;
import com.SIGA.SIGA.model.Usuario;
import com.SIGA.SIGA.repository.UsuarioRepository;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class UsuarioService {

    private final UsuarioRepository usuarioRepository;

    @Transactional(readOnly = true)
    public List<UsuarioResponse> listarTodos() {
        return usuarioRepository.findAll(Sort.by(Sort.Direction.ASC, "id"))
                .stream()
                .map(UsuarioResponse::from)
                .toList();
    }

    @Transactional(readOnly = true)
    public UsuarioResponse obtenerPorId(Long id) {
        return UsuarioResponse.from(buscarPorId(id));
    }

    @Transactional
    public UsuarioResponse actualizar(Long id, ActualizarUsuarioRequest request) {
        Usuario usuario = buscarPorId(id);

        if (request.nombre() != null && !request.nombre().isBlank()) {
            usuario.setNombre(request.nombre().trim());
        }

        if (request.rol() != null) {
            usuario.setRol(request.rol());
        }

        if (request.activo() != null) {
            usuario.setActivo(request.activo());
        }

        if (request.fotoUrl() != null) {
            usuario.setFotoUrl(request.fotoUrl().isBlank() ? null : request.fotoUrl().trim());
        }

        return UsuarioResponse.from(usuarioRepository.save(usuario));
    }

    @Transactional
    public UsuarioResponse cambiarRol(Long id, Rol nuevoRol) {
        if (nuevoRol == null) {
            throw new ReglaNegocioException("El nuevo rol es obligatorio");
        }
        Usuario usuario = buscarPorId(id);
        usuario.setRol(nuevoRol);
        return UsuarioResponse.from(usuarioRepository.save(usuario));
    }

    @Transactional
    public UsuarioResponse cambiarEstado(Long id, boolean activo) {
        Usuario usuario = buscarPorId(id);
        usuario.setActivo(activo);
        return UsuarioResponse.from(usuarioRepository.save(usuario));
    }

    private Usuario buscarPorId(Long id) {
        return usuarioRepository.findById(id)
                .orElseThrow(() -> new RecursoNoEncontradoException("Usuario no encontrado con id: " + id));
    }
}
