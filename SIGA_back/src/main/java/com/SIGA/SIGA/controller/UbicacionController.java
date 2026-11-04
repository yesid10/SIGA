package com.SIGA.SIGA.controller;

import com.SIGA.SIGA.model.Producto;
import com.SIGA.SIGA.model.TipoUbicacion;
import com.SIGA.SIGA.model.Ubicacion;
import com.SIGA.SIGA.dto.UbicacionRequest;
import com.SIGA.SIGA.dto.UbicacionResponse;
import com.SIGA.SIGA.services.ProductoService;
import com.SIGA.SIGA.services.UbicacionService;
import jakarta.validation.Valid;
import java.util.List;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/ubicaciones")
@RequiredArgsConstructor
public class UbicacionController {

    private final UbicacionService ubicacionService;
    private final ProductoService productoService;

    @GetMapping
    public ResponseEntity<List<UbicacionResponse>> listar(@RequestParam(required = false) TipoUbicacion tipo) {
        if (tipo != null) {
            return ResponseEntity.ok(ubicacionService.listarPorTipo(tipo));
        }
        return ResponseEntity.ok(ubicacionService.listarTodas());
    }

    @GetMapping("/{id}")
    public ResponseEntity<UbicacionResponse> obtenerPorId(@PathVariable Long id) {
        return ResponseEntity.ok(ubicacionService.obtenerPorId(id));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMINISTRADOR')")
    public ResponseEntity<UbicacionResponse> crear(@Valid @RequestBody UbicacionRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(ubicacionService.crear(request));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMINISTRADOR')")
    public ResponseEntity<UbicacionResponse> actualizar(@PathVariable Long id, @Valid @RequestBody UbicacionRequest request) {
        return ResponseEntity.ok(ubicacionService.actualizar(id, request));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMINISTRADOR')")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        ubicacionService.eliminar(id);
        return ResponseEntity.noContent().build();
    }

    /**
     * Endpoint para validar regla de compatibilidad RF-14 / HU-02
     */
    @GetMapping("/validar-compatibilidad")
    public ResponseEntity<Map<String, Object>> validarCompatibilidad(
            @RequestParam Long productoId,
            @RequestParam Long ubicacionId) {

        Producto producto = productoService.buscarProductoActivo(productoId);
        Ubicacion ubicacion = ubicacionService.buscarUbicacionActiva(ubicacionId);

        ubicacionService.validarCompatibilidadAlmacenamiento(producto, ubicacion);

        return ResponseEntity.ok(Map.of(
                "compatible", true,
                "mensaje", "El producto es compatible con la ubicación seleccionada"
        ));
    }
}
