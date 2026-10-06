import { useEffect, useState } from 'react';
import { Badge } from '../../components/atoms/Badge';
import { Button } from '../../components/atoms/Button';
import { Eyebrow } from '../../components/atoms/Typography';
import { DataTable } from '../../components/organisms/DataTable';
import { getUbicaciones } from '../../services/ubicaciones';
import type { Ubicacion } from '../../types/catalogs';

export const LocationsPage = () => {
  const [ubicaciones, setUbicaciones] = useState<Ubicacion[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtroTipo, setFiltroTipo] = useState<string>('todos');

  const cargarUbicaciones = async () => {
    try {
      setLoading(true);
      const data = await getUbicaciones();
      setUbicaciones(data);
    } catch {
      // Ignorar error inicial
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void cargarUbicaciones();
  }, []);

  const ubicacionesFiltradas = ubicaciones.filter((u) => {
    if (filtroTipo === 'SECO') return u.tipo === 'SECO';
    if (filtroTipo === 'REFRIGERADO') return u.tipo === 'REFRIGERADO';
    return true;
  });

  return (
    <section className="mx-auto max-w-6xl">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <Eyebrow>Almacenamiento</Eyebrow>
          <h1 className="font-display text-3xl font-extrabold text-slate-900">Ubicaciones de Bodega</h1>
          <p className="mt-1 text-sm text-slate-500">
            Control de estantes y cámaras frigoríficas (RF-13, RF-14).
          </p>
        </div>
        <div className="flex items-center gap-3">
          <select
            className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none focus:border-emerald-700"
            value={filtroTipo}
            onChange={(e) => setFiltroTipo(e.target.value)}
          >
            <option value="todos">Todos los tipos</option>
            <option value="SECO">Seco (No perecederos)</option>
            <option value="REFRIGERADO">Refrigerado (Perecederos)</option>
          </select>
          <Button variant="primary" type="button" onClick={() => void cargarUbicaciones()}>
            Actualizar
          </Button>
        </div>
      </div>

      <div className="mt-8">
        <DataTable
          headers={['Código', 'Nombre', 'Tipo de Almacén', 'Capacidad Máx.', 'Regla RF-14']}
          emptyMessage={loading ? 'Cargando ubicaciones...' : 'No hay ubicaciones registradas.'}
        >
          {ubicacionesFiltradas.map((ubi) => (
            <tr className="border-b border-slate-100 transition hover:bg-slate-50/70" key={ubi.id}>
              <td className="px-4 py-3 font-mono text-xs font-bold text-slate-700">{ubi.codigo}</td>
              <td className="px-4 py-3 font-semibold text-slate-900">{ubi.nombre}</td>
              <td className="px-4 py-3">
                {ubi.tipo === 'REFRIGERADO' ? (
                  <Badge className="bg-sky-100 text-sky-900">Refrigerado</Badge>
                ) : (
                  <Badge className="bg-amber-100 text-amber-900">Seco</Badge>
                )}
              </td>
              <td className="px-4 py-3 text-slate-600 font-medium">
                {ubi.capacidadMaxima != null ? `${ubi.capacidadMaxima} kg` : 'Sin límite'}
              </td>
              <td className="px-4 py-3 text-xs text-slate-500">
                {ubi.tipo === 'REFRIGERADO'
                  ? 'Permite perecederos y no perecederos'
                  : 'Rechaza perecederos estrictamente'}
              </td>
            </tr>
          ))}
        </DataTable>
      </div>
    </section>
  );
};
