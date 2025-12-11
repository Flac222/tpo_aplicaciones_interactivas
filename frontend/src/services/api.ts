
const BASE_URL = 'http://localhost:3000/api';

interface RequestOptions extends RequestInit {
    token?: string;
}

export async function apiRequest<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
    const { token, headers, ...customConfig } = options;
    const authToken = token || localStorage.getItem('token');

    const config: RequestInit = {
        ...customConfig,
        headers: {
            'Content-Type': 'application/json',
            ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
            ...headers,
        },
    };

    const response = await fetch(`${BASE_URL}${endpoint}`, config);

    if (!response.ok) {
        // Manejo de errores especificos
        const errorMessage = await response.text().catch(() => response.statusText);
        throw { status: response.status, message: errorMessage };
    }

    // Manejo los 204
    if (response.status === 204) {
        return {} as T;
    }

    return response.json();
}
