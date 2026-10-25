import React, { useEffect, useState, useMemo } from 'react';
import {
  LuPlus,
  LuSearch,
  LuEye,
  LuX,
  LuTriangleAlert,
  LuRefreshCw,
  LuClock,
  LuCircleCheck,
  LuCircleX,
  LuTruck,
  LuPackage,
  LuCalendar,
  LuTrash2,
  LuSend,
  LuCircleAlert,
} from 'react-icons/lu';
import { Button } from '../../components/atoms/Button';
import { Badge } from '../../components/atoms/Badge';
import { Spinner } from '../../components/atoms/Spinner';
import { Eyebrow } from '../../components/atoms/Typography';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { useAuthStore } from '../../stores/authStore';
import {
  getSolicitudes,
  createSolicitud,
  despacharSolicitud,
  rechazarSolicitud,
} from '../../services/solicitudes';
import { getBeneficiarios, getMiPerfilBeneficiario } from '../../services/beneficiarios';
import { getProductos } from '../../services/productos';
import type {
  Solicitud,
  Beneficiario,
  Producto,
  SolicitudRequest,
  EstadoSolicitud,
} from '../../types/catalogs';

interface TempItem {
  productoId: number;
  productoNombre: string;
  unidadMedida: string;
  esPerecedero: boolean;
  cantidadSolicitada: number;
}

