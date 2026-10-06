package com.SIGA.SIGA.config;

import com.SIGA.SIGA.model.Categoria;
import com.SIGA.SIGA.model.Donante;
import com.SIGA.SIGA.model.Producto;
import com.SIGA.SIGA.model.Rol;
import com.SIGA.SIGA.model.TipoDonante;
import com.SIGA.SIGA.model.TipoUbicacion;
import com.SIGA.SIGA.model.Ubicacion;
import com.SIGA.SIGA.model.Usuario;
import com.SIGA.SIGA.repository.CategoriaRepository;
import com.SIGA.SIGA.repository.DonanteRepository;
import com.SIGA.SIGA.repository.ProductoRepository;
import com.SIGA.SIGA.repository.UbicacionRepository;
import com.SIGA.SIGA.repository.UsuarioRepository;
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
                usuarioRepository.save(admin);
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
                    productoRepository.save(new Producto(null, "Leche Entera 1L", "Bolsa de leche pasteurizada", cat, true, "litros", true));
                    productoRepository.save(new Producto(null, "Yogur de Fresa 1L", "Bebida láctea fermentada", cat, true, "litros", true));
                    productoRepository.save(new Producto(null, "Queso Campesino 500g", "Queso blanco fresco en bloque", cat, true, "unidades", true));
                });

                categoriaRepository.findByNombreIgnoreCase("Carnes y Aves").ifPresent(cat -> {
                    productoRepository.save(new Producto(null, "Pechuga de Pollo", "Pechuga fresca refrigerada", cat, true, "kg", true));
                });

                categoriaRepository.findByNombreIgnoreCase("Frutas y Verduras").ifPresent(cat -> {
                    productoRepository.save(new Producto(null, "Manzana Roja", "Manzanas frescas por kilo", cat, true, "kg", true));
                    productoRepository.save(new Producto(null, "Zanahoria Fresca", "Bolsa de zanahorias lavadas", cat, true, "kg", true));
                });

                categoriaRepository.findByNombreIgnoreCase("Granos y Cereales").ifPresent(cat -> {
                    productoRepository.save(new Producto(null, "Arroz Blanco 1kg", "Arroz de grano largo seleccionado", cat, false, "kg", true));
                    productoRepository.save(new Producto(null, "Frijol Rojo 500g", "Frijol bola roja empacado", cat, false, "unidades", true));
                    productoRepository.save(new Producto(null, "Lenteja Seleccionada 500g", "Lentejas secas de cocción rápida", cat, false, "unidades", true));
                });

                categoriaRepository.findByNombreIgnoreCase("Enlatados y Conservas").ifPresent(cat -> {
                    productoRepository.save(new Producto(null, "Atún en Aceite 170g", "Lata de lomos de atún", cat, false, "latas", true));
                });

                categoriaRepository.findByNombreIgnoreCase("Panadería y Pastas").ifPresent(cat -> {
                    productoRepository.save(new Producto(null, "Spaghetti 500g", "Pasta de sémola de trigo", cat, false, "paquetes", true));
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
        };
    }
}
