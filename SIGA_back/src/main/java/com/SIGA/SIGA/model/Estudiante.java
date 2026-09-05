package com.SIGA.SIGA.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "estudiantes")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Estudiante {

    @Id
    @NotBlank(message = "La cédula es obligatoria")
    @Pattern(regexp = "^[0-9]{8,11}$", message = "La cédula debe contener solo números y tener entre 8 y 11 caracteres")
    @Column(length = 11, unique = true)
    private String cedula;

    @NotBlank(message = "El nombre es obligatorio")
    @Column(nullable = false)
    private String nombre;

    @NotBlank(message = "Los apellidos son obligatorios")
    @Column(nullable = false)
    private String apellidos;

    @NotBlank(message = "El correo es obligatorio")
    @Email(message = "El formato del email es inválido")
    @Column(nullable = false, unique = true)
    private String correo;

    @Column(name = "direccion_residencia")
    private String direccion;

    @NotBlank(message = "La carrera es obligatoria")
    @Column(nullable = false)
    private String carrera;

    @NotNull(message = "La nota promedio es obligatoria")
    @DecimalMin(value = "0.0", message = "La nota promedio debe ser mínimo 0.0")
    @DecimalMax(value = "5.0", message = "La nota promedio debe ser máximo 5.0")
    @Column(nullable = false)
    private Double notaPromedio;

}
