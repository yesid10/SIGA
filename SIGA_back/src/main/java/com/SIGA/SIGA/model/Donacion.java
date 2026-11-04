package com.SIGA.SIGA.model;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "donaciones")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Donacion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER, optional = false)
    @JoinColumn(name = "donante_id", nullable = false)
    private Donante donante;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "usuario_responsable_id")
    private Usuario usuarioResponsable;

    @Column(name = "fecha_recepcion", nullable = false)
    private LocalDate fechaRecepcion;

    @Column(length = 500)
    private String observaciones;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private EstadoDonacion estado = EstadoDonacion.RECIBIDA;

    @OneToMany(mappedBy = "donacion", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Lote> lotes = new ArrayList<>();

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
        if (fechaRecepcion == null) {
            fechaRecepcion = LocalDate.now();
        }
    }
}
