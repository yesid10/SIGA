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
  imagenUrl?: string | null;
  activo: boolean;
}

export interface ProductoRequest {
  nombre: string;
  descripcion?: string;
  categoriaId: number;
  esPerecedero: boolean;
  unidadMedida: string;
  imagenUrl?: string | null;
}

export interface UsuarioAdmin {
  id: number;
  email: string;
  nombre: string;
  rol: 'ADMINISTRADOR' | 'ENCARGADO' | 'BENEFICIARIO';
  activo: boolean;
  fotoUrl?: string | null;
}

export interface ActualizarUsuarioRequest {
  nombre?: string;
  rol?: 'ADMINISTRADOR' | 'ENCARGADO' | 'BENEFICIARIO';
  activo?: boolean;
  fotoUrl?: string | null;
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
  categoriaNombre?: string;
  ubicacionNombre?: string;
  cantidadDisponible?: number;
  unidadMedida?: string;
  esPerecedero?: boolean;
  fechaVencimiento: string;
  diasRestantes: number;
  urgencia: 'CRITICA' | 'ALTA' | 'MEDIA' | 'PREVENTIVA' | string;
}

export interface ReporteCategoriaItem {
  categoria: string;
  kgRecibidos: number;
  kgDistribuidos: number;
  kgVencidos: number;
}

export interface ReporteDonanteItem {
  donante: string;
  totalDonaciones: number;
  kgAportados: number;
}

export interface ReporteBeneficiarioItem {
  beneficiario: string;
  totalSolicitudes: number;
  kgRecibidos: number;
}

export interface ReporteBalanceResponse {
  desde: string;
  hasta: string;
  totalKgRecibidos: number;
  totalKgDistribuidos: number;
  totalKgVencidos: number;
  totalKgDisponibles: number;
  totalDonaciones: number;
  totalSolicitudesAtendidas: number;
  tasaAprovechamiento: number;
  desgloseCategorias: ReporteCategoriaItem[];
  desgloseDonantes: ReporteDonanteItem[];
  desgloseBeneficiarios: ReporteBeneficiarioItem[];
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

export interface Beneficiario {
  id: number;
  documento: string;
  nombre: string;
  email?: string | null;
  telefono?: string | null;
  direccion?: string | null;
  numPersonasHogar: number;
  usuarioId?: number | null;
  activo: boolean;
}

export interface BeneficiarioRequest {
  documento: string;
  nombre: string;
  email?: string;
  telefono?: string;
  direccion?: string;
  numPersonasHogar: number;
  usuarioId?: number | null;
}

export type EstadoSolicitud = 'PENDIENTE' | 'APROBADA' | 'DESPACHADA' | 'RECHAZADA' | 'CANCELADA';

export interface DetalleSolicitud {
  id: number;
  productoId: number;
  productoNombre: string;
  categoriaNombre?: string;
  unidadMedida: string;
  esPerecedero: boolean;
  cantidadSolicitada: number;
  cantidadAsignada: number;
}

export interface Solicitud {
  id: number;
  beneficiarioId: number;
  beneficiarioNombre: string;
  beneficiarioDocumento: string;
  numPersonasHogar: number;
  fechaSolicitud: string;
  estado: EstadoSolicitud;
  usuarioResponsableEmail?: string | null;
  observaciones?: string | null;
  detalles: DetalleSolicitud[];
  totalProductos: number;
}

export interface SolicitudItemRequest {
  productoId: number;
  cantidadSolicitada: number;
}

export interface SolicitudRequest {
  beneficiarioId: number;
  observaciones?: string;
  items: SolicitudItemRequest[];
}
