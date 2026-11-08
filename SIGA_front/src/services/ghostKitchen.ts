import apiClient from './api/axios';
import type { GhostKitchenCatalogResponse } from '../types/ghostKitchen';

export const getGhostKitchenCatalog = async (refrescar = false): Promise<GhostKitchenCatalogResponse> => {
  const { data } = await apiClient.get<GhostKitchenCatalogResponse>(
    '/v1/integracion/ghost-kitchen/productos',
    {
      params: refrescar ? { refrescar: true } : undefined,
    }
  );
  return data;
};
