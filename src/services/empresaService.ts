const API_URL = import.meta.env.VITE_API_URL;

export interface Empresa {
    id_empresa?: number;
    nombre: string;
    direccion: string;
    telefono: string;
    nit: string;
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

export const mostrarMiEmpresa = async () => {
    const response = await fetch(`${API_URL}/gerente/MostrarMiEmpresa`, {
        method: 'GET',
        headers: getAuthHeaders(),
    });

    if (response.status === 404) {
        return {
            empresa: null,
            message: 'El gerente todavía no tiene una empresa registrada.',
        };
    }

    return manejarRespuesta(response);
};

export const registrarMiEmpresa = async (empresa: Empresa) => {
    const response = await fetch(`${API_URL}/gerente/RegistarMiEmpresa`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(empresa),
    });

    return manejarRespuesta(response);
};

export const actualizarMiEmpresa = async (empresa: Empresa) => {
    const response = await fetch(`${API_URL}/gerente/empresa`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(empresa),
    });

    return manejarRespuesta(response);
};

export const eliminarMiEmpresa = async () => {
    const response = await fetch(`${API_URL}/gerente/empresa`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
    });

    return manejarRespuesta(response);
};