const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

export interface Empresa {
  id_empresa: number;
  nombre: string;
  direccion?: string;
  telefono?: string;
  nit?: string;
}

export interface Usuario {
  id_usuario: number;
  nombre?: string;
  apellido?: string;
  email?: string;
}

export interface JefePasante {
  id_usuario: number;
  cargo?: string;
  telefono?: string;
  id_empresa?: number;
  usuario?: Usuario;
}

export interface Actividad {
  id_actividad: number;
  nombre?: string;
  descripcion?: string;
  id_pasantia: number;
}

export interface Pasantia {
  id_pasantia: number;
  nombre: string;
  descripcion?: string;
  fecha_inicio?: string;
  fecha_fin?: string;
  estado?: string;
  horario?: string;
  id_empresa?: number;
  id_jefe?: number;
  documento_path?: string | null;
  documento_nombre?: string | null;
  documento_url?: string | null;

  empresa?: Empresa;
  jefe_pasante?: JefePasante;
  actividades?: Actividad[];
}

export interface BoletaInscripcion {
  id_boleta: number;
  fecha: string;
  descripcion?: string | null;
  estado: 'pendiente' | 'aprobado' | 'rechazado' | string;
  id_pasante: number;
  id_tutor?: number | null;
  id_pasantia: number;
  id_jefe?: number | null;
  pasantia?: Pasantia;
  jefe?: JefePasante;
}

interface ListarPasantiasResponse {
  message: string;
  pasantias: Pasantia[];
}

interface MostrarPasantiaResponse {
  message: string;
  pasantia: Pasantia;
}

interface PostularPasantiaResponse {
  message: string;
  boleta: BoletaInscripcion;
}

interface ListarInscripcionesResponse {
  message: string;
  boletas: BoletaInscripcion[];
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

export const listarPasantiasDisponibles = async (): Promise<ListarPasantiasResponse> => {
  const response = await fetch(`${API_URL}/pasante/pasantias`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });

  return manejarRespuesta(response);
};

export const mostrarDetallePasantia = async (
  id_pasantia: number
): Promise<MostrarPasantiaResponse> => {
  const response = await fetch(`${API_URL}/pasante/pasantias/${id_pasantia}`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });

  return manejarRespuesta(response);
};

export const postularPasantia = async (
  id_pasantia: number
): Promise<PostularPasantiaResponse> => {
  const response = await fetch(`${API_URL}/pasante/inscripcion/${id_pasantia}`, {
    method: 'POST',
    headers: getAuthHeaders(),
  });

  return manejarRespuesta(response);
};

export const listarMisInscripciones = async (): Promise<ListarInscripcionesResponse> => {
  const response = await fetch(`${API_URL}/pasante/inscripciones`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });

  return manejarRespuesta(response);
};
