package com.SIGA.SIGA.controller;

import com.SIGA.SIGA.dto.BeneficiarioRequest;
import com.SIGA.SIGA.dto.BeneficiarioResponse;
import com.SIGA.SIGA.model.Usuario;
import com.SIGA.SIGA.repository.UsuarioRepository;
import com.SIGA.SIGA.services.BeneficiarioService;
import jakarta.validation.Valid;
import java.security.Principal;
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
@RequestMapping("/api/v1/beneficiarios")
@RequiredArgsConstructor
public class BeneficiarioController {

    private final BeneficiarioService beneficiarioService;
    private final UsuarioRepository usuarioRepository;

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMINISTRADOR', 'ENCARGADO')")
    public ResponseEntity<List<BeneficiarioResponse>> listar() {
        return ResponseEntity.ok(beneficiarioService.listarTodos());
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMINISTRADOR', 'ENCARGADO', 'BENEFICIARIO')")
    public ResponseEntity<BeneficiarioResponse> obtenerPorId(@PathVariable Long id) {
        return ResponseEntity.ok(beneficiarioService.obtenerPorId(id));
    }

    @GetMapping("/mi-perfil")
    @PreAuthorize("hasRole('BENEFICIARIO')")
    public ResponseEntity<BeneficiarioResponse> obtenerMiPerfil(Principal principal) {
        Usuario usuario = usuarioRepository.findByEmailIgnoreCase(principal.getName())
                .orElseThrow(() -> new RuntimeException("Usuario no autenticado"));
        return ResponseEntity.ok(beneficiarioService.obtenerPorUsuarioId(usuario.getId()));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMINISTRADOR', 'ENCARGADO', 'BENEFICIARIO')")
    public ResponseEntity<BeneficiarioResponse> crear(@Valid @RequestBody BeneficiarioRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(beneficiarioService.crear(request));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMINISTRADOR', 'ENCARGADO', 'BENEFICIARIO')")
    public ResponseEntity<BeneficiarioResponse> actualizar(
            @PathVariable Long id,
            @Valid @RequestBody BeneficiarioRequest request) {
        return ResponseEntity.ok(beneficiarioService.actualizar(id, request));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMINISTRADOR')")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        beneficiarioService.eliminar(id);
        return ResponseEntity.noContent().build();
    }
}
