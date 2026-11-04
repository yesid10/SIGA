import apiClient from './api/axios';
import type { Categoria, CategoriaRequest } from '../types/catalogs';

export const getCategorias = async (): Promise<Categoria[]> => {
  const { data } = await apiClient.get<Categoria[]>('/v1/categorias');
  return data;
};

export const getCategoriaById = async (id: number): Promise<Categoria> => {
  const { data } = await apiClient.get<Categoria>(`/v1/categorias/${id}`);
  return data;
};

export const createCategoria = async (request: CategoriaRequest): Promise<Categoria> => {
  const { data } = await apiClient.post<Categoria>('/v1/categorias', request);
  return data;
};

export const updateCategoria = async (id: number, request: CategoriaRequest): Promise<Categoria> => {
  const { data } = await apiClient.put<Categoria>(`/v1/categorias/${id}`, request);
  return data;
};

export const deleteCategoria = async (id: number): Promise<void> => {
  await apiClient.delete(`/v1/categorias/${id}`);
};
