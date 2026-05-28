const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

export interface Usuario {
  id_usuario: number;
  nombre: string;
  apellido: string;
  email: string;
  telefono?: string;
}

export interface Empresa {
  id_empresa: number;
  nombre: string;
}

export interface Pasantia {
  id_pasantia: number;
  nombre: string;
  descripcion?: string;
  fecha_inicio: string;
  fecha_fin: string;
  empresa?: Empresa;
}

export interface InformeFinal {
  id_informe: number;
  fecha_entrega: string;
  observacion?: string | null;
  descripcion?: string | null;
  nota: number;
  id_usuario: number;
  id_boleta: number;
}

export interface BoletaTutor {
  id_boleta: number;
  fecha: string;
  descripcion?: string | null;
  estado: string;
  id_pasante: number;
  id_tutor?: number | null;
  id_pasantia: number;
  id_jefe?: number | null;
  pasantia?: Pasantia;
  informe_final?: InformeFinal | null;
}

export interface PasanteTutor {
  id_pasante: number;
  ci?: string;
  reg_universitario?: string;
  direccion?: string;
  telefono?: string;
  id_usuario: number;
  id_institucion?: number | null;
  id_tutor?: number | null;
  usuario?: Usuario;
  institucion?: {
    nombre?: string;
  };
  boleta_actual?: BoletaTutor | null;
}

interface ListarPasantesResponse {
  message: string;
  pasantes: PasanteTutor[];
}

interface DetallePasanteResponse {
  message: string;
  pasante: PasanteTutor;
}

interface InformeResponse {
  message: string;
  informe: InformeFinal;
}

export interface ImportarPasantesResponse {
  message: string;
  resumen?: {
    total_filas_validas: number;
    pasantes_creados: number;
    pasantes_actualizados: number;
    pasantes_asignados_al_tutor: number;
    contrasena_predeterminada: string;
  };
  errores?: {
    fila: number;
    email?: string | null;
    motivo: string;
  }[];
}

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');

  return {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    Authorization: `Bearer ${token}`,
  };
};

const getAuthHeadersSinContentType = () => {
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

export const listarPasantesTutor = async (): Promise<ListarPasantesResponse> => {
  const response = await fetch(`${API_URL}/tutor/pasantes`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });

  return manejarRespuesta(response);
};

export const mostrarPasanteTutor = async (
  id_pasante: number
): Promise<DetallePasanteResponse> => {
  const response = await fetch(`${API_URL}/tutor/pasantes/${id_pasante}`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });

  return manejarRespuesta(response);
};

export const registrarNotaInformeTutor = async (
  id_informe: number,
  nota: number,
  observacion?: string
): Promise<InformeResponse> => {
  const response = await fetch(`${API_URL}/tutor/informes/${id_informe}/nota`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify({
      nota,
      observacion,
    }),
  });

  return manejarRespuesta(response);
};

export const importarPasantesExcelTutor = async (
  archivo: File
): Promise<ImportarPasantesResponse> => {
  const formData = new FormData();
  formData.append('archivo', archivo);

  const response = await fetch(`${API_URL}/tutor/pasantes/importar-excel`, {
    method: 'POST',
    headers: getAuthHeadersSinContentType(),
    body: formData,
  });

  return manejarRespuesta(response);
};
