## TPO Aplicaciones Interactivas - Grupo 6

### Miembros
- [Kagushutchi](https://github.com/Kagushutchi/) 1167217
- [Flac222](https://github.com/Flac222/) 1169070

### Stack:

- Node.js 24
- TypeScript 
- Express
- TypeORM
- PostgreSQL 16

### Configuración

1. Crear el archivo de entorno:

```bash
cp .env

#Ejemplo

PORT=3000 # Server

# PostgreSQL connection
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=my_username
DB_PASSWORD=my_secure_password
DB_NAME=my_db_name
```

2. Instalar dependencias

```bash
npm install
npm install --save-dev @types/jest
npm install --save-dev jest ts-jest @types/jest
npm install --save-dev @jest/types
npm install --save-dev @types/node
npx tsc
```

3. Compilar TypeScript (opcional si usás `dev`)

```bash
npm run build
```

4. Ejecutar migraciones (crea las tablas)

```bash
npm run migration:run
npm run migration:generate
```

5. Iniciar la API

```bash
# Desarrollo (hot reload con ts-node)
npm run dev

# Producción (usa archivos compilados en dist)
npm start
```

La API escucha por defecto en `http://localhost:${PORT}` (ver `PORT` en `.env`).

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