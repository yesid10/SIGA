import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LuTriangleAlert,
  LuCircleAlert,
  LuClock,
  LuFlame,
  LuSearch,
  LuRefreshCw,
  LuBoxes,
  LuSnowflake,
  LuSun,
  LuCalendar,
  LuArrowRight,
  LuShieldAlert,
} from 'react-icons/lu';
import { Button } from '../../components/atoms/Button';
import { Badge } from '../../components/atoms/Badge';
import { Spinner } from '../../components/atoms/Spinner';
import { Eyebrow } from '../../components/atoms/Typography';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { getAlertas } from '../../services/inventario';
import type { AlertaResumen } from '../../types/catalogs';

type FiltroUrgencia = 'TODAS' | 'CRITICA' | 'ALTA' | 'MEDIA' | 'PREVENTIVA';

export const AlertsPage: React.FC = () => {
  const navigate = useNavigate();
  const [alertas, setAlertas] = useState<AlertaResumen[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Filters
  const [filtroUrgencia, setFiltroUrgencia] = useState<FiltroUrgencia>('TODAS');
  const [searchQuery, setSearchQuery] = useState('');

  const cargarAlertas = async () => {
    try {
      setRefreshing(true);
      const data = await getAlertas();
      setAlertas(data);
    } catch (err) {
      console.error('Error al cargar alertas de vencimiento:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    cargarAlertas();
  }, []);

  // Summary Metrics
  const metricas = useMemo(() => {
    const total = alertas.length;
    const criticas = alertas.filter((a) => a.urgencia === 'CRITICA').length;
    const altas = alertas.filter((a) => a.urgencia === 'ALTA').length;
    const medias = alertas.filter((a) => a.urgencia === 'MEDIA').length;
    const preventivas = alertas.filter((a) => a.urgencia === 'PREVENTIVA').length;

    const kgRiesgoInmediato = alertas
      .filter((a) => a.urgencia === 'CRITICA' || a.urgencia === 'ALTA')
      .reduce((acc, a) => acc + (a.cantidadDisponible ?? 0), 0);

    return { total, criticas, altas, medias, preventivas, kgRiesgoInmediato };
  }, [alertas]);

  // Filtered List
  const alertasFiltradas = useMemo(() => {
    return alertas.filter((a) => {
      const matchUrgencia = filtroUrgencia === 'TODAS' || a.urgencia === filtroUrgencia;
      const q = searchQuery.toLowerCase().trim();
      const matchSearch =
        !q ||
        a.productoNombre.toLowerCase().includes(q) ||
        a.numeroLote.toLowerCase().includes(q) ||
        (a.categoriaNombre && a.categoriaNombre.toLowerCase().includes(q)) ||
        (a.ubicacionNombre && a.ubicacionNombre.toLowerCase().includes(q));

      return matchUrgencia && matchSearch;
    });
  }, [alertas, filtroUrgencia, searchQuery]);

  const getUrgenciaBadge = (urgencia: string, dias: number) => {
    switch (urgencia) {
      case 'CRITICA':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-red-100 text-red-900 border border-red-300 animate-pulse">
            <LuFlame className="w-3.5 h-3.5 text-red-600" />
            CRÍTICA ({dias} {dias === 1 ? 'día' : 'días'})
          </span>
        );
      case 'ALTA':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-orange-100 text-orange-900 border border-orange-300">
            <LuTriangleAlert className="w-3.5 h-3.5 text-orange-600" />
            ALTA ({dias} días)
          </span>
        );
      case 'MEDIA':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-900 border border-amber-300">
            <LuClock className="w-3.5 h-3.5 text-amber-600" />
            MEDIA ({dias} días)
          </span>
        );
      case 'PREVENTIVA':
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-900 border border-blue-300">
            <LuCircleAlert className="w-3.5 h-3.5 text-blue-600" />
            PREVENTIVA ({dias} días)
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <Eyebrow>Control Preventivo de Desperdicios (RF-06 / CP-05)</Eyebrow>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 mt-1 flex items-center gap-2">
            <LuShieldAlert className="w-7 h-7 text-red-600" />
            Panel de Alertas de Vencimiento
          </h1>
          <p className="text-sm text-slate-600 mt-0.5">
            Monitoreo en tiempo real de lotes próximos a caducar clasificados por severidad para priorización FEFO.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={cargarAlertas}
            disabled={refreshing}
            className="flex items-center gap-2 cursor-pointer"
          >
            <LuRefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            Actualizar
          </Button>
          <Button
            variant="primary"
            onClick={() => navigate('/requests')}
            className="flex items-center gap-2 cursor-pointer bg-emerald-800 hover:bg-emerald-900 text-white"
          >
            <LuArrowRight className="w-4 h-4" />
            Ir a Despacho FEFO
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Total Alertas */}
        <Card
          onClick={() => setFiltroUrgencia('TODAS')}
          className={`border-slate-200 bg-white shadow-sm cursor-pointer transition-all hover:border-slate-400 ${
            filtroUrgencia === 'TODAS' ? 'ring-2 ring-emerald-600' : ''
          }`}
        >
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Total Alertas
            </CardTitle>
            <div className="p-2 bg-slate-100 text-slate-700 rounded-lg">
              <LuBoxes className="w-4 h-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">{metricas.total}</div>
            <p className="text-xs text-slate-500 mt-1">Lotes con vencimiento ≤ 30 días</p>
          </CardContent>
        </Card>

        {/* Críticas <= 1 día */}
        <Card
          onClick={() => setFiltroUrgencia('CRITICA')}
          className={`border-red-200 bg-red-50/40 shadow-sm cursor-pointer transition-all hover:border-red-400 ${
            filtroUrgencia === 'CRITICA' ? 'ring-2 ring-red-600' : ''
          }`}
        >
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-red-700">
              Crítica (≤ 1 Día)
            </CardTitle>
            <div className="p-2 bg-red-100 text-red-700 rounded-lg">
              <LuFlame className="w-4 h-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-800">{metricas.criticas}</div>
            <p className="text-xs text-red-600 font-medium mt-1">Acción inmediata requerida</p>
          </CardContent>
        </Card>

        {/* Altas <= 3 días */}
        <Card
          onClick={() => setFiltroUrgencia('ALTA')}
          className={`border-orange-200 bg-orange-50/40 shadow-sm cursor-pointer transition-all hover:border-orange-400 ${
            filtroUrgencia === 'ALTA' ? 'ring-2 ring-orange-600' : ''
          }`}
        >
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-orange-700">
              Alta (≤ 3 Días)
            </CardTitle>
            <div className="p-2 bg-orange-100 text-orange-700 rounded-lg">
              <LuTriangleAlert className="w-4 h-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-800">{metricas.altas}</div>
            <p className="text-xs text-orange-600 mt-1">Priorizar en distribución</p>
          </CardContent>
        </Card>

        {/* Medias <= 7 días */}
        <Card
          onClick={() => setFiltroUrgencia('MEDIA')}
          className={`border-amber-200 bg-amber-50/40 shadow-sm cursor-pointer transition-all hover:border-amber-400 ${
            filtroUrgencia === 'MEDIA' ? 'ring-2 ring-amber-600' : ''
          }`}
        >
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-amber-700">
              Media (≤ 7 Días)
            </CardTitle>
            <div className="p-2 bg-amber-100 text-amber-700 rounded-lg">
              <LuClock className="w-4 h-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-800">{metricas.medias}</div>
            <p className="text-xs text-amber-600 mt-1">Próxima semana</p>
          </CardContent>
        </Card>

        {/* Preventivas <= 30 días */}
        <Card
          onClick={() => setFiltroUrgencia('PREVENTIVA')}
          className={`border-blue-200 bg-blue-50/40 shadow-sm cursor-pointer transition-all hover:border-blue-400 ${
            filtroUrgencia === 'PREVENTIVA' ? 'ring-2 ring-blue-600' : ''
          }`}
        >
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold uppercase tracking-wider text-blue-700">
              Preventiva (≤ 30 Días)
            </CardTitle>
            <div className="p-2 bg-blue-100 text-blue-700 rounded-lg">
              <LuCircleAlert className="w-4 h-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-800">{metricas.preventivas}</div>
            <p className="text-xs text-blue-600 mt-1">En vigilancia regular</p>
          </CardContent>
        </Card>
      </div>

      {/* Filter Tabs & Search Bar */}
      <Card className="border-slate-200 bg-white shadow-sm">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            {/* Search */}
            <div className="relative flex-1 w-full">
              <LuSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Buscar por lote, alimento, categoría o ubicación..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-colors"
              />
            </div>

            {/* Severity Pill Selector */}
            <div className="flex flex-wrap items-center gap-1.5 self-start md:self-auto">
              {(['TODAS', 'CRITICA', 'ALTA', 'MEDIA', 'PREVENTIVA'] as FiltroUrgencia[]).map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setFiltroUrgencia(tab)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    filtroUrgencia === tab
                      ? 'bg-slate-900 text-white shadow-sm'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {tab === 'TODAS' ? 'Todas' : tab}
                </button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Table of Alerts */}
      <Card className="border-slate-200 bg-white shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex flex-col items-center justify-center p-12">
            <Spinner />
            <p className="text-sm text-slate-500 mt-3">Calculando estados de caducidad en tiempo real...</p>
          </div>
        ) : alertasFiltradas.length === 0 ? (
          <div className="text-center py-16 px-4">
            <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mx-auto text-emerald-600 mb-3">
              <LuShieldAlert className="w-6 h-6" />
            </div>
            <h3 className="text-base font-semibold text-slate-900">
              No hay alertas para este filtro
            </h3>
            <p className="text-sm text-slate-500 mt-1 max-w-sm mx-auto">
              {searchQuery || filtroUrgencia !== 'TODAS'
                ? 'Prueba modificando los criterios de búsqueda o el nivel de urgencia.'
                : 'Excelente: Todos los lotes en bodega tienen fechas de caducidad seguras (> 30 días).'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
              <thead className="bg-slate-50 text-slate-600 font-semibold uppercase text-xs tracking-wider">
                <tr>
                  <th scope="col" className="px-6 py-3.5">Nivel de Urgencia</th>
                  <th scope="col" className="px-6 py-3.5">Lote / Alimento</th>
                  <th scope="col" className="px-6 py-3.5">Categoría / Almacén</th>
                  <th scope="col" className="px-6 py-3.5">Stock Disponible</th>
                  <th scope="col" className="px-6 py-3.5">Fecha Caducidad</th>
                  <th scope="col" className="px-6 py-3.5 text-right">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {alertasFiltradas.map((alerta) => (
                  <tr key={alerta.loteId} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-6 py-4">
                      {getUrgenciaBadge(alerta.urgencia, alerta.diasRestantes)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-bold text-slate-900">{alerta.productoNombre}</div>
                      <div className="font-mono text-xs text-slate-500 mt-0.5">
                        Lote: {alerta.numeroLote}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-700">
                      <div>{alerta.categoriaNombre ?? 'General'}</div>
                      <div className="flex items-center gap-1 text-slate-500 mt-0.5">
                        {alerta.esPerecedero ? (
                          <span className="inline-flex items-center gap-1 text-blue-700 font-medium">
                            <LuSnowflake className="w-3.5 h-3.5 text-blue-500" />
                            {alerta.ubicacionNombre ?? 'Refrigerado'}
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-amber-700 font-medium">
                            <LuSun className="w-3.5 h-3.5 text-amber-500" />
                            {alerta.ubicacionNombre ?? 'Seco'}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-semibold text-slate-900">
                        {alerta.cantidadDisponible ?? 0} {alerta.unidadMedida ?? 'unid.'}
                      </div>
                      <Badge variant={alerta.diasRestantes <= 3 ? 'danger' : 'warning'}>
                        {alerta.diasRestantes <= 3 ? 'Despacho Urgente' : 'Prioritario'}
                      </Badge>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5 text-xs text-slate-800 font-medium">
                        <LuCalendar className="w-3.5 h-3.5 text-slate-400" />
                        <span>{alerta.fechaVencimiento}</span>
                      </div>
                      <span className="text-[11px] text-slate-500">
                        Quedan {alerta.diasRestantes} {alerta.diasRestantes === 1 ? 'día' : 'días'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Button
                        variant="secondary"
                        onClick={() => navigate('/requests')}
                        className="text-xs px-3 py-1.5 cursor-pointer bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200"
                        title="Priorizar la entrega de este alimento mediante FEFO"
                      >
                        Priorizar Salida
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
};
