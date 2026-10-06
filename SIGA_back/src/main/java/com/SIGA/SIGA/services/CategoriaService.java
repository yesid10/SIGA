package com.SIGA.SIGA.services;

import com.SIGA.SIGA.exception.RecursoNoEncontradoException;
import com.SIGA.SIGA.exception.ReglaNegocioException;
import com.SIGA.SIGA.model.Categoria;
import com.SIGA.SIGA.model.CategoriaRequest;
import com.SIGA.SIGA.model.CategoriaResponse;
import com.SIGA.SIGA.repository.CategoriaRepository;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class CategoriaService {

    private final CategoriaRepository categoriaRepository;

    @Transactional(readOnly = true)
    public List<CategoriaResponse> listarTodas() {
        return categoriaRepository.findByActivoTrue()
                .stream()
                .map(CategoriaResponse::from)
                .toList();
    }

    @Transactional(readOnly = true)
    public CategoriaResponse obtenerPorId(Long id) {
        Categoria categoria = categoriaRepository.findById(id)
                .filter(Categoria::isActivo)
                .orElseThrow(() -> new RecursoNoEncontradoException("Categoría no encontrada con id: " + id));
        return CategoriaResponse.from(categoria);
    }

    @Transactional
    public CategoriaResponse crear(CategoriaRequest request) {
        String nombre = request.nombre().trim();
        if (categoriaRepository.existsByNombreIgnoreCase(nombre)) {
            throw new ReglaNegocioException("Ya existe una categoría con el nombre '" + nombre + "'");
        }

        Categoria categoria = new Categoria();
        categoria.setNombre(nombre);
        categoria.setDescripcion(request.descripcion() != null ? request.descripcion().trim() : null);
        categoria.setActivo(true);

        return CategoriaResponse.from(categoriaRepository.save(categoria));
    }

    @Transactional
    public CategoriaResponse actualizar(Long id, CategoriaRequest request) {
        Categoria categoria = categoriaRepository.findById(id)
                .filter(Categoria::isActivo)
                .orElseThrow(() -> new RecursoNoEncontradoException("Categoría no encontrada con id: " + id));

        String nombre = request.nombre().trim();
        categoriaRepository.findByNombreIgnoreCase(nombre).ifPresent(existente -> {
            if (!existente.getId().equals(id)) {
                throw new ReglaNegocioException("Ya existe otra categoría con el nombre '" + nombre + "'");
            }
        });

        categoria.setNombre(nombre);
        categoria.setDescripcion(request.descripcion() != null ? request.descripcion().trim() : null);

        return CategoriaResponse.from(categoriaRepository.save(categoria));
    }

    @Transactional
    public void eliminar(Long id) {
        Categoria categoria = categoriaRepository.findById(id)
                .filter(Categoria::isActivo)
                .orElseThrow(() -> new RecursoNoEncontradoException("Categoría no encontrada con id: " + id));
        categoria.setActivo(false);
        categoriaRepository.save(categoria);
    }
}
