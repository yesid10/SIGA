package com.SIGA.SIGA.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "beneficiarios")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Beneficiario {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 30)
    private String documento;

    @Column(nullable = false, length = 160)
    private String nombre;

    @Column(length = 120)
    private String email;

    @Column(length = 30)
    private String telefono;

    @Column(length = 200)
    private String direccion;

    @Column(name = "num_personas_hogar", nullable = false)
    private int numPersonasHogar = 1;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "usuario_id")
    private Usuario usuario;

    @Column(nullable = false)
    private boolean activo = true;
}
