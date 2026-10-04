# Plan de implementación de SIGA

## Estado actual

SIGA evolucionará de un CRUD académico de estudiantes a un sistema de gestión de inventario para banco de alimentos con priorización FEFO.

La Fase 1 se inició el 2026-10-04.

## Decisiones de arquitectura

- Backend: Spring Boot, PostgreSQL, Spring Data JPA y Spring Security.
- Frontend: React + TypeScript + Vite.
- Autenticación: Firebase Authentication convivirá con JWT propio.
- Firebase validará identidad durante registro/login; el backend intercambiará el Firebase ID Token por un JWT propio.
- El frontend usará únicamente el JWT propio en las peticiones normales.
- Registro con correo/contraseña y Google.
- El correo deberá estar verificado antes de emitir el JWT propio.
- Estado global: Zustand.
- Peticiones HTTP: Axios con interceptor global para agregar automáticamente el JWT.
- Rutas: React Router.
- Estilos: Tailwind CSS.
- Organización visual: Atomic Design (átomos, moléculas, organismos, plantillas y páginas).
- Backend: DTOs separados de las entidades JPA.
- Cantidades: kilogramos decimales con `BigDecimal`.

## Usuarios, perfiles y permisos

Se separan perfiles de participación y roles operativos.

### Perfiles públicos

- `DONADOR`: puede crear y consultar sus propuestas de donación.
- `BENEFICIARIO`: puede crear solicitudes y consultar su estado.
- Una cuenta puede tener ambos perfiles.

### Roles operativos

- `ENCARGADO`: revisa donaciones, administra inventario, aprueba solicitudes y confirma distribuciones.
- `ADMINISTRADOR`: administra usuarios, roles, ubicaciones, configuración y reportes globales.

`ENCARGADO` y `ADMINISTRADOR` nunca se asignan durante el registro público; solo un administrador puede otorgarlos.

## Flujo de autenticación

```text
Firebase Authentication
    -> Firebase ID Token
    -> Backend valida firma, proyecto, expiración y correo verificado
    -> Backend crea/actualiza usuario y perfiles en PostgreSQL
    -> Backend genera JWT propio
    -> Frontend guarda sesión y usa únicamente JWT propio con Axios
```

Endpoints previstos:

- `POST /api/v1/auth/firebase`
- `POST /api/v1/auth/refresh` (fase posterior si se incorpora refresh token)
- `POST /api/v1/auth/logout`
- `GET /api/v1/auth/me`

El token de Firebase solo se utilizará en el intercambio inicial; no se enviará en las peticiones normales.

## Fases

### Fase 1 — Limpieza y arquitectura base

- [x] Eliminar CRUD, modelos, repositorio, servicio, excepción y datos demo de estudiantes.
- [x] Desacoplar `GlobalExceptionHandler` de estudiantes.
- [x] Instalar Axios, Zustand, React Router, Firebase y Tailwind CSS.
- [x] Crear estructura base Atomic Design.
- [x] Crear carpetas de páginas, servicios, stores, hooks, tipos, guards y utilidades.
- [x] Activar Tailwind mediante `@tailwindcss/vite`.
- [x] Retirar el CSS específico del scaffold de Vite de `App.tsx`.
- [ ] Actualizar README del backend y frontend.
- [x] Retirar assets SVG residuales del scaffold; queda `src/assets/hero.png` pendiente de retirar/reemplazar junto con el branding.
- [x] Verificar build backend/frontend después de la limpieza mediante Docker y Vite.

### Fase 2 — Estructura frontend y navegación

- Crear `app/App.tsx`, `router.tsx` y `providers.tsx`.
- Crear rutas públicas y protegidas con React Router.
- Crear `ProtectedRoute`, `RoleGuard` y `ProfileGuard`.
- Crear layout público, layout de autenticación y layout administrativo.
- Crear átomos base: Button, Input, Label, Badge, Icon, Spinner y Typography.
- Crear moléculas: FormField, PasswordField, SearchInput, AlertMessage y Pagination.
- Crear organismos: LoginForm, RegisterForm, Navbar, Sidebar y DataTable.
- Migrar páginas a componentes por dominio.

Estructura objetivo:

```text
src/
├── app/
├── components/
│   ├── atoms/
│   ├── molecules/
│   ├── organisms/
│   └── templates/
├── pages/
├── services/
│   ├── api/
│   └── firebase/
├── stores/
├── hooks/
├── types/
├── guards/
└── utils/
```

### Fase 3 — Firebase + JWT propio

- Configurar Firebase Web mediante variables `VITE_FIREBASE_*`.
- Configurar Firebase Admin SDK en backend mediante variables/credencial fuera de Git.
- Implementar registro con correo y contraseña.
- Enviar correo de verificación.
- Implementar login con correo y contraseña.
- Implementar login/registro con Google.
- Rechazar usuarios con correo no verificado.
- Crear/actualizar usuario local por Firebase UID.
- Persistir perfiles y roles en PostgreSQL.
- Emitir JWT propio después de validar Firebase.
- Crear Zustand `authStore` para usuario, JWT, login, logout y restauración.
- Crear Axios centralizado con interceptor de request:
  - Leer JWT del store/persistencia.
  - Agregar `Authorization: Bearer <jwt>` automáticamente.
  - Excluir endpoints públicos.
