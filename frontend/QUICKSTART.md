# 🚀 QuickStart - Ejercicios GamerHub

## Instalación Rápida

```bash
npm install
npm run dev
# Abrir http://localhost:5173
```

## 🎯 Estado de los Ejercicios

| #   | Ejercicio            | Estado      | Dificultad | Archivo Principal           |
| --- | -------------------- | ----------- | ---------- | --------------------------- |
| 1   | Theme Context        | ✅ Completo | ⭐         | `contexts/ThemeContext.tsx` |
| 2   | Auth Context         | ✅ Completo | ⭐⭐       | `contexts/AuthContext.tsx`  |
| 3   | useLocalStorage Hook | 🔧 Tu turno | ⭐⭐       | `hooks/useLocalStorage.ts`  |
| 4   | useFetch Hook        | 🔧 Tu turno | ⭐⭐⭐     | `hooks/useFetch.ts`         |
| 5   | React Router         | ✅ Completo | ⭐⭐       | `App.tsx`                   |
| 6   | Router + Loaders     | 🔧 Tu turno | ⭐⭐⭐⭐   | `router.tsx` (crear)        |

## 📋 Tu Trabajo

### Ejercicio 3: useLocalStorage + Settings

**Archivos**:

- 🔧 `src/hooks/useLocalStorage.ts` - Completar el hook
- 🔧 `src/pages/SettingsPage.tsx` - Implementar UI

**Objetivo**: Persistir configuraciones del usuario

**Pasos**:

1. Completar la lógica del hook para leer/escribir en localStorage
2. Crear formulario de configuración (notificaciones, volumen, idioma)
3. Usar el hook para cada configuración
4. Mostrar feedback cuando se guarden cambios

**Test**: Recarga la página y verifica que los cambios persistan

---

### Ejercicio 4: useFetch + Feed

**Archivos**:

- 🔧 `src/hooks/useFetch.ts` - Completar el hook
- 🔧 `src/pages/FeedPage.tsx` - Implementar UI

**Objetivo**: Cargar y mostrar posts de una API

**Pasos**:

1. Completar el hook con estados: data, loading, error
2. Implementar fetch con manejo de errores
3. Usar el hook en FeedPage para cargar posts
4. Mostrar loading spinner, posts, y errores

**API**: `https://jsonplaceholder.typicode.com/posts`

**Test**: Deberías ver lista de posts al entrar a /feed

---

### Ejercicio 6: Router + Loaders (Avanzado)

**Archivos**:

- 🔧 `src/router.tsx` - Crear configuración centralizada
- 🔧 `src/loaders/profileLoader.ts` - Crear loader
- 🔧 `src/pages/ProfilePage.tsx` - Usar useLoaderData
- 🔧 `src/main.tsx` - Cambiar a RouterProvider

**Objetivo**: Migrar a createBrowserRouter y usar loaders

**Pasos**:

1. Crear router.tsx con createBrowserRouter
2. Mover todas las rutas del App.tsx al router
3. Crear loader para cargar datos del perfil
4. Actualizar ProfilePage para usar useLoaderData
5. Cambiar main.tsx para usar RouterProvider

**Test**: Los datos deben cargarse antes de mostrar la página

---

## 💡 Pistas Rápidas

### useLocalStorage

```tsx
// Leer de localStorage
const stored = localStorage.getItem(key);
const initial = stored ? JSON.parse(stored) : defaultValue;

// Guardar en localStorage
localStorage.setItem(key, JSON.stringify(value));
```

### useFetch

```tsx
const [data, setData] = useState(null);
const [loading, setLoading] = useState(true);
const [error, setError] = useState(null);

useEffect(() => {
  fetch(url)
    .then((res) => res.json())
    .then(setData)
    .catch(setError)
    .finally(() => setLoading(false));
}, [url]);
```

### Loader

```tsx
export async function loader({ params }) {
  const response = await fetch(`/api/users/${params.id}`);
  return response.json();
}

// En la ruta:
{ path: '/users/:id', element: <User />, loader: userLoader }
```

## 🎨 Variables CSS Gaming

```css
var(--bg-primary)       /* Fondo principal */
var(--bg-secondary)     /* Fondo secundario */
var(--accent-primary)   /* Color de acento */
var(--text-primary)     /* Texto principal */
var(--text-secondary)   /* Texto secundario */
```

## 🔍 Para Revisar

### Ejercicios Completados (referencia)

- ✅ **ThemeContext**: Revisa cómo crear y usar contexts
- ✅ **AuthContext**: Revisa custom hooks y manejo de estado
- ✅ **LoginForm**: Revisa formularios y validación
- ✅ **ProtectedRoute**: Revisa redirección y guards

### Proyecto de Ejemplos

Ve a `../ejemplos/` para ver implementaciones completas:

- Context API completo con ejemplos
- Custom Hooks completos con ejemplos
- React Router con loaders, nested routes, etc.

## ✅ Checklist de Completado

### Ejercicio 3

- [ ] Hook useLocalStorage lee de localStorage
- [ ] Hook guarda automáticamente los cambios
- [ ] Settings page tiene al menos 3 configuraciones
- [ ] Los cambios persisten al recargar

### Ejercicio 4

- [ ] Hook useFetch maneja loading
- [ ] Hook useFetch maneja errores
- [ ] Feed muestra lista de posts
- [ ] Hay feedback visual para loading y errores

### Ejercicio 6

- [ ] Archivo router.tsx creado con todas las rutas
- [ ] profileLoader.ts creado
- [ ] ProfilePage usa useLoaderData
- [ ] main.tsx usa RouterProvider
- [ ] App.tsx tiene <Outlet /> en lugar de <Routes>

## 🚨 Problemas Comunes

### "localStorage is not defined"

- Solo disponible en el browser
- Verifica que no se ejecute en el server

### "Cannot read property of undefined"

- Verifica que data no sea null antes de usarla
- Usa optional chaining: `data?.property`

### "Module not found"

- Verifica la ruta de import
- Los paths son relativos: `./` o `../`

### "Type error"

- Tipa correctamente con TypeScript
- Usa interfaces para tus datos

## 🎯 Objetivos de Aprendizaje

Al completar estos ejercicios, serás capaz de:

- ✅ Crear y usar Context API para estado global
- ✅ Implementar custom hooks reutilizables
- ✅ Manejar side effects con useEffect
- ✅ Trabajar con localStorage
- ✅ Hacer llamadas HTTP con fetch
- ✅ Configurar React Router con loaders
- ✅ Tipar correctamente con TypeScript
- ✅ Manejar loading y error states
- ✅ Crear interfaces de usuario claras

## 📚 Recursos

- [README.md](./README.md) - Guía detallada de ejercicios
- [Ejemplos](../ejemplos/) - Implementaciones de referencia
- [React Docs](https://react.dev/) - Documentación oficial

---

**¡A codear! 🎮🚀**
