package com.SIGA.SIGA.repository;

import com.SIGA.SIGA.model.TipoUbicacion;
import com.SIGA.SIGA.model.Ubicacion;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UbicacionRepository extends JpaRepository<Ubicacion, Long> {
    Optional<Ubicacion> findByCodigoIgnoreCase(String codigo);
    boolean existsByCodigoIgnoreCase(String codigo);
    List<Ubicacion> findByActivoTrue();
    List<Ubicacion> findByTipoAndActivoTrue(TipoUbicacion tipo);
}
