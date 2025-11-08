# TPO - Frontend React - Guía de Desarrollo

## 📋 Guía y Sugerencias para el Desarrollo Frontend

Este documento es una **guía orientativa** que mapea las funcionalidades del backend y sugiere cómo podría implementarse el frontend. Los estudiantes pueden adaptar, modificar o usar enfoques alternativos según lo consideren apropiado. El objetivo es facilitar la integración completa con la API REST, pero la arquitectura y decisiones técnicas quedan a criterio de cada equipo.

> **💡 Importante**: Los checkboxes `[ ]` son para que marquen su progreso, no requisitos obligatorios en ese orden o formato exacto. Sientanse libres de reorganizar, simplificar o expandir según las necesidades de su proyecto.

---

## 🎨 ÉPICA 1: Configuración y Setup Inicial

### 1.1 Configuración del Proyecto React

**Sugerencia de setup inicial** (pueden usar otras herramientas si lo prefieren):

- [ ] Crear proyecto React con TypeScript usando **Vite** (o Create React App si lo prefieren):
  ```bash
  npm create vite@latest name-proyecto -- --template react-ts
  cd name-proyecto
  npm install
  ```
- [ ] Instalar dependencias principales:
  - [ ] `react-router-dom` - para routing
  - [ ] Opcional: biblioteca de UI (Material-UI, Chakra, Tailwind, etc.)
- [ ] **Sugerencia**: Pueden usar `fetch` nativo para llamadas HTTP (o axios/react-query si lo prefieren)
- [ ] **Ejemplo** de estructura de carpetas (pueden organizarlo de otra manera):
  ```
  src/
  ├── components/     # Componentes reutilizables
  ├── pages/          # Páginas/vistas principales
  ├── hooks/          # Custom hooks
  ├── context/        # Contexts de React
  ├── types/          # Tipos de TypeScript
  ├── utils/          # Utilidades y helpers (incluye wrapper HTTP)
  └── constants/      # Constantes (enums, configs)
  ```
- [ ] Crear archivo `.env.example` con variables de entorno:
  ```
  VITE_API_URL=http://localhost:3000/api
  ```
- [ ] Configurar variables de entorno locales en `.env`
- [ ] **Nota**: En Vite, las variables de entorno deben tener el prefijo `VITE_` y se acceden con `import.meta.env.VITE_API_URL`

**Lo importante es que**:

- El proyecto compila sin errores
- Las herramientas elegidas permiten desarrollo eficiente
- La estructura es clara y mantenible

---

### 1.2 Configuración de HTTP con Fetch

**Sugerencia de implementación** (pueden usar axios, react-query u otra alternativa):

- [ ] Una opción es crear una utilidad HTTP en `utils/http.ts`:
  - [ ] Función wrapper de `fetch` que agregue configuración base
  - [ ] Base URL desde variables de entorno (`import.meta.env.VITE_API_URL`)
  - [ ] Headers por defecto (Content-Type: application/json)
  - [ ] Manejo de errores centralizado
  - [ ] Parseo automático de JSON en respuestas

**Ejemplo de implementación**:

```typescript
// utils/http.ts
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

export async function httpRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const config: RequestInit = {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  };

  const response = await fetch(`${API_URL}${endpoint}`, config);

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || `HTTP Error: ${response.status}`);
  }

  // Si es DELETE sin content, retornar void
  if (response.status === 204) {
    return undefined as T;
  }

  return response.json();
}

// Helpers para métodos HTTP comunes
export const http = {
  get: <T>(endpoint: string) => httpRequest<T>(endpoint, { method: "GET" }),

  post: <T>(endpoint: string, data?: unknown) =>
    httpRequest<T>(endpoint, {
      method: "POST",
      body: JSON.stringify(data),
    }),

  put: <T>(endpoint: string, data?: unknown) =>
    httpRequest<T>(endpoint, {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  delete: <T>(endpoint: string) =>
    httpRequest<T>(endpoint, { method: "DELETE" }),
};
```

- [ ] Crear función de manejo de errores genérico

**Lo importante es que**:

- Wrapper de fetch configurado y funcionando
- Errores se manejan de forma consistente
- Respuestas JSON se parsean automáticamente

---

### 1.3 Tipos y Constantes

Crear interfaces TypeScript que mapeen las entidades del backend:

- [ ] Crear `types/user.ts`:

  ```typescript
  export interface User {
    id: string | number;
    email: string;
    name: string;
    createdAt: string;
  }
  ```

- [ ] Crear `types/team.ts`:

  ```typescript
  export interface Team {
    id: string | number;
    name: string;
    description?: string;
    createdAt: string;
    ownerId: string | number;
    owner?: User; // Relación populated
  }

  export interface Membership {
    id: string | number;
    userId: string | number;
    teamId: string | number;
    joinedAt: string;
    user?: User; // Relación populated
  }
  ```

