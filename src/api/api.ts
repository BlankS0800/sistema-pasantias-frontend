const API_URL = import.meta.env.VITE_API_URL;

export const getToken = () => {
    return localStorage.getItem('token');
};

export const getUsuario = () => {
    const usuario = localStorage.getItem('usuario');

    if (!usuario) {
        return null;
    }

    try {
        return JSON.parse(usuario);
    } catch {
        return null;
    }
};

export const guardarSesion = (token: string, usuario: any) => {
    localStorage.setItem('token', token);
    localStorage.setItem('usuario', JSON.stringify(usuario));
};

export const limpiarSesion = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
};

export const apiFetch = async (endpoint: string, options: RequestInit = {}) => {
    console.log(endpoint)
    const token = getToken();

    const response = await fetch(`${API_URL}${endpoint}`, {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
            ...options.headers,
        },
    });

    const data = await response.json().catch(() => null);

    if (!response.ok) {
        throw data || { message: 'Error en la petición' };
    }

    return data;
};