package com.SIGA.SIGA.config;

import com.SIGA.SIGA.model.Donacion;
import com.SIGA.SIGA.model.EstadoDonacion;
import com.SIGA.SIGA.model.EstadoLote;
import com.SIGA.SIGA.model.Lote;
import com.SIGA.SIGA.model.Categoria;
import com.SIGA.SIGA.model.Donante;
import com.SIGA.SIGA.model.Producto;
import com.SIGA.SIGA.model.Rol;
import com.SIGA.SIGA.model.TipoDonante;
import com.SIGA.SIGA.model.TipoUbicacion;
import com.SIGA.SIGA.model.Ubicacion;
import com.SIGA.SIGA.model.Usuario;
import com.SIGA.SIGA.repository.CategoriaRepository;
import com.SIGA.SIGA.repository.DonacionRepository;
import com.SIGA.SIGA.repository.DonanteRepository;
import com.SIGA.SIGA.repository.LoteRepository;
import com.SIGA.SIGA.repository.ProductoRepository;
import com.SIGA.SIGA.repository.UbicacionRepository;
import com.SIGA.SIGA.repository.UsuarioRepository;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
@RequiredArgsConstructor
public class SeedConfig {

    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;
    private final CategoriaRepository categoriaRepository;
    private final UbicacionRepository ubicacionRepository;
    private final ProductoRepository productoRepository;
    private final DonanteRepository donanteRepository;
    private final DonacionRepository donacionRepository;
    private final LoteRepository loteRepository;

    @Value("${siga.seed.admin-email}")
    private String adminEmail;

    @Value("${siga.seed.admin-password}")
    private String adminPassword;

