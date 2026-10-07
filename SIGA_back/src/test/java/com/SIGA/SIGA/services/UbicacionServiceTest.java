package com.SIGA.SIGA.services;

import com.SIGA.SIGA.exception.ReglaNegocioException;
import com.SIGA.SIGA.model.Categoria;
import com.SIGA.SIGA.model.Producto;
import com.SIGA.SIGA.model.TipoUbicacion;
import com.SIGA.SIGA.model.Ubicacion;
import com.SIGA.SIGA.dto.UbicacionRequest;
import com.SIGA.SIGA.dto.UbicacionResponse;
import com.SIGA.SIGA.repository.UbicacionRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class UbicacionServiceTest {

    @Mock
    private UbicacionRepository ubicacionRepository;

    private UbicacionService ubicacionService;

    @BeforeEach
    void setUp() {
        ubicacionService = new UbicacionService(ubicacionRepository);
    }

    @Test
    void crearUbicacion_Exito() {
        UbicacionRequest request = new UbicacionRequest("EST-A1", "Estante Seco A1", TipoUbicacion.SECO, 500.0);
        when(ubicacionRepository.existsByCodigoIgnoreCase("EST-A1")).thenReturn(false);
        when(ubicacionRepository.save(any(Ubicacion.class))).thenAnswer(inv -> {
            Ubicacion u = inv.getArgument(0);
            u.setId(1L);
            return u;
        });

        UbicacionResponse response = ubicacionService.crear(request);

        assertNotNull(response);
        assertEquals("EST-A1", response.codigo());
        assertEquals(TipoUbicacion.SECO, response.tipo());
        verify(ubicacionRepository).save(any(Ubicacion.class));
    }

    @Test
    void crearUbicacion_CodigoDuplicado_LanzaExcepcion() {
        UbicacionRequest request = new UbicacionRequest("EST-A1", "Estante Seco A1", TipoUbicacion.SECO, 500.0);
        when(ubicacionRepository.existsByCodigoIgnoreCase("EST-A1")).thenReturn(true);

        assertThrows(ReglaNegocioException.class, () -> ubicacionService.crear(request));
        verify(ubicacionRepository, never()).save(any(Ubicacion.class));
    }

    @Test
    void reglaRF14_ProductoPerecederoEnUbicacionSeca_LanzaReglaNegocioException() {
        Categoria cat = new Categoria(1L, "Lácteos", "Productos lácteos", true);
        Producto leche = new Producto(10L, "Leche Entera", "1L", cat, true, "litros", true);
        Ubicacion bodegaSeca = new Ubicacion(20L, "EST-SECO", "Bodega Principal Seca", TipoUbicacion.SECO, 1000.0, true);

        // RF-14: El sistema debe rechazar la asignación
        ReglaNegocioException exception = assertThrows(
                ReglaNegocioException.class,
                () -> ubicacionService.validarCompatibilidadAlmacenamiento(leche, bodegaSeca)
        );

        assertTrue(exception.getMessage().contains("Regla RF-14"));
        assertTrue(exception.getMessage().contains("perecedero"));
    }

    @Test
    void reglaRF14_ProductoPerecederoEnUbicacionRefrigerada_EsValido() {
        Categoria cat = new Categoria(1L, "Lácteos", "Productos lácteos", true);
        Producto leche = new Producto(10L, "Leche Entera", "1L", cat, true, "litros", true);
        Ubicacion cuartoFrio = new Ubicacion(21L, "FRIGO-01", "Cámara Fría 1", TipoUbicacion.REFRIGERADO, 500.0, true);

        // Debe ejecutarse sin lanzar excepción
        assertDoesNotThrow(() -> ubicacionService.validarCompatibilidadAlmacenamiento(leche, cuartoFrio));
    }

    @Test
    void reglaRF14_ProductoNoPerecederoEnUbicacionSeca_EsValido() {
        Categoria cat = new Categoria(2L, "Granos", "Granos y cereales", true);
        Producto arroz = new Producto(11L, "Arroz", "1kg", cat, false, "kg", true);
        Ubicacion bodegaSeca = new Ubicacion(20L, "EST-SECO", "Bodega Principal Seca", TipoUbicacion.SECO, 1000.0, true);

        assertDoesNotThrow(() -> ubicacionService.validarCompatibilidadAlmacenamiento(arroz, bodegaSeca));
    }
}
