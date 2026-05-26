// service/perfilService.ts
import { apiFetch } from '../api/api';

interface PerfilForm {
  telefono?: string;
  direccion?: string;
  ci?: string;
  reg_universitario?: string;
  email?: string;
}

// --- Obtener perfil completo del pasante ---
export const obtenerPerfil = async () => {
  return await apiFetch('/pasante/perfil', {
    method: 'GET',
  });
};

// --- Actualizar datos del perfil ---
export const actualizarPerfil = async (data: PerfilForm) => {
  return await apiFetch('/pasante/perfil', {
    method: 'PUT',
    body: JSON.stringify(data),
  });
};

// --- Subir Hoja de Vida (CV) ---
export const subirCV = async (file: File) => {
  const formData = new FormData();
  formData.append('cv', file);

  return await apiFetch('/pasante/cv', {
    method: 'POST',
    body: formData,
    // No poner Content-Type, fetch lo pone automáticamente para FormData
    headers: {
      Accept: 'application/json',
    },
  });
};

// --- Obtener URL del CV del pasante ---
export const obtenerCV = async () => {
  return await apiFetch('/pasante/cv', {
    method: 'GET',
  });
};