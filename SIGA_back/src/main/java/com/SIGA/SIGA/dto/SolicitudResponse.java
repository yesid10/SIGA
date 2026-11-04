package com.SIGA.SIGA.dto;

import com.SIGA.SIGA.model.EstadoSolicitud;
import com.SIGA.SIGA.model.Solicitud;
import java.time.LocalDate;
import java.util.List;

public record SolicitudResponse(
        Long id,
        Long beneficiarioId,
        String beneficiarioNombre,
        String beneficiarioDocumento,
        int numPersonasHogar,
        LocalDate fechaSolicitud,
        EstadoSolicitud estado,
        String usuarioResponsableEmail,
        String observaciones,
        List<DetalleSolicitudResponse> detalles,
        int totalProductos
) {
    public static SolicitudResponse from(Solicitud s) {
        List<DetalleSolicitudResponse> items = s.getDetalles()
                .stream()
                .map(DetalleSolicitudResponse::from)
                .toList();

        return new SolicitudResponse(
                s.getId(),
                s.getBeneficiario().getId(),
                s.getBeneficiario().getNombre(),
                s.getBeneficiario().getDocumento(),
                s.getBeneficiario().getNumPersonasHogar(),
                s.getFechaSolicitud(),
                s.getEstado(),
                s.getUsuarioResponsable() != null ? s.getUsuarioResponsable().getEmail() : null,
                s.getObservaciones(),
                items,
                items.size()
        );
    }
}
