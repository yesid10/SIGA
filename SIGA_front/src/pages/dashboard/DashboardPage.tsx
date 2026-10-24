import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  LuBox,
  LuBoxes,
  LuClock,
  LuHeartHandshake,
  LuTriangleAlert,
  LuArrowRight,
  LuCheck,
  LuRefreshCw,
  LuClipboardList,
  LuUsers,
  LuMapPin,
  LuChartPie,
  LuChartBar,
} from 'react-icons/lu';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { useAuthStore } from '../../stores/authStore';
import { Badge } from '../../components/atoms/Badge';
import { Button } from '../../components/atoms/Button';
import { Spinner } from '../../components/atoms/Spinner';
import { Eyebrow } from '../../components/atoms/Typography';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../components/ui/card';
import { ChartTooltipContent } from '../../components/ui/chart';
import { DataTable } from '../../components/organisms/DataTable';
import { getMetricasInventario } from '../../services/inventario';
import type { InventarioMetricasResponse } from '../../types/catalogs';

export const DashboardPage: React.FC = () => {
  const user = useAuthStore((state) => state.user);
  const rol = user?.rol ?? 'BENEFICIARIO';

  const [metricas, setMetricas] = useState<InventarioMetricasResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchMetricas = async () => {
    try {
      setRefreshing(true);
      const data = await getMetricasInventario();
      setMetricas(data);
    } catch (error) {
      console.error('Error al cargar métricas del dashboard:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchMetricas();
  }, []);

  const getRoleBadge = () => {
    switch (rol) {
      case 'ADMINISTRADOR':
        return <Badge className="border border-purple-200 bg-purple-50 text-purple-900">Administrador</Badge>;
      case 'ENCARGADO':
        return <Badge className="border border-amber-200 bg-amber-50 text-amber-800">Encargado de Bodega</Badge>;
      case 'BENEFICIARIO':
      default:
        return <Badge className="border border-emerald-200 bg-emerald-50 text-emerald-800">Beneficiario</Badge>;
    }
  };

  const getUrgencyBadge = (urgencia: string) => {
    switch (urgencia.toUpperCase()) {
      case 'CRÍTICA':
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-bold text-red-800 border border-red-200">
            <LuTriangleAlert className="size-3 text-red-600" />
            Crítica
          </span>
        );
      case 'MEDIA':
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-bold text-amber-800 border border-amber-200">
            <LuClock className="size-3 text-amber-600" />
            Media
          </span>
        );
      case 'BAJA':
      default:
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-bold text-blue-800 border border-blue-200">
            <LuCheck className="size-3 text-blue-600" />
            Baja
          </span>
        );
    }
  };

  // Beneficiario Portal
  const renderBeneficiarioDashboard = () => (
    <div className="mt-8 space-y-8">
      <div className="rounded-2xl border border-emerald-100 bg-gradient-to-br from-emerald-50/70 via-white to-emerald-50/30 p-6 md:p-8">
        <h2 className="font-display text-2xl font-bold text-slate-900">
          Hola, {user?.nombre || user?.email}
        </h2>
        <p className="mt-2 max-w-3xl text-sm leading-relaxed text-slate-600 md:text-base">
          Bienvenido al portal de beneficiarios de <strong>SIGA</strong>. Aquí puedes consultar los productos
          alimenticios disponibles para entrega y consultar el estado de tus solicitudes en tiempo real.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="p-6 shadow-xs hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <span className="grid size-10 place-items-center rounded-lg bg-emerald-50 text-emerald-700">
              <LuBox className="size-5" />
            </span>
            <Badge className="bg-emerald-50 text-emerald-800">Disponible</Badge>
          </div>
          <h3 className="mt-5 font-display text-lg font-bold text-slate-900">
            Catálogo de Alimentos
          </h3>
          <p className="mt-2 text-sm leading-relaxed text-slate-500">
            Explora los alimentos perecederos y no perecederos registrados en el banco para armar tu solicitud.
          </p>
          <div className="mt-6 border-t border-slate-100 pt-4">
            <Link
              to="/products"
              className="inline-flex items-center gap-2 text-sm font-semibold text-emerald-700 hover:text-emerald-900 cursor-pointer"
            >
              <span>Explorar productos disponibles</span>
              <LuArrowRight className="size-4" />
            </Link>
          </div>
        </Card>

        <Card className="p-6 shadow-xs hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <span className="grid size-10 place-items-center rounded-lg bg-indigo-50 text-indigo-700">
              <LuClipboardList className="size-5" />
            </span>
            <Badge className="bg-indigo-50 text-indigo-800">Seguimiento</Badge>
          </div>
          <h3 className="mt-5 font-display text-lg font-bold text-slate-900">
            Mis Solicitudes
          </h3>
          <p className="mt-2 text-sm leading-relaxed text-slate-500">
            Consulta en tiempo real si tus pedidos se encuentran pendientes, aprobados, atendidos parcialmente o listos para retiro.
          </p>
          <div className="mt-6 border-t border-slate-100 pt-4">
            <Link
              to="/requests"
              className="inline-flex items-center gap-2 text-sm font-semibold text-indigo-700 hover:text-indigo-900 cursor-pointer"
            >
              <span>Consultar historial de solicitudes</span>
              <LuArrowRight className="size-4" />
            </Link>
          </div>
        </Card>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-6">
        <h4 className="font-display text-base font-bold text-slate-900">
          ¿Cómo gestionamos la asignación de alimentos?
        </h4>
        <p className="mt-2 text-sm leading-relaxed text-slate-600">
          En SIGA cuidamos que los alimentos lleguen a tiempo a quienes más lo necesitan aplicando el principio{' '}
          <strong>FEFO (First Expired, First Out)</strong>. Las solicitudes son revisadas por el equipo de bodega y
          atendidas en base a la disponibilidad y rotación segura de productos.
        </p>
      </div>
    </div>
  );

  // Operational Dashboard for Encargado and Admin matching Figura 3
  const renderOperationalDashboard = () => {
    if (!metricas) return null;

    // Data for Donut Chart (Estado de Lotes)
    const estadoLotesData = [
      { name: 'Disponibles', value: metricas.estadoLotes.disponibles, color: '#10b981' },
      { name: 'Próximos a Vencer', value: metricas.estadoLotes.proximosAVencer, color: '#f59e0b' },
      { name: 'Vencidos', value: metricas.estadoLotes.vencidos, color: '#ef4444' },
    ];

    // Data for Bar Chart (Lotes por Tiempo de Vencimiento)
    const tiempoVencimientoData = [
      { tiempo: '> 3 Meses', lotes: metricas.lotesPorTiempo.masDe3Meses, fill: '#10b981' },
      { tiempo: '1-3 Meses', lotes: metricas.lotesPorTiempo.unoATresMeses, fill: '#3b82f6' },
      { tiempo: '≤ 30 Días', lotes: metricas.lotesPorTiempo.treintaDiasOMenos, fill: '#f59e0b' },
      { tiempo: 'Vencidos', lotes: metricas.lotesPorTiempo.vencidos, fill: '#ef4444' },
    ];

    // Data for Categories Bar Chart
    const categoriasData = metricas.productosPorCategoria.map((c) => ({
      name: c.categoria.length > 12 ? c.categoria.substring(0, 10) + '...' : c.categoria,
      cantidad: c.cantidad,
      porcentaje: c.porcentaje,
    }));

    return (
      <div className="mt-8 space-y-8 animate-in fade-in duration-300">
        {/* Top Header with Quick Actions */}
        <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
          <div>
            <h2 className="font-display text-xl font-bold text-slate-900">
              Panel Operativo de Control y Trazabilidad (Figura 3)
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Monitoreo en tiempo real de lotes, existencias, vencimientos y recepción de donaciones.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              onClick={fetchMetricas}
              disabled={refreshing}
              className="flex items-center gap-1.5 py-2 px-3 text-xs"
            >
              <LuRefreshCw className={`size-3.5 ${refreshing ? 'animate-spin' : ''}`} />
              <span>Refrescar</span>
            </Button>
            <Link to="/donations">
              <Button className="flex items-center gap-1.5 py-2 px-3 text-xs">
                <LuHeartHandshake className="size-3.5" />
                <span>Registrar Donación</span>
              </Button>
            </Link>
          </div>
        </div>

        {/* 5 KPI Cards (Figura 3) */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <Card className="p-5 shadow-xs hover:border-emerald-300 transition">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Productos Disponibles
              </span>
              <span className="grid size-9 place-items-center rounded-lg bg-emerald-50 text-emerald-700">
                <LuBox className="size-5" />
              </span>
            </div>
            <p className="mt-3 font-display text-3xl font-extrabold text-slate-900">
              {metricas.productosDisponibles}
            </p>
            <p className="mt-1 flex items-center gap-1 text-xs text-emerald-700 font-semibold">
              <LuCheck className="size-3.5" />
              <span>Con stock en bodega</span>
            </p>
          </Card>

          <Card className="p-5 shadow-xs hover:border-blue-300 transition">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Lotes Registrados
              </span>
              <span className="grid size-9 place-items-center rounded-lg bg-blue-50 text-blue-700">
                <LuBoxes className="size-5" />
              </span>
            </div>
            <p className="mt-3 font-display text-3xl font-extrabold text-slate-900">
              {metricas.lotesRegistrados}
            </p>
            <p className="mt-1 text-xs text-blue-700 font-semibold">
              {metricas.estadoLotes.disponibles} activos en bodega
            </p>
          </Card>

          <Card className="p-5 shadow-xs border-amber-200 bg-amber-50/40 hover:border-amber-300 transition">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-800">
                Próximos a Vencer
              </span>
              <span className="grid size-9 place-items-center rounded-lg bg-amber-100 text-amber-800">
                <LuClock className="size-5" />
              </span>
            </div>
            <p className="mt-3 font-display text-3xl font-extrabold text-amber-950">
              {metricas.proximosAVencer}
            </p>
            <p className="mt-1 text-xs text-amber-700 font-semibold">
              En los próximos 30 días
            </p>
          </Card>

          <Card className="p-5 shadow-xs border-indigo-200 bg-indigo-50/30 hover:border-indigo-300 transition">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-800">
                Donaciones Registradas
              </span>
              <span className="grid size-9 place-items-center rounded-lg bg-indigo-100 text-indigo-800">
                <LuHeartHandshake className="size-5" />
              </span>
            </div>
            <p className="mt-3 font-display text-3xl font-extrabold text-indigo-950">
              {metricas.donacionesRegistradas}
            </p>
            <p className="mt-1 text-xs text-indigo-700 font-semibold">
              Historial de ingresos
            </p>
          </Card>

          <Card className="p-5 shadow-xs border-red-200 bg-red-50/40 hover:border-red-300 transition">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-red-800">
                Alertas de Vencimiento
              </span>
              <span className="grid size-9 place-items-center rounded-lg bg-red-100 text-red-800">
                <LuTriangleAlert className="size-5" />
              </span>
            </div>
            <p className="mt-3 font-display text-3xl font-extrabold text-red-950">
              {metricas.alertasVencimiento}
            </p>
            <p className="mt-1 text-xs text-red-700 font-semibold">
              Requieren rotación FEFO
            </p>
          </Card>
        </div>

        {/* shadcn Charts Section (Recharts Graphical Widgets) */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* Chart 1: Categorías (shadcn BarChart) */}
          <Card className="shadow-xs">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base flex items-center gap-2">
                    <LuChartBar className="size-4 text-emerald-800" />
                    <span>Distribución por Categorías</span>
                  </CardTitle>
                  <CardDescription>Cantidad de existencias catalogadas por tipo de alimento</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-2">
              <div className="h-64 w-full">
                {categoriasData.length === 0 ? (
                  <div className="flex h-full items-center justify-center text-xs text-slate-400">
                    Sin categorías registradas
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={categoriasData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                      <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748b' }} interval={0} angle={-15} textAnchor="end" />
                      <YAxis tick={{ fontSize: 11, fill: '#64748b' }} />
                      <Tooltip content={<ChartTooltipContent />} />
                      <Bar dataKey="cantidad" name="Productos" fill="#047857" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Chart 2: Estado de Lotes (shadcn Donut Chart) */}
          <Card className="shadow-xs">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base flex items-center gap-2">
                    <LuChartPie className="size-4 text-emerald-800" />
                    <span>Estado de Lotes en Bodega</span>
                  </CardTitle>
                  <CardDescription>Semáforo de inventario y condición de caducidad</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-2">
              <div className="h-64 w-full flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={estadoLotesData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={85}
                      paddingAngle={4}
                    >
                      {estadoLotesData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip content={<ChartTooltipContent />} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex items-center justify-center gap-4 text-xs mt-2 border-t border-slate-100 pt-3">
                <div className="flex items-center gap-1.5">
                  <span className="size-2.5 rounded-full bg-emerald-500" />
                  <span className="text-slate-600">Disponibles ({metricas.estadoLotes.disponibles})</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="size-2.5 rounded-full bg-amber-500" />
                  <span className="text-slate-600">Próximos ({metricas.estadoLotes.proximosAVencer})</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="size-2.5 rounded-full bg-red-500" />
                  <span className="text-slate-600">Vencidos ({metricas.estadoLotes.vencidos})</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Chart 3: Lotes por Tiempo de Vencimiento (Ventana FEFO) */}
          <Card className="shadow-xs">
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <LuClock className="size-4 text-blue-700" />
                <span>Lotes por Tiempo de Vencimiento</span>
              </CardTitle>
              <CardDescription>Ventana temporal de rotación FEFO en almacén</CardDescription>
            </CardHeader>
            <CardContent className="pt-2">
              <div className="h-56 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={tiempoVencimientoData} margin={{ top: 10, right: 10, left: -20, bottom: 10 }}>
                    <XAxis dataKey="tiempo" tick={{ fontSize: 11, fill: '#64748b' }} />
                    <YAxis tick={{ fontSize: 11, fill: '#64748b' }} />
                    <Tooltip content={<ChartTooltipContent />} />
                    <Bar dataKey="lotes" name="Lotes" radius={[6, 6, 0, 0]}>
                      {tiempoVencimientoData.map((entry, index) => (
                        <Cell key={`bar-${index}`} fill={entry.fill} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Widget 4: Donaciones por Modalidad */}
          <Card className="shadow-xs">
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <LuHeartHandshake className="size-4 text-indigo-700" />
                <span>Donaciones por Modalidad</span>
              </CardTitle>
              <CardDescription>Resumen de tipos de contribuciones recibidas</CardDescription>
            </CardHeader>
            <CardContent className="pt-2 space-y-3">
              {metricas.donacionesPorTipo.length === 0 ? (
                <p className="py-8 text-center text-xs text-slate-400">Sin donaciones registradas</p>
              ) : (
                metricas.donacionesPorTipo.map((tipo) => (
                  <div key={tipo.tipo} className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50/50 p-3.5">
                    <span className="text-xs font-bold text-slate-800">{tipo.tipo}</span>
                    <Badge className="bg-indigo-50 text-indigo-800 font-mono">
                      {`${tipo.cantidad} donación(es)`}
                    </Badge>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>

        {/* 2 Operational Tables (Figura 3) */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Últimas Donaciones */}
          <Card className="shadow-xs">
            <CardHeader className="pb-3 border-b border-slate-100">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base">Últimas Donaciones</CardTitle>
                  <CardDescription>Ingresos recientes al banco de alimentos</CardDescription>
                </div>
                <Link to="/donations" className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-800 hover:text-emerald-950 cursor-pointer">
                  <span>Ver todas</span>
                  <LuArrowRight className="size-3.5" />
                </Link>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <DataTable
                headers={['Donante', 'Fecha', 'Productos / Cant.', 'Estado']}
                emptyMessage="No hay donaciones registradas."
              >
                {metricas.ultimasDonaciones.slice(0, 5).map((d) => (
                  <tr key={d.id} className="border-b border-slate-100 hover:bg-slate-50/70">
                    <td className="px-4 py-3 font-semibold text-slate-900 text-xs">
                      {d.donanteNombre}
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-500 font-mono">
                      {d.fechaRecepcion}
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-700">
                      {d.totalProductos} prod. ({d.totalCantidad} unid.)
                    </td>
                    <td className="px-4 py-3 text-xs">
                      <Badge className="bg-emerald-50 text-emerald-800">{d.estado}</Badge>
                    </td>
                  </tr>
                ))}
              </DataTable>
            </CardContent>
          </Card>

          {/* Alertas Recientes */}
          <Card className="shadow-xs">
            <CardHeader className="pb-3 border-b border-slate-100">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base">Alertas Recientes</CardTitle>
                  <CardDescription>Productos con vencimiento próximo o crítico</CardDescription>
                </div>
                <Link to="/inventory" className="inline-flex items-center gap-1 text-xs font-semibold text-red-700 hover:text-red-900 cursor-pointer">
                  <span>Ir al inventario</span>
                  <LuArrowRight className="size-3.5" />
                </Link>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <DataTable
                headers={['Lote', 'Producto', 'Días Rest.', 'Urgencia', 'Acción']}
                emptyMessage="No hay alertas críticas en este momento."
              >
                {metricas.alertasRecientes.slice(0, 5).map((alerta) => (
                  <tr key={alerta.loteId} className="border-b border-slate-100 hover:bg-slate-50/70">
                    <td className="px-4 py-3 font-mono text-xs font-bold text-slate-900">
                      {alerta.numeroLote}
                    </td>
                    <td className="px-4 py-3 text-xs font-medium text-slate-800">
                      {alerta.productoNombre}
                    </td>
                    <td className="px-4 py-3 text-xs">
                      <span className={`font-semibold ${alerta.diasRestantes <= 0 ? 'text-red-600' : 'text-amber-700'}`}>
                        {alerta.diasRestantes < 0 ? `Vencido` : `${alerta.diasRestantes} días`}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs">
                      {getUrgencyBadge(alerta.urgencia)}
                    </td>
                    <td className="px-4 py-3 text-xs">
                      <Link
                        to="/inventory"
                        className="inline-flex items-center gap-1 rounded px-2.5 py-1 text-xs font-semibold text-emerald-800 hover:bg-emerald-50 cursor-pointer"
                      >
                        <span>Gestionar</span>
                      </Link>
                    </td>
                  </tr>
                ))}
              </DataTable>
            </CardContent>
          </Card>
        </div>

        {/* Admin Quick Links when role is ADMINISTRADOR */}
        {rol === 'ADMINISTRADOR' && (
          <div className="rounded-2xl border border-purple-100 bg-purple-50/30 p-6">
            <h4 className="text-xs font-bold uppercase tracking-wider text-purple-900">
              Accesos de Gobernanza y Configuración (Admin)
            </h4>
            <div className="mt-4 grid gap-4 sm:grid-cols-4">
              <Link to="/users" className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-3.5 hover:border-purple-300 hover:shadow-xs transition cursor-pointer">
                <div className="grid size-9 place-items-center rounded-lg bg-purple-50 text-purple-700">
                  <LuUsers className="size-5" />
                </div>
                <div>
                  <span className="block text-xs font-bold text-slate-900">Usuarios & Roles</span>
                  <span className="text-[11px] text-slate-400">Control RBAC</span>
                </div>
              </Link>
              <Link to="/products" className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-3.5 hover:border-emerald-300 hover:shadow-xs transition cursor-pointer">
                <div className="grid size-9 place-items-center rounded-lg bg-emerald-50 text-emerald-700">
                  <LuBox className="size-5" />
                </div>
                <div>
                  <span className="block text-xs font-bold text-slate-900">Catálogo Productos</span>
                  <span className="text-[11px] text-slate-400">Cards & Fotos</span>
                </div>
              </Link>
              <Link to="/locations" className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-3.5 hover:border-blue-300 hover:shadow-xs transition cursor-pointer">
                <div className="grid size-9 place-items-center rounded-lg bg-blue-50 text-blue-700">
                  <LuMapPin className="size-5" />
                </div>
                <div>
                  <span className="block text-xs font-bold text-slate-900">Ubicaciones</span>
                  <span className="text-[11px] text-slate-400">Bodega & Frío</span>
                </div>
              </Link>
              <Link to="/donors" className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-3.5 hover:border-amber-300 hover:shadow-xs transition cursor-pointer">
                <div className="grid size-9 place-items-center rounded-lg bg-amber-50 text-amber-700">
                  <LuHeartHandshake className="size-5" />
                </div>
                <div>
                  <span className="block text-xs font-bold text-slate-900">Directorio Donantes</span>
                  <span className="text-[11px] text-slate-400">Aliados</span>
                </div>
              </Link>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <section className="mx-auto max-w-7xl">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <Eyebrow>Sistema Integral de Gestión de Alimentos</Eyebrow>
          <h1 className="font-display text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
            Bienvenido a SIGA
          </h1>
        </div>
        <div>{getRoleBadge()}</div>
      </div>

      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <Spinner />
        </div>
      ) : (
        <>
          {rol === 'BENEFICIARIO' && renderBeneficiarioDashboard()}
          {(rol === 'ENCARGADO' || rol === 'ADMINISTRADOR') && renderOperationalDashboard()}
        </>
      )}
    </section>
  );
};
