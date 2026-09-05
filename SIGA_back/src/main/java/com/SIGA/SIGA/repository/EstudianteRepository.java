package com.SIGA.SIGA.repository;

import com.SIGA.SIGA.model.Estudiante;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface EstudianteRepository extends JpaRepository<Estudiante, String> {
    boolean existsByCorreo(String correo);
}
