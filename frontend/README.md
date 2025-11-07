# 🎮 Ejercicios Prácticos: GamerHub - Red Social de Gamers

Este proyecto contiene ejercicios prácticos para aprender **Context API**, **Custom Hooks** y **React Router** con TypeScript, construyendo una red social para gamers.

## 🚀 Inicio Rápido

### Instalación

```bash
npm install
npm run dev
```

El proyecto se abrirá en `http://localhost:5173`

## 🎯 Sobre GamerHub

Una red social temática de gaming donde implementarás:

- 🎨 Sistema de temas (dark/light mode)
- 🔐 Autenticación y gestión de usuarios
- 📱 Feed de actividades
- ⚙️ Configuración con persistencia
- 🛣️ Navegación con React Router

## 📚 Ejercicios

### ✅ Ejercicio 1: Theme Context (Completado)

**Estado**: Implementado como referencia

**Archivo**: `src/contexts/ThemeContext.tsx`

Este ejercicio ya está resuelto para que lo uses como referencia. Revisa el código para entender cómo:

- Crear un Context con `createContext()`
- Implementar un Provider con estado
- Consumir el context con `use()` (React 19)

---

### ✅ Ejercicio 2: Auth Context (Completado)

**Estado**: Implementado como referencia

**Archivo**: `src/contexts/AuthContext.tsx`

Este ejercicio también está resuelto. Estudia cómo:

- Manejar estado de autenticación
- Crear funciones `login()` y `logout()`
- Usar un custom hook `useAuth()`
- Tipar correctamente con TypeScript

---

### 🔧 Ejercicio 3: useLocalStorage Hook

**Objetivo**: Implementar un custom hook para persistir datos en localStorage

**Archivos a modificar**:

- ✅ `src/hooks/useLocalStorage.ts` (ya existe, solo tiene la estructura básica)
- 🔧 `src/pages/SettingsPage.tsx` (implementar UI)

**Tareas**:

#### Parte 1: Completar el Hook

Archivo: `src/hooks/useLocalStorage.ts`

El hook ya tiene la estructura. Debes implementar:

1. **Estado inicial**: Leer de localStorage o usar valor por defecto
2. **Efecto para guardar**: Usar `useEffect` para sincronizar con localStorage
3. **Manejar errores**: Wrap en try/catch para evitar crashes

**Pistas**:

```tsx
// Para leer de localStorage:
const storedValue = localStorage.getItem(key);
const initial = storedValue ? JSON.parse(storedValue) : initialValue;

// Para guardar en localStorage:
localStorage.setItem(key, JSON.stringify(value));

// Para escuchar cambios:
useEffect(() => {
  // guardar cuando value cambie
}, [value, key]);
```

#### Parte 2: Implementar la UI en Settings

Archivo: `src/pages/SettingsPage.tsx`

Crear un formulario de configuración que use `useLocalStorage` para guardar:

**Configuraciones sugeridas**:

- Notificaciones (boolean)
- Volumen (número 0-100)
- Idioma (string: 'es', 'en', 'pt')
- Auto-play videos (boolean)

**Estructura recomendada**:

```tsx
export function SettingsPage() {
  // Usar useLocalStorage para cada configuración
  const [notifications, setNotifications] = useLocalStorage(
    "notifications",
    true
  );
  const [volume, setVolume] = useLocalStorage("volume", 50);
  // ... etc

  return (
    <div className="main-content">
      <div className="card">
        <h2>⚙️ Configuración</h2>

        {/* Sección de notificaciones */}
        {/* Sección de audio */}
        {/* Sección de idioma */}

        <div
          style={{
            marginTop: "2rem",
            padding: "1rem",
            backgroundColor: "var(--bg-tertiary)",
          }}
        >
          <h4>💡 Tip</h4>
          <p>Recarga la página y verás que tu configuración se mantiene!</p>
        </div>
      </div>
    </div>
  );
}
```

**Tips**:

- Usa checkboxes para booleans
- Usa `<input type="range">` para el volumen
- Usa `<select>` para el idioma
- Muestra feedback visual cuando guardas

---

### 🔧 Ejercicio 4: useFetch Hook

**Objetivo**: Crear un hook reutilizable para hacer llamadas HTTP

**Archivos a modificar**:

- ✅ `src/hooks/useFetch.ts` (ya existe, solo tiene la estructura básica)
- 🔧 `src/pages/FeedPage.tsx` (implementar UI)

**Tareas**:

#### Parte 1: Completar el Hook

Archivo: `src/hooks/useFetch.ts`

El hook debe manejar:

1. **Estados**: `data`, `loading`, `error`
2. **Efecto para fetch**: Hacer la llamada cuando cambie la URL
3. **Cleanup**: Cancelar fetch si el componente se desmonta
4. **Error handling**: Capturar y mostrar errores

**Pistas**:

