import { useEffect, useState } from 'react';
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
} from 'react-icons/lu';
import { useAuthStore } from '../../stores/authStore';
import { Badge } from '../../components/atoms/Badge';
import { Button } from '../../components/atoms/Button';
import { Spinner } from '../../components/atoms/Spinner';
import { Eyebrow } from '../../components/atoms/Typography';
import { DataTable } from '../../components/organisms/DataTable';
import { getMetricasInventario } from '../../services/inventario';
import type { InventarioMetricasResponse } from '../../types/catalogs';

export const DashboardPage = () => {
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
        return <Badge className="border border-indigo-200 bg-indigo-50 text-indigo-800">Administrador</Badge>;
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
        <article className="flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-6 shadow-xs transition hover:shadow-md">
          <div>
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
          </div>
          <div className="mt-6 border-t border-slate-100 pt-4">
            <Link
              to="/products"
              className="inline-flex items-center gap-2 text-sm font-semibold text-emerald-700 hover:text-emerald-900"
            >
              <span>Explorar productos disponibles</span>
              <LuArrowRight className="size-4" />
            </Link>
          </div>
        </article>

        <article className="flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-6 shadow-xs transition hover:shadow-md">
          <div>
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
          </div>
          <div className="mt-6 border-t border-slate-100 pt-4">
            <Link
              to="/requests"
              className="inline-flex items-center gap-2 text-sm font-semibold text-indigo-700 hover:text-indigo-900"
            >
              <span>Consultar historial de solicitudes</span>
              <LuArrowRight className="size-4" />
            </Link>
          </div>
        </article>
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

    const totalLotesCount =
      metricas.estadoLotes.disponibles +
      metricas.estadoLotes.proximosAVencer +
      metricas.estadoLotes.vencidos || 1;

    const pctDisponibles = Math.round((metricas.estadoLotes.disponibles / totalLotesCount) * 100);
    const pctProximos = Math.round((metricas.estadoLotes.proximosAVencer / totalLotesCount) * 100);
    const pctVencidos = Math.round((metricas.estadoLotes.vencidos / totalLotesCount) * 100);

    return (
      <div className="mt-8 space-y-8">
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
          {/* 1. Productos Disponibles */}
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
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
          </div>

          {/* 2. Lotes Registrados */}
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
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
              {metricas.estadoLotes.disponibles} activos
            </p>
          </div>

          {/* 3. Próximos a Vencer */}
          <div className="rounded-xl border border-amber-200 bg-amber-50/50 p-5 shadow-xs">
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
          </div>

          {/* 4. Donaciones Registradas */}
          <div className="rounded-xl border border-indigo-200 bg-indigo-50/40 p-5 shadow-xs">
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
          </div>

          {/* 5. Alertas de Vencimiento */}
          <div className="rounded-xl border border-red-200 bg-red-50/50 p-5 shadow-xs">
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
          </div>
        </div>

        {/* Analytical Visual Breakdown (4 Blocks matching Figura 3) */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* Distribución por Categorías */}
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-display text-base font-bold text-slate-900">
                Distribución por Categorías
              </h3>
              <span className="text-xs text-slate-400">Existencias actuales</span>
            </div>
            <div className="mt-4 space-y-3">
              {metricas.productosPorCategoria.length === 0 ? (
                <p className="py-4 text-center text-xs text-slate-400">Sin datos registrados</p>
              ) : (
                metricas.productosPorCategoria.map((cat) => (
                  <div key={cat.categoria}>
                    <div className="flex items-center justify-between text-xs font-medium">
                      <span className="text-slate-700">{cat.categoria}</span>
                      <span className="text-slate-500 font-mono">
                        {cat.cantidad} ({cat.porcentaje}%)
                      </span>
                    </div>
                    <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-slate-100">
                      <div
                        className="h-full rounded-full bg-emerald-600 transition-all duration-500"
                        style={{ width: `${Math.min(cat.porcentaje, 100)}%` }}
                      />
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Estado de Lotes */}
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-display text-base font-bold text-slate-900">
                Estado de Lotes
              </h3>
              <span className="text-xs text-slate-400">Total: {totalLotesCount} lotes</span>
            </div>
            <div className="mt-4">
              {/* Stacked bar */}
              <div className="flex h-3 w-full overflow-hidden rounded-full bg-slate-100">
                <div
                  className="bg-emerald-500 transition-all duration-500"
                  style={{ width: `${pctDisponibles}%` }}
                  title={`Disponibles: ${pctDisponibles}%`}
                />
                <div
                  className="bg-amber-400 transition-all duration-500"
                  style={{ width: `${pctProximos}%` }}
                  title={`Próximos a vencer: ${pctProximos}%`}
                />
                <div
                  className="bg-red-500 transition-all duration-500"
                  style={{ width: `${pctVencidos}%` }}
                  title={`Vencidos: ${pctVencidos}%`}
                />
              </div>

              <div className="mt-6 grid grid-cols-3 gap-3 text-center">
                <div className="rounded-lg bg-emerald-50 p-3">
                  <span className="block text-xs font-semibold text-emerald-800">Disponibles</span>
                  <span className="mt-1 block font-mono text-xl font-bold text-emerald-950">
                    {metricas.estadoLotes.disponibles}
                  </span>
                  <span className="text-[11px] text-emerald-700">{pctDisponibles}%</span>
                </div>

                <div className="rounded-lg bg-amber-50 p-3">
                  <span className="block text-xs font-semibold text-amber-800">Próximos a vencer</span>
                  <span className="mt-1 block font-mono text-xl font-bold text-amber-950">
                    {metricas.estadoLotes.proximosAVencer}
                  </span>
                  <span className="text-[11px] text-amber-700">{pctProximos}%</span>
                </div>

                <div className="rounded-lg bg-red-50 p-3">
                  <span className="block text-xs font-semibold text-red-800">Vencidos</span>
                  <span className="mt-1 block font-mono text-xl font-bold text-red-950">
                    {metricas.estadoLotes.vencidos}
                  </span>
                  <span className="text-[11px] text-red-700">{pctVencidos}%</span>
                </div>
              </div>
            </div>
          </div>

          {/* Donaciones por Tipo */}
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-display text-base font-bold text-slate-900">
                Donaciones por Tipo
              </h3>
              <span className="text-xs text-slate-400">Modalidad de donación</span>
            </div>
            <div className="mt-4 space-y-3">
              {metricas.donacionesPorTipo.length === 0 ? (
                <p className="py-4 text-center text-xs text-slate-400">Sin donaciones registradas</p>
              ) : (
                metricas.donacionesPorTipo.map((tipo) => (
                  <div key={tipo.tipo} className="flex items-center justify-between rounded-lg border border-slate-100 p-3">
                    <span className="text-xs font-semibold text-slate-700">{tipo.tipo}</span>
                    <Badge className="bg-indigo-50 text-indigo-800 font-mono">
                      {`${tipo.cantidad} donación(es)`}
                    </Badge>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Lotes por Tiempo de Vencimiento */}
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-display text-base font-bold text-slate-900">
                Lotes por Tiempo de Vencimiento
              </h3>
              <span className="text-xs text-slate-400">Ventana temporal FEFO</span>
            </div>
            <div className="mt-4 space-y-2.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-medium text-emerald-800">Más de 3 meses:</span>
                <span className="font-bold text-slate-900 font-mono">{metricas.lotesPorTiempo.masDe3Meses} lotes</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="font-medium text-blue-800">Entre 1 y 3 meses:</span>
                <span className="font-bold text-slate-900 font-mono">{metricas.lotesPorTiempo.unoATresMeses} lotes</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="font-medium text-amber-800">30 días o menos (Alerta):</span>
                <span className="font-bold text-amber-900 font-mono">{metricas.lotesPorTiempo.treintaDiasOMenos} lotes</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="font-medium text-red-800">Vencidos:</span>
                <span className="font-bold text-red-900 font-mono">{metricas.lotesPorTiempo.vencidos} lotes</span>
              </div>
            </div>
          </div>
        </div>

        {/* 2 Operational Tables (Figura 3) */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Últimas Donaciones */}
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h3 className="font-display text-base font-bold text-slate-900">
                  Últimas Donaciones
                </h3>
                <p className="text-xs text-slate-500">Ingresos recientes al banco de alimentos</p>
              </div>
              <Link to="/donations" className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 hover:text-emerald-900">
                <span>Ver todas</span>
                <LuArrowRight className="size-3.5" />
              </Link>
            </div>
            <div className="mt-4">
              <DataTable
                headers={['Donante', 'Fecha', 'Productos / Cant.', 'Estado']}
                emptyMessage="No hay donaciones registradas."
              >
                {metricas.ultimasDonaciones.slice(0, 5).map((d) => (
                  <tr key={d.id} className="border-b border-slate-100 hover:bg-slate-50/70">
                    <td className="px-3 py-2.5 font-semibold text-slate-900 text-xs">
                      {d.donanteNombre}
                    </td>
                    <td className="px-3 py-2.5 text-xs text-slate-500 font-mono">
                      {d.fechaRecepcion}
                    </td>
                    <td className="px-3 py-2.5 text-xs text-slate-700">
                      {d.totalProductos} prod. ({d.totalCantidad} unid.)
                    </td>
                    <td className="px-3 py-2.5 text-xs">
                      <Badge className="bg-emerald-50 text-emerald-800">{d.estado}</Badge>
                    </td>
                  </tr>
                ))}
              </DataTable>
            </div>
          </div>

          {/* Alertas Recientes */}
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h3 className="font-display text-base font-bold text-slate-900">
                  Alertas Recientes
                </h3>
                <p className="text-xs text-slate-500">Productos con vencimiento próximo o crítico</p>
              </div>
              <Link to="/inventory" className="inline-flex items-center gap-1 text-xs font-semibold text-red-700 hover:text-red-900">
                <span>Ir al inventario</span>
                <LuArrowRight className="size-3.5" />
              </Link>
            </div>
            <div className="mt-4">
              <DataTable
                headers={['Lote', 'Producto', 'Días Rest.', 'Urgencia', 'Acción']}
                emptyMessage="No hay alertas críticas en este momento."
              >
                {metricas.alertasRecientes.slice(0, 5).map((alerta) => (
                  <tr key={alerta.loteId} className="border-b border-slate-100 hover:bg-slate-50/70">
                    <td className="px-3 py-2.5 font-mono text-xs font-bold text-slate-900">
                      {alerta.numeroLote}
                    </td>
                    <td className="px-3 py-2.5 text-xs font-medium text-slate-800">
                      {alerta.productoNombre}
                    </td>
                    <td className="px-3 py-2.5 text-xs">
                      <span className={`font-semibold ${alerta.diasRestantes <= 0 ? 'text-red-600' : 'text-amber-700'}`}>
                        {alerta.diasRestantes < 0 ? `Vencido` : `${alerta.diasRestantes} días`}
                      </span>
                    </td>
                    <td className="px-3 py-2.5 text-xs">
                      {getUrgencyBadge(alerta.urgencia)}
                    </td>
                    <td className="px-3 py-2.5 text-xs">
                      <Link
                        to="/inventory"
                        className="inline-flex items-center gap-1 rounded px-2 py-0.5 text-xs font-semibold text-emerald-700 hover:bg-emerald-50"
                      >
                        <span>Gestionar</span>
                      </Link>
                    </td>
                  </tr>
                ))}
              </DataTable>
            </div>
          </div>
        </div>

        {/* Admin Quick Links when role is ADMINISTRADOR */}
        {rol === 'ADMINISTRADOR' && (
          <div className="rounded-xl border border-indigo-100 bg-indigo-50/30 p-6">
            <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-700">
              Accesos de Gobernanza y Configuración
            </h4>
            <div className="mt-4 grid gap-4 sm:grid-cols-4">
              <Link to="/users" className="flex items-center gap-3 rounded-lg border border-slate-200 bg-white p-3 hover:border-indigo-300">
                <LuUsers className="size-5 text-indigo-600" />
                <div>
                  <span className="block text-xs font-bold text-slate-900">Usuarios & Roles</span>
                  <span className="text-[11px] text-slate-400">Control RBAC</span>
                </div>
              </Link>
              <Link to="/products" className="flex items-center gap-3 rounded-lg border border-slate-200 bg-white p-3 hover:border-emerald-300">
                <LuBox className="size-5 text-emerald-600" />
                <div>
                  <span className="block text-xs font-bold text-slate-900">Catálogo Productos</span>
                  <span className="text-[11px] text-slate-400">Perecederos</span>
                </div>
              </Link>
              <Link to="/locations" className="flex items-center gap-3 rounded-lg border border-slate-200 bg-white p-3 hover:border-blue-300">
                <LuMapPin className="size-5 text-blue-600" />
                <div>
                  <span className="block text-xs font-bold text-slate-900">Ubicaciones</span>
                  <span className="text-[11px] text-slate-400">Bodega & Frío</span>
                </div>
              </Link>
              <Link to="/donors" className="flex items-center gap-3 rounded-lg border border-slate-200 bg-white p-3 hover:border-amber-300">
                <LuHeartHandshake className="size-5 text-amber-600" />
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
