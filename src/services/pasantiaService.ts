const API_URL = import.meta.env.VITE_API_URL;

export type EstadoPasantia = 'habilitada' | 'inhabilitada';

export interface EncargadoPasantia {
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

export interface Pasantia {
    id_pasantia: number;
    nombre: string;
    descripcion: string;
    fecha_inicio: string;
    fecha_fin: string;
    estado: EstadoPasantia;
    horario: string;
    id_empresa: number;
    id_jefe?: number | null;
    documento_path?: string | null;
    documento_nombre?: string | null;
    documento_url?: string | null;
    jefe_pasante?: EncargadoPasantia | null;
}

export interface PasantiaPayload {
    nombre: string;
    descripcion: string;
    fecha_inicio: string;
    fecha_fin: string;
    estado: EstadoPasantia;
    horario: string;
    id_jefe: number;
    documento?: File | null;
}

const getAuthHeaders = () => {
    const token = localStorage.getItem('token');

    return {
        Accept: 'application/json',
        Authorization: `Bearer ${token}`,
    };
};

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

const crearFormData = (payload: PasantiaPayload) => {
    const formData = new FormData();

    formData.append('nombre', payload.nombre);
    formData.append('descripcion', payload.descripcion);
    formData.append('fecha_inicio', payload.fecha_inicio);
    formData.append('fecha_fin', payload.fecha_fin);
    formData.append('estado', payload.estado);
    formData.append('horario', payload.horario);
    formData.append('id_jefe', String(payload.id_jefe));

    if (payload.documento) {
        formData.append('documento', payload.documento);
    }

    return formData;
};

export const listarPasantiasGerente = async () => {
    const response = await fetch(`${API_URL}/gerente/pasantias`, {
        method: 'GET',
        headers: getJsonHeaders(),
    });

    return manejarRespuesta(response);
};

export const registrarPasantiaGerente = async (payload: PasantiaPayload) => {
    const response = await fetch(`${API_URL}/gerente/pasantias`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: crearFormData(payload),
    });

    return manejarRespuesta(response);
};

export const actualizarPasantiaGerente = async (
    idPasantia: number,
    payload: PasantiaPayload
) => {
    const formData = crearFormData(payload);

    /*
      Para enviar archivo en actualización usamos POST + _method=PUT.
      Esto evita problemas con multipart/form-data usando PUT directo.
    */
    formData.append('_method', 'PUT');

    const response = await fetch(`${API_URL}/gerente/pasantias/${idPasantia}`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: formData,
    });

    return manejarRespuesta(response);
};

export const cambiarEstadoPasantiaGerente = async (
    idPasantia: number,
    estado: EstadoPasantia
) => {
    const response = await fetch(
        `${API_URL}/gerente/pasantias/${idPasantia}/estado`,
        {
            method: 'PATCH',
            headers: getJsonHeaders(),
            body: JSON.stringify({ estado }),
        }
    );

    return manejarRespuesta(response);
};

export const eliminarPasantiaGerente = async (idPasantia: number) => {
    const response = await fetch(`${API_URL}/gerente/pasantias/${idPasantia}`, {
        method: 'DELETE',
        headers: getJsonHeaders(),
    });

    return manejarRespuesta(response);
};

export const listarEncargadosParaPasantia = async () => {
    const response = await fetch(`${API_URL}/gerente/jefes-pasantes`, {
        method: 'GET',
        headers: getJsonHeaders(),
    });

    return manejarRespuesta(response);
};

export const obtenerUrlDocumento = (documentoUrl?: string | null) => {
    if (!documentoUrl) return null;

    if (documentoUrl.startsWith('http')) {
        return documentoUrl;
    }

    const baseUrl = API_URL.replace('/api', '');

    return `${baseUrl}${documentoUrl}`;
};