    @Bean
    CommandLineRunner seedInitialData() {
        return args -> {
            // 1. Semilla de Usuario Administrador
            if (!usuarioRepository.existsByEmailIgnoreCase(adminEmail)) {
                Usuario admin = new Usuario();
                admin.setNombre("Administrador General");
                admin.setEmail(adminEmail.toLowerCase());
                admin.setPassword(passwordEncoder.encode(adminPassword));
                admin.setRol(Rol.ADMINISTRADOR);
                admin.setActivo(true);
                admin.setFotoUrl("https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&auto=format&fit=crop&q=60");
                usuarioRepository.save(admin);
            }

            if (!usuarioRepository.existsByEmailIgnoreCase("encargado@siga.org")) {
                Usuario encargado = new Usuario();
                encargado.setNombre("Carlos Encargado Bodega");
                encargado.setEmail("encargado@siga.org");
                encargado.setPassword(passwordEncoder.encode("Password123*"));
                encargado.setRol(Rol.ENCARGADO);
                encargado.setActivo(true);
                encargado.setFotoUrl("https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=60");
                usuarioRepository.save(encargado);
            }

            if (!usuarioRepository.existsByEmailIgnoreCase("beneficiario@siga.org")) {
                Usuario bene = new Usuario();
                bene.setNombre("Fundación Manos Unidas");
                bene.setEmail("beneficiario@siga.org");
                bene.setPassword(passwordEncoder.encode("Password123*"));
                bene.setRol(Rol.BENEFICIARIO);
                bene.setActivo(true);
                bene.setFotoUrl("https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=60");
                usuarioRepository.save(bene);
            }

            // 2. Semilla de Categorías
            if (categoriaRepository.count() == 0) {
                Categoria lacteos = new Categoria(null, "Lácteos y Derivados", "Leche, quesos, yogures y productos pasteurizados", true);
                Categoria frutas = new Categoria(null, "Frutas y Verduras", "Alimentos frescos agrícolas y perecederos", true);
                Categoria carnes = new Categoria(null, "Carnes y Aves", "Carnes rojas, pollo, pescado y embutidos", true);
                Categoria granos = new Categoria(null, "Granos y Cereales", "Arroz, frijol, lentejas, garbanzos y avena", true);
                Categoria enlatados = new Categoria(null, "Enlatados y Conservas", "Atún, sardinas, legumbres y vegetales en lata", true);
                Categoria panaderia = new Categoria(null, "Panadería y Pastas", "Pan, pastas secas, galletas y harinas", true);

                categoriaRepository.saveAll(List.of(lacteos, frutas, carnes, granos, enlatados, panaderia));
            }

            // 3. Semilla de Ubicaciones (RF-13: SECO / REFRIGERADO)
            if (ubicacionRepository.count() == 0) {
                Ubicacion cam1 = new Ubicacion(null, "CAM-F01", "Cámara Frigorífica 01 - Principal", TipoUbicacion.REFRIGERADO, 2500.0, true);
                Ubicacion cam2 = new Ubicacion(null, "CAM-F02", "Cámara Frigorífica 02 - Lácteos y Frutas", TipoUbicacion.REFRIGERADO, 1800.0, true);
                Ubicacion estA = new Ubicacion(null, "EST-SEC-A", "Estante Seco Pasillo A", TipoUbicacion.SECO, 2000.0, true);
                Ubicacion estB = new Ubicacion(null, "EST-SEC-B", "Estante Seco Pasillo B", TipoUbicacion.SECO, 2000.0, true);
                Ubicacion bodGranos = new Ubicacion(null, "BOD-GRAN-01", "Bodega de Granos y Harinas", TipoUbicacion.SECO, 6000.0, true);

                ubicacionRepository.saveAll(List.of(cam1, cam2, estA, estB, bodGranos));
            }

            // 4. Semilla de Productos (RF-03: esPerecedero y unidadMedida)
            if (productoRepository.count() == 0) {
                categoriaRepository.findByNombreIgnoreCase("Lácteos y Derivados").ifPresent(cat -> {
                    productoRepository.save(new Producto(null, "Leche Entera 1L", "Bolsa de leche pasteurizada", cat, true, "litros", "https://images.unsplash.com/photo-1550583724-b2692b85b150?w=500&auto=format&fit=crop&q=60", true));
                    productoRepository.save(new Producto(null, "Yogur de Fresa 1L", "Bebida láctea fermentada", cat, true, "litros", "https://images.unsplash.com/photo-1488477181946-6428a0291777?w=500&auto=format&fit=crop&q=60", true));
                    productoRepository.save(new Producto(null, "Queso Campesino 500g", "Queso blanco fresco en bloque", cat, true, "unidades", "https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?w=500&auto=format&fit=crop&q=60", true));
                });

                categoriaRepository.findByNombreIgnoreCase("Carnes y Aves").ifPresent(cat -> {
                    productoRepository.save(new Producto(null, "Pechuga de Pollo", "Pechuga fresca refrigerada", cat, true, "kg", "https://images.unsplash.com/photo-1604503468506-a8da13d82791?w=500&auto=format&fit=crop&q=60", true));
                });

                categoriaRepository.findByNombreIgnoreCase("Frutas y Verduras").ifPresent(cat -> {
                    productoRepository.save(new Producto(null, "Manzana Roja", "Manzanas frescas por kilo", cat, true, "kg", "https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=500&auto=format&fit=crop&q=60", true));
                    productoRepository.save(new Producto(null, "Zanahoria Fresca", "Bolsa de zanahorias lavadas", cat, true, "kg", "https://images.unsplash.com/photo-1598170845058-32b9d6a5c317?w=500&auto=format&fit=crop&q=60", true));
                });

                categoriaRepository.findByNombreIgnoreCase("Granos y Cereales").ifPresent(cat -> {
                    productoRepository.save(new Producto(null, "Arroz Blanco 1kg", "Arroz de grano largo seleccionado", cat, false, "kg", "https://images.unsplash.com/photo-1586201375761-83865001e31c?w=500&auto=format&fit=crop&q=60", true));
                    productoRepository.save(new Producto(null, "Frijol Rojo 500g", "Frijol bola roja empacado", cat, false, "unidades", "https://images.unsplash.com/photo-1551462147-ff29053bfc14?w=500&auto=format&fit=crop&q=60", true));
                    productoRepository.save(new Producto(null, "Lenteja Seleccionada 500g", "Lentejas secas de cocción rápida", cat, false, "unidades", "https://images.unsplash.com/photo-1505253758473-96b3015f21c9?w=500&auto=format&fit=crop&q=60", true));
                });

                categoriaRepository.findByNombreIgnoreCase("Enlatados y Conservas").ifPresent(cat -> {
                    productoRepository.save(new Producto(null, "Atún en Aceite 170g", "Lata de lomos de atún", cat, false, "latas", "https://images.unsplash.com/photo-1544943910-4c1dc44a0eb9?w=500&auto=format&fit=crop&q=60", true));
                });

                categoriaRepository.findByNombreIgnoreCase("Panadería y Pastas").ifPresent(cat -> {
                    productoRepository.save(new Producto(null, "Spaghetti 500g", "Pasta de sémola de trigo", cat, false, "paquetes", "https://images.unsplash.com/photo-1612927601601-6638404737ce?w=500&auto=format&fit=crop&q=60", true));
                });
            }

            // 5. Semilla de Donantes (RF-01)
            if (donanteRepository.count() == 0) {
                Donante d1 = new Donante(null, "900123456-1", "Supermercados Éxito S.A.", TipoDonante.EMPRESA, "donaciones@exito.com", "3101234567", "Carrera 15 # 30-20, Bucaramanga", true);
                Donante d2 = new Donante(null, "890987654-3", "Lácteos Alquería de Colombia", TipoDonante.EMPRESA, "contacto@alqueria.com.co", "3159876543", "Zona Industrial Km 4, Girón", true);
                Donante d3 = new Donante(null, "800555333-8", "Distribuidora Agrícola del Oriente", TipoDonante.EMPRESA, "agro.oriente@distri.com", "3124447788", "Central de Abastos Bloque B, Bucaramanga", true);
                Donante d4 = new Donante(null, "1098765432", "María Camila Restrepo", TipoDonante.PERSONA_NATURAL, "camila.restrepo@gmail.com", "3205558899", "Calle 45 # 22-10, Floridablanca", true);
                Donante d5 = new Donante(null, "63543210", "Juan Carlos Mendoza", TipoDonante.PERSONA_NATURAL, "jcmendoza@hotmail.com", "3001112233", "Carrera 27 # 14-50, Bucaramanga", true);

                donanteRepository.saveAll(List.of(d1, d2, d3, d4, d5));
            }

            // 6. Semilla de Donaciones y Lotes (CU-01 / RF02 / Figura 4 y 5)
            if (donacionRepository.count() == 0) {
                Usuario admin = usuarioRepository.findByEmailIgnoreCase(adminEmail).orElse(null);
                Donante exito = donanteRepository.findByIdentificacion("900123456-1").orElse(null);
                Donante alqueria = donanteRepository.findByIdentificacion("890987654-3").orElse(null);

                Ubicacion cam1 = ubicacionRepository.findByCodigoIgnoreCase("CAM-F01").orElse(null);
                Ubicacion cam2 = ubicacionRepository.findByCodigoIgnoreCase("CAM-F02").orElse(null);
                Ubicacion estA = ubicacionRepository.findByCodigoIgnoreCase("EST-SEC-A").orElse(null);
                Ubicacion bodGranos = ubicacionRepository.findByCodigoIgnoreCase("BOD-GRAN-01").orElse(null);

                Producto leche = productoRepository.findByNombreIgnoreCase("Leche Entera 1L").orElse(null);
                Producto yogurt = productoRepository.findByNombreIgnoreCase("Yogur de Fresa 1L").orElse(null);
                Producto arroz = productoRepository.findByNombreIgnoreCase("Arroz Blanco 1kg").orElse(null);
                Producto frijol = productoRepository.findByNombreIgnoreCase("Frijol Rojo 500g").orElse(null);
                Producto atun = productoRepository.findByNombreIgnoreCase("Atún en Aceite 170g").orElse(null);

                if (exito != null && arroz != null && atun != null) {
                    Donacion donacionExito = new Donacion();
                    donacionExito.setDonante(exito);
                    donacionExito.setUsuarioResponsable(admin);
                    donacionExito.setFechaRecepcion(LocalDate.now().minusDays(5));
                    donacionExito.setObservaciones("Donación mensual de granos y abarrotes");
                    donacionExito.setEstado(EstadoDonacion.RECIBIDA);

                    Lote loteArroz = new Lote(null, "L-ARR-01", arroz, donacionExito, bodGranos, new BigDecimal("300.00"), new BigDecimal("300.00"), "kg", LocalDate.now().minusDays(5), LocalDate.now().plusMonths(6), EstadoLote.DISPONIBLE, null);
                    Lote loteAtun = new Lote(null, "L-ATU-01", atun, donacionExito, estA, new BigDecimal("120.00"), new BigDecimal("120.00"), "latas", LocalDate.now().minusDays(5), LocalDate.now().plusMonths(12), EstadoLote.DISPONIBLE, null);

                    donacionExito.getLotes().addAll(List.of(loteArroz, loteAtun));
                    donacionRepository.save(donacionExito);
                }

                if (alqueria != null && leche != null && yogurt != null) {
                    Donacion donacionAlqueria = new Donacion();
                    donacionAlqueria.setDonante(alqueria);
                    donacionAlqueria.setUsuarioResponsable(admin);
                    donacionAlqueria.setFechaRecepcion(LocalDate.now().minusDays(2));
                    donacionAlqueria.setObservaciones("Entrega refrigerada cadena de frío garantizada");
                    donacionAlqueria.setEstado(EstadoDonacion.RECIBIDA);

                    Lote loteLeche = new Lote(null, "L-LEC-02", leche, donacionAlqueria, cam1, new BigDecimal("150.00"), new BigDecimal("150.00"), "litros", LocalDate.now().minusDays(2), LocalDate.now().plusDays(15), EstadoLote.DISPONIBLE, null);
                    Lote loteYogurt = new Lote(null, "L-YOG-01", yogurt, donacionAlqueria, cam2, new BigDecimal("80.00"), new BigDecimal("80.00"), "litros", LocalDate.now().minusDays(2), LocalDate.now().plusDays(25), EstadoLote.DISPONIBLE, null);

                    donacionAlqueria.getLotes().addAll(List.of(loteLeche, loteYogurt));
                    donacionRepository.save(donacionAlqueria);
                }
            }
        };
    }
}
