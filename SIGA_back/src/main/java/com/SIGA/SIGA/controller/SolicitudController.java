package com.SIGA.SIGA.controller;

import com.SIGA.SIGA.dto.SolicitudRequest;
import com.SIGA.SIGA.dto.SolicitudResponse;
import com.SIGA.SIGA.model.Rol;
import com.SIGA.SIGA.model.Usuario;
import com.SIGA.SIGA.repository.BeneficiarioRepository;
import com.SIGA.SIGA.repository.UsuarioRepository;
import com.SIGA.SIGA.services.SolicitudService;
import jakarta.validation.Valid;
import java.security.Principal;
import java.util.List;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/solicitudes")
@RequiredArgsConstructor
public class SolicitudController {

    private final SolicitudService solicitudService;
    private final UsuarioRepository usuarioRepository;
    private final BeneficiarioRepository beneficiarioRepository;

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMINISTRADOR', 'ENCARGADO', 'BENEFICIARIO')")
    public ResponseEntity<List<SolicitudResponse>> listar(Principal principal) {
        Usuario usuario = usuarioRepository.findByEmailIgnoreCase(principal.getName()).orElse(null);

        // Si el usuario es BENEFICIARIO, solo ve sus solicitudes
        if (usuario != null && usuario.getRol() == Rol.BENEFICIARIO) {
            return beneficiarioRepository.findByUsuarioId(usuario.getId())
                    .map(b -> ResponseEntity.ok(solicitudService.listarPorBeneficiario(b.getId())))
                    .orElseGet(() -> ResponseEntity.ok(List.of()));
        }

        // Administradores y Encargados ven todas las solicitudes
        return ResponseEntity.ok(solicitudService.listarTodas());
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMINISTRADOR', 'ENCARGADO', 'BENEFICIARIO')")
    public ResponseEntity<SolicitudResponse> obtenerPorId(@PathVariable Long id) {
        return ResponseEntity.ok(solicitudService.obtenerPorId(id));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMINISTRADOR', 'ENCARGADO', 'BENEFICIARIO')")
    public ResponseEntity<SolicitudResponse> crear(@Valid @RequestBody SolicitudRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(solicitudService.crearSolicitud(request));
    }

    @PostMapping("/{id}/despachar")
    @PreAuthorize("hasAnyRole('ADMINISTRADOR', 'ENCARGADO')")
    public ResponseEntity<SolicitudResponse> despacharConFefo(@PathVariable Long id, Principal principal) {
        return ResponseEntity.ok(solicitudService.despacharConFefo(id, principal.getName()));
    }

    @PostMapping("/{id}/rechazar")
    @PreAuthorize("hasAnyRole('ADMINISTRADOR', 'ENCARGADO')")
    public ResponseEntity<SolicitudResponse> rechazar(
            @PathVariable Long id,
            @RequestBody(required = false) Map<String, String> body,
            Principal principal) {
        String motivo = body != null ? body.get("motivo") : null;
        return ResponseEntity.ok(solicitudService.rechazarSolicitud(id, motivo, principal.getName()));
    }
}
