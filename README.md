# SIGA - Sistema Inteligente de Gestión de Alimentos 🍎📦

[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.4%2B%20%2F%204.x-6DB33F?logo=springboot&logoColor=white)](https://spring.io/projects/spring-boot)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169E1?logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?logo=docker&logoColor=white)](https://www.docker.com/)

**SIGA** es una plataforma integral diseñada para optimizar las operaciones de los **Bancos de Alimentos**, facilitando la recepción de donaciones, el almacenamiento técnico de víveres según su naturaleza perecedera o seca, la gestión de beneficiarios vulnerables y el **despacho automatizado con rotación FEFO (*First Expired, First Out*)**.

---

## ⚡ Levantamiento en 1 Solo Paso (Zero-Config)

> **¿Funciona el proyecto con un solo comando?**  
> **¡SÍ!** Gracias a la configuración orquestada de Docker Compose y al componente de semillas (`SeedConfig`) del backend, no necesitas correr scripts SQL, crear esquemas manuales ni configurar usuarios iniciales. Al levantar los contenedores, la base de datos se crea, las tablas se generan y todos los datos semilla (usuarios, catálogo, lotes, ubicaciones y donaciones) se cargan automáticamente.

### Requisitos previos
- [Docker Engine](https://docs.docker.com/engine/install/) (v24+) y [Docker Compose](https://docs.docker.com/compose/) (v2+).

### Paso único
En la raíz del proyecto, ejecuta:

```bash
docker compose up -d --build
```

*(O `docker compose up -d` si las imágenes ya fueron compiladas).*

Docker se encargará automáticamente de:
1. Levantar **PostgreSQL 16** (`siga-db`) y verificar su salud interna con `pg_isready`.
2. Compilar y arrancar la API **Spring Boot** (`siga-backend`), ejecutando la creación del esquema y la siembra de datos de prueba (`SeedConfig`).
3. Compilar y servir la aplicación **React 19 + Vite** mediante **Nginx** (`siga-frontend`) con proxy inverso hacia el backend.

---

## 🌐 URLs de Acceso y Credenciales Preconfiguradas

Una vez levantados los contenedores, accede desde tu navegador:

| Servicio | URL | Descripción |
| :--- | :--- | :--- |
| **Frontend Web** | [http://localhost:5173](http://localhost:5173) | Aplicación React SPA (o puerto configurado) |
| **Backend API** | [http://localhost:8080](http://localhost:8080) | API REST Spring Boot |
| **Swagger / OpenAPI** | [http://localhost:8080/swagger-ui.html](http://localhost:8080/swagger-ui.html) | Documentación interactiva de endpoints |
| **Base de Datos** | `localhost:5433` (externo) | PostgreSQL (`siga` / `siga-dev-password`) |

### Cuentas Semilla Disponibles

| Rol | Correo Electrónico | Contraseña | Permisos y Alcance |
| :--- | :--- | :--- | :--- |
| **Administrador** | `admin@siga.local` | `Admin123!` | Acceso total: donaciones, inventario, beneficiarios, reportes de balance y usuarios. |
| **Encargado de Bodega** | `encargado@siga.org` | `Password123*` | Recepción de donaciones, gestión de ubicaciones, control de lotes y despacho FEFO. |
| **Beneficiario** | `beneficiario@siga.org` | `Password123*` | Portal de autoservicio: consulta de cupos y creación de solicitudes de víveres. |

---

## 🛠️ Módulos y Reglas de Negocio Implementadas

### 1. Donaciones y Trazabilidad (RF01 - RF03)
- Registro de donantes clasificados como **Empresas** (con NIT) o **Personas Naturales** (con Cédula).
- Ingreso de remesas con asignación de código de lote, fecha de vencimiento y cantidad inicial.

### 2. Almacenamiento Técnico y Capacidad (RF13 - RF14)
- Diferenciación estricta de ubicaciones:
  - **Cámaras Frigoríficas (`REFRIGERADO`):** Para lácteos, carnes y frutas perecederas.
  - **Estantes y Pasillos (`SECO`):** Para granos, enlatados y pastas no perecederas.
- Monitoreo en tiempo real de capacidad ocupada vs. capacidad máxima.

### 3. Algoritmo de Despacho FEFO (*First Expired, First Out*) (RF05, RF07 - RF11)
- Asignación automatizada de existencias priorizando los lotes vigentes **más próximos a su fecha de caducidad**.
- **Seguridad alimentaria:** Exclusión automática de lotes caducados (`VENCIDO`) o agotados (`AGOTADO`).
- **Consumo encadenado:** Si un lote no cubre la cantidad solicitada, consume el remanente del siguiente lote más próximo en cola FEFO.
- **Entregas parciales (RF11):** Si el stock no cubre la totalidad, asigna las existencias disponibles y registra una nota en las observaciones.
- Generación de traza de auditoría detallando qué lotes y cantidades fueron deducidos de bodega.

### 4. Monitoreo Automatizado de Caducidad (RF06 / CP-05)
- Tarea programada en segundo plano (`LoteSchedulerService`) que corre automáticamente a la medianoche y al iniciar la aplicación.
- Actualización automática de estados (`PROXIMO_A_VENCER` para <= 30 días, `VENCIDO` para lotes cuya fecha ya expiró).
- Tablero de alertas clasificado por severidad: **Crítica** (≤ 1 día), **Alta** (≤ 3 días), **Media** (≤ 7 días) y **Preventiva** (≤ 30 días).

### 5. Beneficiarios y Priorización Social (RF04)
- Registro de familias, fundaciones y comedores comunitarios con su respectivo documento de identidad.
- Priorización basada en el número de personas a cargo en el hogar o institución asistida.

### 6. Reportes de Balance y Estadísticas (RF16 / Figuras 3 y 5)
- Balance consolidado de entradas (donaciones recibidas) vs. salidas (alimentos despachados).
- Gráficas interactivas por categoría de producto, donantes con mayor aporte y beneficiarios atendidos.
- Filtro por rango de fechas y exportación a formato **CSV**.

---

## 📂 Estructura del Repositorio

```text
SIGA/
├── docker-compose.yml          # Orquestación de Contenedores (db, backend, frontend)
├── .env.example                # Plantilla unificada de variables de entorno
├── README.md                   # Documentación general y guía de puesta en marcha
│
├── SIGA_back/                  # Backend Spring Boot (Java 17)
│   ├── src/main/java/com/SIGA/SIGA/
│   │   ├── config/             # Seguridad JWT, CORS y Semillas (SeedConfig.java)
│   │   ├── controller/         # Controladores REST API
│   │   ├── dto/                # Data Transfer Objects (Request / Response)
│   │   ├── model/              # Entidades JPA (Donacion, Lote, Solicitud, Beneficiario, etc.)
│   │   ├── repository/         # Interfaces Spring Data JPA y consultas JPQL FEFO
│   │   └── services/           # Lógica de negocio (FEFO, Scheduler, Donaciones, etc.)
│   ├── Dockerfile              # Empaquetado Docker multi-etapa
│   └── pom.xml                 # Dependencias Maven
│
└── SIGA_front/                 # Frontend React 19 + TypeScript + Tailwind CSS
    ├── src/
    │   ├── components/         # Componentes atómicos (Botones, Badges, Tablas, etc.)
    │   ├── pages/              # Vistas principales:
    │   │   ├── alerts/         # Panel de Alertas de Vencimiento
    │   │   ├── beneficiaries/  # Gestión de Beneficiarios
    │   │   ├── dashboard/      # Métricas y KPIs de almacén
    │   │   ├── donations/      # Recepción de Donaciones
    │   │   ├── inventory/      # Búsqueda y trazabilidad de Lotes
    │   │   ├── reports/        # Balance de Alimentos y Gráficas
    │   │   └── requests/       # Bandeja de Solicitudes y Despacho FEFO
    │   ├── services/           # Cliente Axios e integración de endpoints
    │   └── stores/             # Estado global de autenticación (Zustand)
    ├── Dockerfile              # Build Vite y despliegue Nginx
    └── nginx.conf              # Configuración de proxy inverso
```

---

## 💻 Desarrollo Local (Sin Docker)

Si prefieres ejecutar los componentes de manera nativa en tu máquina:

### 1. Base de Datos
Asegúrate de tener PostgreSQL 16 corriendo en el puerto `5433` (o ajusta la URL en `application.properties`):
```bash
docker run -d --name siga-db -p 5433:5432 -e POSTGRES_DB=siga -e POSTGRES_USER=siga -e POSTGRES_PASSWORD=siga-dev-password postgres:16-alpine
```

### 2. Backend
```bash
cd SIGA_back
./mvnw clean spring-boot:run
```
*Las pruebas unitarias pueden ejecutarse con `./mvnw test`.*

### 3. Frontend
```bash
cd SIGA_front
npm install
npm run dev
```
La aplicación quedará disponible en `http://localhost:5173`.

---

## 🔒 Variables de Entorno

El archivo `.env` en la raíz gobierna la configuración de Docker, Spring Boot y Vite. Para personalizar valores, crea una copia local:

```bash
cp .env.example .env
```

| Variable | Descripción | Valor por Defecto |
| :--- | :--- | :--- |
| `POSTGRES_DB` | Nombre de la base de datos | `siga` |
| `POSTGRES_USER` | Usuario de base de datos | `siga` |
| `POSTGRES_PASSWORD` | Contraseña de PostgreSQL | `siga-dev-password` |
| `POSTGRES_PORT` | Puerto expuesto para la base de datos | `5433` |
| `BACKEND_PORT` | Puerto HTTP para el backend | `8080` |
| `FRONTEND_PORT` | Puerto HTTP para el frontend | `5173` |
| `JWT_SECRET` | Clave secreta para firma de tokens JWT | *(Clave de desarrollo)* |
| `SEED_ADMIN_EMAIL` | Correo del administrador inicial | `admin@siga.local` |
| `SEED_ADMIN_PASSWORD` | Contraseña del administrador inicial | `Admin123!` |
| `FIREBASE_ENABLED` | Integración opcional con Firebase Auth | `true` / `false` |

---

## 🧪 Comandos Útiles

- **Ver logs en tiempo real:**
  ```bash
  docker compose logs -f
  ```
- **Reiniciar un servicio específico (ej. backend):**
  ```bash
  docker compose restart backend
  ```
- **Detener los contenedores conservando los datos:**
  ```bash
  docker compose down
  ```
- **Detener y limpiar volúmenes para reiniciar desde cero:**
  ```bash
  docker compose down -v
  ```
