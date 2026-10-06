export type TipoDonante = 'PERSONA_NATURAL' | 'EMPRESA';

export interface Donante {
  id: number;
  identificacion: string;
  nombre: string;
  tipo: TipoDonante;
  email?: string | null;
  telefono?: string | null;
  direccion?: string | null;
  activo: boolean;
}

export interface DonanteRequest {
  identificacion: string;
  nombre: string;
  tipo: TipoDonante;
  email?: string;
  telefono?: string;
  direccion?: string;
}

export interface Categoria {
  id: number;
  nombre: string;
  descripcion?: string | null;
  activo: boolean;
}

export interface CategoriaRequest {
  nombre: string;
  descripcion?: string;
}

export type TipoUbicacion = 'SECO' | 'REFRIGERADO';

export interface Ubicacion {
  id: number;
  codigo: string;
  nombre: string;
  tipo: TipoUbicacion;
  capacidadMaxima?: number | null;
  activo: boolean;
}

export interface UbicacionRequest {
  codigo: string;
  nombre: string;
  tipo: TipoUbicacion;
  capacidadMaxima?: number;
}

export interface Producto {
  id: number;
  nombre: string;
  descripcion?: string | null;
  categoriaId: number;
  categoriaNombre?: string;
  esPerecedero: boolean;
  unidadMedida: string;
  activo: boolean;
}

export interface ProductoRequest {
  nombre: string;
  descripcion?: string;
  categoriaId: number;
  esPerecedero: boolean;
  unidadMedida: string;
}
