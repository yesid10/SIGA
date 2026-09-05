package com.SIGA.SIGA.services;

import com.SIGA.SIGA.exception.EstudianteNoEncontradoException;
import com.SIGA.SIGA.model.Estudiante;
import com.SIGA.SIGA.model.EstudianteDTO;
import com.SIGA.SIGA.repository.EstudianteRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class EstudianteService {

    private final EstudianteRepository estudianteRepository;

    public Estudiante crearEstudiante(EstudianteDTO estudianteDTO) {
        Estudiante estudiante = new Estudiante();
        estudiante.setCedula(estudianteDTO.getCedula());
        estudiante.setNombre(estudianteDTO.getNombre());
        estudiante.setApellidos(estudianteDTO.getApellidos());
        estudiante.setCorreo(estudianteDTO.getCorreo());
        estudiante.setDireccion(estudianteDTO.getDireccion());
        estudiante.setCarrera(estudianteDTO.getCarrera());
        estudiante.setNotaPromedio(estudianteDTO.getNotaPromedio());
        
        return estudianteRepository.save(estudiante);
    }

    public Optional<Estudiante> obtenerEstudiante(String cedula) {
        return estudianteRepository.findById(cedula);
    }

    public List<Estudiante> obtenerTodosLosEstudiantes() {
        return estudianteRepository.findAll();
    }

    public Estudiante actualizarEstudiante(String cedula, EstudianteDTO estudianteDTO) {
        Estudiante estudiante = estudianteRepository.findById(cedula)
                .orElseThrow(() -> new EstudianteNoEncontradoException("Estudiante con cédula " + cedula + " no encontrado"));
        
        estudiante.setNombre(estudianteDTO.getNombre());
        estudiante.setApellidos(estudianteDTO.getApellidos());
        estudiante.setCorreo(estudianteDTO.getCorreo());
        estudiante.setDireccion(estudianteDTO.getDireccion());
        estudiante.setCarrera(estudianteDTO.getCarrera());
        estudiante.setNotaPromedio(estudianteDTO.getNotaPromedio());
        
        return estudianteRepository.save(estudiante);
    }

    public void eliminarEstudiante(String cedula) {
        if (!estudianteRepository.existsById(cedula)) {
            throw new EstudianteNoEncontradoException("Estudiante con cédula " + cedula + " no encontrado");
        }
        estudianteRepository.deleteById(cedula);
    }
}
