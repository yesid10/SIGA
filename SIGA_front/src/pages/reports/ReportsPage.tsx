import React, { useEffect, useState, useMemo } from 'react';
import {
  LuFileText,
  LuCalendar,
  LuDownload,
  LuPrinter,
  LuRefreshCw,
  LuTrendingUp,
  LuTruck,
  LuCircleCheck,
  LuCircleX,
  LuBoxes,
  LuUsers,
  LuHeartHandshake,
} from 'react-icons/lu';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { Button } from '../../components/atoms/Button';
import { Spinner } from '../../components/atoms/Spinner';
import { Eyebrow } from '../../components/atoms/Typography';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { getReporteBalance } from '../../services/reportes';
import type { ReporteBalanceResponse } from '../../types/catalogs';

export const ReportsPage: React.FC = () => {
  // Date state: default last 30 days
  const [desde, setDesde] = useState<string>(() => {
    const d = new Date();
    d.setDate(d.getDate() - 30);
    return d.toISOString().split('T')[0];
  });
  const [hasta, setHasta] = useState<string>(() => {
    return new Date().toISOString().split('T')[0];
  });

  const [reporte, setReporte] = useState<ReporteBalanceResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const cargarReporte = async () => {
    try {
      setRefreshing(true);
      const data = await getReporteBalance({ desde, hasta });
      setReporte(data);
    } catch (err) {
      console.error('Error al cargar reporte de balance:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    cargarReporte();
  }, []);

  const handlePreset = (dias: number) => {
    const h = new Date();
    const d = new Date();
    d.setDate(d.getDate() - dias);
    setDesde(d.toISOString().split('T')[0]);
    setHasta(h.toISOString().split('T')[0]);
  };

  const handleFiltrar = (e: React.FormEvent) => {
    e.preventDefault();
    cargarReporte();
  };

  const handleExportCSV = () => {
    if (!reporte) return;
    const rows = [
      ['Categoría', 'Kg Recibidos', 'Kg Distribuidos (FEFO)', 'Kg Vencidos'],
      ...reporte.desgloseCategorias.map((c) => [
        c.categoria,
        c.kgRecibidos.toString(),
        c.kgDistribuidos.toString(),
        c.kgVencidos.toString(),
      ]),
    ];
    const csvContent =
      'data:text/csv;charset=utf-8,' + rows.map((e) => e.join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `balance_alimentos_${desde}_a_${hasta}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    window.print();
  };

  // Chart data: compare Recibidos vs Distribuidos vs Vencidos by category
  const chartData = useMemo(() => {
    if (!reporte) return [];
    return reporte.desgloseCategorias.map((cat) => ({
      name: cat.categoria.length > 15 ? cat.categoria.substring(0, 15) + '...' : cat.categoria,
      fullName: cat.categoria,
      Recibidos: Number(cat.kgRecibidos),
      Distribuidos: Number(cat.kgDistribuidos),
      Vencidos: Number(cat.kgVencidos),
    }));
  }, [reporte]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <Eyebrow>Informes Ejecutivos y Rendición de Cuentas (RF-16 / Figura 5)</Eyebrow>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 mt-1 flex items-center gap-2">
            <LuFileText className="w-7 h-7 text-emerald-700" />
            Reporte de Balance de Alimentos
          </h1>
          <p className="text-sm text-slate-600 mt-0.5">
            Trazabilidad consolidada de insumos recibidos, distribuidos con FEFO y mermas en el período seleccionado.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={handleExportCSV}
            disabled={!reporte || loading}
            className="flex items-center gap-1.5 cursor-pointer text-xs"
            title="Exportar datos consolidados a hoja CSV"
          >
            <LuDownload className="w-4 h-4" />
            Exportar CSV
          </Button>
          <Button
            variant="outline"
            onClick={handlePrint}
            className="flex items-center gap-1.5 cursor-pointer text-xs"
            title="Imprimir informe oficial"
          >
            <LuPrinter className="w-4 h-4" />
            Imprimir
          </Button>
          <Button
            variant="primary"
            onClick={cargarReporte}
            disabled={refreshing}
            className="flex items-center gap-1.5 cursor-pointer text-xs bg-emerald-800 hover:bg-emerald-900 text-white"
          >
            <LuRefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            Actualizar
          </Button>
        </div>
      </div>

      {/* Date Range Selector */}
      <Card className="border-slate-200 bg-white shadow-sm">
        <CardContent className="p-4">
          <form onSubmit={handleFiltrar} className="flex flex-col lg:flex-row gap-4 items-center justify-between">
            <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
              <div className="flex items-center gap-2">
                <LuCalendar className="w-4 h-4 text-slate-500" />
                <span className="text-xs font-semibold uppercase text-slate-700">Rango:</span>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="date"
                  value={desde}
                  onChange={(e) => setDesde(e.target.value)}
                  className="px-3 py-1.5 border border-slate-300 rounded-lg text-xs bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
                <span className="text-xs text-slate-400">hasta</span>
                <input
                  type="date"
                  value={hasta}
                  onChange={(e) => setHasta(e.target.value)}
                  className="px-3 py-1.5 border border-slate-300 rounded-lg text-xs bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <Button type="submit" variant="secondary" className="text-xs py-1.5 px-3 cursor-pointer">
                Consultar
              </Button>
            </div>

            {/* Quick Presets */}
            <div className="flex flex-wrap items-center gap-1.5 w-full lg:w-auto justify-start lg:justify-end">
              <button
                type="button"
                onClick={() => handlePreset(7)}
                className="px-2.5 py-1 text-xs font-medium rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 cursor-pointer transition-colors"
              >
                Últimos 7 días
              </button>
              <button
                type="button"
                onClick={() => handlePreset(30)}
                className="px-2.5 py-1 text-xs font-medium rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 cursor-pointer transition-colors"
              >
                Últimos 30 días
              </button>
              <button
                type="button"
                onClick={() => handlePreset(90)}
                className="px-2.5 py-1 text-xs font-medium rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 cursor-pointer transition-colors"
              >
                Último trimestre
              </button>
              <button
                type="button"
                onClick={() => handlePreset(365)}
                className="px-2.5 py-1 text-xs font-medium rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 cursor-pointer transition-colors"
              >
                Año corrido
              </button>
            </div>
          </form>
        </CardContent>
      </Card>

      {loading ? (
        <div className="flex flex-col items-center justify-center p-16">
          <Spinner />
          <p className="text-sm text-slate-500 mt-3">Calculando balance consolidado de alimentos...</p>
        </div>
      ) : !reporte ? (
        <div className="text-center py-16 text-slate-500">
          No se pudo generar el reporte para el período seleccionado.
        </div>
      ) : (
        <>
          {/* Executive Summary KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* Total Recibido */}
            <Card className="border-slate-200 bg-white shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Alimento Recibido
                </CardTitle>
                <div className="p-2 bg-emerald-50 text-emerald-700 rounded-lg">
                  <LuTruck className="w-4 h-4" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-slate-900">
                  {reporte.totalKgRecibidos} <span className="text-sm font-normal text-slate-500">kg</span>
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  En {reporte.totalDonaciones} donaciones registradas
                </p>
              </CardContent>
            </Card>

            {/* Total Distribuido (FEFO) */}
            <Card className="border-slate-200 bg-white shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-xs font-semibold uppercase tracking-wider text-emerald-700">
                  Distribuido con FEFO
                </CardTitle>
                <div className="p-2 bg-emerald-100 text-emerald-800 rounded-lg">
                  <LuCircleCheck className="w-4 h-4" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-emerald-800">
                  {reporte.totalKgDistribuidos} <span className="text-sm font-normal text-slate-500">kg</span>
                </div>
                <p className="text-xs text-emerald-600 font-medium mt-1">
                  En {reporte.totalSolicitudesAtendidas} solicitudes atendidas
                </p>
              </CardContent>
            </Card>

            {/* Vencido / Desperdiciado */}
            <Card className="border-slate-200 bg-white shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-xs font-semibold uppercase tracking-wider text-red-700">
                  Caducado / Pérdida
                </CardTitle>
                <div className="p-2 bg-red-50 text-red-700 rounded-lg">
                  <LuCircleX className="w-4 h-4" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-700">
                  {reporte.totalKgVencidos} <span className="text-sm font-normal text-slate-500">kg</span>
                </div>
                <p className="text-xs text-red-600 mt-1">
                  Lotes expirados en el período
                </p>
              </CardContent>
            </Card>

            {/* Tasa de Aprovechamiento */}
            <Card className="border-slate-200 bg-white shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-xs font-semibold uppercase tracking-wider text-blue-700">
                  Aprovechamiento
                </CardTitle>
                <div className="p-2 bg-blue-50 text-blue-700 rounded-lg">
                  <LuTrendingUp className="w-4 h-4" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-800">
                  {reporte.tasaAprovechamiento}%
                </div>
                <p className="text-xs text-blue-600 mt-1">
                  Efectividad del rescate alimentario
                </p>
              </CardContent>
            </Card>

            {/* Stock Disponible Bodega */}
            <Card className="border-slate-200 bg-white shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Stock Disponible
                </CardTitle>
                <div className="p-2 bg-slate-100 text-slate-700 rounded-lg">
                  <LuBoxes className="w-4 h-4" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-slate-800">
                  {reporte.totalKgDisponibles} <span className="text-sm font-normal text-slate-500">kg</span>
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  Existencias físicas vigentes
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Chart Section */}
          <Card className="border-slate-200 bg-white shadow-sm">
            <CardHeader className="pb-0">
              <CardTitle className="text-sm font-bold text-slate-900">
                Flujo Comparativo de Alimentos por Categoría (Kilogramos)
              </CardTitle>
              <p className="text-xs text-slate-500 mt-0.5">
                Contraste entre insumos recibidos, despachados a beneficiarios y mermas caducadas.
              </p>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 10, right: 20, left: 0, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="name" stroke="#64748b" fontSize={11} tickLine={false} />
                    <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#ffffff',
                        border: '1px solid #e2e8f0',
                        borderRadius: '8px',
                        fontSize: '12px',
                      }}
                    />
                    <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                    <Bar dataKey="Recibidos" fill="#047857" name="Recibidos (kg)" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="Distribuidos" fill="#3b82f6" name="Distribuidos FEFO (kg)" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="Vencidos" fill="#ef4444" name="Caducados (kg)" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Breakdown Tables (Categorías, Donantes, Beneficiarios) */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Tabla Donantes */}
            <Card className="border-slate-200 bg-white shadow-sm overflow-hidden">
              <CardHeader className="border-b border-slate-100 bg-slate-50/50 py-3">
                <CardTitle className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
                  <LuHeartHandshake className="w-4 h-4 text-emerald-600" />
                  Aportes por Donante ({reporte.desgloseDonantes.length})
                </CardTitle>
              </CardHeader>
              <div className="overflow-x-auto max-h-72 overflow-y-auto">
                <table className="min-w-full divide-y divide-slate-100 text-left text-xs">
                  <thead className="bg-slate-50 text-slate-600 font-semibold sticky top-0">
                    <tr>
                      <th className="px-4 py-2.5">Donante</th>
                      <th className="px-4 py-2.5 text-center">Entregas</th>
                      <th className="px-4 py-2.5 text-right">Total Aportado</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white">
                    {reporte.desgloseDonantes.map((d, i) => (
                      <tr key={i} className="hover:bg-slate-50">
                        <td className="px-4 py-2.5 font-medium text-slate-900">{d.donante}</td>
                        <td className="px-4 py-2.5 text-center text-slate-600">{d.totalDonaciones}</td>
                        <td className="px-4 py-2.5 text-right font-bold text-emerald-700">{d.kgAportados} kg</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>

            {/* Tabla Beneficiarios */}
            <Card className="border-slate-200 bg-white shadow-sm overflow-hidden">
              <CardHeader className="border-b border-slate-100 bg-slate-50/50 py-3">
                <CardTitle className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
                  <LuUsers className="w-4 h-4 text-blue-600" />
                  Distribución a Beneficiarios ({reporte.desgloseBeneficiarios.length})
                </CardTitle>
              </CardHeader>
              <div className="overflow-x-auto max-h-72 overflow-y-auto">
                <table className="min-w-full divide-y divide-slate-100 text-left text-xs">
                  <thead className="bg-slate-50 text-slate-600 font-semibold sticky top-0">
                    <tr>
                      <th className="px-4 py-2.5">Beneficiario / Entidad</th>
                      <th className="px-4 py-2.5 text-center">Solicitudes</th>
                      <th className="px-4 py-2.5 text-right">Alimento Asignado</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white">
                    {reporte.desgloseBeneficiarios.map((b, i) => (
                      <tr key={i} className="hover:bg-slate-50">
                        <td className="px-4 py-2.5 font-medium text-slate-900">{b.beneficiario}</td>
                        <td className="px-4 py-2.5 text-center text-slate-600">{b.totalSolicitudes}</td>
                        <td className="px-4 py-2.5 text-right font-bold text-blue-700">{b.kgRecibidos} kg</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
        </>
      )}
    </div>
  );
};