export const RequestsPage: React.FC = () => {
  const user = useAuthStore((state) => state.user);
  const isBeneficiario = user?.rol === 'BENEFICIARIO';
  const canDispatch = user?.rol === 'ADMINISTRADOR' || user?.rol === 'ENCARGADO';

  const [solicitudes, setSolicitudes] = useState<Solicitud[]>([]);
  const [beneficiarios, setBeneficiarios] = useState<Beneficiario[]>([]);
  const [productos, setProductos] = useState<Producto[]>([]);
  const [miPerfil, setMiPerfil] = useState<Beneficiario | null>(null);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [estadoFilter, setEstadoFilter] = useState<'TODAS' | EstadoSolicitud>('TODAS');

  // Modals
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [detailSolicitud, setDetailSolicitud] = useState<Solicitud | null>(null);
  const [dispatchingSolicitud, setDispatchingSolicitud] = useState<Solicitud | null>(null);
  const [rejectingSolicitud, setRejectingSolicitud] = useState<Solicitud | null>(null);
  const [rejectMotivo, setRejectMotivo] = useState('');

  // Form State
  const [selectedBeneficiarioId, setSelectedBeneficiarioId] = useState<number | ''>('');
  const [observaciones, setObservaciones] = useState('');
  const [items, setItems] = useState<TempItem[]>([]);
  const [itemProductoId, setItemProductoId] = useState<number | ''>('');
  const [itemCantidad, setItemCantidad] = useState<number | ''>('');
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const cargarDatos = async () => {
    try {
      setRefreshing(true);
      const [sols, prods] = await Promise.all([
        getSolicitudes(),
        getProductos(),
      ]);
      setSolicitudes(sols);
      setProductos(prods.filter((p) => p.activo));

      if (isBeneficiario) {
        try {
          const perfil = await getMiPerfilBeneficiario();
          setMiPerfil(perfil);
          setSelectedBeneficiarioId(perfil.id);
        } catch {
          // Si el usuario beneficiario no tiene perfil vinculado
          setMiPerfil(null);
        }
      } else {
        const benes = await getBeneficiarios();
        setBeneficiarios(benes.filter((b) => b.activo));
      }
    } catch (err) {
      console.error('Error al cargar solicitudes:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  const resetCreateForm = () => {
    if (isBeneficiario && miPerfil) {
      setSelectedBeneficiarioId(miPerfil.id);
    } else {
      setSelectedBeneficiarioId(beneficiarios[0]?.id ?? '');
    }
    setObservaciones('');
    setItems([]);
    setItemProductoId('');
    setItemCantidad('');
    setFormError(null);
  };

  const handleOpenCreateModal = () => {
    resetCreateForm();
    setIsCreateModalOpen(true);
  };

  const handleAddItem = () => {
    if (!itemProductoId) {
      setFormError('Selecciona un producto para agregar.');
      return;
    }
    if (!itemCantidad || Number(itemCantidad) <= 0) {
      setFormError('Ingresa una cantidad válida mayor a cero.');
      return;
    }

    const prod = productos.find((p) => p.id === Number(itemProductoId));
    if (!prod) return;

    // Check if already in items
    const existingIndex = items.findIndex((it) => it.productoId === prod.id);
    if (existingIndex >= 0) {
      const updated = [...items];
      updated[existingIndex].cantidadSolicitada += Number(itemCantidad);
      setItems(updated);
    } else {
      setItems([
        ...items,
        {
          productoId: prod.id,
          productoNombre: prod.nombre,
          unidadMedida: prod.unidadMedida,
          esPerecedero: prod.esPerecedero,
          cantidadSolicitada: Number(itemCantidad),
        },
      ]);
    }

    setItemProductoId('');
    setItemCantidad('');
    setFormError(null);
  };

  const handleRemoveItem = (index: number) => {
    setItems(items.filter((_, idx) => idx !== index));
  };

  const handleSubmitSolicitud = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const beneId = isBeneficiario ? miPerfil?.id : Number(selectedBeneficiarioId);
    if (!beneId) {
      setFormError('Debes seleccionar un beneficiario.');
      return;
    }

    if (items.length === 0) {
      setFormError('Debes agregar al menos un producto a la solicitud.');
      return;
    }

    const payload: SolicitudRequest = {
      beneficiarioId: beneId,
      observaciones: observaciones.trim() || undefined,
      items: items.map((it) => ({
        productoId: it.productoId,
        cantidadSolicitada: it.cantidadSolicitada,
      })),
    };

    try {
      setSubmitting(true);
      await createSolicitud(payload);
      setIsCreateModalOpen(false);
      resetCreateForm();
      await cargarDatos();
    } catch (err: unknown) {
      const errorMsg =
        (err as { response?: { data?: { mensaje?: string; error?: string } } })?.response?.data?.mensaje ||
        (err as { response?: { data?: { error?: string } } })?.response?.data?.error ||
        'Ocurrió un error al crear la solicitud.';
      setFormError(errorMsg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDespacharConFefo = async () => {
    if (!dispatchingSolicitud) return;
    try {
      setSubmitting(true);
      await despacharSolicitud(dispatchingSolicitud.id);
      setDispatchingSolicitud(null);
      await cargarDatos();
    } catch (err: unknown) {
      const errorMsg =
        (err as { response?: { data?: { mensaje?: string; error?: string } } })?.response?.data?.mensaje ||
        'Error al realizar el despacho FEFO.';
      alert(errorMsg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleRechazar = async () => {
    if (!rejectingSolicitud) return;
    try {
      setSubmitting(true);
      await rechazarSolicitud(rejectingSolicitud.id, rejectMotivo.trim() || undefined);
      setRejectingSolicitud(null);
      setRejectMotivo('');
      await cargarDatos();
    } catch (err: unknown) {
      const errorMsg =
        (err as { response?: { data?: { mensaje?: string; error?: string } } })?.response?.data?.mensaje ||
        'Error al rechazar la solicitud.';
      alert(errorMsg);
    } finally {
      setSubmitting(false);
    }
  };

  // Metrics
  const metricas = useMemo(() => {
    const total = solicitudes.length;
    const pendientes = solicitudes.filter((s) => s.estado === 'PENDIENTE').length;
    const despachadas = solicitudes.filter((s) => s.estado === 'DESPACHADA').length;
    const rechazadas = solicitudes.filter((s) => s.estado === 'RECHAZADA').length;
    return { total, pendientes, despachadas, rechazadas };
  }, [solicitudes]);

  // Filtering
  const filteredSolicitudes = useMemo(() => {
    return solicitudes.filter((s) => {
      const matchesSearch =
        s.beneficiarioNombre.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.beneficiarioDocumento.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.detalles.some((d) => d.productoNombre.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesEstado = estadoFilter === 'TODAS' || s.estado === estadoFilter;
      return matchesSearch && matchesEstado;
    });
  }, [solicitudes, searchQuery, estadoFilter]);

  const getStatusBadge = (estado: EstadoSolicitud) => {
    switch (estado) {
      case 'PENDIENTE':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-200">
            <LuClock className="w-3.5 h-3.5" />
            Pendiente por Despacho
          </span>
        );
      case 'DESPACHADA':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
            <LuCircleCheck className="w-3.5 h-3.5" />
            Despachada con FEFO
          </span>
        );
      case 'RECHAZADA':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-800 border border-red-200">
            <LuCircleX className="w-3.5 h-3.5" />
            Rechazada
          </span>
        );
      case 'CANCELADA':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-800 border border-slate-200">
            Cancelada
          </span>
        );
      default:
        return <Badge variant="neutral">{estado}</Badge>;
    }
  };

  const getPriorityBadge = (personas: number) => {
    if (personas >= 20) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold bg-purple-100 text-purple-800 border border-purple-200">
          Alta Prioridad ({personas} pers.)
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-700">
        {personas} pers.
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <Eyebrow>Despacho y Rotación de Alimentos (RF-05 / CU-05)</Eyebrow>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 mt-1">
            {isBeneficiario ? 'Mis Solicitudes de Alimentos' : 'Bandeja de Solicitudes y Despacho FEFO'}
          </h1>
          <p className="text-sm text-slate-600 mt-0.5">
            {isBeneficiario
              ? 'Realiza pedidos de víveres según la disponibilidad del Banco de Alimentos.'
              : 'Asignación automatizada de existencias priorizando lotes más próximos a vencer (FEFO).'}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={cargarDatos}
            disabled={refreshing}
            className="flex items-center gap-2 cursor-pointer"
          >
            <LuRefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            Actualizar
          </Button>
          <Button
            variant="primary"
            onClick={handleOpenCreateModal}
            className="flex items-center gap-2 cursor-pointer"
          >
            <LuPlus className="w-4 h-4" />
            Nueva Solicitud
          </Button>
        </div>
      </div>

      {/* Notice for Beneficiary without linked profile */}
      {isBeneficiario && !miPerfil && !loading && (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-3">
          <LuCircleAlert className="w-5 h-5 text-amber-600 mt-0.5 shrink-0" />
          <div className="text-sm text-amber-800">
            <span className="font-bold">Aviso de Perfil:</span> Tu cuenta aún no tiene un registro de beneficiario vinculado. Comunícate con el administrador para vincular tu documento de identidad y registrar el número de personas en tu hogar.
          </div>
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-slate-200 bg-white shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-medium uppercase tracking-wider text-slate-500">
              Total Solicitudes
            </CardTitle>
            <div className="p-2 bg-slate-100 text-slate-700 rounded-lg">
              <LuTruck className="w-5 h-5" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">{metricas.total}</div>
            <p className="text-xs text-slate-500 mt-1">Histórico registrado en el sistema</p>
          </CardContent>
        </Card>

        <Card className="border-slate-200 bg-white shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-medium uppercase tracking-wider text-amber-600">
              Pendientes
            </CardTitle>
            <div className="p-2 bg-amber-50 text-amber-600 rounded-lg">
              <LuClock className="w-5 h-5" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-700">{metricas.pendientes}</div>
            <p className="text-xs text-slate-500 mt-1">Por asignar y despachar con FEFO</p>
          </CardContent>
        </Card>

        <Card className="border-slate-200 bg-white shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-medium uppercase tracking-wider text-emerald-600">
              Despachadas (FEFO)
            </CardTitle>
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
              <LuCircleCheck className="w-5 h-5" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-700">{metricas.despachadas}</div>
            <p className="text-xs text-slate-500 mt-1">Lotes descontados exitosamente</p>
          </CardContent>
        </Card>

        <Card className="border-slate-200 bg-white shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-medium uppercase tracking-wider text-red-600">
              Rechazadas
            </CardTitle>
            <div className="p-2 bg-red-50 text-red-600 rounded-lg">
              <LuCircleX className="w-5 h-5" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-700">{metricas.rechazadas}</div>
            <p className="text-xs text-slate-500 mt-1">Sin existencia o no conformes</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters & Search */}
      <Card className="border-slate-200 bg-white shadow-sm">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-3">
            <div className="relative flex-1">
              <LuSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Buscar por beneficiario, documento o alimentos..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-colors"
              />
            </div>
            <div className="flex items-center gap-2">
              <select
                aria-label="Filtrar por estado de solicitud"
                value={estadoFilter}
                onChange={(e) => setEstadoFilter(e.target.value as 'TODAS' | EstadoSolicitud)}
                className="px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-colors cursor-pointer"
              >
                <option value="TODAS">Todos los estados</option>
                <option value="PENDIENTE">Pendientes</option>
                <option value="DESPACHADA">Despachadas</option>
                <option value="RECHAZADA">Rechazadas</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Solicitudes List */}
      <Card className="border-slate-200 bg-white shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex flex-col items-center justify-center p-12">
            <Spinner />
            <p className="text-sm text-slate-500 mt-3">Cargando solicitudes...</p>
          </div>
        ) : filteredSolicitudes.length === 0 ? (
          <div className="text-center py-16 px-4">
            <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto text-slate-400 mb-3">
              <LuTruck className="w-6 h-6" />
            </div>
            <h3 className="text-base font-semibold text-slate-900">No hay solicitudes para mostrar</h3>
            <p className="text-sm text-slate-500 mt-1 max-w-sm mx-auto">
              {searchQuery || estadoFilter !== 'TODAS'
                ? 'Intenta cambiando los filtros de búsqueda.'
                : 'Crea tu primera solicitud de víveres para iniciar el proceso de despacho.'}
            </p>
            {!searchQuery && estadoFilter === 'TODAS' && (
              <Button
                variant="primary"
                onClick={handleOpenCreateModal}
                className="mt-4 inline-flex items-center gap-2 cursor-pointer"
              >
                <LuPlus className="w-4 h-4" />
                Nueva Solicitud
              </Button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
              <thead className="bg-slate-50 text-slate-600 font-semibold uppercase text-xs tracking-wider">
                <tr>
                  <th scope="col" className="px-6 py-3.5">ID / Fecha</th>
                  <th scope="col" className="px-6 py-3.5">Beneficiario</th>
                  <th scope="col" className="px-6 py-3.5">Vulnerabilidad</th>
                  <th scope="col" className="px-6 py-3.5">Alimentos Solicitados</th>
                  <th scope="col" className="px-6 py-3.5">Estado</th>
                  <th scope="col" className="px-6 py-3.5 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {filteredSolicitudes.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-bold text-slate-900">#{s.id}</div>
                      <div className="flex items-center gap-1 text-xs text-slate-500 mt-0.5">
                        <LuCalendar className="w-3.5 h-3.5 text-slate-400" />
                        <span>{s.fechaSolicitud}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-semibold text-slate-900">{s.beneficiarioNombre}</div>
                      <div className="font-mono text-xs text-slate-500 mt-0.5">
                        {s.beneficiarioDocumento}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {getPriorityBadge(s.numPersonasHogar)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-xs text-slate-700 max-w-xs space-y-0.5">
                        {s.detalles.slice(0, 2).map((d) => (
                          <div key={d.id} className="truncate">
                            • <span className="font-medium">{d.productoNombre}</span>: {d.cantidadSolicitada} {d.unidadMedida}
                            {s.estado === 'DESPACHADA' && (
                              <span className="text-emerald-700 font-semibold ml-1">
                                (Asignado: {d.cantidadAsignada} {d.unidadMedida})
                              </span>
                            )}
                          </div>
                        ))}
                        {s.detalles.length > 2 && (
                          <span className="text-[11px] text-slate-500 italic">
                            + {s.detalles.length - 2} productos más...
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(s.estado)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => setDetailSolicitud(s)}
                          className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-md transition-colors cursor-pointer"
                          title="Ver detalle de la solicitud"
                        >
                          <LuEye className="w-4 h-4" />
                        </button>
                        {canDispatch && s.estado === 'PENDIENTE' && (
                          <>
                            <button
                              type="button"
                              onClick={() => setDispatchingSolicitud(s)}
                              className="px-2.5 py-1 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-md transition-colors flex items-center gap-1 cursor-pointer shadow-sm"
                              title="Despachar asignando existencias con FEFO"
                            >
                              <LuTruck className="w-3.5 h-3.5" />
                              Despachar FEFO
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setRejectingSolicitud(s);
                                setRejectMotivo('');
                              }}
                              className="px-2.5 py-1 text-xs font-semibold bg-red-50 hover:bg-red-100 text-red-700 rounded-md transition-colors cursor-pointer border border-red-200"
                              title="Rechazar solicitud"
                            >
                              Rechazar
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Modal: Crear Nueva Solicitud */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden border border-slate-200 max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <LuPlus className="w-5 h-5 text-emerald-600" />
                Nueva Solicitud de Alimentos (RF-05)
              </h2>
              <button
                type="button"
                onClick={() => setIsCreateModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-md cursor-pointer"
              >
                <LuX className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitSolicitud} className="p-6 space-y-4 overflow-y-auto flex-1">
              {formError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-sm text-red-700">
                  <LuTriangleAlert className="w-4 h-4 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              {/* Beneficiary selection (if admin/encargado) */}
              {!isBeneficiario ? (
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                    Beneficiario Destino *
                  </label>
                  <select
                    required
                    value={selectedBeneficiarioId}
                    onChange={(e) => setSelectedBeneficiarioId(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
                  >
                    <option value="">Selecciona un beneficiario registrado...</option>
                    {beneficiarios.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.nombre} ({b.documento}) - {b.numPersonasHogar} personas
                      </option>
                    ))}
                  </select>
                </div>
              ) : (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-sm text-emerald-800">
                  <span className="font-bold">Beneficiario solicitante:</span> {miPerfil?.nombre} (Doc: {miPerfil?.documento} | Núcleo: {miPerfil?.numPersonasHogar} personas)
                </div>
              )}

              {/* Product Selector to Add Items */}
              <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/50 space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  Agregar Alimentos al Pedido
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
                  <div className="sm:col-span-7">
                    <label className="block text-xs font-medium text-slate-600 mb-1">
                      Producto Disponible
                    </label>
                    <select
                      value={itemProductoId}
                      onChange={(e) => setItemProductoId(Number(e.target.value))}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
                    >
                      <option value="">Selecciona un producto...</option>
                      {productos.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.nombre} ({p.unidadMedida}) {p.esPerecedero ? '❄ Perecedero' : 'Seco'}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="sm:col-span-3">
                    <label className="block text-xs font-medium text-slate-600 mb-1">
                      Cantidad
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0.01"
                      placeholder="0.00"
                      value={itemCantidad}
                      onChange={(e) => setItemCantidad(e.target.value ? parseFloat(e.target.value) : '')}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleAddItem}
                      className="w-full py-2 bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100 cursor-pointer flex items-center justify-center gap-1"
                    >
                      <LuPlus className="w-4 h-4" />
                      Añadir
                    </Button>
                  </div>
                </div>
              </div>

              {/* Basket list */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                  Alimentos a Solicitar ({items.length})
                </label>
                {items.length === 0 ? (
                  <p className="text-xs text-slate-400 italic py-2">
                    Aún no has agregado productos. Selecciona uno arriba y haz clic en &quot;Añadir&quot;.
                  </p>
                ) : (
                  <div className="border border-slate-200 rounded-lg divide-y divide-slate-100 max-h-48 overflow-y-auto">
                    {items.map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between p-2.5 text-sm">
                        <div className="flex items-center gap-2">
                          <LuPackage className="w-4 h-4 text-emerald-600" />
                          <span className="font-semibold text-slate-800">{item.productoNombre}</span>
                          <span className="text-xs text-slate-500">
                            ({item.cantidadSolicitada} {item.unidadMedida})
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveItem(idx)}
                          className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded cursor-pointer"
                        >
                          <LuTrash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                  Observaciones / Justificación (Opcional)
                </label>
                <textarea
                  rows={2}
                  value={observaciones}
                  onChange={(e) => setObservaciones(e.target.value)}
                  placeholder="Detalles sobre las raciones, población objetivo o fecha preferida de entrega..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsCreateModalOpen(false)}
                  disabled={submitting}
                  className="cursor-pointer"
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  disabled={submitting || items.length === 0}
                  className="flex items-center gap-2 cursor-pointer"
                >
                  <LuSend className="w-4 h-4" />
                  {submitting ? 'Enviando...' : 'Crear Solicitud'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Confirmar Despacho FEFO */}
      {dispatchingSolicitud && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden border border-slate-200">
            <div className="p-6">
              <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mb-4">
                <LuTruck className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">
                Aprobar y Despachar con FEFO
              </h3>
              <p className="text-sm text-slate-600 mt-2">
                Estás a punto de despachar la Solicitud <span className="font-bold text-slate-900">#{dispatchingSolicitud.id}</span> para <span className="font-semibold text-slate-900">{dispatchingSolicitud.beneficiarioNombre}</span> ({dispatchingSolicitud.numPersonasHogar} personas).
              </p>
              <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg text-xs text-blue-900 leading-relaxed">
                <span className="font-bold">Algoritmo FEFO (First Expired, First Out):</span> El sistema buscará de manera automática los lotes de cada producto con la fecha de vencimiento más próxima, descontando el inventario físico disponible para prevenir mermas.
              </div>
              <div className="flex items-center justify-end gap-3 mt-6">
                <Button
                  variant="outline"
                  onClick={() => setDispatchingSolicitud(null)}
                  disabled={submitting}
                  className="cursor-pointer"
                >
                  Cancelar
                </Button>
                <Button
                  variant="primary"
                  onClick={handleDespacharConFefo}
                  disabled={submitting}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer"
                >
                  {submitting ? 'Despachando...' : 'Confirmar Despacho FEFO'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Rechazar Solicitud */}
      {rejectingSolicitud && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden border border-slate-200">
            <div className="p-6">
              <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mb-4">
                <LuCircleX className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">
                Rechazar Solicitud #{rejectingSolicitud.id}
              </h3>
              <p className="text-sm text-slate-600 mt-1">
                Indica el motivo por el cual la solicitud no puede ser atendida.
              </p>
              <div className="mt-4">
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                  Motivo de Rechazo
                </label>
                <textarea
                  rows={3}
                  value={rejectMotivo}
                  onChange={(e) => setRejectMotivo(e.target.value)}
                  placeholder="Ej. Existencias agotadas en almacén o falta de cupo de entrega..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>
              <div className="flex items-center justify-end gap-3 mt-6">
                <Button
                  variant="outline"
                  onClick={() => setRejectingSolicitud(null)}
                  disabled={submitting}
                  className="cursor-pointer"
                >
                  Cancelar
                </Button>
                <Button
                  variant="primary"
                  onClick={handleRechazar}
                  disabled={submitting}
                  className="bg-red-600 hover:bg-red-700 text-white cursor-pointer"
                >
                  {submitting ? 'Rechazando...' : 'Rechazar Solicitud'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Ver Detalles */}
      {detailSolicitud && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden border border-slate-200 max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
              <div className="flex items-center gap-2">
                <LuEye className="w-5 h-5 text-emerald-600" />
                <h3 className="text-base font-bold text-slate-900">
                  Detalle de Solicitud #{detailSolicitud.id}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setDetailSolicitud(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-md cursor-pointer"
              >
                <LuX className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 overflow-y-auto flex-1 text-sm">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 p-4 bg-slate-50 rounded-xl border border-slate-200">
                <div>
                  <p className="text-xs uppercase tracking-wider font-semibold text-slate-400">Beneficiario</p>
                  <p className="font-bold text-slate-900 mt-0.5">{detailSolicitud.beneficiarioNombre}</p>
                  <p className="font-mono text-xs text-slate-500">{detailSolicitud.beneficiarioDocumento}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wider font-semibold text-slate-400">Núcleo Poblacional</p>
                  <p className="text-emerald-700 font-bold mt-0.5">{detailSolicitud.numPersonasHogar} personas</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wider font-semibold text-slate-400">Estado Actual</p>
                  <div className="mt-0.5">{getStatusBadge(detailSolicitud.estado)}</div>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wider font-semibold text-slate-400">Fecha Registro</p>
                  <p className="text-slate-800 font-medium mt-0.5">{detailSolicitud.fechaSolicitud}</p>
                </div>
                <div className="sm:col-span-2">
                  <p className="text-xs uppercase tracking-wider font-semibold text-slate-400">Responsable Despacho</p>
                  <p className="text-slate-800 font-medium mt-0.5">{detailSolicitud.usuarioResponsableEmail || 'Pendiente por asignar'}</p>
                </div>
              </div>

              {detailSolicitud.observaciones && (
                <div className="p-3 bg-amber-50/60 border border-amber-200 rounded-lg text-xs text-amber-900">
                  <span className="font-bold">Observaciones:</span> {detailSolicitud.observaciones}
                </div>
              )}

              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                  Artículos de la Solicitud ({detailSolicitud.detalles.length})
                </h4>
                <div className="border border-slate-200 rounded-lg overflow-hidden">
                  <table className="min-w-full divide-y divide-slate-200 text-left text-xs">
                    <thead className="bg-slate-50 text-slate-600 font-semibold uppercase">
                      <tr>
                        <th className="px-4 py-2.5">Producto</th>
                        <th className="px-4 py-2.5">Tipo</th>
                        <th className="px-4 py-2.5">Cantidad Solicitada</th>
                        <th className="px-4 py-2.5">Cantidad Asignada (FEFO)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 bg-white">
                      {detailSolicitud.detalles.map((d) => (
                        <tr key={d.id} className="hover:bg-slate-50">
                          <td className="px-4 py-3 font-semibold text-slate-900">
                            {d.productoNombre}
                          </td>
                          <td className="px-4 py-3">
                            <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-semibold ${d.esPerecedero ? 'bg-blue-100 text-blue-800' : 'bg-slate-100 text-slate-700'}`}>
                              {d.esPerecedero ? 'Perecedero' : 'Seco'}
                            </span>
                          </td>
                          <td className="px-4 py-3 font-medium text-slate-700">
                            {d.cantidadSolicitada} {d.unidadMedida}
                          </td>
                          <td className="px-4 py-3">
                            {detailSolicitud.estado === 'DESPACHADA' ? (
                              <span className="font-bold text-emerald-700">
                                {d.cantidadAsignada} {d.unidadMedida}
                              </span>
                            ) : (
                              <span className="text-slate-400 italic">En espera</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-200 text-right">
              <Button
                variant="outline"
                onClick={() => setDetailSolicitud(null)}
                className="cursor-pointer"
              >
                Cerrar
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
