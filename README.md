## TPO Aplicaciones Interactivas - API

Node.js + TypeScript + Express + TypeORM + PostgreSQL

### Prerrequisitos

- Node.js 18+
- PostgreSQL 13+

### Configuración rápida

1. Crear el archivo de entorno

```bash
cp .env.example .env
# Editá los valores según tu entorno (usuario, contraseña, base, host, puerto)
```

2. Instalar dependencias

```bash
npm install
```

3. Compilar TypeScript (opcional si usás `dev`)

```bash
npm run build
```

4. Ejecutar migraciones (crea las tablas)

```bash
npm run migration:run
```

5. Iniciar la API

```bash
# Desarrollo (hot reload con ts-node)
npm run dev

# Producción (usa archivos compilados en dist)
npm start
```

La API escucha por defecto en `http://localhost:${PORT}` (ver `PORT` en `.env`).

### Variables de entorno

Usá `.env.example` como referencia. Variables principales:

- `PORT` (p. ej. 3000)
- `DB_HOST`, `DB_PORT`, `DB_USERNAME`, `DB_PASSWORD`, `DB_NAME`

### Base de datos y TypeORM

- Configuración del DataSource: `src/db/data-source.ts`
- Entidades: `src/**/*.entity.ts`
- Migraciones: `src/db/migrations`
- `synchronize` está deshabilitado (usar migraciones)

Scripts útiles:

```bash
# Ejecutar migraciones pendientes
npm run migration:run
# Revertir la última migración
npm run migration:revert
# Mostrar estado de migraciones
npm run migration:show
# Generar migración por diff (revisar y ajustar el resultado)
npm run migration:generate
# Crear migración vacía (template)
npm run migration:create
```

Notas:

- Algunas migraciones incluyen `CREATE EXTENSION IF NOT EXISTS "uuid-ossp"` para UUID. En algunos entornos puede requerir permisos elevados.
- Hay una migración de ejemplo para `todos`: `src/db/migrations/*-CreateTodosTable.ts`.
- También hay una migración plantilla para estudiantes con estructura mínima.

### Endpoints principales

- Documentación Swagger UI: `GET /docs`

- Health/Status

  - `GET /api/status`

- Todos (CRUD de ejemplo, quitar)
  - `GET /api/todos`
  - `GET /api/todos/:id`
  - `POST /api/todos` body: `{ "title": "Tarea", "completed": false }`
  - `PUT /api/todos/:id` body parcial: `{ "title": "Nuevo título", "completed": true }`
  - `DELETE /api/todos/:id`

### Estructura del proyecto (resumen)

```
src/
  app.ts                  # Express app y middlewares
  index.ts                # Bootstrap: DataSource y server
  controllers/            # Controladores HTTP
  services/               # Lógica de negocio
  repositories/           # Acceso a datos (TypeORM Repository)
  entities/               # Entidades TypeORM (*.entity.ts)
  routes/                 # Rutas Express
  db/
    data-source.ts        # Configuración TypeORM
    migrations/           # Migraciones
```

### Referencias

- Ejemplo oficial TypeORM + Express: [typeorm.io/docs/guides/example-with-express](https://typeorm.io/docs/guides/example-with-express)
