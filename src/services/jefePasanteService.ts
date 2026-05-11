const API_URL = import.meta.env.VITE_API_URL;

export interface EncargadoPasantePayload {
    nombre: string;
    apellido: string;
    email: string;
    contrasena: string;
    telefono: string;
    cargo: string;
}

export interface EncargadoPasante {
    id_usuario: number;
    cargo: string;
    telefono: string;
    id_empresa: number;
    usuario?: {
        id_usuario: number;
        nombre: string;
        apellido: string;
        email: string;
        telefono: string;
    };
}

const getAuthHeaders = () => {
    const token = localStorage.getItem('token');

    return {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        Authorization: `Bearer ${token}`,
    };
};

const manejarRespuesta = async (response: Response) => {
    const data = await response.json().catch(() => null);

    if (!response.ok) {
        throw data || { message: 'Error en la petición.' };
    }

    return data;
};

export const listarEncargadosPasantes = async () => {
    const response = await fetch(`${API_URL}/gerente/jefes-pasantes`, {
        method: 'GET',
        headers: getAuthHeaders(),
    });

    return manejarRespuesta(response);
};

export const registrarEncargadoPasante = async (
    payload: EncargadoPasantePayload
) => {
    const response = await fetch(`${API_URL}/gerente/jefes-pasantes`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(payload),
    });

    return manejarRespuesta(response);
};