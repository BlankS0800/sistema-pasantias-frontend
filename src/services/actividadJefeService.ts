const API_URL = import.meta.env.VITE_API_URL;

export interface ActividadJefe {
    id_actividad: number;
    titulo: string;
    descripcion: string;
    fecha_inicio: string;
    fecha_fin: string;
    id_pasantia: number;
    pasantia?: PasantiaAsignada;
}

export interface PasantiaAsignada {
    id_pasantia: number;
    nombre: string;
    descripcion: string;
    fecha_inicio: string;
    fecha_fin: string;
    estado: string;
    horario: string;
    id_empresa: number;
    id_jefe: number;
    documento_nombre?: string | null;
    documento_url?: string | null;
    actividades?: ActividadJefe[];
}

export interface ActividadPayload {
    titulo: string;
    descripcion: string;
    fecha_inicio: string;
    fecha_fin: string;
    id_pasantia: number;
}

const getJsonHeaders = () => {
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

export const listarPasantiasAsignadasJefe = async () => {
    const response = await fetch(`${API_URL}/jefe/pasantias`, {
        method: 'GET',
        headers: getJsonHeaders(),
    });

    return manejarRespuesta(response);
};

export const listarActividadesJefe = async () => {
    const response = await fetch(`${API_URL}/jefe/actividades`, {
        method: 'GET',
        headers: getJsonHeaders(),
    });

    return manejarRespuesta(response);
};

export const registrarActividadJefe = async (payload: ActividadPayload) => {
    const response = await fetch(`${API_URL}/jefe/actividades`, {
        method: 'POST',
        headers: getJsonHeaders(),
        body: JSON.stringify(payload),
    });

    return manejarRespuesta(response);
};

export const actualizarActividadJefe = async (
    idActividad: number,
    payload: ActividadPayload
) => {
    const response = await fetch(`${API_URL}/jefe/actividades/${idActividad}`, {
        method: 'PUT',
        headers: getJsonHeaders(),
        body: JSON.stringify(payload),
    });

    return manejarRespuesta(response);
};

export const eliminarActividadJefe = async (idActividad: number) => {
    const response = await fetch(`${API_URL}/jefe/actividades/${idActividad}`, {
        method: 'DELETE',
        headers: getJsonHeaders(),
    });

    return manejarRespuesta(response);
};