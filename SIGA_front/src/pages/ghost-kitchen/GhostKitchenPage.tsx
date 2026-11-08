import React, { useEffect, useState, useMemo } from 'react';
import {
  LuUtensilsCrossed,
  LuRefreshCw,
  LuSearch,
  LuCircleCheck,
  LuCircleAlert,
  LuTags,
  LuBanknote,
  LuEye,
  LuX,
  LuFlame,
} from 'react-icons/lu';
import { Button } from '../../components/atoms/Button';
import { Eyebrow } from '../../components/atoms/Typography';
import { Card, CardContent } from '../../components/ui/card';
import { getGhostKitchenCatalog } from '../../services/ghostKitchen';
import type { GhostKitchenCatalogResponse, GhostKitchenPlato } from '../../types/ghostKitchen';

export const GhostKitchenPage: React.FC = () => {
  const [catalog, setCatalog] = useState<GhostKitchenCatalogResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Filtros
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategoria, setSelectedCategoria] = useState<string>('todas');
  const [soloDisponibles, setSoloDisponibles] = useState(false);

  // Modal de Detalle
  const [selectedPlato, setSelectedPlato] = useState<GhostKitchenPlato | null>(null);

  const loadCatalog = async (forceRefresh = false) => {
    try {
      if (forceRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);
      const data = await getGhostKitchenCatalog(forceRefresh);
      setCatalog(data);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al conectar con la API de Ghost Kitchen';
      setError(msg);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadCatalog(false);
  }, []);

  const formatCOP = (valor: number): string => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      maximumFractionDigits: 0,
    }).format(valor);
  };

  const platosFiltrados = useMemo(() => {
    if (!catalog?.platos) return [];

    return catalog.platos.filter((plato) => {
      // Búsqueda por texto (nombre o descripción)
      const matchesSearch =
        plato.nombre.toLowerCase().includes(searchQuery.toLowerCase()) ||
        plato.descripcion.toLowerCase().includes(searchQuery.toLowerCase());

      // Filtro de categoría
      const matchesCategoria =
        selectedCategoria === 'todas' ||
        plato.categoriaId.toString() === selectedCategoria ||
        plato.categoriaNombre.toLowerCase() === selectedCategoria.toLowerCase();

      // Filtro de stock disponible
      const matchesDisponibilidad = !soloDisponibles || plato.cantidadDisponible > 0;

      return matchesSearch && matchesCategoria && matchesDisponibilidad;
    });
  }, [catalog, searchQuery, selectedCategoria, soloDisponibles]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <div className="size-10 animate-spin rounded-full border-3 border-emerald-600 border-t-transparent" />
        <div className="text-center">
          <p className="font-semibold text-slate-800 text-lg">Consultando UDS Externa...</p>
          <p className="text-sm text-slate-500">Conectando con la API de Ghost Kitchen (Render)</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Encabezado */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Eyebrow className="text-emerald-700 font-semibold tracking-wider">
              INTEGRACIÓN EXTERNA M2M · UDS ALIADA
            </Eyebrow>
            {catalog?.origenEnLinea ? (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800 border border-emerald-300">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                En Línea
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800 border border-amber-300">
                <span className="w-2 h-2 rounded-full bg-amber-500" />
                Modo Contingencia / Caché
              </span>
            )}
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 flex items-center gap-2">
            <LuUtensilsCrossed className="text-emerald-600" />
            Catálogo Ghost Kitchen
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Platos preparados, categorías y disponibilidad en tiempo real consumidos directamente desde la cocina aliada.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={() => loadCatalog(true)}
            disabled={refreshing}
            className="flex items-center gap-2 border-slate-300 text-slate-700 hover:bg-slate-50"
          >
            <LuRefreshCw className={`w-4 h-4 text-emerald-600 ${refreshing ? 'animate-spin' : ''}`} />
            {refreshing ? 'Sincronizando...' : 'Sincronizar ahora'}
          </Button>
        </div>
      </div>

      {/* Alerta si hubo error */}
      {error && (
        <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-xl text-amber-800">
          <LuCircleAlert className="w-5 h-5 mt-0.5 shrink-0 text-amber-600" />
          <div className="text-sm">
            <p className="font-semibold">Aviso de conexión externa</p>
            <p>{error}. Se están mostrando los datos de respaldo en memoria.</p>
          </div>
        </div>
      )}

      {/* Tarjetas KPI de Resumen */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="border-slate-200/80 shadow-xs">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
              <LuFlame className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Total Platos</p>
              <p className="text-2xl font-bold text-slate-900">{catalog?.totalPlatos ?? 0}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200/80 shadow-xs">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-3 bg-teal-50 text-teal-600 rounded-xl">
              <LuCircleCheck className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">En Stock</p>
              <p className="text-2xl font-bold text-teal-700">{catalog?.platosDisponibles ?? 0}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200/80 shadow-xs">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
              <LuTags className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Categorías</p>
              <p className="text-2xl font-bold text-slate-900">{catalog?.categorias?.length ?? 0}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200/80 shadow-xs">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
              <LuBanknote className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Moneda</p>
              <p className="text-2xl font-bold text-slate-900">{catalog?.moneda ?? 'COP'}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Barra de Filtros y Búsqueda */}
      <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row gap-3">
          {/* Buscador */}
          <div className="relative flex-1">
            <LuSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Buscar plato o ingrediente..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition"
            />
          </div>

          {/* Selector de disponibilidad */}
          <button
            type="button"
            onClick={() => setSoloDisponibles(!soloDisponibles)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border transition ${
              soloDisponibles
                ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                : 'bg-white text-slate-600 border-slate-300 hover:bg-slate-50'
            }`}
          >
            <span
              className={`w-3.5 h-3.5 rounded-sm flex items-center justify-center border ${
                soloDisponibles ? 'bg-emerald-600 border-emerald-600 text-white' : 'border-slate-400'
              }`}
            >
              {soloDisponibles && '✓'}
            </span>
            Solo en stock
          </button>
        </div>

        {/* Pestañas de categorías */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-1 border-t border-slate-100">
          <button
            type="button"
            onClick={() => setSelectedCategoria('todas')}
            className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition ${
              selectedCategoria === 'todas'
                ? 'bg-emerald-700 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Todas las categorías ({catalog?.platos?.length ?? 0})
          </button>
          {catalog?.categorias?.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setSelectedCategoria(cat.nombre)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition ${
                selectedCategoria.toLowerCase() === cat.nombre.toLowerCase()
                  ? 'bg-emerald-700 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cat.nombre}
            </button>
          ))}
        </div>
      </div>

      {/* Grid de Platos */}
      {platosFiltrados.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-3">
          <div className="w-16 h-16 mx-auto bg-slate-100 text-slate-400 rounded-full flex items-center justify-center">
            <LuUtensilsCrossed className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-slate-800">No se encontraron platos</h3>
          <p className="text-sm text-slate-500 max-w-md mx-auto">
            No hay productos que coincidan con los criterios de búsqueda o filtros seleccionados.
          </p>
          <Button
            variant="outline"
            onClick={() => {
              setSearchQuery('');
              setSelectedCategoria('todas');
              setSoloDisponibles(false);
            }}
          >
            Restablecer filtros
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {platosFiltrados.map((plato) => (
            <div
              key={plato.id}
              className="bg-white rounded-2xl border border-slate-200/90 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col overflow-hidden group"
            >
              {/* Imagen del plato */}
              <div className="relative aspect-video w-full bg-slate-100 overflow-hidden">
                {plato.imagenUrl ? (
                  <img
                    src={plato.imagenUrl}
                    alt={plato.nombre}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                    onError={(e) => {
                      // Fallback en caso de que la imagen de Render falle
                      const target = e.target as HTMLImageElement;
                      target.onerror = null;
                      target.src = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80';
                    }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-emerald-50 text-emerald-400">
                    <LuUtensilsCrossed className="w-12 h-12" />
                  </div>
                )}

                {/* Badge de Categoría flotante */}
                <span className="absolute top-3 left-3 bg-white/90 backdrop-blur-xs text-slate-800 font-semibold text-xs px-2.5 py-1 rounded-full shadow-xs border border-white/60">
                  {plato.categoriaNombre}
                </span>

                {/* Badge de Stock flotante */}
                <div className="absolute top-3 right-3">
                  {plato.cantidadDisponible > 0 ? (
                    <span className="bg-emerald-600/95 text-white font-semibold text-xs px-2.5 py-1 rounded-full shadow-xs backdrop-blur-xs flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-white" />
                      Stock: {plato.cantidadDisponible}
                    </span>
                  ) : (
                    <span className="bg-rose-600/95 text-white font-semibold text-xs px-2.5 py-1 rounded-full shadow-xs backdrop-blur-xs">
                      Agotado
                    </span>
                  )}
                </div>
              </div>

              {/* Contenido */}
              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="font-bold text-lg text-slate-900 group-hover:text-emerald-700 transition-colors">
                    {plato.nombre}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                    {plato.descripcion || 'Sin descripción disponible del proveedor.'}
                  </p>
                </div>

                <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between">
                  <div>
                    <p className="text-[10px] uppercase font-semibold text-slate-400 tracking-wider">Precio UDS</p>
                    <p className="text-xl font-extrabold text-emerald-700">{formatCOP(plato.precio)}</p>
                  </div>

                  <Button
                    variant="outline"
                    onClick={() => setSelectedPlato(plato)}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs border-slate-300 hover:border-emerald-600 hover:text-emerald-700 text-slate-700"
                  >
                    <LuEye className="w-4 h-4" />
                    Detalle
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal de Detalle */}
      {selectedPlato && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl border border-slate-100">
            {/* Imagen del modal */}
            <div className="relative aspect-video w-full bg-slate-100">
              {selectedPlato.imagenUrl ? (
                <img
                  src={selectedPlato.imagenUrl}
                  alt={selectedPlato.nombre}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.onerror = null;
                    target.src = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80';
                  }}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-emerald-50 text-emerald-400">
                  <LuUtensilsCrossed className="w-16 h-16" />
                </div>
              )}
              <button
                type="button"
                onClick={() => setSelectedPlato(null)}
                className="absolute top-3 right-3 p-2 rounded-full bg-white/90 hover:bg-white text-slate-700 shadow-md transition"
              >
                <LuX className="w-5 h-5" />
              </button>
              <span className="absolute bottom-3 left-3 bg-slate-900/80 backdrop-blur-xs text-white text-xs px-3 py-1 rounded-full font-medium">
                {selectedPlato.categoriaNombre}
              </span>
            </div>

            {/* Información detallada */}
            <div className="p-6 space-y-4">
              <div>
                <h3 className="text-xl font-bold text-slate-900">{selectedPlato.nombre}</h3>
                <p className="text-sm text-slate-600 mt-2 leading-relaxed">{selectedPlato.descripcion}</p>
              </div>

              {/* Grid de especificaciones */}
              <div className="grid grid-cols-2 gap-3 p-4 bg-slate-50 rounded-xl border border-slate-100 text-sm">
                <div>
                  <span className="text-xs text-slate-400 uppercase font-medium">Precio Unitario</span>
                  <p className="text-lg font-bold text-emerald-700">{formatCOP(selectedPlato.precio)}</p>
                </div>
                <div>
                  <span className="text-xs text-slate-400 uppercase font-medium">Disponibilidad</span>
                  <p className={`font-semibold ${selectedPlato.cantidadDisponible > 0 ? 'text-emerald-700' : 'text-rose-600'}`}>
                    {selectedPlato.cantidadDisponible > 0
                      ? `${selectedPlato.cantidadDisponible} disponibles`
                      : 'Sin existencias'}
                  </p>
                </div>
                <div>
                  <span className="text-xs text-slate-400 uppercase font-medium">Cantidad Reservada</span>
                  <p className="font-semibold text-slate-800">{selectedPlato.cantidadReservada} unidades</p>
                </div>
                <div>
                  <span className="text-xs text-slate-400 uppercase font-medium">ID en Ghost Kitchen</span>
                  <p className="font-semibold text-slate-800">#{selectedPlato.id}</p>
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <Button variant="primary" onClick={() => setSelectedPlato(null)}>
                  Cerrar
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GhostKitchenPage;
