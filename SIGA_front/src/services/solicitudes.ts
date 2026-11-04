import apiClient from './api/axios';
import type { Solicitud, SolicitudRequest } from '../types/catalogs';

export const getSolicitudes = async (): Promise<Solicitud[]> => {
  const { data } = await apiClient.get<Solicitud[]>('/v1/solicitudes');
  return data;
};

export const getSolicitudById = async (id: number): Promise<Solicitud> => {
  const { data } = await apiClient.get<Solicitud>(`/v1/solicitudes/${id}`);
  return data;
};

export const createSolicitud = async (request: SolicitudRequest): Promise<Solicitud> => {
  const { data } = await apiClient.post<Solicitud>('/v1/solicitudes', request);
  return data;
};

export const despacharSolicitud = async (id: number): Promise<Solicitud> => {
  const { data } = await apiClient.post<Solicitud>(`/v1/solicitudes/${id}/despachar`);
  return data;
};

export const rechazarSolicitud = async (id: number, motivo?: string): Promise<Solicitud> => {
  const { data } = await apiClient.post<Solicitud>(`/v1/solicitudes/${id}/rechazar`, { motivo });
  return data;
};
