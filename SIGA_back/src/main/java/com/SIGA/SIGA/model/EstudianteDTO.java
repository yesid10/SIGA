package com.SIGA.SIGA.model;

import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class EstudianteDTO {

    @NotBlank(message = "La cédula es obligatoria")
    @Pattern(regexp = "^[0-9]{8,11}$", message = "La cédula debe contener solo números y tener entre 8 y 11 caracteres")
    private String cedula;

    @NotBlank(message = "El nombre es obligatorio")
    private String nombre;

    @NotBlank(message = "Los apellidos son obligatorios")
    private String apellidos;

    @NotBlank(message = "El correo es obligatorio")
    @Email(message = "El formato del email es inválido")
    private String correo;

    private String direccion;

    @NotBlank(message = "La carrera es obligatoria")
    private String carrera;

    @NotNull(message = "La nota promedio es obligatoria")
    @DecimalMin(value = "0.0", message = "La nota promedio debe ser mínimo 0.0")
    @DecimalMax(value = "5.0", message = "La nota promedio debe ser máximo 5.0")
    private Double notaPromedio;
}
