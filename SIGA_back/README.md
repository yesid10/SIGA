# SIGA_back

Backend desarrollado como entrega del laboratorio de la materia **Entornos de Programación**.  
El objetivo del proyecto es implementar un **CRUD completo** sobre una única entidad: **Estudiante**.

La aplicación está construida con **Spring Boot** para exponer la API REST y gestionar la lógica del negocio.  
Para la persistencia se utiliza **PostgreSQL en la nube** mediante **NeonDB**, por lo que el backend ya está conectado a un servicio de base de datos remoto.

## Funcionalidades principales

- Crear estudiante
- Consultar estudiante por cédula
- Listar todos los estudiantes
- Actualizar estudiante
- Eliminar estudiante

## Tecnologías

- Java 17
- Spring Boot
- Spring Web MVC
- Spring Data JPA / Hibernate
- PostgreSQL (NeonDB)
- OpenAPI / Swagger (springdoc)

## Cómo levantar el proyecto

1. Clonar el repositorio:

```bash
git clone https://github.com/yesid10/SIGA_back
cd SIGA_back
```

2. Crear un archivo `.env` en la raíz del proyecto (puedes copiar `.env.example`) y definir:
   - `DB_URL`
   - `DB_USERNAME`
   - `DB_PASSWORD`
3. Exportar las variables del `.env` en tu terminal antes de ejecutar la app:

```bash
set -a && source .env && set +a
```

   Si usas **IntelliJ IDEA**, una forma más cómoda es instalar el plugin **EnvFile** y enlazar el archivo `.env` desde la configuración de ejecución. Esto evita tener que exportar las variables manualmente cada vez que levantas el proyecto.

   En **Windows**, si no usas IntelliJ, puedes abrir la terminal de PowerShell dentro del proyecto y cargar las variables con un script equivalente, o definirlas directamente en la configuración de ejecución del IDE. Si prefieres trabajar desde consola, también puedes adaptar el `.env` a tu entorno y usar el comando de arranque de Maven correspondiente.

   Si usas **otro IDE** distinto a IntelliJ, busca la opción equivalente para cargar variables de entorno en la configuración de ejecución. La idea es la misma: `DB_URL`, `DB_USERNAME` y `DB_PASSWORD` deben estar disponibles para el proceso que inicia Spring Boot.

4. Ejecutar la aplicación con Maven Wrapper:

```bash
./mvnw spring-boot:run
```

Si estás en Windows:

```bash
mvnw.cmd spring-boot:run
```

Por defecto, la app levanta en:

- `http://localhost:8080`

## Endpoints principales

Base path de la API:

- `/api/v1/estudiantes`

Operaciones:

- `POST /api/v1/estudiantes` → crear estudiante
- `GET /api/v1/estudiantes` → listar estudiantes
- `GET /api/v1/estudiantes/{cedula}` → consultar por cédula
- `PUT /api/v1/estudiantes/{cedula}` → actualizar estudiante
- `DELETE /api/v1/estudiantes/{cedula}` → eliminar estudiante

## Documentación Swagger / OpenAPI

Con la aplicación en ejecución, puedes acceder a:

- **Swagger UI:** `http://localhost:8080/swagger-ui.html`
- **OpenAPI JSON:** `http://localhost:8080/v3/api-docs`

Desde Swagger UI puedes probar los endpoints directamente (requests y responses) sin usar herramientas externas.
