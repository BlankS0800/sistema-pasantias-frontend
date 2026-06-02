const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

export interface Usuario {
  id_usuario: number;
  nombre: string;
  apellido: string;
  email: string;
  telefono?: string;
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
  usuario?: Usuario;
  institucion?: Institucion;
  ultima_hoja_vida?: {
    id_hv: number;
    habilidades?: string | null;
    documento_nombre?: string;
  } | null;
}

export interface Empresa {
  id_empresa: number;
  nombre: string;
}

export interface Pasantia {
  id_pasantia: number;
  nombre: string;
  descripcion?: string;
  fecha_inicio?: string;
  fecha_fin?: string;
  estado?: string;
  horario?: string;
  empresa?: Empresa;
}

export interface Jefe {
  id_usuario: number;
  cargo?: string;
  telefono?: string;
  usuario?: Usuario;
}

export interface PostulacionEmpresa {
  id_boleta: number;
  fecha: string;
  descripcion?: string;
  estado: 'pendiente' | 'aprobado' | 'rechazado' | string;
  id_pasante: number;
  id_tutor?: number | null;
  id_pasantia: number;
  id_jefe?: number | null;
  pasante?: Pasante;
  pasantia?: Pasantia;
  jefe?: Jefe;
  tutor?: any;
}

interface ListarPostulacionesResponse {
  message: string;
  tipo_usuario: 'gerente' | 'jefe';
  postulaciones: PostulacionEmpresa[];
}

interface PostulacionResponse {
  message: string;
  postulacion: PostulacionEmpresa;
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

export const listarPostulacionesEmpresa =
  async (): Promise<ListarPostulacionesResponse> => {
    const response = await fetch(`${API_URL}/empresa/postulaciones`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    return manejarRespuesta(response);
  };

export const mostrarPostulacionEmpresa = async (
  id_boleta: number
): Promise<PostulacionResponse> => {
  const response = await fetch(`${API_URL}/empresa/postulaciones/${id_boleta}`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });

  return manejarRespuesta(response);
};

export const aprobarPostulacionEmpresa = async (
  id_boleta: number
): Promise<PostulacionResponse> => {
  const response = await fetch(
    `${API_URL}/empresa/postulaciones/${id_boleta}/aprobar`,
    {
      method: 'PUT',
      headers: getAuthHeaders(),
    }
  );

  return manejarRespuesta(response);
};

export const rechazarPostulacionEmpresa = async (
  id_boleta: number,
  descripcion?: string
): Promise<PostulacionResponse> => {
  const response = await fetch(
    `${API_URL}/empresa/postulaciones/${id_boleta}/rechazar`,
    {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({
        descripcion,
      }),
    }
  );

  return manejarRespuesta(response);
};