- [ ] Crear `types/task.ts`:

  ```typescript
  export enum TaskStatus {
    PENDING = "PENDING",
    IN_PROGRESS = "IN_PROGRESS",
    COMPLETED = "COMPLETED",
    CANCELLED = "CANCELLED",
  }

  export enum TaskPriority {
    HIGH = "HIGH",
    MEDIUM = "MEDIUM",
    LOW = "LOW",
  }

  export interface Task {
    id: string | number;
    title: string;
    description: string;
    status: TaskStatus;
    priority: TaskPriority;
    dueDate?: string;
    createdAt: string;
    updatedAt: string;
    creatorId: string | number;
    assignedToId?: string | number;
    teamId?: string | number;
    // Relaciones populated opcionales
    creator?: User;
    assignedTo?: User;
    team?: Team;
    tags?: Tag[];
  }
  ```

- [ ] Crear `types/comment.ts`:

  ```typescript
  export interface Comment {
    id: string | number;
    content: string;
    authorId: string | number;
    taskId: string | number;
    createdAt: string;
    author?: User; // Relación populated
  }
  ```

- [ ] Crear `types/history.ts`:

  ```typescript
  export interface StatusHistory {
    id: string | number;
    taskId: string | number;
    previousStatus: TaskStatus;
    newStatus: TaskStatus;
    userId: string | number;
    changedAt: string;
    user?: User; // Relación populated
  }
  ```

- [ ] Crear `types/tag.ts`:

  ```typescript
  export interface Tag {
    id: string | number;
    name: string;
    color: string;
  }
  ```

- [ ] Crear `types/activity.ts`:

  ```typescript
  export enum ActivityType {
    CREATED = "CREATED",
    ASSIGNED = "ASSIGNED",
    STATUS_CHANGED = "STATUS_CHANGED",
    COMMENTED = "COMMENTED",
  }

  export interface Activity {
    id: string | number;
    type: ActivityType;
    userId: string | number;
    taskId: string | number;
    description: string;
    createdAt: string;
    user?: User;
    task?: Task;
  }
  ```

- [ ] Crear `types/api.ts` para respuestas de paginación:
  ```typescript
  export interface PaginatedResponse<T> {
    data: T[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }
  ```

**Lo importante es que**:

- Todos los tipos coinciden con las entidades del backend
- Enums definidos correctamente
- Interfaces incluyen relaciones opcionales (populated)

---

### 1.4 Configuración de Routing

- [ ] Instalar y configurar React Router
- [ ] Definir estructura de rutas en `App.tsx`:
  - [ ] `/` - Redirect a `/tasks`
  - [ ] `/tasks` - Lista de tareas
  - [ ] `/tasks/:id` - Detalle/editar tarea
  - [ ] `/tasks/new` - Crear tarea
  - [ ] `/teams` - Lista de teams
  - [ ] `/teams/:id` - Detalle/editar equipo
  - [ ] `/activity` - Feed de activity

**Nota**: No hay autenticación. El usuario actual se selecciona desde el header con un dropdown.

**Lo importante es que**:

- Routing funciona correctamente
- Navegación entre páginas es fluida

---

## 👤 ÉPICA 2: Gestión de Usuarios

### 2.1 Context de Usuario Actual

- [ ] Crear `context/UserContext.tsx`:
  - [ ] Estado: usuario actual (seleccionado), lista de users disponibles
  - [ ] Funciones: `setCurrentUser`, `getUsuarios`
  - [ ] Almacenar usuario seleccionado en `localStorage` para persistencia
  - [ ] Cargar lista de users al iniciar la app

**Lo importante es que**:

- Context provee status de usuario actual global
- Usuario seleccionado persiste en localStorage
- Selección se restaura al recargar página

---

### 2.2 Integración con API - Usuarios

**Endpoints del backend a consumir**:

- [ ] `GET /users` - Obtener lista de todos los users
- [ ] `GET /users/:id` - Obtener un usuario específico
- [ ] `POST /users` - Crear un nuevo usuario (opcional)
- [ ] `PUT /users/:id` - Actualizar un usuario (opcional)

**Casos de uso**:

- Cargar lista de users en el selector de usuario actual
- Cargar lista de users para asignar tareas
- Cargar lista de users para invitar a teams

**Lo importante es que**:

- Todos los endpoints de users están integrados
- Manejo de errores en llamadas HTTP
- Datos se muestran correctamente en la UI

---

### 2.3 Componente - Selector de Usuario Actual

**Ubicación**: `components/UserSelector.tsx`

**Sugerencias de implementación**:

- [ ] Dropdown para seleccionar usuario actual de una lista
- [ ] Mostrar todos los users disponibles en el sistema
- [ ] Al seleccionar, actualizar el contexto global
- [ ] Mostrar avatar/icono y name del usuario
- [ ] Persistir selección en localStorage

**Lo importante es que**:

- Selector carga lista de users del backend
- Cambio de usuario actualiza el contexto global
- Selección persiste al recargar

---

### 2.4 Componente - Header/Navbar

**Ubicación**: `components/Header.tsx`

**Sugerencias de implementación**:

- [ ] Selector de usuario actual: `[Usuario ⌄]` con:
  - [ ] Lista de todos los users del sistema
  - [ ] Al seleccionar, cambiar el usuario actual en la aplicación
  - [ ] Mostrar avatar/name del usuario seleccionado
