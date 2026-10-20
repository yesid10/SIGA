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

export type EstadoDonacion = 'RECIBIDA' | 'CANCELADA';
export type EstadoLote = 'DISPONIBLE' | 'PROXIMO_A_VENCER' | 'VENCIDO' | 'AGOTADO';

export interface LoteItemRequest {
  productoId: number;
  numeroLote: string;
  cantidad: number;
  unidadMedida: string;
  fechaVencimiento: string;
  ubicacionId?: number;
}

export interface DonacionRequest {
  donanteId: number;
  fechaRecepcion: string;
  observaciones?: string;
  items: LoteItemRequest[];
}

export interface Lote {
  id: number;
  numeroLote: string;
  productoId: number;
  productoNombre: string;
  categoriaNombre?: string;
  esPerecedero: boolean;
  cantidadInicial: number;
  cantidadDisponible: number;
  unidadMedida: string;
  fechaIngreso: string;
  fechaVencimiento: string;
  diasRestantes?: number;
  estado: EstadoLote;
  ubicacionId?: number | null;
  ubicacionCodigo?: string | null;
  ubicacionNombre?: string | null;
  donanteId?: number | null;
  donanteNombre?: string | null;
}

export interface Donacion {
  id: number;
  donanteId: number;
  donanteNombre: string;
  donanteIdentificacion: string;
  usuarioResponsableEmail?: string | null;
  fechaRecepcion: string;
  observaciones?: string | null;
  estado: EstadoDonacion;
  items: Lote[];
  totalProductos: number;
  totalCantidad: number;
  createdAt: string;
}

export interface CategoriaEstadistica {
  categoria: string;
  cantidad: number;
  porcentaje: number;
}

export interface EstadoLotesEstadistica {
  disponibles: number;
  proximosAVencer: number;
  vencidos: number;
}

export interface AlertaResumen {
  loteId: number;
  numeroLote: string;
  productoNombre: string;
  fechaVencimiento: string;
  diasRestantes: number;
  urgencia: string;
}

export interface DonacionPorTipoEstadistica {
  tipo: string;
  cantidad: number;
}

export interface LotesPorTiempoEstadistica {
  masDe3Meses: number;
  unoATresMeses: number;
  treintaDiasOMenos: number;
  vencidos: number;
}

export interface InventarioMetricasResponse {
  productosDisponibles: number;
  lotesRegistrados: number;
  proximosAVencer: number;
  donacionesRegistradas: number;
  alertasVencimiento: number;
  productosPorCategoria: CategoriaEstadistica[];
  estadoLotes: EstadoLotesEstadistica;
  donacionesPorTipo: DonacionPorTipoEstadistica[];
  lotesPorTiempo: LotesPorTiempoEstadistica;
  ultimasDonaciones: Donacion[];
  alertasRecientes: AlertaResumen[];
}
