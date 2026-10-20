import apiClient from './api/axios';
import type { InventarioMetricasResponse, Lote } from '../types/catalogs';

export interface BusquedaLotesParams {
  query?: string;
  categoriaId?: number;
  donanteId?: number;
  estado?: string;
  desde?: string;
  hasta?: string;
}

export const getMetricasInventario = async (): Promise<InventarioMetricasResponse> => {
  const { data } = await apiClient.get<InventarioMetricasResponse>('/v1/inventario/metricas');
  return data;
};

export const buscarLotes = async (params?: BusquedaLotesParams): Promise<Lote[]> => {
  const { data } = await apiClient.get<Lote[]>('/v1/inventario/busqueda', { params });
  return data;
};
