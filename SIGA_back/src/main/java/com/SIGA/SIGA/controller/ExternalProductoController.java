package com.SIGA.SIGA.controller;

import com.SIGA.SIGA.dto.ExternalProductoResponse;
import com.SIGA.SIGA.model.Lote;
import com.SIGA.SIGA.model.Producto;
import com.SIGA.SIGA.repository.LoteRepository;
import com.SIGA.SIGA.repository.ProductoRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.enums.ParameterIn;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

/**
 * Controlador REST para integración Machine-to-Machine (M2M) con otras unidades de desarrollo (ej. Ghost Kitchen).
 * Autenticación mediante cabecera HTTP: X-API-KEY.
 * Restricción de seguridad: Exclusivamente lectura (GET).
 */
@RestController
@RequestMapping("/api/v1/external/productos")
@RequiredArgsConstructor
@Tag(name = "Integración Externa M2M (UDS)", description = "Endpoints de catálogo e inventario para unidades de desarrollo externas (ej. Ghost Kitchen) autenticadas vía X-API-KEY")
public class ExternalProductoController {

    private final ProductoRepository productoRepository;
    private final LoteRepository loteRepository;

    @GetMapping({"", "/"})
    @Operation(
            summary = "Listar catálogo de productos disponibles para consumo externo",
            description = "Devuelve el catálogo de alimentos del Banco de Alimentos con su stock total disponible vigente para despacho. Requiere cabecera X-API-KEY.",
            parameters = {
                    @Parameter(
                            name = "X-API-KEY",
                            in = ParameterIn.HEADER,
                            required = true,
                            description = "Clave de API compartida para la unidad externa",
                            schema = @Schema(type = "string", defaultValue = "siga-uds-external-access-key-2026")
                    )
            }
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Catálogo consultado exitosamente"),
            @ApiResponse(responseCode = "401", description = "X-API-KEY ausente o no autorizada", content = @Content),
            @ApiResponse(responseCode = "403", description = "Operación no permitida (solo lectura GET)", content = @Content)
    })
    public ResponseEntity<List<ExternalProductoResponse>> listarProductosExternos(
            @RequestParam(required = false) Long categoriaId,
            @RequestParam(required = false) Boolean esPerecedero) {

        LocalDate hoy = LocalDate.now();

        List<Producto> productos = productoRepository.findByActivoTrue();
        if (categoriaId != null) {
            productos = productos.stream()
                    .filter(p -> p.getCategoria() != null && p.getCategoria().getId().equals(categoriaId))
                    .toList();
        }
        if (esPerecedero != null) {
            productos = productos.stream()
                    .filter(p -> p.isEsPerecedero() == esPerecedero)
                    .toList();
        }

        List<ExternalProductoResponse> response = productos.stream()
                .map(prod -> {
                    List<Lote> lotesVigentes = loteRepository.findLotesDisponiblesParaFefo(prod.getId(), hoy);
                    BigDecimal stockTotal = lotesVigentes.stream()
                            .map(Lote::getCantidadDisponible)
                            .reduce(BigDecimal.ZERO, BigDecimal::add);

                    return new ExternalProductoResponse(
                            prod.getId(),
                            prod.getNombre(),
                            prod.getDescripcion(),
                            prod.getCategoria() != null ? prod.getCategoria().getNombre() : "Sin categoría",
                            prod.isEsPerecedero(),
                            prod.getUnidadMedida(),
                            stockTotal,
                            prod.getImagenUrl(),
                            stockTotal.compareTo(BigDecimal.ZERO) > 0
                    );
                })
                .toList();

        return ResponseEntity.ok(response);
    }

    @GetMapping({"/{id}", "/{id}/"})
    @Operation(
            summary = "Obtener producto por ID para consumo externo",
            description = "Consulta la información detallada y el stock vigente disponible de un producto específico mediante su ID.",
            parameters = {
                    @Parameter(
                            name = "X-API-KEY",
                            in = ParameterIn.HEADER,
                            required = true,
                            description = "Clave de API compartida para la unidad externa",
                            schema = @Schema(type = "string", defaultValue = "siga-uds-external-access-key-2026")
                    )
            }
    )
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Producto encontrado exitosamente"),
            @ApiResponse(responseCode = "401", description = "X-API-KEY ausente o no autorizada", content = @Content),
            @ApiResponse(responseCode = "404", description = "Producto no encontrado o inactivo", content = @Content)
    })
    public ResponseEntity<ExternalProductoResponse> obtenerProductoPorId(@PathVariable Long id) {
        LocalDate hoy = LocalDate.now();

        return productoRepository.findById(id)
                .filter(Producto::isActivo)
                .map(prod -> {
                    List<Lote> lotesVigentes = loteRepository.findLotesDisponiblesParaFefo(prod.getId(), hoy);
                    BigDecimal stockTotal = lotesVigentes.stream()
                            .map(Lote::getCantidadDisponible)
                            .reduce(BigDecimal.ZERO, BigDecimal::add);

                    ExternalProductoResponse dto = new ExternalProductoResponse(
                            prod.getId(),
                            prod.getNombre(),
                            prod.getDescripcion(),
                            prod.getCategoria() != null ? prod.getCategoria().getNombre() : "Sin categoría",
                            prod.isEsPerecedero(),
                            prod.getUnidadMedida(),
                            stockTotal,
                            prod.getImagenUrl(),
                            stockTotal.compareTo(BigDecimal.ZERO) > 0
                    );
                    return ResponseEntity.ok(dto);
                })
                .orElse(ResponseEntity.notFound().build());
    }
}
