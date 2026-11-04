import { useEffect, useState } from 'react';
import { Badge } from '../../components/atoms/Badge';
import { Button } from '../../components/atoms/Button';
import { Eyebrow } from '../../components/atoms/Typography';
import { DataTable } from '../../components/organisms/DataTable';
import { getDonantes } from '../../services/donantes';
import type { Donante } from '../../types/catalogs';

export const DonorsPage = () => {
  const [donantes, setDonantes] = useState<Donante[]>([]);
  const [loading, setLoading] = useState(true);

  const cargarDonantes = async () => {
    try {
      setLoading(true);
      const data = await getDonantes();
      setDonantes(data);
    } catch {
      // Ignorar error inicial
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void cargarDonantes();
  }, []);

  return (
    <section className="mx-auto max-w-6xl">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <Eyebrow>Entrada de Alimentos</Eyebrow>
          <h1 className="font-display text-3xl font-extrabold text-slate-900">Directorio de Donantes</h1>
          <p className="mt-1 text-sm text-slate-500">
            Registro de personas naturales y empresas donantes (RF-01).
          </p>
        </div>
        <Button variant="primary" type="button" onClick={() => void cargarDonantes()}>
          Actualizar
        </Button>
      </div>

      <div className="mt-8">
        <DataTable
          headers={['Identificación', 'Nombre / Razón Social', 'Tipo', 'Contacto', 'Estado']}
          emptyMessage={loading ? 'Cargando donantes...' : 'No hay donantes registrados aún.'}
        >
          {donantes.map((don) => (
            <tr className="border-b border-slate-100 transition hover:bg-slate-50/70" key={don.id}>
              <td className="px-4 py-3 font-mono text-xs font-bold text-slate-700">{don.identificacion}</td>
              <td className="px-4 py-3 font-semibold text-slate-900">
                <div>{don.nombre}</div>
                {don.direccion && <div className="text-xs text-slate-400">{don.direccion}</div>}
              </td>
              <td className="px-4 py-3">
                {don.tipo === 'EMPRESA' ? (
                  <Badge className="bg-indigo-100 text-indigo-900">Empresa</Badge>
                ) : (
                  <Badge className="bg-emerald-100 text-emerald-900">Persona Natural</Badge>
                )}
              </td>
              <td className="px-4 py-3 text-xs text-slate-600">
                <div>{don.email ?? 'Sin correo'}</div>
                <div className="text-slate-400">{don.telefono ?? 'Sin teléfono'}</div>
              </td>
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
