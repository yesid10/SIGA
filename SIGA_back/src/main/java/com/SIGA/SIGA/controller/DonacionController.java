package com.SIGA.SIGA.controller;

import com.SIGA.SIGA.dto.DonacionRequest;
import com.SIGA.SIGA.dto.DonacionResponse;
import com.SIGA.SIGA.dto.LoteResponse;
import com.SIGA.SIGA.model.EstadoLote;
import com.SIGA.SIGA.services.DonacionService;
import jakarta.validation.Valid;
import java.util.List;
import java.util.Optional;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1")
@RequiredArgsConstructor
public class DonacionController {

    private final DonacionService donacionService;

    @PostMapping("/donaciones")
    @PreAuthorize("hasAnyRole('ADMINISTRADOR', 'ENCARGADO')")
    public ResponseEntity<DonacionResponse> registrarDonacion(
            @Valid @RequestBody DonacionRequest request,
            Authentication authentication) {
        String email = authentication != null ? authentication.getName() : null;
        DonacionResponse response = donacionService.registrarDonacion(request, email);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/donaciones")
    @PreAuthorize("hasAnyRole('ADMINISTRADOR', 'ENCARGADO')")
    public ResponseEntity<List<DonacionResponse>> listarDonaciones() {
        return ResponseEntity.ok(donacionService.listarDonaciones());
    }

    @GetMapping("/donaciones/{id}")
    @PreAuthorize("hasAnyRole('ADMINISTRADOR', 'ENCARGADO')")
    public ResponseEntity<DonacionResponse> obtenerDonacionPorId(@PathVariable Long id) {
        return ResponseEntity.ok(donacionService.obtenerPorId(id));
    }

    @GetMapping("/inventario/lotes")
    @PreAuthorize("hasAnyRole('ADMINISTRADOR', 'ENCARGADO', 'BENEFICIARIO')")
    public ResponseEntity<List<LoteResponse>> listarLotes(
            @RequestParam(required = false) Long productoId,
            @RequestParam(required = false) EstadoLote estado) {
        return ResponseEntity.ok(donacionService.listarLotes(Optional.ofNullable(productoId), Optional.ofNullable(estado)));
    }
}