- Crear interceptor de response para manejar `401`, limpiar sesión y redirigir a login.

### Fase 4 — Backend DTO y dominio de usuarios

Eliminar progresivamente el dominio académico restante de documentación y configuración.

Crear DTOs separados para:

- Autenticación.
- Usuarios y perfiles.
- Productos.
- Donaciones.
- Inventario y lotes.
- Solicitudes.
- Distribuciones.
- Reportes.

No exponer entidades JPA directamente desde los controladores.

Crear entidades:

- `Usuario`.
- `Perfil`/relación de perfiles.
- `Rol`.
- `Donante`.
- `Donacion`.
- `Categoria`.
- `Producto`.
- `Ubicacion`.
- `Lote`.
- `Solicitud`.
- `SolicitudDetalle`.
- `Distribucion`.
- `DistribucionDetalle`.
- `MovimientoInventario`.
- `Alerta`.
- `Auditoria`.

### Fase 5 — Donaciones

Flujo:

```text
Donador crea propuesta
    -> Encargado revisa
    -> Acepta o rechaza
    -> Se recibe físicamente
    -> Encargado confirma cantidades y vencimientos
    -> Sistema crea lotes y movimiento de entrada
```

Estados: `PROPUESTA`, `PENDIENTE_REVISION`, `ACEPTADA`, `RECHAZADA`, `RECIBIDA`, `CANCELADA`.

El donador no podrá crear lotes ni modificar stock directamente.

### Fase 6 — Inventario y FEFO

- Gestionar productos, categorías y ubicaciones.
- Crear lotes con cantidad, ingreso, vencimiento y estado.
- Impedir ubicaciones no refrigeradas para perecederos.
- Consultar stock por producto, categoría, lote y ubicación.
- Generar alertas a 7, 3 y 1 día del vencimiento.
- Marcar lotes vencidos y excluirlos de distribución.
- Implementar solicitudes multiítem.
- Aprobar/rechazar solicitudes.
- Ejecutar FEFO en backend, dentro de transacción y con control de concurrencia.
- Ordenar lotes por vencimiento, ingreso e identificador.
- Registrar distribución por cada lote utilizado.
- Marcar solicitudes atendidas o atendidas parcialmente.

### Fase 7 — Dashboard y reportes

- Dashboard adaptado a cada rol/perfil.
- Inventario actual.
- Próximos vencimientos.
- Lotes vencidos.
- Solicitudes pendientes.
- Kilogramos recibidos.
- Kilogramos distribuidos.
- Kilogramos vencidos/desperdiciados.
- Reportes por rango de fechas.
- Historial de movimientos y auditoría.

### Fase 8 — Calidad, pruebas y Docker

- Pruebas unitarias de FEFO.
- Pruebas de autenticación y verificación de correo.
- Pruebas de permisos por rol y perfil.
- Pruebas de DTOs y validaciones.
- Pruebas de integración con PostgreSQL.
- Pruebas de concurrencia en distribución.
- Pruebas de componentes Atomic Design.
- Pruebas end-to-end del flujo donación → lote → solicitud → distribución.
- Actualizar Docker Compose para variables Firebase.
- No incluir credenciales privadas Firebase en imágenes ni repositorio.
- Documentar ejecución, variables, Firebase, Docker y usuarios de prueba.

## Permisos principales

| Funcionalidad | Donador | Beneficiario | Encargado | Administrador |
|---|---:|---:|---:|---:|
| Crear propuesta de donación | Sí | Según perfil | Sí | Sí |
| Consultar sus donaciones | Sí | No | Sí | Sí |
| Crear lotes directamente | No | No | Sí | Sí |
| Consultar inventario | Opcional | Sí | Sí | Sí |
| Crear solicitud | No | Sí | No | Sí |
| Aprobar donaciones | No | No | Sí | Sí |
| Aprobar solicitudes | No | No | Sí | Sí |
| Registrar distribución | No | No | Sí | Sí |
| Gestionar usuarios y roles | No | No | No | Sí |
| Ver reportes globales | No | No | Limitado | Sí |

## Criterios de aceptación globales

- Ningún dato de estudiante queda expuesto en la aplicación.
- Las peticiones protegidas llevan automáticamente el JWT propio mediante Axios.
- Un Firebase Token no se usa en peticiones normales.
- Un usuario no verificado no puede obtener JWT propio.
- Un registro público nunca obtiene permisos de encargado o administrador.
- Un usuario puede ser simultáneamente donador y beneficiario.
- El backend valida todos los roles y permisos.
- Las entidades JPA no se exponen directamente; se usan DTOs.
- El frontend usa Atomic Design y Tailwind CSS.
- El estado global se administra con Zustand.
- La navegación se controla con React Router.
- FEFO se valida en backend, no solo en frontend.
