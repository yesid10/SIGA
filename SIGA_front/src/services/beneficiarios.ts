import apiClient from './api/axios';
import type { Beneficiario, BeneficiarioRequest } from '../types/catalogs';

export const getBeneficiarios = async (): Promise<Beneficiario[]> => {
  const { data } = await apiClient.get<Beneficiario[]>('/v1/beneficiarios');
  return data;
};

export const getBeneficiarioById = async (id: number): Promise<Beneficiario> => {
  const { data } = await apiClient.get<Beneficiario>(`/v1/beneficiarios/${id}`);
  return data;
};

export const getMiPerfilBeneficiario = async (): Promise<Beneficiario> => {
  const { data } = await apiClient.get<Beneficiario>('/v1/beneficiarios/mi-perfil');
  return data;
};

export const createBeneficiario = async (request: BeneficiarioRequest): Promise<Beneficiario> => {
  const { data } = await apiClient.post<Beneficiario>('/v1/beneficiarios', request);
  return data;
};

export const updateBeneficiario = async (id: number, request: BeneficiarioRequest): Promise<Beneficiario> => {
  const { data } = await apiClient.put<Beneficiario>(`/v1/beneficiarios/${id}`, request);
  return data;
};

export const deleteBeneficiario = async (id: number): Promise<void> => {
  await apiClient.delete(`/v1/beneficiarios/${id}`);
};
