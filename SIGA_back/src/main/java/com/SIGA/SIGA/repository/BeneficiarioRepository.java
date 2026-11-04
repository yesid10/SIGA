package com.SIGA.SIGA.repository;

import com.SIGA.SIGA.model.Beneficiario;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface BeneficiarioRepository extends JpaRepository<Beneficiario, Long> {
    List<Beneficiario> findByActivoTrue();
    Optional<Beneficiario> findByDocumento(String documento);
    boolean existsByDocumento(String documento);
    Optional<Beneficiario> findByUsuarioId(Long usuarioId);
}
