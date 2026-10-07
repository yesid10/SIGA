package com.SIGA.SIGA.services;

import com.SIGA.SIGA.exception.RecursoNoEncontradoException;
import com.SIGA.SIGA.model.Categoria;
import com.SIGA.SIGA.model.Producto;
import com.SIGA.SIGA.dto.ProductoRequest;
import com.SIGA.SIGA.dto.ProductoResponse;
import com.SIGA.SIGA.repository.CategoriaRepository;
import com.SIGA.SIGA.repository.ProductoRepository;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class ProductoService {

    private final ProductoRepository productoRepository;
    private final CategoriaRepository categoriaRepository;

    @Transactional(readOnly = true)
    public List<ProductoResponse> listarTodos() {
        return productoRepository.findByActivoTrue()
                .stream()
                .map(ProductoResponse::from)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<ProductoResponse> listarPorCategoria(Long categoriaId) {
        return productoRepository.findByCategoriaIdAndActivoTrue(categoriaId)
                .stream()
                .map(ProductoResponse::from)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<ProductoResponse> listarPorPerecedero(boolean esPerecedero) {
        return productoRepository.findByEsPerecederoAndActivoTrue(esPerecedero)
                .stream()
                .map(ProductoResponse::from)
                .toList();
    }

    @Transactional(readOnly = true)
    public ProductoResponse obtenerPorId(Long id) {
        return ProductoResponse.from(buscarProductoActivo(id));
    }

    @Transactional(readOnly = true)
    public Producto buscarProductoActivo(Long id) {
        return productoRepository.findById(id)
                .filter(Producto::isActivo)
                .orElseThrow(() -> new RecursoNoEncontradoException("Producto no encontrado con id: " + id));
    }

    @Transactional
    public ProductoResponse crear(ProductoRequest request) {
        Categoria categoria = categoriaRepository.findById(request.categoriaId())
                .filter(Categoria::isActivo)
                .orElseThrow(() -> new RecursoNoEncontradoException("Categoría no encontrada con id: " + request.categoriaId()));

        Producto producto = new Producto();
        producto.setNombre(request.nombre().trim());
        producto.setDescripcion(request.descripcion() != null ? request.descripcion().trim() : null);
        producto.setCategoria(categoria);
        producto.setEsPerecedero(request.esPerecedero());
        producto.setUnidadMedida(request.unidadMedida().trim().toLowerCase());
        producto.setActivo(true);

        return ProductoResponse.from(productoRepository.save(producto));
    }

    @Transactional
    public ProductoResponse actualizar(Long id, ProductoRequest request) {
        Producto producto = buscarProductoActivo(id);
        Categoria categoria = categoriaRepository.findById(request.categoriaId())
                .filter(Categoria::isActivo)
                .orElseThrow(() -> new RecursoNoEncontradoException("Categoría no encontrada con id: " + request.categoriaId()));

        producto.setNombre(request.nombre().trim());
        producto.setDescripcion(request.descripcion() != null ? request.descripcion().trim() : null);
        producto.setCategoria(categoria);
        producto.setEsPerecedero(request.esPerecedero());
        producto.setUnidadMedida(request.unidadMedida().trim().toLowerCase());

        return ProductoResponse.from(productoRepository.save(producto));
    }

    @Transactional
    public void eliminar(Long id) {
        Producto producto = buscarProductoActivo(id);
        producto.setActivo(false);
        productoRepository.save(producto);
    }
}