- [ ] Links de navegación:
  - [ ] "Tareas" → `/tasks`
  - [ ] "Equipos" → `/teams`
  - [ ] "Actividad" → `/activity`
- [ ] (Opcional) Logo/título de la aplicación

**Lo importante es que**:

- Header visible en todas las páginas
- Selector de usuario funciona correctamente
- Navegación entre secciones clara

---

## 👥 ÉPICA 3: Gestión de Equipos

### 3.1 Integración con API - Equipos

**Endpoints del backend a consumir**:

- [ ] `GET /teams` - Obtener lista de teams del usuario actual
- [ ] `GET /teams/:id` - Obtener detalle de un equipo específico
- [ ] `POST /teams` - Crear un nuevo equipo
  - Body: `{ name, description?, ownerId }`
- [ ] `PUT /teams/:id` - Actualizar información de un equipo
  - Body: `{ name?, description? }`

**Casos de uso**:

- Listar teams del usuario en la página de teams
- Cargar opciones en el selector de equipo del header
- Mostrar/editar información del equipo en detalle

**Lo importante es que**:

- Todos los endpoints de teams están integrados
- Manejo de errores en operaciones
- Solo el propietario puede editar el equipo

---

### 3.2 Integración con API - Membresías

**Endpoints del backend a consumir**:

- [ ] `GET /teams/:id/members` - Obtener lista de members de un equipo
- [ ] `POST /teams/:id/members` - Agregar un miembro al equipo
  - Body: `{ userId }`
  - El nuevo miembro siempre tiene rol "MIEMBRO"
- [ ] `DELETE /teams/:id/members/:userId` - Remover un miembro del equipo

**Casos de uso**:

- Mostrar lista de members en detalle del equipo
- Invitar nuevos members al equipo (solo propietario)
- Remover members del equipo (solo propietario)

**Nota**: No hay cambio de roles. El propietario es fijo (quien creó el equipo) y todos los demás son members.

**Lo importante es que**:

- Gestión de members funcional
- Solo el propietario puede agregar/remover members
- El propietario no puede removerse a sí mismo

---

### 3.3 Componente - Lista de Equipos

**Ubicación**: `pages/Teams.tsx`

**Requisitos según wireframe "Gestión de teams"**:

- [ ] Botón "Nuevo equipo" en la parte superior
- [ ] Lista de teams del usuario actual:
  - [ ] Mostrar name del equipo
  - [ ] Botón "Gestionar" por cada equipo
  - [ ] Indicar rol del usuario en cada equipo (Propietario/Miembro)
- [ ] Al hacer clic en "Gestionar", mostrar detalle del equipo (puede ser vista lateral o página separada)
- [ ] Estado vacío: "No tenés teams. Creá uno para comenzar."
- [ ] Estado de carga mientras se obtienen teams

**Lo importante es que**:

- Lista de teams se carga correctamente
- Navegación a detalle funciona
- Estados de carga y vacío implementados

---

### 3.4 Componente - Crear/Editar Equipo

**Ubicación**: `components/TeamForm.tsx` o modal en `pages/Teams.tsx`

**Requisitos según wireframe**:

- [ ] Formulario con campos:
  - [ ] Nombre del equipo (requerido)
  - [ ] Descripción (opcional)
- [ ] Botón "Guardar"
- [ ] Botón "Cancelar"
- [ ] Validaciones:
  - [ ] Nombre requerido
- [ ] Al guardar, actualizar lista de teams
- [ ] Mostrar errores del servidor

**Modo creación**:

- [ ] El ownerId se toma del usuario actual automáticamente

**Modo edición**:

- [ ] Cargar datos existentes del equipo
- [ ] Solo propietarios pueden editar

**Lo importante es que**:

- Formulario crea/edita teams correctamente
- Validaciones funcionan
- Integración con backend exitosa

---

### 3.5 Componente - Detalle de Equipo y Gestión de Miembros

**Ubicación**: `pages/EquipoDetalle.tsx` o panel en `pages/Teams.tsx`

**Requisitos según wireframe**:

- [ ] Sección de edición de equipo:
  - [ ] Campo "Nombre" editable (solo propietario)
  - [ ] Campo "Descripción" editable (solo propietario)
  - [ ] Botón "Guardar" cambios
- [ ] Sección de members:
  - [ ] Mostrar propietario (sin botón de remover)
  - [ ] Lista de members con:
    - [ ] Nombre/email del usuario (ej: `@ana`)
    - [ ] Indicador "Miembro"
    - [ ] Botón "Remover" (solo visible para propietario, no puede remover al propietario)
- [ ] Sección de invitación:
  - [ ] Input "Invitar por email/usuario" (search por email o ID)
  - [ ] Botón "Invitar" (todos los invitados son "Miembros")
  - [ ] Solo propietario puede invitar
- [ ] Confirmación al remover members
- [ ] Estado de carga al agregar/remover members

**Lo importante es que**:

- Solo el propietario puede editar equipo y gestionar members
- Miembros solo pueden ver el equipo
- El propietario no puede ser removido
- Integración completa con backend

---

