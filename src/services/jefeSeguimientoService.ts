const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

export interface Usuario {
  id_usuario: number;
  nombre: string;
  apellido: string;
  email: string;
}

export interface Institucion {
  id_institucion?: number;
  nombre?: string;
}

export interface Pasante {
  id_pasante: number;
  ci?: string;
  reg_universitario?: string;
  direccion?: string;
  telefono?: string;
  id_usuario: number;
  usuario?: Usuario;
  institucion?: Institucion;
}

export interface Empresa {
  id_empresa: number;
  nombre: string;
}

export interface PasantiaSeguimiento {
  id_pasantia: number;
  nombre: string;
  descripcion: string;
  fecha_inicio: string;
  fecha_fin: string;
  estado: string;
  horario?: string;
  id_empresa: number;
  id_jefe?: number;
  empresa?: Empresa;
  pasantes_aprobados_count?: number;
  actividades_count?: number;
}

export interface ActividadSeguimiento {
  id_actividad: number;
  titulo: string;
  descripcion: string;
  fecha_inicio: string;
  fecha_fin: string;
  id_pasantia: number;
  id_pasante?: number | null;
  progreso: number;
  resultado?: string | null;
  estado: 'pendiente' | 'en_progreso' | 'completada' | string;
  color?: string | null;
  pasante?: Pasante | null;
  pasantia?: PasantiaSeguimiento;
}

export interface ActividadMensaje {
  id_actividad_mensaje: number;
  id_actividad: number;
  id_usuario: number;
  mensaje: string;
  fecha: string;
  usuario?: Usuario;
}

interface ListarPasantiasResponse {
  message: string;
  pasantias: PasantiaSeguimiento[];
}

interface ListarActividadesResponse {
  message: string;
  pasantia: PasantiaSeguimiento;
  actividades: ActividadSeguimiento[];
}

interface ActividadResponse {
  message: string;
  actividad: ActividadSeguimiento & {
    mensajes?: ActividadMensaje[];
  };
}

interface MensajesResponse {
  message: string;
  actividad: ActividadSeguimiento;
  mensajes: ActividadMensaje[];
}

interface MensajeCreadoResponse {
  message: string;
  mensaje_foro: ActividadMensaje;
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

export const listarPasantiasSeguimiento = async (): Promise<ListarPasantiasResponse> => {
  const response = await fetch(`${API_URL}/jefe/seguimiento/pasantias`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });

  return manejarRespuesta(response);
};

export const listarActividadesSeguimiento = async (
  id_pasantia: number
): Promise<ListarActividadesResponse> => {
  const response = await fetch(`${API_URL}/jefe/seguimiento/pasantias/${id_pasantia}/actividades`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });

  return manejarRespuesta(response);
};

export const mostrarActividadSeguimiento = async (
  id_actividad: number
): Promise<ActividadResponse> => {
  const response = await fetch(`${API_URL}/jefe/seguimiento/actividades/${id_actividad}`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });

  return manejarRespuesta(response);
};

export const actualizarProgresoActividadJefe = async (
  id_actividad: number,
  progreso: number,
  resultado?: string
): Promise<ActividadResponse> => {
  const response = await fetch(`${API_URL}/jefe/seguimiento/actividades/${id_actividad}/progreso`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify({
      progreso,
      resultado,
    }),
  });

  return manejarRespuesta(response);
};

export const listarMensajesActividad = async (
  id_actividad: number
): Promise<MensajesResponse> => {
  const response = await fetch(`${API_URL}/actividades/${id_actividad}/mensajes`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });

  return manejarRespuesta(response);
};

export const enviarMensajeActividad = async (
  id_actividad: number,
  mensaje: string
): Promise<MensajeCreadoResponse> => {
  const response = await fetch(`${API_URL}/actividades/${id_actividad}/mensajes`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({
      mensaje,
    }),
  });

  return manejarRespuesta(response);
};
