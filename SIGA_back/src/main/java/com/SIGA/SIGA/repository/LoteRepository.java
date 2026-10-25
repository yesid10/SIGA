package com.SIGA.SIGA.repository;

import com.SIGA.SIGA.model.EstadoLote;
import com.SIGA.SIGA.model.Lote;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface LoteRepository extends JpaRepository<Lote, Long> {
    List<Lote> findAllByOrderByFechaVencimientoAsc();

    List<Lote> findByProductoIdAndEstado(Long productoId, EstadoLote estado);

    Optional<Lote> findByProductoIdAndNumeroLoteIgnoreCase(Long productoId, String numeroLote);

    List<Lote> findByFechaVencimientoBetween(LocalDate inicio, LocalDate fin);

    List<Lote> findByFechaVencimientoLessThanEqual(LocalDate fecha);

    List<Lote> findByFechaVencimientoBeforeAndEstadoNot(LocalDate fecha, EstadoLote estado);

    List<Lote> findByFechaVencimientoBetweenAndEstado(LocalDate inicio, LocalDate fin, EstadoLote estado);

    long countByEstado(EstadoLote estado);

    @Query("SELECT COUNT(l) FROM Lote l WHERE l.fechaVencimiento <= :fechaLimite AND l.estado = :estado")
    long countProximosAVencer(@Param("fechaLimite") LocalDate fechaLimite, @Param("estado") EstadoLote estado);

    @Query("SELECT l FROM Lote l WHERE l.producto.id = :productoId AND l.cantidadDisponible > 0 AND l.estado != 'VENCIDO' AND l.estado != 'AGOTADO' ORDER BY l.fechaVencimiento ASC")
    List<Lote> findLotesDisponiblesParaFefo(@Param("productoId") Long productoId);
}