### 3.6 Componente - Selector de Equipo (Header)

**Ubicación**: `components/TeamSelector.tsx`

**Sugerencias de implementación**:

- [ ] Dropdown con lista de teams del usuario
- [ ] Opción "Tareas personales" (sin equipo)
- [ ] Al seleccionar, actualizar el contexto global de equipo seleccionado
- [ ] Filtrar tareas según equipo seleccionado

**Lo importante es que**:

- Selector cambia el contexto de equipo
- Lista de tareas se actualiza según selección

---

## 📝 ÉPICA 4: Gestión de Tareas

### 4.1 Integración con API - Tareas

**Endpoints del backend a consumir**:

**CRUD Básico**:

- [ ] `GET /tasks` - Obtener lista de tareas con filters y paginación
  - Query params: `status`, `priority`, `dateFrom`, `dateTo`, `tags`, `assignedTo`, `search`, `sortBy`, `order`, `page`, `limit`, `teamId`
  - Response: `{ data: Task[], total, page, limit, totalPages }`
- [ ] `GET /tasks/:id` - Obtener detalle de una tarea específica
- [ ] `POST /tasks` - Crear una nueva tarea
  - Body: `{ title, description, status, priority, dueDate?, assignedToId?, teamId?, creatorId }`
- [ ] `PUT /tasks/:id` - Actualizar una tarea
  - Body: `{ title?, description?, priority?, dueDate?, assignedToId? }`

**Estados**:

- [ ] `PUT /tasks/:id/status` - Cambiar status de una tarea
  - Body: `{ status }`

**Casos de uso**:

- Listar tareas en la página principal con filters
- Crear/editar tareas desde el formulario
- Cambiar status de tareas (validar transiciones válidas)
- Ver detalle completo de una tarea

**Lo importante es que**:

- Todos los endpoints están integrados
- Filtros y paginación funcionan correctamente
- Cambios de status respetan transiciones válidas (PENDIENTE → EN_CURSO → FINALIZADA, cualquiera → CANCELADA)

---

### 4.2 Integración con API - Comentarios

**Endpoints del backend a consumir**:

- [ ] `GET /tasks/:id/comments` - Obtener comments de una tarea
- [ ] `POST /tasks/:id/comments` - Agregar un comentario a una tarea
  - Body: `{ content, authorId }`
- [ ] `PUT /comments/:id` - Editar un comentario existente
  - Body: `{ content }`

**Casos de uso**:

- Mostrar comments en el detalle de la tarea
- Agregar nuevos comments
- Editar comments propios

**Lo importante es que**:

- Comentarios se cargan y muestran correctamente
- Se pueden agregar comments a cualquier tarea
- Se pueden editar comments existentes
- Comentarios se pueden agregar incluso a tareas finalizadas

---

### 4.3 Integración con API - Historial

**Endpoints del backend a consumir**:

- [ ] `GET /tasks/:id/history` - Obtener history de cambios de status de una tarea

**Casos de uso**:

- Mostrar history de cambios en el detalle de la tarea
- Ver quién y cuándo realizó cada cambio de status

**Lo importante es que**:

- Historial se obtiene y muestra correctamente
- Muestra quién y cuándo cambió el status
- Formato legible: "Usuario cambió status: Anterior → Nuevo (createdAt)"

---

### 4.4 Integración con API - Etiquetas

**Endpoints del backend a consumir**:

- [ ] `GET /tags` - Obtener lista de todas las tags
- [ ] `POST /tags` - Crear una nueva etiqueta
  - Body: `{ name, color }`
- [ ] `PUT /tasks/:id/tags` - Asignar/actualizar tags de una tarea
  - Body: `{ tagIds: [id1, id2, ...] }`

**Casos de uso**:

- Listar tags disponibles en el selector
- Crear nuevas tags desde el formulario de tarea
- Asignar/desasignar múltiples tags a una tarea
- Filtrar tareas por tags

**Lo importante es que**:

- Etiquetas se pueden listar y crear
- Asignación de múltiples tags a tareas funciona
- Una tarea puede tener varias tags
- Se pueden filtrar tareas por tags

---

### 4.5 Componente - Lista de Tareas

**Ubicación**: `pages/Tasks.tsx`

**Requisitos según wireframe "Lista de tareas"**:

**Barra de filtros y búsqueda**:

- [ ] Filtro por equipo: `Equipo [Todos ⌄]`
  - Opciones: Todos, o equipos específicos del usuario
  - Filtrar tareas por equipo
- [ ] Barra de búsqueda: `[🔍 Buscar tareas...]`
  - Buscar por título o descripción de la tarea
- [ ] Filtro por status: `Estado [Todos ⌄]`
  - Opciones: Todos, Pendiente, En curso, Finalizada, Cancelada
- [ ] Filtro por priority: `Prioridad [Todas ⌄]`
  - Opciones: Todas, Alta, Media, Baja
- [ ] Filtro por createdAt de vencimiento: `Vence [Rango ⌄]`
  - Selector de rango de fechas (desde - hasta)
- [ ] Filtro por tags: `Tags [ + ]`
  - Multi-selector de tags
