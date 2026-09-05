package com.SIGA.SIGA.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.HashMap;
import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, Object>> manejarValidacionException(MethodArgumentNotValidException ex) {
        Map<String, Object> respuesta = new HashMap<>();
        Map<String, String> errores = new HashMap<>();

        ex.getBindingResult().getFieldErrors().forEach(error -> 
            errores.put(error.getField(), error.getDefaultMessage())
        );

        respuesta.put("mensaje", "Error en la validación de datos");
        respuesta.put("errores", errores);
        respuesta.put("estado", HttpStatus.BAD_REQUEST.value());

        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(respuesta);
    }

    @ExceptionHandler(EstudianteNoEncontradoException.class)
    public ResponseEntity<Map<String, Object>> manejarEstudianteNoEncontrado(EstudianteNoEncontradoException ex) {
        Map<String, Object> respuesta = new HashMap<>();
        respuesta.put("mensaje", ex.getMessage());
        respuesta.put("estado", HttpStatus.NOT_FOUND.value());

        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(respuesta);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, Object>> manejarExcepcionGeneral(Exception ex) {
        Map<String, Object> respuesta = new HashMap<>();
        respuesta.put("mensaje", "Error interno del servidor");
        respuesta.put("estado", HttpStatus.INTERNAL_SERVER_ERROR.value());

        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(respuesta);
    }
}
