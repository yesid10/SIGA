package com.SIGA.SIGA.controller;

import com.SIGA.SIGA.dto.DonanteRequest;
import com.SIGA.SIGA.dto.DonanteResponse;
import com.SIGA.SIGA.services.DonanteService;
import jakarta.validation.Valid;
import java.util.List;
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
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/donantes")
@RequiredArgsConstructor
public class DonanteController {

    private final DonanteService donanteService;

    @GetMapping
    public ResponseEntity<List<DonanteResponse>> listarTodos() {
        return ResponseEntity.ok(donanteService.listarTodos());
    }

    @GetMapping("/{id}")
    public ResponseEntity<DonanteResponse> obtenerPorId(@PathVariable Long id) {
        return ResponseEntity.ok(donanteService.obtenerPorId(id));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMINISTRADOR', 'ENCARGADO')")
    public ResponseEntity<DonanteResponse> crear(@Valid @RequestBody DonanteRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(donanteService.crear(request));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMINISTRADOR', 'ENCARGADO')")
    public ResponseEntity<DonanteResponse> actualizar(@PathVariable Long id, @Valid @RequestBody DonanteRequest request) {
        return ResponseEntity.ok(donanteService.actualizar(id, request));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMINISTRADOR', 'ENCARGADO')")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        donanteService.eliminar(id);
        return ResponseEntity.noContent().build();
    }
}
