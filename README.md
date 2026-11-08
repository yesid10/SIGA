# SIGA - Sistema Inteligente de Gestión de Alimentos 🍎📦

## 1. ¿De qué se trata el proyecto?

**SIGA (Sistema Inteligente de Gestión de Alimentos)** es una solución web integral diseñada para optimizar y automatizar los procesos operativos de un **Banco de Alimentos**.

El propósito principal del sistema es:

- **Gestionar la entrada y trazabilidad de donaciones** realizadas por personas naturales o empresas.
- **Controlar el almacenamiento técnico diferenciado** entre alimentos perecederos (cámaras refrigeradas) y alimentos no perecederos (estantes secos).
- **Monitorear automáticamente las fechas de vencimiento** para evitar pérdidas y mermas alimentarias mediante un sistema de alertas por semáforo.
- **Automatizar el despacho de alimentos mediante el algoritmo FEFO (_First Expired, First Out_)**, asignando con prioridad los lotes vigentes más próximos a vencer y excluyendo automáticamente cualquier lote caducado.
- **Administrar los beneficiarios** (familias, fundaciones y comedores comunitarios), priorizando las entregas según su nivel de vulnerabilidad poblacional.
- **Generar balances e informes estadísticos** de entradas versus salidas, con visualización gráfica y exportación a formato CSV.

---

## 2. Tecnologías Manejadas

El proyecto está construido bajo una arquitectura desacoplada de tres capas:

- **Backend (API REST):**
  - **Lenguaje:** Java 17.
  - **Framework:** Spring Boot 4 / 3.4+.
  - **Seguridad y Autenticación:** Spring Security 6, JWT (_JSON Web Tokens_ con biblioteca JJWT 0.12.x), BCrypt y Firebase Admin SDK (autenticación federada híbrida).
  - **Persistencia de Datos:** Spring Data JPA con Hibernate 7.
  - **Documentación API:** SpringDoc OpenAPI 3 / Swagger UI.
  - **Pruebas:** JUnit 5 y Mockito.

- **Frontend (Single Page Application):**
  - **Librería Principal:** React 19.
  - **Lenguaje:** TypeScript 5.
  - **Herramienta de Construcción:** Vite 8.
  - **Estilos y Diseño:** Tailwind CSS.
  - **Manejo de Estado:** Zustand.
  - **Visualización de Datos:** Recharts.
  - **Iconografía:** React Icons (Lucide).

- **Base de Datos:**
  - **Motor:** PostgreSQL 16.

- **Infraestructura y Despliegue:**
  - **Contenedores:** Docker y Docker Compose (orquestación multicontenedor con _healthcheck_).
  - **Servidor Web Frontend:** Nginx (servidor estático y proxy inverso hacia la API).

---

## 3. Requisitos y Programas que se Deben Tener Instalados

Para desplegar y utilizar el sistema en cualquier máquina (Windows, macOS o Linux), se requiere tener instalado:

1. **Docker Engine (versión 24 o superior) y Docker Compose (versión 2 o superior):**  
   O en su defecto, **Docker Desktop** debidamente iniciado.
2. **Git:** Para clonar el repositorio de código fuente.
3. **Navegador Web:** Google Chrome, Mozilla Firefox, Microsoft Edge o Safari.
4. **Puertos libres en el equipo:**
   - Puerto `5173` (para la aplicación web Frontend).
   - Puerto `8080` (para el Backend REST API).
   - Puerto `5433` (para la base de datos PostgreSQL expuesta al host).

---

## 4. ¿Cómo se Levanta el Sistema? (Despliegue)

El proyecto cuenta con configuración para levantarse **con un solo comando** gracias a Docker Compose y a las semillas automáticas del backend.

### Paso 1: Clonar el repositorio

Abre una terminal y clona el proyecto:

```bash
git clone https://github.com/yesid10/SIGA/tree/main
cd SIGA
```

### Paso 2: Verificar el archivo de configuración `.env`

Asegúrate de que el archivo `.env` exista en la raíz del proyecto. Si no existe, créalo a partir de la plantilla:

```bash
cp .env.example .env
```

_(El archivo `.env` unificado ya incluye todas las contraseñas, claves JWT y configuraciones por defecto necesarias para la base de datos y la semilla)._

### Paso 3: Levantar los contenedores

Ejecuta el siguiente comando en la raíz del proyecto:

```bash
docker compose up -d --build
```