- [ ] Botón "Nueva tarea"

**Tabla de tareas**:

- [ ] Columnas:
  - [ ] `#` - Número o ID de tarea
  - [ ] `Título` - Título de la tarea
  - [ ] `Estado` - Badge con color según status
  - [ ] `Prioridad` - Badge con color según priority
  - [ ] `Vence` - Fecha límite formateada (ej: `12/09`)
  - [ ] `Asignado` - Nombre del usuario asignado (ej: `@ana`) o `—` si no hay
- [ ] Al hacer clic en una fila, abrir detalle/edición de tarea
- [ ] Estado vacío: "No hay tareas. [Crear tarea]"
- [ ] Estado de carga: mensaje "Cargando tareas..." con spinner opcional

**Paginación**:

- [ ] Controles: `◀ 1 2 3 ▶`
- [ ] Mostrar total de resultados
- [ ] Permitir cambiar cantidad de items por página

**Ordenamiento**:

- [ ] Permitir sortBy por:
  - Fecha límite (ascendente/descendente)
  - Prioridad (alta → baja o inversa)
  - Fecha de creación (más reciente/antigua)
- [ ] Indicar columna de ordenamiento activa

**Lo importante es que**:

- Lista de tareas se carga correctamente
- Filtros se pueden combinar y funcionan
- Búsqueda en título/descripción funciona
- Paginación funciona correctamente
- Ordenamiento funciona
- Estados de carga/vacío implementados
- Navegación a detalle funciona

---

### 4.6 Componente - Crear/Editar Tarea

**Ubicación**: `pages/TaskForm.tsx` o `pages/TaskDetail.tsx`

**Requisitos según wireframe "Crear / Editar tarea"**:

**Header**:

- [ ] Botón "← Volver" (volver a lista de tareas)
- [ ] Botón "Guardar"

**Formulario principal**:

- [ ] Campo "Título" (requerido, max 200 caracteres)
- [ ] Campo "Descripción" (textarea, opcional, max 1000 caracteres)
- [ ] Selector "Estado": `[Pendiente ⌄]`
  - Opciones: Pendiente, En curso, Finalizada, Cancelada
  - **Validar transiciones válidas** al editar (PENDIENTE → EN_CURSO → FINALIZADA; cualquiera → CANCELADA)
- [ ] Selector "Prioridad": `[Media ⌄]`
  - Opciones: Alta, Media, Baja
- [ ] Selector de createdAt "Vence": `[ dd/mm/aaaa 📅 ]`
  - Usar date picker
  - Validar que no sea createdAt pasada
  - Opcional (puede estar vacío)
- [ ] Selector "Asignado a": `[Usuario ⌄]`
  - Dropdown con users del equipo (si es tarea de equipo)
  - Opcional (puede estar sin asignar)
- [ ] Sección "Tags": `[ + agregar ]`
  - Mostrar tags asignadas con chips removibles: `[tag-1] [X] [tag-2] [X]`
  - Botón para agregar tags (selector multi o crear nueva)

**Sección de Comentarios** (solo en modo edición):

- [ ] Lista de comments:
  - [ ] Mostrar autor, createdAt y content: `@ana (hoy 10:22): ...`
- [ ] Campo de texto para agregar comentario: `[Agregar comentario _____] (Enviar)`
- [ ] Botón "Enviar" comentario
- [ ] Validar que comentario no esté vacío

**Sección de Historial** (solo en modo edición):

- [ ] Lista de cambios de status:
  - [ ] Formato: `@juan cambió Estado: Pendiente → En curso (ayer 18:03)`
  - [ ] Ordenar por createdAt descendente (más reciente arriba)
  - [ ] Mostrar usuario que hizo el cambio

**Validaciones del formulario**:

- [ ] Título: requerido, max 200 caracteres
- [ ] Descripción: max 1000 caracteres
- [ ] Estado: requerido
- [ ] Prioridad: requerida
- [ ] Fecha límite: no en el pasado (si se proporciona)
- [ ] Transiciones de status válidas (solo permitir cambios válidos)

**Restricciones de edición**:

- [ ] Si tarea está FINALIZADA o CANCELADA:
  - [ ] Deshabilitar edición de: título, descripción, status (excepto comentar), priority, createdAt límite, asignado
  - [ ] Permitir edición de: comments y tags

**Estados**:

- [ ] Estado de carga al guardar
- [ ] Deshabilitar botones durante guardado
- [ ] Mensajes de éxito/error

**Lo importante es que**:

- Formulario crea/edita tareas correctamente
- Validaciones funcionan correctamente
- Transiciones de status se validan
- Restricciones de edición se aplican
- Comentarios e history se muestran y funcionan
- Etiquetas se pueden agregar/remover
- Integración completa con backend

---

### 4.7 Hooks Útiles de la Librería useHooks

