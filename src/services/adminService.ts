const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
import { apiFetch } from '../api/api';


export interface RolAdmin {
  id_rol: number;
  descripcion: string;
  abreviacion: string;
  habilitado?: boolean;
  usuarios_count?: number;
}

export interface UsuarioAdmin {
  id_usuario: number;
  nombre: string;
  apellido: string;
  email: string;
  telefono?: string | null;
  id_rol: number;
  rol?: RolAdmin;
}

export interface ResumenAdmin {
  usuarios_total: number;
  roles_total: number;
  pasantes_total: number;
  gerentes_total: number;
  jefes_total: number;
  tutores_total: number;
}

interface ResumenResponse {
  message: string;
  resumen: ResumenAdmin;
  roles: RolAdmin[];
}

interface UsuariosResponse {
  message: string;
  usuarios: UsuarioAdmin[];
}

interface RolesResponse {
  message: string;
  roles: RolAdmin[];
}

interface UsuarioResponse {
  message: string;
  usuario: UsuarioAdmin;
}

export interface ActualizarUsuarioPayload {
  nombre: string;
  apellido: string;
  email: string;
  telefono?: string | null;
  id_rol: number;
}

export const obtenerResumenAdmin = async (): Promise<ResumenResponse> => {
  return await apiFetch('/admin/resumen', {
    method: 'GET',
  });
};

export const listarRolesAdmin = async (): Promise<RolesResponse> => {
  return await apiFetch('/admin/roles', {
    method: 'GET',
  });
};

export const listarUsuariosAdmin = async (filtros?: {
  buscar?: string;
  id_rol?: string;
}): Promise<UsuariosResponse> => {
  const params = new URLSearchParams();

  if (filtros?.buscar) {
    params.append('buscar', filtros.buscar);
  }

  if (filtros?.id_rol) {
    params.append('id_rol', filtros.id_rol);
  }

  const query = params.toString();

  return await apiFetch(`/admin/usuarios${query ? `?${query}` : ''}`, {
    method: 'GET',
  });
};

export const actualizarUsuarioAdmin = async (
  id_usuario: number,
  payload: ActualizarUsuarioPayload
): Promise<UsuarioResponse> => {
  return await apiFetch(`/admin/usuarios/${id_usuario}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
};

export const restablecerPasswordAdmin = async (
  id_usuario: number,
  password: string
): Promise<{ message: string }> => {
  return await apiFetch(`/admin/usuarios/${id_usuario}/password`, {
    method: 'PUT',
    body: JSON.stringify({ password }),
  });
};

export const eliminarUsuarioAdmin = async (
  id_usuario: number
): Promise<{ message: string }> => {
  return await apiFetch(`/admin/usuarios/${id_usuario}`, {
    method: 'DELETE',
  });
};
