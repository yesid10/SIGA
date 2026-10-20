package com.SIGA.SIGA.repository;

import com.SIGA.SIGA.model.Donacion;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface DonacionRepository extends JpaRepository<Donacion, Long> {
    List<Donacion> findAllByOrderByFechaRecepcionDesc();
    List<Donacion> findTop5ByOrderByFechaRecepcionDesc();
    long countBy();
}
