const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

export interface Usuario {
  id_usuario: number;
  nombre: string;
  apellido: string;
  email: string;
}

export interface Empresa {
  id_empresa: number;
  nombre: string;
}

export interface Pasante {
  id_pasante: number;
  ci?: string;
  reg_universitario?: string;
  telefono?: string;
  usuario?: Usuario;
  institucion?: { nombre?: string };
}

export interface Pasantia {
  id_pasantia: number;
  nombre: string;
  descripcion?: string;
  fecha_inicio: string;
  fecha_fin: string;
  estado: string;
  empresa?: Empresa;
  pasantes_aprobados_count?: number;
  actividades_count?: number;
}

export interface ActividadEvaluacion {
  id_actividad: number;
  titulo: string;
  descripcion: string;
  fecha_inicio: string;
  fecha_fin: string;
  progreso: number;
  estado: string;
  resultado?: string | null;
}

export interface InformeFinal {
  id_informe: number;
  fecha_entrega: string;
  observacion?: string | null;
  descripcion?: string | null;
  nota: number;
  id_usuario: number;
  id_boleta: number;
  boleta?: BoletaEvaluacion;
}

export interface BoletaEvaluacion {
  id_boleta: number;
  fecha: string;
  estado: string;
  id_pasante: number;
  id_pasantia: number;
  pasante?: Pasante;
  pasantia?: Pasantia;
  informe_final?: InformeFinal | null;
  actividades_count?: number;
  actividades_completadas_count?: number;
  nota_calculada?: number;
  evaluado?: boolean;
}

interface PasantiasResponse {
  message: string;
  pasantias: Pasantia[];
}

interface BoletasResponse {
  message: string;
  pasantia: Pasantia;
  boletas: BoletaEvaluacion[];
}

interface CalculoResponse {
  message: string;
  boleta: BoletaEvaluacion;
  actividades: ActividadEvaluacion[];
  nota: number;
  resumen: string;
  ya_evaluado: boolean;
}

interface InformeResponse {
  message: string;
  informe: InformeFinal;
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

export const listarPasantiasEvaluacion = async (): Promise<PasantiasResponse> => {
  const response = await fetch(`${API_URL}/jefe/evaluaciones/pasantias`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });

  return manejarRespuesta(response);
};

export const listarBoletasEvaluacion = async (
  id_pasantia: number
): Promise<BoletasResponse> => {
  const response = await fetch(`${API_URL}/jefe/evaluaciones/pasantias/${id_pasantia}/boletas`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });

  return manejarRespuesta(response);
};

export const calcularEvaluacionFinal = async (
  id_boleta: number
): Promise<CalculoResponse> => {
  const response = await fetch(`${API_URL}/jefe/evaluaciones/boletas/${id_boleta}/calcular`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });

  return manejarRespuesta(response);
};

export const registrarEvaluacionFinal = async (
  id_boleta: number,
  observacion: string,
  descripcion: string
): Promise<InformeResponse> => {
  const response = await fetch(`${API_URL}/jefe/evaluaciones/boletas/${id_boleta}`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({
      observacion,
      descripcion,
    }),
  });

  return manejarRespuesta(response);
};

export const obtenerCertificadoJefeHtml = async (
  id_informe: number
): Promise<string> => {
  const response = await fetch(`${API_URL}/jefe/evaluaciones/informes/${id_informe}/certificado`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    const data = await response.json().catch(() => null);
    throw data || { message: 'No se pudo cargar el certificado.' };
  }

  return response.text();
};
