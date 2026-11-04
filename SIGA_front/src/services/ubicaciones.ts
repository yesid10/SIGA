import apiClient from './api/axios';
import type { TipoUbicacion, Ubicacion, UbicacionRequest } from '../types/catalogs';

export const getUbicaciones = async (tipo?: TipoUbicacion): Promise<Ubicacion[]> => {
  const { data } = await apiClient.get<Ubicacion[]>('/v1/ubicaciones', { params: tipo ? { tipo } : undefined });
  return data;
};

export const getUbicacionById = async (id: number): Promise<Ubicacion> => {
  const { data } = await apiClient.get<Ubicacion>(`/v1/ubicaciones/${id}`);
  return data;
};

export const createUbicacion = async (request: UbicacionRequest): Promise<Ubicacion> => {
  const { data } = await apiClient.post<Ubicacion>('/v1/ubicaciones', request);
  return data;
};

export const updateUbicacion = async (id: number, request: UbicacionRequest): Promise<Ubicacion> => {
  const { data } = await apiClient.put<Ubicacion>(`/v1/ubicaciones/${id}`, request);
  return data;
};

export const deleteUbicacion = async (id: number): Promise<void> => {
  await apiClient.delete(`/v1/ubicaciones/${id}`);
};

export const validarCompatibilidadAlmacenamiento = async (
  productoId: number,
  ubicacionId: number,
): Promise<{ compatible: boolean; mensaje: string }> => {
  const { data } = await apiClient.get<{ compatible: boolean; mensaje: string }>(
    '/v1/ubicaciones/validar-compatibilidad',
    { params: { productoId, ubicacionId } },
  );
  return data;
};