Docker descargará/construirá las imágenes, levantará PostgreSQL 16 (`siga-db`), iniciará el backend Spring Boot (`siga-backend`) ejecutando la creación de tablas y la siembra automática de datos (`SeedConfig`), y pondrá en marcha el frontend Nginx (`siga-frontend`).

### Paso 4: Acceso al sistema

Una vez transcurridos aproximadamente 45 segundos, abre tu navegador e ingresa a:

- **Frontend Web (Aplicación SIGA):** [http://localhost:5173](http://localhost:5173)
- **Documentación Swagger / OpenAPI:** [http://localhost:8080/swagger-ui.html](http://localhost:8080/swagger-ui.html)
- **Backend API:** [http://localhost:8080/api/v1](http://localhost:8080/api/v1)

---

## 5. ¿Cómo se Usa el Sistema?

### Credenciales de Acceso Sembradas

El sistema se inicializa automáticamente con tres cuentas de prueba con diferentes roles para su evaluación inmediata:

| Rol                     | Correo Electrónico      | Contraseña     | Alcance de Permisos                                                                                       |
| :---------------------- | :---------------------- | :------------- | :-------------------------------------------------------------------------------------------------------- |
| **Administrador**       | `admin@siga.local`      | `Admin123!`    | Acceso completo: donaciones, inventario, beneficiarios, reportes de balance y administración de usuarios. |
| **Encargado de Bodega** | `encargado@siga.org`    | `Password123*` | Operaciones de almacén: recepción de donaciones, gestión de lotes y ejecución del despacho con FEFO.      |
| **Beneficiario**        | `beneficiario@siga.org` | `Password123*` | Portal de beneficiario: consulta de cupos asignados y creación de solicitudes de víveres.                 |

---

### Flujo de Uso por Módulos

1. **Recepción de Alimentos (`/donations`):**
   - El Encargado o Administrador registra una nueva donación indicando el donante (Empresa o Persona Natural).
   - Se agregan los productos recibidos definiendo cantidad, unidad de medida, fecha de vencimiento y ubicación (Cámara Frigorífica si es perecedero o Estante si es seco).
2. **Consulta y Trazabilidad de Inventario (`/inventory`):**
   - Permite buscar lotes por nombre de producto, número de lote, donante o categoría.
   - Visualiza en tiempo real los días restantes de vida útil y la cantidad disponible de cada lote.

3. **Panel de Alertas de Vencimiento (`/alerts`):**
   - Semáforo automático que clasifica los alimentos según su proximidad a caducar: **Crítica** (≤ 1 día), **Alta** (≤ 3 días), **Media** (≤ 7 días) y **Preventiva** (≤ 30 días).

4. **Gestión de Beneficiarios (`/beneficiaries`):**
   - Registro de familias u organizaciones receptoras con su documento de identidad y número de personas a cargo en el hogar para priorizar la distribución.

5. **Bandeja de Solicitudes y Despacho FEFO (`/requests`):**
   - **Crear Solicitud:** El beneficiario o administrador genera un pedido seleccionando los productos deseados (el sistema muestra en tiempo real el stock vigente disponible).
   - **Despachar con FEFO:** El Encargado o Administrador hace clic en _"Despachar FEFO"_. El sistema selecciona automáticamente los lotes más próximos a caducar, descuenta las existencias físicas, marca los lotes consumidos como agotados y excluye lotes vencidos garantizando la inocuidad alimentaria.

6. **Balance y Reportes (`/reports`):**
   - El Administrador visualiza el balance de entradas (kilos/unidades donadas) versus salidas (víveres despachados).
   - Incluye gráficos comparativos por categoría de alimentos, lista de principales donantes/beneficiarios y botón para exportar los datos a archivo **CSV**.

7. **Integración Externa M2M (Consumo por Ghost Kitchen / Otra UDS):**
   - Permite que sistemas aliados (como Ghost Kitchen: `https://ghost-kitchen-nusq.onrender.com`) consulten el catálogo de productos con su stock real vigente.
   - **Endpoint:** `GET /api/v1/external/productos` (o `GET /api/v1/productos`).
   - **Cabecera requerida:** `X-API-KEY: siga-uds-external-access-key-2026`.
   - **Permisos:** Estrictamente lectura (`GET`). Cualquier intento de modificación (`POST`, `PUT`, `DELETE`) es denegado con HTTP 403 Forbidden.
   - **CORS Habilitado:** Configurado para aceptar peticiones desde `https://ghost-kitchen-nusq.onrender.com` y orígenes autorizados.
