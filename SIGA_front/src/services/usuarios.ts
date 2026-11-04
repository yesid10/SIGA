import apiClient from './api/axios';
import type { UsuarioAdmin, ActualizarUsuarioRequest } from '../types/catalogs';

export const getUsuarios = async (): Promise<UsuarioAdmin[]> => {
  const { data } = await apiClient.get<UsuarioAdmin[]>('/v1/usuarios');
  return data;
};

export const getUsuarioById = async (id: number): Promise<UsuarioAdmin> => {
  const { data } = await apiClient.get<UsuarioAdmin>(`/v1/usuarios/${id}`);
  return data;
};

export const updateUsuario = async (
  id: number,
  request: ActualizarUsuarioRequest
): Promise<UsuarioAdmin> => {
  const { data } = await apiClient.put<UsuarioAdmin>(`/v1/usuarios/${id}`, request);
  return data;
};

export const changeRol = async (
  id: number,
  rol: 'ADMINISTRADOR' | 'ENCARGADO' | 'BENEFICIARIO'
): Promise<UsuarioAdmin> => {
  const { data } = await apiClient.put<UsuarioAdmin>(
    `/v1/usuarios/${id}/rol`,
    null,
    { params: { rol } }
  );
  return data;
};

export const changeEstado = async (
  id: number,
  activo: boolean
): Promise<UsuarioAdmin> => {
  const { data } = await apiClient.put<UsuarioAdmin>(
    `/v1/usuarios/${id}/estado`,
    null,
    { params: { activo } }
  );
  return data;
};
