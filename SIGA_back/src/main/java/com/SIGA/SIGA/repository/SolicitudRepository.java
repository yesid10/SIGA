package com.SIGA.SIGA.repository;

import com.SIGA.SIGA.model.EstadoSolicitud;
import com.SIGA.SIGA.model.Solicitud;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SolicitudRepository extends JpaRepository<Solicitud, Long> {
    List<Solicitud> findAllByOrderByFechaSolicitudDesc();
    List<Solicitud> findByBeneficiarioIdOrderByFechaSolicitudDesc(Long beneficiarioId);
    List<Solicitud> findByEstadoOrderByFechaSolicitudDesc(EstadoSolicitud estado);
}
