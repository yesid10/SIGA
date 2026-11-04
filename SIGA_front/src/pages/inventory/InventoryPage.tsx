import { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  LuSearch,
  LuRefreshCw,
  LuPlus,
  LuBoxes,
  LuClock,
  LuTriangleAlert,
  LuCheck,
  LuEye,
  LuMapPin,
  LuX,
  LuPackage,
  LuFilter,
} from 'react-icons/lu';
import { Button } from '../../components/atoms/Button';
import { Badge } from '../../components/atoms/Badge';
import { Spinner } from '../../components/atoms/Spinner';
import { Eyebrow } from '../../components/atoms/Typography';
import { DataTable } from '../../components/organisms/DataTable';
import { buscarLotes } from '../../services/inventario';
import { getCategorias } from '../../services/categorias';
import { getUbicaciones } from '../../services/ubicaciones';
import type { Lote, Categoria, Ubicacion, EstadoLote } from '../../types/catalogs';

export const InventoryPage = () => {
  const [lotes, setLotes] = useState<Lote[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [ubicaciones, setUbicaciones] = useState<Ubicacion[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Filters state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategoria, setSelectedCategoria] = useState<string>('');
  const [selectedEstado, setSelectedEstado] = useState<string>('');
  const [selectedUbicacion, setSelectedUbicacion] = useState<string>('');

  // Selected lot for detail modal
  const [selectedLote, setSelectedLote] = useState<Lote | null>(null);

  const fetchData = async () => {
    try {
      setRefreshing(true);
      const [lotesData, categoriasData, ubicacionesData] = await Promise.all([
        buscarLotes(),
        getCategorias(),
        getUbicaciones(),
      ]);
      setLotes(lotesData);
      setCategorias(categoriasData);
      setUbicaciones(ubicacionesData);
    } catch (error) {
      console.error('Error al cargar datos del inventario:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Filtered lots client-side for instantaneous reactive search
  const filteredLotes = useMemo(() => {
    return lotes.filter((lote) => {
      // Search query (lote number or product name)
      const q = searchQuery.toLowerCase().trim();
      if (q) {
        const matchLote = lote.numeroLote.toLowerCase().includes(q);
        const matchProd = lote.productoNombre.toLowerCase().includes(q);
        const matchDonante = lote.donanteNombre?.toLowerCase().includes(q) ?? false;
        if (!matchLote && !matchProd && !matchDonante) return false;
      }

      // Filter by category
      if (selectedCategoria) {
        if (lote.categoriaNombre !== selectedCategoria) return false;
      }

      // Filter by state
      if (selectedEstado) {
        if (lote.estado !== selectedEstado) return false;
      }

      // Filter by location
      if (selectedUbicacion) {
        if (lote.ubicacionCodigo !== selectedUbicacion) return false;
      }

      return true;
    });
  }, [lotes, searchQuery, selectedCategoria, selectedEstado, selectedUbicacion]);

  // Statistics calculation for bottom cards
  const stats = useMemo(() => {
    const totalLotes = lotes.length;
    const stockTotal = lotes.reduce((acc, curr) => acc + (Number(curr.cantidadDisponible) || 0), 0);
    const proximosAVencer = lotes.filter(
      (l) => (l.diasRestantes !== undefined ? l.diasRestantes <= 30 && l.diasRestantes >= 0 : false)
    ).length;
    const vencidos = lotes.filter(
      (l) => (l.diasRestantes !== undefined ? l.diasRestantes < 0 : false) || l.estado === 'VENCIDO'
    ).length;

    return { totalLotes, stockTotal, proximosAVencer, vencidos };
  }, [lotes]);

  const handleClearFilters = () => {
    setSearchQuery('');
    setSelectedCategoria('');
    setSelectedEstado('');
    setSelectedUbicacion('');
  };

  const getEstadoBadge = (estado: EstadoLote) => {
    switch (estado) {
      case 'DISPONIBLE':
        return (
          <Badge className="border border-emerald-200 bg-emerald-50 text-emerald-800">
            Disponible
          </Badge>
        );
      case 'PROXIMO_A_VENCER':
        return (
          <Badge className="border border-amber-200 bg-amber-50 text-amber-800">
            Próximo a Vencer
          </Badge>
        );
      case 'VENCIDO':
        return (
          <Badge className="border border-red-200 bg-red-50 text-red-800">
            Vencido
          </Badge>
        );
      case 'AGOTADO':
        return (
          <Badge className="border border-slate-200 bg-slate-100 text-slate-700">
            Agotado
          </Badge>
        );
      default:
        return <Badge>{estado}</Badge>;
    }
  };

  const getDiasRestantesBadge = (dias?: number) => {
    if (dias === undefined) return <span className="text-slate-400">-</span>;

    if (dias < 0) {
      return (
        <span className="inline-flex items-center gap-1 rounded-md bg-red-100 px-2 py-0.5 text-xs font-bold text-red-800">
          <LuTriangleAlert className="size-3.5 text-red-600" />
          Vencido ({Math.abs(dias)}d)
        </span>
      );
    }
    if (dias <= 7) {
      return (
        <span className="inline-flex items-center gap-1 rounded-md bg-red-50 px-2 py-0.5 text-xs font-semibold text-red-700 border border-red-200">
          <LuClock className="size-3.5 text-red-600" />
          {dias} días (Crítico)
        </span>
      );
    }
    if (dias <= 30) {
      return (
        <span className="inline-flex items-center gap-1 rounded-md bg-amber-50 px-2 py-0.5 text-xs font-semibold text-amber-700 border border-amber-200">
          <LuClock className="size-3.5 text-amber-600" />
          {dias} días
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 rounded-md bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-700 border border-emerald-200">
        <LuCheck className="size-3.5 text-emerald-600" />
        {`${dias} días`}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Spinner />
      </div>
    );
  }

  return (
    <section className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-200 pb-5">
        <div>
          <Eyebrow>Gestión de Bodega</Eyebrow>
          <h1 className="font-display text-2xl font-bold text-slate-900 sm:text-3xl">
            Inventario de Alimentos
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Gestión y seguimiento de lotes de alimentos donados con priorización FEFO.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            onClick={fetchData}
            disabled={refreshing}
            className="flex items-center gap-2 py-2 px-3 text-xs"
          >
            <LuRefreshCw className={`size-4 ${refreshing ? 'animate-spin' : ''}`} />
            <span>Actualizar</span>
          </Button>
          <Link to="/donations">
            <Button className="flex items-center gap-2 py-2 px-3 text-xs">
              <LuPlus className="size-4" />
              <span>Registrar Donación</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Filters Bar matching Figura 5 */}
      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
        <div className="flex items-center gap-2 pb-3 text-xs font-bold uppercase tracking-wider text-slate-500 border-b border-slate-100">
          <LuFilter className="size-4 text-emerald-600" />
          <span>Filtros de Búsqueda</span>
        </div>
        <div className="mt-3 grid gap-3 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-5">
          {/* Text search */}
          <div className="relative lg:col-span-2">
            <input
              type="text"
              placeholder="Buscar por lote, producto o donante..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-lg border border-slate-300 pl-9 pr-3 py-2 text-sm text-slate-800 placeholder-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
            <LuSearch className="absolute left-3 top-2.5 size-4 text-slate-400" />
          </div>

          {/* Categoría */}
          <div>
            <select
              value={selectedCategoria}
              onChange={(e) => setSelectedCategoria(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-800 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            >
              <option value="">Todas las categorías</option>
              {categorias.map((cat) => (
                <option key={cat.id} value={cat.nombre}>
                  {cat.nombre}
                </option>
              ))}
            </select>
          </div>

          {/* Estado */}
          <div>
            <select
              value={selectedEstado}
              onChange={(e) => setSelectedEstado(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-800 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            >
              <option value="">Todos los estados</option>
              <option value="DISPONIBLE">DISPONIBLE</option>
              <option value="PROXIMO_A_VENCER">PRÓXIMO A VENCER</option>
              <option value="VENCIDO">VENCIDO</option>
              <option value="AGOTADO">AGOTADO</option>
            </select>
          </div>

          {/* Ubicación */}
          <div>
            <select
              value={selectedUbicacion}
              onChange={(e) => setSelectedUbicacion(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-800 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            >
              <option value="">Todas las ubicaciones</option>
              {ubicaciones.map((ub) => (
                <option key={ub.id} value={ub.codigo}>
                  {ub.codigo} - {ub.nombre}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Clear filters row */}
        {(searchQuery || selectedCategoria || selectedEstado || selectedUbicacion) && (
          <div className="mt-3 pt-3 border-t border-slate-100 flex justify-end">
            <button
              type="button"
              onClick={handleClearFilters}
              className="text-xs font-semibold text-slate-500 hover:text-slate-800 underline"
            >
              Limpiar todos los filtros
            </button>
          </div>
        )}
      </div>

      {/* Main Inventory Table matching Figura 5 */}
      <DataTable
        headers={[
          'Lote',
          'Producto',
          'Cantidad',
          'Fecha Vencimiento',
          'Días Restantes',
          'Ubicación',
          'Estado',
          'Acciones',
        ]}
        emptyMessage="No se encontraron lotes que coincidan con los criterios de búsqueda."
      >
        {filteredLotes.map((lote) => (
          <tr key={lote.id} className="border-b border-slate-100 hover:bg-slate-50/70 transition">
            <td className="px-4 py-3 font-mono text-xs font-bold text-slate-900">
              {lote.numeroLote}
            </td>
            <td className="px-4 py-3">
              <div className="font-semibold text-slate-900">{lote.productoNombre}</div>
              <div className="flex items-center gap-2 mt-0.5">
                {lote.categoriaNombre && (
                  <span className="text-xs text-slate-500">{lote.categoriaNombre}</span>
                )}
                {lote.esPerecedero ? (
                  <span className="rounded bg-amber-50 px-1.5 py-0.2 text-[10px] font-bold text-amber-700 border border-amber-200">
                    Perecedero
                  </span>
                ) : (
                  <span className="rounded bg-blue-50 px-1.5 py-0.2 text-[10px] font-bold text-blue-700 border border-blue-200">
                    No perecedero
                  </span>
                )}
              </div>
            </td>
            <td className="px-4 py-3">
              <span className="font-bold text-slate-900">{lote.cantidadDisponible}</span>{' '}
              <span className="text-xs text-slate-500">/ {lote.cantidadInicial} {lote.unidadMedida}</span>
            </td>
            <td className="px-4 py-3 text-slate-600 text-xs font-mono">
              {lote.fechaVencimiento}
            </td>
            <td className="px-4 py-3">
              {getDiasRestantesBadge(lote.diasRestantes)}
            </td>
            <td className="px-4 py-3">
              <div className="inline-flex items-center gap-1 text-xs text-slate-700 font-medium">
                <LuMapPin className="size-3.5 text-slate-400" />
                <span>{lote.ubicacionCodigo || 'Sin asignar'}</span>
              </div>
            </td>
            <td className="px-4 py-3">
              {getEstadoBadge(lote.estado)}
            </td>
            <td className="px-4 py-3">
              <button
                type="button"
                onClick={() => setSelectedLote(lote)}
                className="inline-flex items-center gap-1 rounded px-2 py-1 text-xs font-semibold text-emerald-700 hover:bg-emerald-50 transition"
              >
                <LuEye className="size-3.5" />
                <span>Detalle</span>
              </button>
            </td>
          </tr>
        ))}
      </DataTable>

      {/* Bottom KPI Statistics Cards matching Figura 5 */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 pt-2">
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Total de Lotes
            </span>
            <span className="grid size-8 place-items-center rounded-lg bg-blue-50 text-blue-700">
              <LuBoxes className="size-4" />
            </span>
          </div>
          <p className="mt-2 font-display text-2xl font-extrabold text-slate-900">
            {stats.totalLotes}
          </p>
          <p className="mt-1 text-xs text-slate-500">Registrados en el banco</p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Stock Total
            </span>
            <span className="grid size-8 place-items-center rounded-lg bg-emerald-50 text-emerald-700">
              <LuPackage className="size-4" />
            </span>
          </div>
          <p className="mt-2 font-display text-2xl font-extrabold text-slate-900">
            {stats.stockTotal.toLocaleString()}
          </p>
          <p className="mt-1 text-xs text-slate-500">Unidades / kg disponibles</p>
        </div>

        <div className="rounded-xl border border-amber-200 bg-amber-50/50 p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-800">
              Próximos a Vencer
            </span>
            <span className="grid size-8 place-items-center rounded-lg bg-amber-100 text-amber-800">
              <LuClock className="size-4" />
            </span>
          </div>
          <p className="mt-2 font-display text-2xl font-extrabold text-amber-950">
            {stats.proximosAVencer}
          </p>
          <p className="mt-1 text-xs text-amber-700">En los próximos 30 días (FEFO)</p>
        </div>

        <div className="rounded-xl border border-red-200 bg-red-50/50 p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-red-800">
              Lotes Vencidos
            </span>
            <span className="grid size-8 place-items-center rounded-lg bg-red-100 text-red-800">
              <LuTriangleAlert className="size-4" />
            </span>
          </div>
          <p className="mt-2 font-display text-2xl font-extrabold text-red-950">
            {stats.vencidos}
          </p>
          <p className="mt-1 text-xs text-red-700">Requieren disposición / baja</p>
        </div>
      </div>

      {/* Lot Detail Modal */}
      {selectedLote && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl animate-in fade-in duration-200">
            <div className="flex items-start justify-between border-b border-slate-100 pb-4">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">
                  Ficha de Trazabilidad de Lote
                </span>
                <h3 className="mt-1 font-display text-xl font-bold text-slate-900">
                  {selectedLote.numeroLote}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedLote(null)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              >
                <LuX className="size-5" />
              </button>
            </div>

            <div className="mt-4 space-y-4">
              <div className="grid grid-cols-2 gap-3 rounded-xl bg-slate-50 p-4 text-xs">
                <div>
                  <span className="text-slate-500">Producto:</span>
                  <p className="mt-0.5 font-bold text-slate-800">{selectedLote.productoNombre}</p>
                </div>
                <div>
                  <span className="text-slate-500">Categoría:</span>
                  <p className="mt-0.5 font-bold text-slate-800">{selectedLote.categoriaNombre || 'Sin categoría'}</p>
                </div>
                <div>
                  <span className="text-slate-500">Tipo:</span>
                  <p className="mt-0.5 font-bold text-slate-800">
                    {selectedLote.esPerecedero ? 'Perecedero (Refrigeración)' : 'No Perecedero'}
                  </p>
                </div>
                <div>
                  <span className="text-slate-500">Estado:</span>
                  <div className="mt-0.5">{getEstadoBadge(selectedLote.estado)}</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="rounded-lg border border-slate-200 p-3">
                  <span className="text-slate-500">Cantidad Disponible:</span>
                  <p className="mt-1 font-mono text-base font-extrabold text-emerald-700">
                    {selectedLote.cantidadDisponible} {selectedLote.unidadMedida}
                  </p>
                  <p className="text-[11px] text-slate-400">Inicial: {selectedLote.cantidadInicial} {selectedLote.unidadMedida}</p>
                </div>

                <div className="rounded-lg border border-slate-200 p-3">
                  <span className="text-slate-500">Días para Vencimiento:</span>
                  <div className="mt-1">{getDiasRestantesBadge(selectedLote.diasRestantes)}</div>
                  <p className="text-[11px] text-slate-400">Vence: {selectedLote.fechaVencimiento}</p>
                </div>
              </div>

              <div className="rounded-lg border border-slate-200 p-3 text-xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Ubicación física:</span>
                  <span className="font-semibold text-slate-800">
                    {selectedLote.ubicacionCodigo} - {selectedLote.ubicacionNombre}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Fecha de Ingreso:</span>
                  <span className="font-medium text-slate-800 font-mono">{selectedLote.fechaIngreso}</span>
                </div>
                {selectedLote.donanteNombre && (
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Donante Origen:</span>
                    <span className="font-medium text-emerald-800">{selectedLote.donanteNombre}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <Button onClick={() => setSelectedLote(null)}>Cerrar</Button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
