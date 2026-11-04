package com.SIGA.SIGA.services;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.SIGA.SIGA.dto.SolicitudItemRequest;
import com.SIGA.SIGA.dto.SolicitudRequest;
import com.SIGA.SIGA.dto.SolicitudResponse;
import com.SIGA.SIGA.exception.ReglaNegocioException;
import com.SIGA.SIGA.model.Beneficiario;
import com.SIGA.SIGA.model.DetalleSolicitud;
import com.SIGA.SIGA.model.EstadoLote;
import com.SIGA.SIGA.model.EstadoSolicitud;
import com.SIGA.SIGA.model.Lote;
import com.SIGA.SIGA.model.Producto;
import com.SIGA.SIGA.model.Rol;
import com.SIGA.SIGA.model.Solicitud;
import com.SIGA.SIGA.model.Usuario;
import com.SIGA.SIGA.repository.BeneficiarioRepository;
import com.SIGA.SIGA.repository.LoteRepository;
import com.SIGA.SIGA.repository.ProductoRepository;
import com.SIGA.SIGA.repository.SolicitudRepository;
import com.SIGA.SIGA.repository.UsuarioRepository;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
public class SolicitudServiceTest {

    @Mock
    private SolicitudRepository solicitudRepository;

    @Mock
    private BeneficiarioRepository beneficiarioRepository;

    @Mock
    private ProductoRepository productoRepository;

    @Mock
    private LoteRepository loteRepository;

    @Mock
    private UsuarioRepository usuarioRepository;

    @InjectMocks
    private SolicitudService solicitudService;

    private Beneficiario beneficiario;
    private Producto arroz;
    private Usuario admin;

    @BeforeEach
    void setUp() {
        beneficiario = new Beneficiario(1L, "901234567-8", "Fundación Hogar", "hogar@test.com", "3001234567", "Calle 1 # 2-3", 30, null, true);
        arroz = new Producto(10L, "Arroz 1kg", "Arroz blanco", null, false, "kg", null, true);
        admin = new Usuario(2L, "admin@siga.local", "hash", null, "Admin General", Rol.ADMINISTRADOR, null, true);
    }

    @Test
    void crearSolicitud_Exito() {
        SolicitudRequest request = new SolicitudRequest(
                1L,
                "Solicitud de prueba",
                List.of(new SolicitudItemRequest(10L, new BigDecimal("20.00")))
        );

        when(beneficiarioRepository.findById(1L)).thenReturn(Optional.of(beneficiario));
        when(productoRepository.findById(10L)).thenReturn(Optional.of(arroz));
        when(solicitudRepository.save(any(Solicitud.class))).thenAnswer(invocation -> {
            Solicitud s = invocation.getArgument(0);
            s.setId(100L);
            return s;
        });

        SolicitudResponse response = solicitudService.crearSolicitud(request);

        assertNotNull(response);
        assertEquals(100L, response.id());
        assertEquals(EstadoSolicitud.PENDIENTE, response.estado());
        assertEquals(1, response.detalles().size());
        assertEquals(new BigDecimal("20.00"), response.detalles().get(0).cantidadSolicitada());
    }

    @Test
    void despacharConFefo_Exito_DescuentaLoteMasProximo() {
        Solicitud solicitud = new Solicitud();
        solicitud.setId(50L);
        solicitud.setBeneficiario(beneficiario);
        solicitud.setEstado(EstadoSolicitud.PENDIENTE);
        solicitud.setFechaSolicitud(LocalDate.now());

        DetalleSolicitud detalle = new DetalleSolicitud(1L, solicitud, arroz, new BigDecimal("25.00"), BigDecimal.ZERO);
        solicitud.getDetalles().add(detalle);

        Lote lote1 = new Lote(101L, "L-01", arroz, null, null, new BigDecimal("50.00"), new BigDecimal("50.00"), "kg", LocalDate.now(), LocalDate.now().plusDays(20), EstadoLote.PROXIMO_A_VENCER, null);

        when(solicitudRepository.findById(50L)).thenReturn(Optional.of(solicitud));
        when(usuarioRepository.findByEmailIgnoreCase("admin@siga.local")).thenReturn(Optional.of(admin));
        when(loteRepository.findLotesDisponiblesParaFefo(eq(10L), any(LocalDate.class))).thenReturn(List.of(lote1));
        when(solicitudRepository.saveAndFlush(any(Solicitud.class))).thenAnswer(invocation -> invocation.getArgument(0));

        SolicitudResponse response = solicitudService.despacharConFefo(50L, "admin@siga.local");

        assertNotNull(response);
        assertEquals(EstadoSolicitud.DESPACHADA, response.estado());
        assertEquals(new BigDecimal("25.00"), response.detalles().get(0).cantidadAsignada());
        assertEquals(new BigDecimal("25.00"), lote1.getCantidadDisponible());
        verify(loteRepository).saveAndFlush(lote1);
    }

