package com.SIGA.SIGA.controller;

import com.SIGA.SIGA.dto.InventarioMetricasResponse;
import com.SIGA.SIGA.dto.LoteResponse;
import com.SIGA.SIGA.services.InventarioService;
import java.time.LocalDate;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/inventario")
@RequiredArgsConstructor
public class InventarioController {

    private final InventarioService inventarioService;

    @GetMapping("/metricas")
    @PreAuthorize("hasAnyRole('ADMINISTRADOR', 'ENCARGADO', 'BENEFICIARIO')")
    public ResponseEntity<InventarioMetricasResponse> obtenerMetricas() {
        return ResponseEntity.ok(inventarioService.obtenerMetricas());
    }

    @GetMapping("/busqueda")
    @PreAuthorize("hasAnyRole('ADMINISTRADOR', 'ENCARGADO', 'BENEFICIARIO')")
    public ResponseEntity<List<LoteResponse>> buscarLotes(
            @RequestParam(required = false) String query,
            @RequestParam(required = false) Long categoriaId,
            @RequestParam(required = false) Long donanteId,
            @RequestParam(required = false) String estado,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate desde,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate hasta) {
        return ResponseEntity.ok(inventarioService.buscarLotes(query, categoriaId, donanteId, estado, desde, hasta));
    }
}
