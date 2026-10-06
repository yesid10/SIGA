import apiClient from './api/axios';
import type { Donante, DonanteRequest } from '../types/catalogs';

export const getDonantes = async (): Promise<Donante[]> => {
  const { data } = await apiClient.get<Donante[]>('/v1/donantes');
  return data;
};

export const getDonanteById = async (id: number): Promise<Donante> => {
  const { data } = await apiClient.get<Donante>(`/v1/donantes/${id}`);
  return data;
};

export const createDonante = async (request: DonanteRequest): Promise<Donante> => {
  const { data } = await apiClient.post<Donante>('/v1/donantes', request);
  return data;
};

export const updateDonante = async (id: number, request: DonanteRequest): Promise<Donante> => {
  const { data } = await apiClient.put<Donante>(`/v1/donantes/${id}`, request);
  return data;
};

export const deleteDonante = async (id: number): Promise<void> => {
  await apiClient.delete(`/v1/donantes/${id}`);
};