    @Test
    void despacharConFefo_MultiplesLotesFefo_ConsumePrimeroMasAntiguo() {
        Solicitud solicitud = new Solicitud();
        solicitud.setId(51L);
        solicitud.setBeneficiario(beneficiario);
        solicitud.setEstado(EstadoSolicitud.PENDIENTE);
        solicitud.setFechaSolicitud(LocalDate.now());

        DetalleSolicitud detalle = new DetalleSolicitud(2L, solicitud, arroz, new BigDecimal("40.00"), BigDecimal.ZERO);
        solicitud.getDetalles().add(detalle);

        Lote loteProximo = new Lote(101L, "L-PRX", arroz, null, null, new BigDecimal("15.00"), new BigDecimal("15.00"), "kg", LocalDate.now(), LocalDate.now().plusDays(5), EstadoLote.PROXIMO_A_VENCER, null);
        Lote lotePosterior = new Lote(102L, "L-POST", arroz, null, null, new BigDecimal("50.00"), new BigDecimal("50.00"), "kg", LocalDate.now(), LocalDate.now().plusDays(60), EstadoLote.DISPONIBLE, null);

        when(solicitudRepository.findById(51L)).thenReturn(Optional.of(solicitud));
        when(usuarioRepository.findByEmailIgnoreCase("admin@siga.local")).thenReturn(Optional.of(admin));
        when(loteRepository.findLotesDisponiblesParaFefo(eq(10L), any(LocalDate.class))).thenReturn(List.of(loteProximo, lotePosterior));
        when(solicitudRepository.saveAndFlush(any(Solicitud.class))).thenAnswer(invocation -> invocation.getArgument(0));

        SolicitudResponse response = solicitudService.despacharConFefo(51L, "admin@siga.local");

        assertNotNull(response);
        assertEquals(EstadoSolicitud.DESPACHADA, response.estado());
        assertEquals(new BigDecimal("40.00"), response.detalles().get(0).cantidadAsignada());
        assertEquals(BigDecimal.ZERO, loteProximo.getCantidadDisponible());
        assertEquals(EstadoLote.AGOTADO, loteProximo.getEstado());
        assertEquals(new BigDecimal("25.00"), lotePosterior.getCantidadDisponible());
    }

    @Test
    void despacharConFefo_SinStockDisponible_LanzaReglaNegocioException() {
        Solicitud solicitud = new Solicitud();
        solicitud.setId(52L);
        solicitud.setBeneficiario(beneficiario);
        solicitud.setEstado(EstadoSolicitud.PENDIENTE);

        DetalleSolicitud detalle = new DetalleSolicitud(3L, solicitud, arroz, new BigDecimal("10.00"), BigDecimal.ZERO);
        solicitud.getDetalles().add(detalle);

        when(solicitudRepository.findById(52L)).thenReturn(Optional.of(solicitud));
        when(usuarioRepository.findByEmailIgnoreCase("admin@siga.local")).thenReturn(Optional.of(admin));
        when(loteRepository.findLotesDisponiblesParaFefo(eq(10L), any(LocalDate.class))).thenReturn(new ArrayList<>());

        ReglaNegocioException ex = assertThrows(ReglaNegocioException.class, () ->
                solicitudService.despacharConFefo(52L, "admin@siga.local")
        );

        assertNotNull(ex.getMessage());
        assertEquals(true, ex.getMessage().contains("No hay lotes vigentes con stock disponible en bodega"));
    }

    @Test
    void despacharConFefo_SolicitudYaDespachada_LanzaReglaNegocioException() {
        Solicitud solicitud = new Solicitud();
        solicitud.setId(53L);
        solicitud.setEstado(EstadoSolicitud.DESPACHADA);

        when(solicitudRepository.findById(53L)).thenReturn(Optional.of(solicitud));

        assertThrows(ReglaNegocioException.class, () ->
                solicitudService.despacharConFefo(53L, "admin@siga.local")
        );
    }

    @Test
    void rechazarSolicitud_Exito() {
        Solicitud solicitud = new Solicitud();
        solicitud.setId(54L);
        solicitud.setBeneficiario(beneficiario);
        solicitud.setEstado(EstadoSolicitud.PENDIENTE);
        solicitud.setObservaciones("Obs previa");

        when(solicitudRepository.findById(54L)).thenReturn(Optional.of(solicitud));
        when(usuarioRepository.findByEmailIgnoreCase("admin@siga.local")).thenReturn(Optional.of(admin));
        when(solicitudRepository.save(any(Solicitud.class))).thenAnswer(invocation -> invocation.getArgument(0));

        SolicitudResponse response = solicitudService.rechazarSolicitud(54L, "Falta de stock", "admin@siga.local");

        assertNotNull(response);
        assertEquals(EstadoSolicitud.RECHAZADA, response.estado());
        assertEquals(true, response.observaciones().contains("Motivo de rechazo: Falta de stock"));
    }
}
