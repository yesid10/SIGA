import apiClient from './api/axios';
import type { ReporteBalanceResponse } from '../types/catalogs';

export interface ReporteBalanceParams {
  desde?: string;
  hasta?: string;
}

export const getReporteBalance = async (params?: ReporteBalanceParams): Promise<ReporteBalanceResponse> => {
  const { data } = await apiClient.get<ReporteBalanceResponse>('/v1/reportes/balance', { params });
  return data;
};
