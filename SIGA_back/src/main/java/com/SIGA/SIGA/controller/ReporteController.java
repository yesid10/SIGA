package com.SIGA.SIGA.controller;

import com.SIGA.SIGA.dto.ReporteBalanceResponse;
import com.SIGA.SIGA.services.ReporteService;
import java.time.LocalDate;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/reportes")
@RequiredArgsConstructor
public class ReporteController {

    private final ReporteService reporteService;

    @GetMapping("/balance")
    @PreAuthorize("hasAnyRole('ADMINISTRADOR', 'ENCARGADO')")
    public ResponseEntity<ReporteBalanceResponse> obtenerReporteBalance(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate desde,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate hasta) {
        return ResponseEntity.ok(reporteService.generarReporteBalance(desde, hasta));
    }
}
