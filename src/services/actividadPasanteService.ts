const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

export interface Empresa {
  id_empresa: number;
  nombre: string;
}

export interface Pasantia {
  id_pasantia: number;
  nombre: string;
  empresa?: Empresa;
}

export interface ActividadPasante {
  id_actividad: number;
  titulo: string;
  descripcion: string;
  fecha_inicio: string;
  fecha_fin: string;
  id_pasantia: number;
  id_pasante?: number | null;
  progreso: number;
  resultado?: string | null;
  estado?: string;
  color?: string | null;
  bloqueada?: boolean;
  pasantia?: Pasantia;
}

export interface UsuarioMensaje {
  id_usuario: number;
  nombre: string;
  apellido: string;
  email?: string;
}

export interface MensajeActividad {
  id_mensaje?: number;
  id_actividad_mensaje?: number;
  id_actividad: number;
  id_usuario: number;
  mensaje: string;
  fecha: string;
  es_mio?: boolean;
  usuario?: UsuarioMensaje;
}

interface ListarActividadesResponse {
  message: string;
  actividades: ActividadPasante[];
}

interface ActualizarActividadResponse {
  message: string;
  actividad: ActividadPasante;
}

interface MensajesResponse {
  message: string;
  mensajes: MensajeActividad[];
}

interface EnviarMensajeResponse {
  message: string;
  mensaje_foro: MensajeActividad;
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

export const listarMisActividades = async (): Promise<ListarActividadesResponse> => {
  const response = await fetch(`${API_URL}/pasante/actividades`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });

  return manejarRespuesta(response);
};

export const actualizarProgresoActividad = async (
  id_actividad: number,
  progreso: number,
  resultado: string
): Promise<ActualizarActividadResponse> => {
  const response = await fetch(`${API_URL}/pasante/actividades/${id_actividad}`, {
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
): Promise<EnviarMensajeResponse> => {
  const response = await fetch(`${API_URL}/actividades/${id_actividad}/mensajes`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({
      mensaje,
    }),
  });

  return manejarRespuesta(response);
};
