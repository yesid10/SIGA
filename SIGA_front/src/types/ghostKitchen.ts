export interface GhostKitchenCategoria {
  id: number;
  nombre: string;
  slug: string;
  descripcion: string;
  orden: number;
  activa: boolean;
}

export interface GhostKitchenPlato {
  id: number;
  nombre: string;
  descripcion: string;
  categoriaId: number;
  categoriaNombre: string;
  precio: number;
  imagenUrl: string | null;
  cantidadDisponible: number;
  cantidadReservada: number;
  activo: boolean;
}

export interface GhostKitchenCatalogResponse {
  proveedor: string;
  moneda: string;
  zonaHoraria: string;
  fechaSincronizacion: string;
  totalPlatos: number;
  platosDisponibles: number;
  categorias: GhostKitchenCategoria[];
  platos: GhostKitchenPlato[];
  origenEnLinea: boolean;
}
