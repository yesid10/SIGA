package com.SIGA.SIGA.repository;

import com.SIGA.SIGA.model.Producto;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ProductoRepository extends JpaRepository<Producto, Long> {
    List<Producto> findByActivoTrue();
    List<Producto> findByCategoriaIdAndActivoTrue(Long categoriaId);
    List<Producto> findByEsPerecederoAndActivoTrue(boolean esPerecedero);
}
