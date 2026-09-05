package com.SIGA.SIGA.controller;

import com.SIGA.SIGA.model.Estudiante;
import com.SIGA.SIGA.model.EstudianteDTO;
import com.SIGA.SIGA.services.EstudianteService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/estudiantes")
@RequiredArgsConstructor
@Tag(name = "Controlador de Estudiantes", description = "API para gestionar estudiantes del sistema SIGA")
public class EstudianteController {

    private final EstudianteService estudianteService;

    @PostMapping
    @Operation(summary = "Crear un nuevo estudiante", description = "Crea un nuevo registro de estudiante en la base de datos")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "201", description = "Estudiante creado exitosamente"),
            @ApiResponse(responseCode = "400", description = "Error en la validación de datos (campos obligatorios, formato de email, rango de nota, etc.)")
    })
    public ResponseEntity<Estudiante> crearEstudiante(@Valid @RequestBody EstudianteDTO estudianteDTO) {
        Estudiante nuevoEstudiante = estudianteService.crearEstudiante(estudianteDTO);
        return ResponseEntity.status(HttpStatus.CREATED).body(nuevoEstudiante);
    }

    @GetMapping("/{cedula}")
    @Operation(summary = "Obtener un estudiante por cédula", description = "Recupera la información de un estudiante específico")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Estudiante encontrado"),
            @ApiResponse(responseCode = "404", description = "Estudiante no encontrado")
    })
    public ResponseEntity<Estudiante> obtenerEstudiante(@PathVariable String cedula) {
        Estudiante estudiante = estudianteService.obtenerEstudiante(cedula)
                .orElseThrow(() -> new com.SIGA.SIGA.exception.EstudianteNoEncontradoException(
                        "Estudiante con cédula " + cedula + " no encontrado"
                ));
        return ResponseEntity.ok(estudiante);
    }

    @GetMapping
    @Operation(summary = "Obtener todos los estudiantes", description = "Recupera la lista completa de estudiantes registrados")
    @ApiResponse(responseCode = "200", description = "Lista de estudiantes")
    public ResponseEntity<List<Estudiante>> obtenerTodos() {
        List<Estudiante> estudiantes = estudianteService.obtenerTodosLosEstudiantes();
        return ResponseEntity.ok(estudiantes);
    }

    @PutMapping("/{cedula}")
    @Operation(summary = "Actualizar un estudiante", description = "Actualiza la información de un estudiante existente")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Estudiante actualizado exitosamente"),
            @ApiResponse(responseCode = "400", description = "Error en la validación de datos"),
            @ApiResponse(responseCode = "404", description = "Estudiante no encontrado")
    })
    public ResponseEntity<Estudiante> actualizarEstudiante(@PathVariable String cedula, 
                                                           @Valid @RequestBody EstudianteDTO estudianteDTO) {
        Estudiante estudianteActualizado = estudianteService.actualizarEstudiante(cedula, estudianteDTO);
        return ResponseEntity.ok(estudianteActualizado);
    }

    @DeleteMapping("/{cedula}")
    @Operation(summary = "Eliminar un estudiante", description = "Elimina el registro de un estudiante de la base de datos")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "204", description = "Estudiante eliminado exitosamente"),
            @ApiResponse(responseCode = "404", description = "Estudiante no encontrado")
    })
    public ResponseEntity<Void> eliminarEstudiante(@PathVariable String cedula) {
        estudianteService.eliminarEstudiante(cedula);
        return ResponseEntity.noContent().build();
    }
}
