package com.SIGA.SIGA.services;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

import com.SIGA.SIGA.dto.DonacionRequest;
import com.SIGA.SIGA.dto.DonacionResponse;
import com.SIGA.SIGA.dto.LoteItemRequest;
import com.SIGA.SIGA.exception.ReglaNegocioException;
import com.SIGA.SIGA.model.Categoria;
import com.SIGA.SIGA.model.Donacion;
import com.SIGA.SIGA.model.Donante;
import com.SIGA.SIGA.model.EstadoDonacion;
import com.SIGA.SIGA.model.EstadoLote;
import com.SIGA.SIGA.model.Producto;
import com.SIGA.SIGA.model.TipoDonante;
import com.SIGA.SIGA.model.TipoUbicacion;
import com.SIGA.SIGA.model.Ubicacion;
import com.SIGA.SIGA.model.Usuario;
import com.SIGA.SIGA.repository.DonacionRepository;
import com.SIGA.SIGA.repository.DonanteRepository;
import com.SIGA.SIGA.repository.LoteRepository;
import com.SIGA.SIGA.repository.ProductoRepository;
import com.SIGA.SIGA.repository.UbicacionRepository;
import com.SIGA.SIGA.repository.UsuarioRepository;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
public class DonacionServiceTest {

    @Mock
    private DonacionRepository donacionRepository;

    @Mock
    private LoteRepository loteRepository;

    @Mock
    private DonanteRepository donanteRepository;

    @Mock
    private ProductoRepository productoRepository;

    @Mock
    private UbicacionRepository ubicacionRepository;

    @Mock
    private UsuarioRepository usuarioRepository;

    @InjectMocks
    private DonacionService donacionService;

    private Donante donante;
    private Categoria categoriaLacteos;
    private Producto productoPerecedero;
    private Ubicacion ubicacionSeca;
    private Ubicacion ubicacionRefrigerada;

    @BeforeEach
    void setUp() {
        donante = new Donante(1L, "900123456", "Fundación Esperanza", TipoDonante.EMPRESA, "contacto@esperanza.org", "3001234567", "Calle 10 # 5-20", true);
        categoriaLacteos = new Categoria(1L, "Lácteos", "Productos lácteos", true);
        productoPerecedero = new Producto(10L, "Leche Entera 1L", "Leche pasteurizada", categoriaLacteos, true, "Litros", null, true);
        ubicacionSeca = new Ubicacion(1L, "EST-01", "Estantería A1", TipoUbicacion.SECO, 500.0, true);
        ubicacionRefrigerada = new Ubicacion(2L, "CAM-01", "Cámara Fría 1", TipoUbicacion.REFRIGERADO, 1000.0, true);
    }

    @Test
    void registrarDonacion_Exitoso() {
        LoteItemRequest item = new LoteItemRequest(
                10L,
                "L004",
                new BigDecimal("50"),
                "Litros",
                LocalDate.now().plusMonths(1),
                2L
        );
        DonacionRequest request = new DonacionRequest(
                1L,
                LocalDate.now(),
                "Donación comunitaria",
                List.of(item)
        );

        when(donanteRepository.findById(1L)).thenReturn(Optional.of(donante));
        when(productoRepository.findById(10L)).thenReturn(Optional.of(productoPerecedero));
        when(ubicacionRepository.findById(2L)).thenReturn(Optional.of(ubicacionRefrigerada));
        when(donacionRepository.save(any(Donacion.class))).thenAnswer(invocation -> {
            Donacion d = invocation.getArgument(0);
            d.setId(100L);
            return d;
        });

        DonacionResponse response = donacionService.registrarDonacion(request, "encargado@siga.local");

        assertNotNull(response);
        assertEquals(100L, response.id());
        assertEquals("Fundación Esperanza", response.donanteNombre());
        assertEquals(EstadoDonacion.RECIBIDA, response.estado());
        assertEquals(1, response.totalProductos());
        assertEquals(new BigDecimal("50"), response.totalCantidad());
    }

    @Test
    void registrarDonacion_FallaSiPerecederoEnUbicacionSeca() {
        LoteItemRequest item = new LoteItemRequest(
                10L,
                "L004",
                new BigDecimal("50"),
                "Litros",
                LocalDate.now().plusMonths(1),
                1L // Ubicación Seca
        );
        DonacionRequest request = new DonacionRequest(
                1L,
                LocalDate.now(),
                "Intento incorrecto de almacenamiento",
                List.of(item)
        );

        when(donanteRepository.findById(1L)).thenReturn(Optional.of(donante));
        when(productoRepository.findById(10L)).thenReturn(Optional.of(productoPerecedero));
        when(ubicacionRepository.findById(1L)).thenReturn(Optional.of(ubicacionSeca));

        ReglaNegocioException exception = assertThrows(ReglaNegocioException.class, () ->
                donacionService.registrarDonacion(request, "encargado@siga.local"));

        assertEquals("El producto perecedero 'Leche Entera 1L' requiere una ubicación refrigerada y no puede almacenarse en 'Estantería A1' (SECO).", exception.getMessage());
    }

    @Test
    void registrarDonacion_FallaSiFechaVencimientoEsPasada() {
        LoteItemRequest item = new LoteItemRequest(
                10L,
                "L004",
                new BigDecimal("50"),
                "Litros",
                LocalDate.now().minusDays(1), // Vencido
                2L
        );
        DonacionRequest request = new DonacionRequest(
                1L,
                LocalDate.now(),
                "Intento de vencido",
                List.of(item)
        );

        when(donanteRepository.findById(1L)).thenReturn(Optional.of(donante));
        when(productoRepository.findById(10L)).thenReturn(Optional.of(productoPerecedero));

        assertThrows(ReglaNegocioException.class, () ->
                donacionService.registrarDonacion(request, "encargado@siga.local"));
    }
}
