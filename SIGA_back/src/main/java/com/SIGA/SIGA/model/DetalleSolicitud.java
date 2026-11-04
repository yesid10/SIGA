package com.SIGA.SIGA.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import java.math.BigDecimal;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "detalles_solicitud")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class DetalleSolicitud {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "solicitud_id", nullable = false)
    @JsonIgnore
    private Solicitud solicitud;

    @ManyToOne(fetch = FetchType.EAGER, optional = false)
    @JoinColumn(name = "producto_id", nullable = false)
    private Producto producto;

    @Column(name = "cantidad_solicitada", nullable = false, precision = 10, scale = 2)
    private BigDecimal cantidadSolicitada;

    @Column(name = "cantidad_asignada", nullable = false, precision = 10, scale = 2)
    private BigDecimal cantidadAsignada = BigDecimal.ZERO;
}
