const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

export interface HojaVidaHistorial {
  id_hv: number;
  id_pasante: number;
  habilidades?: string | null;
  documento_nombre: string;
  documento_mime: string;
  version: number;
  es_ultima_version: boolean;
}

export interface HojaVidaPreview {
  id_hv: number;
  habilidades?: string | null;
  documento_nombre: string;
  documento_mime: string;
  documento_base64: string;
}

interface HistorialHojaVidaResponse {
  message: string;
  hojas_vida: HojaVidaHistorial[];
  ultima_hoja_vida: HojaVidaHistorial | null;
}

interface SubirHojaVidaResponse {
  message: string;
  hoja_vida: HojaVidaHistorial;
}

interface PreviewHojaVidaResponse {
  message: string;
  hoja_vida: HojaVidaPreview;
}

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');

  return {
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

export const listarHistorialHojasVida = async (): Promise<HistorialHojaVidaResponse> => {
  const response = await fetch(`${API_URL}/pasante/hoja-vida`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });

  return manejarRespuesta(response);
};

export const subirNuevaHojaVida = async (
  habilidades: string,
  documento: File
): Promise<SubirHojaVidaResponse> => {
  const formData = new FormData();

  formData.append('habilidades', habilidades);
  formData.append('documento', documento);

  const response = await fetch(`${API_URL}/pasante/hoja-vida`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: formData,
  });

  return manejarRespuesta(response);
};

export const obtenerPreviewHojaVida = async (
  id_hv: number
): Promise<PreviewHojaVidaResponse> => {
  const response = await fetch(`${API_URL}/pasante/hoja-vida/${id_hv}/preview`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });

  return manejarRespuesta(response);
};