```tsx
// Estados básicos
const [data, setData] = useState<T | null>(null);
const [loading, setLoading] = useState(true);
const [error, setError] = useState<string | null>(null);

// Efecto para fetch
useEffect(() => {
  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await fetch(url);
      if (!response.ok) throw new Error("Error fetching");
      const json = await response.json();
      setData(json);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  fetchData();
}, [url]);
```

#### Parte 2: Implementar el Feed

Archivo: `src/pages/FeedPage.tsx`

Usar `useFetch` para cargar y mostrar posts de una API.

**API sugerida**: `https://jsonplaceholder.typicode.com/posts`

**Estructura recomendada**:

```tsx
interface Post {
  userId: number;
  id: number;
  title: string;
  body: string;
}

export function FeedPage() {
  const { gamer } = useAuth();
  const { data: posts, loading, error } = useFetch<Post[]>("...");

  if (loading) return <div>⏳ Cargando posts...</div>;
  if (error) return <div>❌ Error: {error}</div>;

  return (
    <div className="main-content">
      <h2>📱 Feed de {gamer?.username}</h2>

      {/* Mapear y mostrar posts */}
      {posts?.map((post) => (
        <div key={post.id} className="card">
          {/* Renderizar post */}
        </div>
      ))}
    </div>
  );
}
```

**Tips**:

- Muestra un skeleton o spinner mientras carga
- Muestra mensajes de error amigables
- Dale estilo gaming a las cards de posts
- Considera agregar un botón de refresh

---

### ✅ Ejercicio 5: React Router (Completado)

**Estado**: Implementado como referencia

**Archivos**: `src/App.tsx`, `src/pages/*.tsx`

El routing básico ya está implementado con:

- Rutas públicas: `/`, `/login`
- Rutas protegidas: `/feed`, `/profile/:username`, `/settings`
- 404 para rutas no encontradas
- Componente `ProtectedRoute` para autenticación

Revisa cómo:

- Configurar `BrowserRouter`
- Usar `<Link>` y `<Route>`
- Implementar rutas protegidas
- Usar `useNavigate()` para navegación programática

---

### 🔧 Ejercicio 6: React Router + Loaders (Avanzado)

**Objetivo**: Migrar de `BrowserRouter` a `createBrowserRouter` y usar loaders

**Archivos a crear/modificar**:

- 🔧 Crear `src/router.tsx` (nuevo archivo)
- 🔧 Modificar `src/main.tsx` (cambiar a `RouterProvider`)
- 🔧 Crear `src/loaders/profileLoader.ts` (nuevo archivo)
- 🔧 Modificar `src/pages/ProfilePage.tsx` (usar `useLoaderData`)

**Tareas**:

#### Parte 1: Crear el Router Centralizado

Archivo: `src/router.tsx`

Migrar de `<Routes>` a `createBrowserRouter`:

```tsx
import { createBrowserRouter } from "react-router-dom";
import App from "./App";
// ... otros imports

export const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      { index: true, element: <HomePage /> },
      { path: "login", element: <LoginPage /> },
      // ... definir el resto de rutas
    ],
  },
]);
```

**Pistas**:

- Usa `children` para rutas anidadas
- Agrega `loader` a las rutas que necesitan datos
- Usa `errorElement` para manejar errores

#### Parte 2: Crear el Loader

Archivo: `src/loaders/profileLoader.ts`

```tsx
// Definir interfaz del perfil
interface ProfileData {
  username: string;
  // ... otros campos
}

// Loader function
export async function profileLoader({
  params,
}: {
  params: { username: string };
}) {
  // Aquí podrías hacer fetch a una API
  // Por ahora, devuelve datos mock

  // Simular delay de red
  await new Promise((resolve) => setTimeout(resolve, 500));

  return {
    username: params.username,
    // ... datos del perfil
  };
}
```

#### Parte 3: Usar el Loader en ProfilePage

Archivo: `src/pages/ProfilePage.tsx`

```tsx
import { useLoaderData } from "react-router-dom";

export function ProfilePage() {
  const profile = useLoaderData() as ProfileData;

  // Ya no necesitas useState, useEffect, loading, etc
  // Los datos ya están listos!

  return (
    <div className="main-content">
      <h2>Perfil de {profile.username}</h2>
      {/* Renderizar perfil */}
    </div>
  );
}
```

#### Parte 4: Actualizar main.tsx

Archivo: `src/main.tsx`

```tsx
import { RouterProvider } from "react-router-dom";
import { router } from "./router";

// Cambiar de <BrowserRouter> a <RouterProvider>
createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ThemeProvider>
      <AuthProvider>
        <RouterProvider router={router} />
      </AuthProvider>
    </ThemeProvider>
  </StrictMode>
);
```

#### Parte 5: Actualizar App.tsx

Archivo: `src/App.tsx`

- Remover `<Routes>` y `<Route>`
- Agregar `<Outlet />` donde se renderizarán las rutas hijas
- El layout (navbar, footer) se mantiene

**Tips**:

