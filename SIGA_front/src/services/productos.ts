import apiClient from './api/axios';
import type { Producto, ProductoRequest } from '../types/catalogs';

export const getProductos = async (filters?: { categoriaId?: number; esPerecedero?: boolean }): Promise<Producto[]> => {
  const { data } = await apiClient.get<Producto[]>('/v1/productos', { params: filters });
  return data;
};

export const getProductoById = async (id: number): Promise<Producto> => {
  const { data } = await apiClient.get<Producto>(`/v1/productos/${id}`);
  return data;
};

export const createProducto = async (request: ProductoRequest): Promise<Producto> => {
  const { data } = await apiClient.post<Producto>('/v1/productos', request);
  return data;
};

export const updateProducto = async (id: number, request: ProductoRequest): Promise<Producto> => {
  const { data } = await apiClient.put<Producto>(`/v1/productos/${id}`, request);
  return data;
};

export const deleteProducto = async (id: number): Promise<void> => {
  await apiClient.delete(`/v1/productos/${id}`);
};
