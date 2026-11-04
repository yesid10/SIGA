package com.SIGA.SIGA.repository;

import com.SIGA.SIGA.model.Donante;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface DonanteRepository extends JpaRepository<Donante, Long> {
    Optional<Donante> findByIdentificacion(String identificacion);
    boolean existsByIdentificacion(String identificacion);
    List<Donante> findByActivoTrue();
}