- Los loaders se ejecutan ANTES de renderizar el componente
- No necesitas loading states en el componente
- Usa `defer` y `Suspense` para streaming (avanzado)

---

## 📁 Estructura del Proyecto

```
src/
├── contexts/              # Context providers
│   ├── ThemeContext.tsx       ✅ Completado
│   └── AuthContext.tsx        ✅ Completado
├── hooks/                 # Custom hooks
│   ├── useLocalStorage.ts     🔧 Por completar
│   └── useFetch.ts            🔧 Por completar
├── components/            # Componentes reutilizables
│   ├── LoginForm.tsx          ✅ Completado
│   └── ProtectedRoute.tsx     ✅ Completado
├── pages/                 # Páginas
│   ├── HomePage.tsx           ✅ Completado
│   ├── LoginPage.tsx          ✅ Completado
│   ├── FeedPage.tsx           🔧 Por completar (Ej. 4)
│   ├── ProfilePage.tsx        🔧 Por completar (Ej. 6)
│   ├── SettingsPage.tsx       🔧 Por completar (Ej. 3)
│   └── NotFoundPage.tsx       ✅ Completado
├── loaders/               # Data loaders (para Ej. 6)
│   └── profileLoader.ts       🔧 Por crear
├── router.tsx             # Router config (para Ej. 6)
├── App.tsx                # Layout principal
└── main.tsx               # Entry point
```

## 🎨 Variables CSS Disponibles

El proyecto incluye variables CSS para el tema gaming:

```css
/* Colores principales */
--bg-primary: #0f0f23
--bg-secondary: #1a1a2e
--bg-tertiary: #16213e
--accent-primary: #0f3460
--accent-secondary: #533483
--text-primary: #e8e8e8
--text-secondary: #a0a0a0

/* Uso */
.mi-elemento {
  background-color: var(--bg-secondary);
  color: var(--text-primary);
}
```

## 💡 Tips Generales

### Para Context API

- Siempre tipa los contexts con TypeScript
- Crea custom hooks (`useAuth`, `useTheme`) para facilitar el consumo
- Usa `use()` de React 19 en lugar de `useContext()`

### Para Custom Hooks

- Los hooks SIEMPRE empiezan con `use`
- Deben ser reutilizables y genéricos
- Devuelve arrays `[value, setValue]` o objetos `{ value, loading, error }`
- Maneja casos edge (errores, loading, undefined)

### Para React Router

- Usa `<Link>` en lugar de `<a>` para navegación
- `useNavigate()` para navegación programática
- Rutas dinámicas: `/profile/:username`
- Query params: `/search?q=react`
- Loaders para cargar datos antes del render

### Para TypeScript

- Define interfaces para tus datos
- Tipa los props de componentes
- Usa genéricos en hooks reutilizables: `useFetch<Post[]>`
- El compilador es tu amigo - si hay error, hay razón

## 🔧 Comandos Disponibles

```bash
npm run dev      # Modo desarrollo
npm run build    # Build para producción
npm run preview  # Preview del build
npm run lint     # Linter
```

## 📖 Recursos de Ayuda

### Documentación Oficial

- [React Docs](https://react.dev/) - Documentación oficial de React
- [React Router](https://reactrouter.com/) - Documentación de React Router
- [TypeScript](https://www.typescriptlang.org/) - Documentación de TypeScript

### Ejemplos de Referencia

Revisa el proyecto `ejemplos/` en la carpeta padre para ver implementaciones completas de:

- Context API (ThemeContext, AuthContext, CartContext)
- Custom Hooks (useLocalStorage, useFetch, useDebounce, useToggle)
- React Router (rutas dinámicas, nested routes, loaders)

### APIs para Testing

- JSONPlaceholder: `https://jsonplaceholder.typicode.com/posts`
- Usa esta API gratuita para el ejercicio de useFetch

## ✅ Checklist de Progreso

- [x] Ejercicio 1: Theme Context
- [x] Ejercicio 2: Auth Context
- [ ] Ejercicio 3: useLocalStorage + Settings UI
- [ ] Ejercicio 4: useFetch + Feed UI
- [x] Ejercicio 5: React Router básico
- [ ] Ejercicio 6: React Router + Loaders

## 🎯 Criterios de Evaluación

### Funcionalidad (40%)

- ✅ El código funciona sin errores
- ✅ Cumple con los requisitos del ejercicio
- ✅ Maneja casos edge (errores, loading, etc)

### Código (30%)

- ✅ Código limpio y legible
- ✅ Buenas prácticas de React
- ✅ TypeScript correctamente tipado

### UI/UX (20%)

- ✅ Interfaz clara y usable
- ✅ Feedback visual apropiado
- ✅ Estilo consistente con el tema gaming

### Creatividad (10%)

- ✅ Soluciones creativas
- ✅ Mejoras adicionales
- ✅ Atención al detalle

---

**¡Buena suerte con los ejercicios! 🎮🚀**
