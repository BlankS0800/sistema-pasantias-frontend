const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

export interface InformePasante {
  id_informe: number;
  fecha_entrega: string;
  observacion?: string | null;
  descripcion?: string | null;
  nota: number;
  id_boleta: number;
  boleta?: {
    pasantia?: {
      id_pasantia: number;
      nombre: string;
      fecha_inicio: string;
      fecha_fin: string;
      empresa?: {
        nombre: string;
      };
    };
    jefe?: {
      usuario?: {
        nombre: string;
        apellido: string;
      };
    };
  };
}

interface InformesResponse {
  message: string;
  informes: InformePasante[];
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

export const listarMisCertificados = async (): Promise<InformesResponse> => {
  const response = await fetch(`${API_URL}/pasante/certificados`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });

  return manejarRespuesta(response);
};

export const obtenerCertificadoPasanteHtml = async (
  id_informe: number
): Promise<string> => {
  const response = await fetch(`${API_URL}/pasante/certificados/${id_informe}/vista`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    const data = await response.json().catch(() => null);
    throw data || { message: 'No se pudo cargar el certificado.' };
  }

  return response.text();
};