**Librería recomendada**: [@uidotdev/usehooks](https://usehooks.com/)

**Instalación**:

```bash
npm i @uidotdev/usehooks
```

**Hooks útiles para este proyecto**:

- [ ] **useDebounce** - Retrasar búsquedas mientras el usuario escribe

  - Ejemplo: `const debouncedSearch = useDebounce(searchTerm, 500)`
  - Uso: Barra de búsqueda de tareas (integrada en los filtros)

- [ ] **useToggle** - Manejar estados booleanos (modals, dropdowns)

  - Ejemplo: `const [isOpen, toggle] = useToggle(false)`
  - Uso: Abrir/cerrar modales de confirmación

- [ ] **useLocalStorage** - Persistir datos en localStorage

  - Ejemplo: `const [user, setUser] = useLocalStorage('currentUser', null)`
  - Uso: Guardar usuario seleccionado y filtros

- [ ] **useClickAway** - Detectar clicks fuera de un elemento

  - Ejemplo: `useClickAway(ref, () => setIsOpen(false))`
  - Uso: Cerrar dropdowns al hacer click afuera

- [ ] **useKeyPress** - Detectar teclas presionadas

  - Ejemplo: `const escPressed = useKeyPress('Escape')`
  - Uso: Atajos de teclado (Esc para cerrar, Enter para guardar)

- [ ] **useDocumentTitle** - Cambiar título de la página

  - Ejemplo: `useDocumentTitle('Nueva Tarea')`
  - Uso: Mostrar contexto en el título del navegador

- [ ] **useInterval** - Ejecutar algo periódicamente
  - Ejemplo: `useInterval(() => refetch(), 30000)`
  - Uso: Auto-refresh del feed de actividad

**Ejemplo de uso**:

```typescript
import { useDebounce, useLocalStorage } from "@uidotdev/usehooks";

function TasksList() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useLocalStorage("taskFilters", {});
  const debouncedSearch = useDebounce(searchTerm, 500);

  // Usar debouncedSearch para hacer fetch...
}
```

**Recursos**:

- 📚 Documentación completa: https://usehooks.com/
- 📦 NPM: https://www.npmjs.com/package/@uidotdev/usehooks

---

## 📊 ÉPICA 5: Activity

### 5.1 Integración con API - Actividad

**Endpoints del backend a consumir**:

- [ ] `GET /activity` - Obtener feed de activity del usuario actual
  - Query params opcionales: `type`, `teamId`, `limit`
- [ ] `GET /teams/:id/activity` - Obtener activity de un equipo específico
  - Solo para propietarios/members del equipo

**Casos de uso**:

- Mostrar feed de activity reciente del usuario
- Filtrar activity por type (creación, asignación, cambio status, comentario)
- Mostrar activity de un equipo específico
- Navegar a la tarea desde el feed de activity

**Lo importante es que**:

- Actividad se obtiene y muestra correctamente
- Feed incluye diferentes tipos de activity
- Se puede filtrar por type y equipo
- Links a tareas relacionadas funcionan

---

### 5.2 Componente - Feed de Actividad

**Ubicación**: `pages/Activity.tsx`

**Sugerencias de implementación**:

**Filtros**:

- [ ] Filtro por equipo: `Equipo [Todos ⌄]`
  - Opciones: Todos, o equipos específicos del usuario
  - Filtrar actividad por equipo
- [ ] Filtro por tipo: `Tipo [Todos ⌄]`
  - Opciones: Todos, Creación, Asignación, Cambio de status, Comentario

**Feed de actividad**:

- [ ] Lista de actividades recientes:
  - [ ] Formato: "[@usuario] [acción] [tarea] ([tiempo])"
    - Ejemplo: "@ana asignó la tarea 'Redactar propuesta' a @juan (hace 2 horas)"
  - [ ] Iconos según type de activity (creación, asignación, cambio status, comentario)
  - [ ] Link a la tarea relacionada
- [ ] Filtros opcionales:
  - [ ] Por type de activity
  - [ ] Por equipo
- [ ] Paginación o scroll infinito
- [ ] Estado vacío: "No hay activity reciente"

**Lo importante es que**:

- Feed de activity se muestra correctamente
- Navegación a tareas desde el feed funciona
- Actualizaciones en tiempo real (opcional: polling o WebSockets)

---

## 🎨 ÉPICA 6: UX y Responsive Design

### 6.1 Estados de Carga

**Sugerencias de implementación**:

- [ ] Implementar mensajes de carga simples en:
  - [ ] Lista de tareas: "Cargando tareas..."
  - [ ] Lista de teams: "Cargando equipos..."
  - [ ] Detalle de tarea: "Cargando tarea..."
  - [ ] Feed de activity: "Cargando actividad..."
- [ ] Opcionalmente agregar un spinner (⏳ o elemento giratorio)
- [ ] Mostrar indicador de loading al guardar formularios
- [ ] Deshabilitar botones durante operaciones

**Lo importante es que**:

- Loading states son claros y simples de implementar
- Usuario sabe que la aplicación está procesando
- UI no se bloquea durante operaciones

---

### 6.2 Estados Vacíos

**Sugerencias de implementación**:

- [ ] Implementar empty states en:
  - [ ] Lista de tareas: "No hay tareas. [Crear tarea]"
  - [ ] Lista de teams: "No tenés teams. [Crear equipo]"
  - [ ] Comentarios: "No hay comments. Sé el primero en comentar."
  - [ ] Historial: "No hay cambios de status registrados."
  - [ ] Actividad: "No hay activity reciente."
- [ ] Incluir ilustración o icono
- [ ] Incluir CTA (Call to Action) cuando aplique

**Lo importante es que**:t

- Empty states guían al usuario a realizar acciones
- Mejoran la experiencia de primeros usos

---

### 6.3 Confirmación para Remover Miembros

**Sugerencias de implementación**:

- [ ] Modal de confirmación al remover miembro de equipo
- [ ] Texto claro del impacto de la acción
- [ ] Botones "Confirmar" y "Cancelar"
- [ ] Solo visible para propietarios del equipo

**Lo importante es que**:

- Confirmación previene remociones accidentales
- Usuario entiende el impacto de la acción

---

### 6.4 Validaciones Visuales en Formularios

**Sugerencias de implementación**:

- [ ] Indicadores de campo requerido (asterisco `*`)
- [ ] Mensajes de error debajo de cada campo
- [ ] Colores de validación:
  - Rojo para errores
  - Verde para éxito (opcional)
- [ ] Deshabilitar submit hasta que formulario sea válido
- [ ] Mostrar errores al perder foco del campo (onBlur) o al submit

**Lo importante es que**:

- Validaciones son claras y visibles
- Usuario sabe qué corregir antes de enviar

---

## 📚 ÉPICA 7: Documentación

### 7.1 README del Frontend

**Sugerencias de implementación**:

- [ ] Crear `README.md` con:
  - [ ] Prerrequisitos (Node.js >= 16, npm)
  - [ ] Instalación: `npm install`
  - [ ] Configuración de variables de entorno (`.env.example` con prefijo `VITE_`)
  - [ ] Ejecución en desarrollo: `npm run dev`
  - [ ] Build para producción: `npm run build`
  - [ ] Preview del build: `npm run preview`
  - [ ] Linting: `npm run lint`
  - [ ] Estructura de carpetas
  - [ ] Tecnologías utilizadas (React + TypeScript + Vite)
  - [ ] Decisiones técnicas importantes (uso de fetch, organización de código, etc.)

**Ejemplo de estructura de README**:

````markdown
# Gestor de Tareas Colaborativas - Frontend

Frontend desarrollado con React + TypeScript + Vite

## Prerrequisitos

- Node.js >= 16
- npm >= 7

## Instalación

```bash
npm install
```
````

## Configuración

Crear archivo `.env` basado en `.env.example`:

```
VITE_API_URL=http://localhost:3000/api
```

## Scripts

- `npm run dev` - Inicia servidor de desarrollo
- `npm run build` - Genera build de producción
- `npm run preview` - Previsualiza build de producción
- `npm run lint` - Ejecuta linter (opcional)

## Estructura de carpetas

```
src/
├── components/     # Componentes reutilizables
├── pages/          # Páginas/vistas principales
├── hooks/          # Custom hooks
├── context/        # Contexts de React
├── types/          # Tipos de TypeScript
├── utils/          # Utilidades (http wrapper, helpers)
└── constants/      # Constantes (enums, configs)
```

## Tecnologías

- React 18
- TypeScript
- Vite
- React Router
- fetch nativo para HTTP

## Decisiones Técnicas

- Se usa fetch nativo con wrapper personalizado en lugar de Axios
- Variables de entorno con prefijo VITE\_ (requerido por Vite)
- Formularios manejados con status de React (useState)

```

**Lo importante es que**:

- Otro desarrollador puede levantar el frontend siguiendo el README
- Documentación clara y completa
- Instrucciones específicas para Vite

---

## ✅ Checklist Final de Verificación

### 👤 Gestión de Usuario Actual

- [ ] Selector de usuario carga lista desde backend
- [ ] Al seleccionar usuario, actualiza contexto global
- [ ] Usuario seleccionado persiste al recargar página
- [ ] Usuario actual se usa en creación de tareas, comments, etc.

### 👥 Usuarios y Equipos

- [ ] Crear equipo funciona (usuario creador = propietario)
- [ ] Editar equipo funciona (solo propietario)
- [ ] Listar teams del usuario funciona
- [ ] Agregar members funciona (siempre con rol "Miembro")
- [ ] Remover members funciona (solo propietario, no puede remover al propietario)
- [ ] Validación: el propietario no puede ser removido
- [ ] Selector de equipo en header funciona

### 📝 Tareas - CRUD

- [ ] Crear tarea funciona (personal y de equipo)
- [ ] Editar tarea funciona
- [ ] Listar tareas funciona
- [ ] Detalle de tarea se carga correctamente

### 📝 Tareas - Atributos

- [ ] Título, descripción, status, priority se guardan
- [ ] Fecha límite se valida (no en pasado)
- [ ] Asignar tarea a usuario funciona
- [ ] Tareas pueden ser personales o de equipo

### 📝 Tareas - Estados

- [ ] Cambio de status funciona
- [ ] Transiciones válidas se respetan (PENDIENTE → EN_CURSO → FINALIZADA)
- [ ] Cualquier status puede pasar a CANCELADA
- [ ] Tareas FINALIZADAS/CANCELADAS: solo se pueden editar comments y tags

### 📝 Tareas - Filtros y Búsqueda

- [ ] Filtro por status funciona
- [ ] Filtro por priority funciona
- [ ] Filtro por rango de fechas funciona
- [ ] Filtro por tags funciona
- [ ] Filtro por asignado funciona
- [ ] Búsqueda por texto (título/descripción) funciona
- [ ] Filtros se pueden combinar
- [ ] Ordenamiento por createdAt límite, priority, creación funciona
- [ ] Paginación funciona correctamente

### 💬 Comentarios

- [ ] Agregar comentario funciona
- [ ] Listar comments funciona
- [ ] Editar comentario funciona
- [ ] Se pueden agregar comments a tareas finalizadas

### 📜 Historial

- [ ] Historial de cambios de status se muestra
- [ ] Incluye quién y cuándo hizo el cambio
- [ ] Formato es legible y claro

### 🏷️ Etiquetas

- [ ] Crear etiqueta funciona
- [ ] Listar tags funciona
- [ ] Asignar tags a tarea funciona
- [ ] Remover tags de tarea funciona
- [ ] Una tarea puede tener múltiples tags

### 📊 Actividad

- [ ] Feed de activity del usuario funciona
- [ ] Actividad del equipo funciona (si se implementa)
- [ ] Se registran cambios de status, asignaciones, comments
- [ ] Click en activity redirige a la tarea

### 🎨 UX

- [ ] Estados de carga en todas las operaciones
- [ ] Estados vacíos en listas sin elementos
- [ ] Confirmación para remover members de equipo
- [ ] Validaciones visuales en formularios
- [ ] Mensajes de error claros


### 📚 Documentación

- [ ] README completo con instrucciones
- [ ] Variables de entorno documentadas
- [ ] Estructura de carpetas documentada
- [ ] Decisiones técnicas documentadas

---

## 📋 Mapeo Completo: Endpoints Backend ↔ Features Frontend

### Endpoints de Usuarios

| Endpoint            | Método | Usado en                                        |
| ------------------- | ------ | ----------------------------------------------- |
| `/users`         | GET    | Selector de usuario actual, asignar tareas     |
| `/users/:id`     | GET    | Ver perfil de usuario (opcional)                |
| `/users`         | POST   | Crear usuario (opcional, puede ser seed en BD)  |
| `/users/:id`     | PUT    | Editar perfil (opcional)                        |

### Endpoints de Equipos

| Endpoint        | Método | Usado en                                  |
| --------------- | ------ | ----------------------------------------- |
| `/teams`      | GET    | Lista de teams, selector de equipo      |
| `/teams/:id`  | GET    | Detalle de equipo, editar información     |
| `/teams`      | POST   | Crear nuevo equipo                        |
| `/teams/:id`  | PUT    | Actualizar name/descripción del equipo  |

### Endpoints de Membresías

| Endpoint                             | Método | Usado en                                |
| ------------------------------------ | ------ | --------------------------------------- |
| `/teams/:id/members`              | GET    | Listar members de un equipo            |
| `/teams/:id/members`              | POST   | Invitar/agregar miembro al equipo       |
| `/teams/:id/members/:userId`   | DELETE | Remover miembro del equipo              |

**Nota**: No hay cambio de roles. El propietario es fijo (quien creó el equipo) y todos los demás son members.

### Endpoints de Tareas

| Endpoint                | Método | Usado en                                       |
| ----------------------- | ------ | ---------------------------------------------- |
| `/tasks`               | GET    | Lista de tareas con filters y paginación       |
| `/tasks/:id`           | GET    | Detalle/editar tarea                           |
| `/tasks`               | POST   | Crear nueva tarea                              |
| `/tasks/:id`           | PUT    | Actualizar tarea                               |
| `/tasks/:id/status`    | PUT    | Cambiar status (validar transiciones)          |

### Endpoints de Comentarios

| Endpoint                      | Método | Usado en                          |
| ----------------------------- | ------ | --------------------------------- |
| `/tasks/:id/comments`     | GET    | Ver comments de una tarea      |
| `/tasks/:id/comments`     | POST   | Agregar comentario                |
| `/comments/:id`            | PUT    | Editar comentario                 |

### Endpoints de Historial

| Endpoint                  | Método | Usado en                                |
| ------------------------- | ------ | --------------------------------------- |
| `/tasks/:id/history`   | GET    | Ver history de cambios de status      |

### Endpoints de Etiquetas

| Endpoint                   | Método | Usado en                                  |
| -------------------------- | ------ | ----------------------------------------- |
| `/tags`               | GET    | Listar tags disponibles              |
| `/tags`               | POST   | Crear nueva etiqueta                      |
| `/tasks/:id/tags`    | PUT    | Asignar/actualizar tags de una tarea |

### Endpoints de Actividad

| Endpoint                   | Método | Usado en                              |
| -------------------------- | ------ | ------------------------------------- |
| `/activity`               | GET    | Feed de activity del usuario         |
| `/teams/:id/activity`   | GET    | Feed de activity del equipo          |

```
