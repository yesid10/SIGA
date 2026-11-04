import apiClient from './api/axios';
import type { Donacion, DonacionRequest, Lote, EstadoLote } from '../types/catalogs';

export const getDonaciones = async (): Promise<Donacion[]> => {
  const { data } = await apiClient.get<Donacion[]>('/v1/donaciones');
  return data;
};

export const getDonacionById = async (id: number): Promise<Donacion> => {
  const { data } = await apiClient.get<Donacion>(`/v1/donaciones/${id}`);
  return data;
};

export const createDonacion = async (request: DonacionRequest): Promise<Donacion> => {
  const { data } = await apiClient.post<Donacion>('/v1/donaciones', request);
  return data;
};

export const getLotes = async (params?: { productoId?: number; estado?: EstadoLote }): Promise<Lote[]> => {
  const { data } = await apiClient.get<Lote[]>('/v1/inventario/lotes', { params });
  return data;
};
