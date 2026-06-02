const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

export type ActividadColor = 'verde' | 'azul' | 'morado' | 'naranja' | 'rojo';
export type EstadoActividad = 'pendiente' | 'en_progreso' | 'completada' | string;

export interface Usuario {
  id_usuario: number;
  nombre?: string;
  apellido?: string;
  email?: string;
  telefono?: string;
}

export interface Institucion {
  id_institucion?: number;
  nombre?: string;
}

export interface PasanteAprobado {
  id_pasante: number;
  ci?: string;
  reg_universitario?: string;
  direccion?: string;
  telefono?: string;
  usuario?: Usuario;
  institucion?: Institucion;
}

export interface Empresa {
  id_empresa: number;
  nombre: string;
  direccion?: string;
  telefono?: string;
  nit?: string;
}

export interface ActividadJefe {
  id_actividad: number;
  titulo: string;
  descripcion: string;
  fecha_inicio: string;
  fecha_fin: string;
  id_pasantia: number;
  id_pasante?: number | null;
  progreso?: number;
  resultado?: string | null;
  estado?: EstadoActividad;
  color?: ActividadColor;
  pasante?: PasanteAprobado | null;
}

export interface PasantiaAsignada {
  id_pasantia: number;
  nombre: string;
  descripcion: string;
  fecha_inicio: string;
  fecha_fin: string;
  horario: string;
  estado: string;
  id_empresa?: number;
  id_jefe?: number;
  empresa?: Empresa;
  pasantes_aprobados_count?: number;
  actividades_count?: number;
  actividades?: ActividadJefe[];
}

export interface ActividadPayload {
  titulo: string;
  descripcion: string;
  fecha_inicio: string;
  fecha_fin: string;
  id_pasantia: number;
  id_pasante?: number | null;
  color?: ActividadColor;
}

interface ListarPasantiasResponse {
  message?: string;
  pasantias: PasantiaAsignada[];
}

interface ListarPasantesResponse {
  message?: string;
  pasantia: PasantiaAsignada;
  pasantes: PasanteAprobado[];
}

interface ActividadResponse {
  message: string;
  actividad: ActividadJefe;
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

export const listarPasantiasAsignadasJefe = async (): Promise<ListarPasantiasResponse> => {
  const response = await fetch(`${API_URL}/jefe/pasantias`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });

  return manejarRespuesta(response);
};

export const listarPasantesAprobadosPorPasantia = async (
  id_pasantia: number
): Promise<ListarPasantesResponse> => {
  const response = await fetch(`${API_URL}/jefe/pasantias/${id_pasantia}/pasantes-aprobados`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });

  return manejarRespuesta(response);
};

export const registrarActividadJefe = async (
  actividad: ActividadPayload
): Promise<ActividadResponse> => {
  const response = await fetch(`${API_URL}/jefe/actividades`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(actividad),
  });

  return manejarRespuesta(response);
};

export const actualizarActividadJefe = async (
  id_actividad: number,
  actividad: ActividadPayload
): Promise<ActividadResponse> => {
  const response = await fetch(`${API_URL}/jefe/actividades/${id_actividad}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(actividad),
  });

  return manejarRespuesta(response);
};

export const eliminarActividadJefe = async (id_actividad: number) => {
  const response = await fetch(`${API_URL}/jefe/actividades/${id_actividad}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });

  return manejarRespuesta(response);
};
