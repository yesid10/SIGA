import { useEffect, useState } from 'react';
import { Badge } from '../../components/atoms/Badge';
import { Button } from '../../components/atoms/Button';
import { Eyebrow } from '../../components/atoms/Typography';
import { DataTable } from '../../components/organisms/DataTable';
import { getProductos } from '../../services/productos';
import { getCategorias } from '../../services/categorias';
import type { Producto, Categoria } from '../../types/catalogs';

export const ProductsPage = () => {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtroPerecedero, setFiltroPerecedero] = useState<string>('todos');
  const [filtroCategoria, setFiltroCategoria] = useState<string>('todas');

  const cargarDatos = async () => {
    try {
      setLoading(true);
      const [prods, cats] = await Promise.all([
        getProductos(),
        getCategorias(),
      ]);
      setProductos(prods);
      setCategorias(cats);
    } catch {
      // Ignorar error de carga inicial
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void cargarDatos();
  }, []);

  const productosFiltrados = productos.filter((p) => {
    if (filtroCategoria !== 'todas' && p.categoriaId !== Number(filtroCategoria)) return false;
    if (filtroPerecedero === 'perecedero') return p.esPerecedero;
    if (filtroPerecedero === 'no-perecedero') return !p.esPerecedero;
    return true;
  });

  return (
    <section className="mx-auto max-w-6xl">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <Eyebrow>Catálogo Maestro</Eyebrow>
          <h1 className="font-display text-3xl font-extrabold text-slate-900">Productos y Categorías</h1>
          <p className="mt-1 text-sm text-slate-500">
            Clasificación de alimentos y control de condición perecedera (RF-03).
          </p>
        </div>
        <div className="flex items-center gap-3">
          <select
            className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none focus:border-emerald-700"
            value={filtroCategoria}
            onChange={(e) => setFiltroCategoria(e.target.value)}
          >
            <option value="todas">Todas las categorías</option>
            {categorias.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nombre}
              </option>
            ))}
          </select>
          <select
            className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none focus:border-emerald-700"
            value={filtroPerecedero}
            onChange={(e) => setFiltroPerecedero(e.target.value)}
          >
            <option value="todos">Todos los tipos</option>
            <option value="perecedero">Solo Perecederos</option>
            <option value="no-perecedero">No Perecederos</option>
          </select>
          <Button variant="primary" type="button" onClick={() => void cargarDatos()}>
            Actualizar
          </Button>
        </div>
      </div>

      <div className="mt-8">
        <DataTable
          headers={['ID', 'Nombre', 'Categoría', 'Perecedero', 'Unidad de Medida', 'Estado']}
          emptyMessage={loading ? 'Cargando catálogo...' : 'No hay productos registrados.'}
        >
          {productosFiltrados.map((prod) => (
            <tr className="border-b border-slate-100 transition hover:bg-slate-50/70" key={prod.id}>
              <td className="px-4 py-3 font-mono text-xs text-slate-400">#{prod.id}</td>
              <td className="px-4 py-3 font-semibold text-slate-900">
                <div>{prod.nombre}</div>
                {prod.descripcion && <div className="text-xs text-slate-400">{prod.descripcion}</div>}
              </td>
              <td className="px-4 py-3 text-slate-600">{prod.categoriaNombre ?? 'General'}</td>
              <td className="px-4 py-3">
                {prod.esPerecedero ? (
                  <Badge className="bg-amber-100 text-amber-900">Perecedero (Frío)</Badge>
                ) : (
                  <Badge className="bg-slate-100 text-slate-800">No perecedero (Seco)</Badge>
                )}
              </td>
              <td className="px-4 py-3 text-slate-600 font-medium">{prod.unidadMedida}</td>
              <td className="px-4 py-3">
                <span className="inline-flex size-2 rounded-full bg-emerald-500" />
                <span className="ml-1.5 text-xs text-slate-600">Activo</span>
              </td>
            </tr>
          ))}
        </DataTable>
      </div>
    </section>
  );
};
