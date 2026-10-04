# SIGA Backend

Backend del Sistema de Gestión de Inventario para un Banco de Alimentos con priorización FEFO.

La aplicación está en migración desde el CRUD académico inicial hacia el dominio de donaciones, usuarios, inventario por lotes, solicitudes y distribuciones. La autenticación actual utiliza JWT propio; la siguiente fase integrará Firebase Authentication como proveedor de identidad inicial, manteniendo el JWT del backend para las peticiones normales.

## Tecnologías

- Java 17
- Spring Boot
- Spring Web MVC
- Spring Data JPA / Hibernate
- PostgreSQL
- Spring Security y JWT
- OpenAPI / Swagger

## Ejecución

Para ejecutar con Docker Compose desde la raíz del repositorio:

```text
docker compose up --build
```

Para ejecutar el backend directamente, define estas variables en `.env` o en el entorno:

- `DB_URL`
- `DB_USERNAME`
- `DB_PASSWORD`
- `JWT_SECRET`
- `JWT_EXPIRATION_MS`
- `CORS_ALLOWED_ORIGINS`
- `SEED_ADMIN_EMAIL`
- `SEED_ADMIN_PASSWORD`

Después ejecuta el Maven Wrapper:

```text
./mvnw spring-boot:run
```

La API queda disponible en `http://localhost:8080`.

## Autenticación actual

Endpoint público disponible:

- `POST /api/v1/auth/login`

Credenciales locales de desarrollo:

- Correo: `admin@siga.local`
- Contraseña: `Admin123!`

El resto de endpoints requiere el encabezado `Authorization: Bearer <jwt>`.

La integración Firebase → JWT propio se implementará en la Fase 3 del plan raíz del repositorio.

## Documentación

- Swagger UI: `http://localhost:8080/swagger-ui.html`
- OpenAPI JSON: `http://localhost:8080/v3/api-docs`

El diseño de entidades, DTOs, perfiles, roles, donaciones e inventario está documentado en `/plan.md`.
