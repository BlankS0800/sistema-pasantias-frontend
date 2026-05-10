import { apiFetch, guardarSesion, limpiarSesion } from '../api/api';

interface LoginPayload {
    email: string;
    contrasena: string;
}

export const login = async (payload: LoginPayload) => {
    const data = await apiFetch('/login', {
        method: 'POST',
        body: JSON.stringify(payload),
    });

    guardarSesion(data.token, data.usuario);

    return data;
};

export const logout = async () => {
    try {
        await apiFetch('/logout', {
            method: 'POST',
        });
    } catch (error) {
        console.error('Error al cerrar sesión en el servidor:', error);
    } finally {
        limpiarSesion();
    }
};

export const me = async () => {
    return await apiFetch('/me', {
        method: 'GET',
    });
};