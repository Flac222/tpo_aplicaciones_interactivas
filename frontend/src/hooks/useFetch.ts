// src/hooks/useFetch.tsx
import { useState, useEffect } from "react";

interface UseFetchResult<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

// *** CAMBIO: Se añade 'options' como segundo argumento ***
export function useFetch<T>(
    url: string | null, // Aceptamos null para no ejecutar el fetch si la URL no está lista
    options?: RequestInit // Tipo estándar para las opciones de fetch
): UseFetchResult<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refetchTrigger, setRefetchTrigger] = useState(0);

  useEffect(() => {
    // Si la URL es null, detenemos la ejecución y mostramos que no está cargando
    if (!url) {
        setLoading(false);
        setData(null);
        return;
    }
    
    const abortController = new AbortController();

    async function fetchData() {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(url as string, {
          signal: abortController.signal,
          // *** CAMBIO: Se unen las opciones recibidas con el signal ***
          ...options
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const jsonData = await response.json();
        setData(jsonData);
      } catch (err: unknown) {
        if (err instanceof Error && err.name !== "AbortError") {
          setError(err.message);
        }
      } finally {
        setLoading(false);
      }
    }

    fetchData();

    return () => {
      abortController.abort();
    };
    // *** CAMBIO: Se añade 'options' a las dependencias para que cambie si las opciones cambian ***
    // (Ej. si el token cambia)
  }, [url, refetchTrigger, options]); 

  const refetch = () => {
    setRefetchTrigger((prev) => prev + 1);
  };

  return { data, loading, error, refetch };
}