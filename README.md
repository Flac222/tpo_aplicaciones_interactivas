# TPO Aplicaciones Interactivas - Grupo 6

Este proyecto es el Trabajo Práctico Obligatorio (TPO) de la materia Aplicaciones Interactivas.

Consiste en una **aplicación de gestión de tareas y tableros** inspirada en el flujo de trabajo **Kanban** (similar a Trello). Permite a los usuarios crear, organizar y visualizar tareas con características clave como:

* **Prioridad** (alta, media, baja).
* **Etiquetas** personalizadas.
* **Estados** (pendiente, en progreso, completada, etc.).

## Stack:

### Backend:

- [Node.js 24](https://nodejs.org/)
- [TypeScript](https://www.typescriptlang.org/)
- [Express.js](https://expressjs.com/)
- [TypeORM](https://typeorm.io/)
- [PostgreSQL 16](https://www.postgresql.org/)

### Frontend:

- [React 19](https://react.dev/)
- [Vite](https://vite.dev/)

## Configuración

1. Crear el archivo de entorno dentro de backend copiando el [ejemplo](backend/.env.example):

```bash
cd backend
cp .env.example .env
```
```
# Contenido del ejemplo

PORT=3000 # Server

# Conexion con PostgreSQL
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=my_username
DB_PASSWORD=my_secure_password
DB_NAME=my_db_name

# Clave para los token
JWT_SECRET=my_secure_password
```
2. Instalar las dependencias del backend:

```
npm install
npm install --save-dev @types/jest
npm install --save-dev jest ts-jest @types/jest
npm install --save-dev @jest/types
npm install --save-dev @types/node
npx tsc
```

3. Compilar TypeScript (opcional si usás `dev`):

```bash
npm run build
```

4. Ejecutar migraciones (crea las tablas):

```bash
npm run migration:run
npm run migration:generate
```

5. Crear la base de datos en docker o donde quieras.

```docker
docker run --name backend-postgres -e POSTGRES_USER=my_username -e POSTGRES_PASSWORD=my_secure_password  -e POSTGRES_DB=my_db_name -p 5432:5432  -d postgres:16
```

6. Iniciar la API:

```bash
# Desarrollo (hot reload con ts-node)
npm run dev

# Producción (usa archivos compilados en dist)
npm start
```
7. Instalar las dependencias del frontend:
```bash
cd ..
cd frontend
npm install
```
8. Iniciar el frontend:
```bash
npm run dev
```

La API escucha por defecto en `http://localhost:${PORT}` (ver `PORT` en `.env`).

El front esta por defecto en `http://localhost:5173`

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

## Endpoints principales

- Documentación Swagger UI: `GET /docs`

- Health/Status

  - `GET /api/status`

## Estructura del proyecto: 

```
backend/
  src/
    app.ts                  # Express app y middlewares.
    index.ts                # Bootstrap: DataSource y server.
    controllers/            # Controladores HTTP.
    services/               # Lógica de negocio.
    repositories/           # Acceso a datos (TypeORM Repository).
    entities/               # Entidades TypeORM (*.entity.ts).
    routes/                 # Rutas Express.
    db/
      data-source.ts        # Configuración TypeORM.
      migrations/           # Migraciones.
frontend/
  src/
    app.css                 # Estilos globales específicos de la app.
    app.tsx                 # Archivo principal logica de la app.
    index.css               # Estilos globales compartidos.
    main.tsx                # Renderiza la app en el DOM y configura providers.
    components/             # Carpeta de componentes reutilizables.
    contexts/               # Definición de Context API y manejo del estado global
    hooks/                  # Lógica reutilizable: useFetch, useAuth, etc.
    pages/                  # Vistas completas de la aplicación (home, login, etc.)
    types/                  # Definiciones de tipos TypeScript (interfaces, etc.)
```
## Autores
- [Kagushutchi](https://github.com/Kagushutchi/) 1167217
- [Flac222](https://github.com/Flac222/) 1169070

## Licencia

- Este proyecto no cuenta con una licencia de uso. Su contenido es exclusivamente académico y fue desarrollado como parte de una materia universitaria. No está destinado a distribución ni reutilización comercial.