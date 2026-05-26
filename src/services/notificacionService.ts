const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

export interface Notificacion {
  id_notificacion: number;
  id_usuario: number;
  titulo: string;
  mensaje: string;
  tipo: string;
  id_actividad?: number | null;
  url?: string | null;
  leida: boolean;
  fecha: string;
}

interface ListarNotificacionesResponse {
  message: string;
  no_leidas: number;
  notificaciones: Notificacion[];
}

interface CountResponse {
  no_leidas: number;
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

export const listarNotificaciones = async (): Promise<ListarNotificacionesResponse> => {
  const response = await fetch(`${API_URL}/notificaciones`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });

  return manejarRespuesta(response);
};

export const contarNotificacionesNoLeidas = async (): Promise<CountResponse> => {
  const response = await fetch(`${API_URL}/notificaciones/no-leidas/count`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });

  return manejarRespuesta(response);
};

export const marcarNotificacionLeida = async (id_notificacion: number) => {
  const response = await fetch(`${API_URL}/notificaciones/${id_notificacion}/leer`, {
    method: 'PUT',
    headers: getAuthHeaders(),
  });

  return manejarRespuesta(response);
};

export const marcarTodasNotificacionesLeidas = async () => {
  const response = await fetch(`${API_URL}/notificaciones/leer-todas`, {
    method: 'PUT',
    headers: getAuthHeaders(),
  });

  return manejarRespuesta(response);
};
