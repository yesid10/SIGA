import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { Badge } from '../../components/atoms/Badge';
import { Button } from '../../components/atoms/Button';
import { Eyebrow } from '../../components/atoms/Typography';
import { DataTable } from '../../components/organisms/DataTable';
import { createCategoria, deleteCategoria, getCategorias, updateCategoria } from '../../services/categorias';
import type { Categoria } from '../../types/catalogs';

export const CategoriesPage = () => {
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [loading, setLoading] = useState(true);

  const [modalAbierto, setModalAbierto] = useState(false);
  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState('');
  const [editandoId, setEditandoId] = useState<number | null>(null);

  const cargarCategorias = async () => {
    try {
      setLoading(true);
      const data = await getCategorias();
      setCategorias(data);
    } catch {
      // Ignorar error inicial
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void cargarCategorias();
  }, []);

const abrirModal = () => {
  setEditandoId(null);
  setNombre('');
  setDescripcion('');
  setError('');
  setModalAbierto(true);
};

const abrirEditar = (cat: Categoria) => {
  setEditandoId(cat.id);
  setNombre(cat.nombre);
  setDescripcion(cat.descripcion ?? '');
  setError('');
  setModalAbierto(true);
};

  const cerrarModal = () => {
    if (!guardando) setModalAbierto(false);
  };

const guardarCategoria = async (e: FormEvent) => {
  e.preventDefault();
  if (!nombre.trim()) {
    setError('El nombre es obligatorio.');
    return;
  }
  const request = { nombre: nombre.trim(), descripcion: descripcion.trim() };
  try {
    setGuardando(true);
    setError('');
    if (editandoId === null) {
      await createCategoria(request);
    } else {
      await updateCategoria(editandoId, request);
    }
    setModalAbierto(false);
    await cargarCategorias();
  } catch (err) {
    const mensaje = (err as { response?: { data?: { message?: string } } }).response?.data?.message;
    setError(mensaje ?? 'No se pudo guardar la categoría. Intenta de nuevo.');
  } finally {
    setGuardando(false);
  }
};

const borrarCategoria = async (cat: Categoria) => {
  if (!window.confirm(`¿Seguro que quieres borrar la categoría "${cat.nombre}"?`)) return;
  try {
    await deleteCategoria(cat.id);
    await cargarCategorias();
  } catch (err) {
    const mensaje = (err as { response?: { data?: { message?: string } } }).response?.data?.message;
    window.alert(mensaje ?? 'No se pudo borrar la categoría. Intenta de nuevo.');
  }
};

  return (
    <section className="mx-auto max-w-6xl">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <Eyebrow>Catálogo</Eyebrow>
          <h1 className="font-display text-3xl font-extrabold text-slate-900">Categorías de Productos</h1>
          <p className="mt-1 text-sm text-slate-500">
            Clasificación de los alimentos que maneja el banco.
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="primary" type="button" onClick={abrirModal}>
            Nueva categoría
          </Button>
          <Button variant="primary" type="button" onClick={() => void cargarCategorias()}>
            Actualizar
          </Button>
        </div>
      </div>

      <div className="mt-8">
        <DataTable
          headers={['Nombre', 'Descripción', 'Estado', 'Acciones']}
          emptyMessage={loading ? 'Cargando categorías...' : 'No hay categorías registradas.'}
        >
          {categorias.map((cat) => (
            <tr className="border-b border-slate-100 transition hover:bg-slate-50/70" key={cat.id}>
              <td className="px-4 py-3 font-semibold text-slate-900">{cat.nombre}</td>
              <td className="px-4 py-3 text-slate-600">{cat.descripcion || 'Sin descripción'}</td>
              <td className="px-4 py-3">
                {cat.activo ? (
                  <Badge className="bg-emerald-100 text-emerald-900">Activa</Badge>
                ) : (
                  <Badge className="bg-slate-100 text-slate-600">Inactiva</Badge>
                )}
              </td>
                            <td className="px-4 py-3">
                <button
                  type="button"
                  className="rounded-lg px-3 py-1.5 text-sm font-semibold text-emerald-800 hover:bg-emerald-50"
                  onClick={() => abrirEditar(cat)}
                >
                  Editar
                </button>
                <button
                  type="button"
                  className="rounded-lg px-3 py-1.5 text-sm font-semibold text-red-700 hover:bg-red-50"
                  onClick={() => void borrarCategoria(cat)}
                >
                  Borrar
                </button>
              </td>
            </tr>
          ))}
        </DataTable>
      </div>

      {modalAbierto && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4"
          onClick={cerrarModal}
        >
          <form
            className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
            onSubmit={(e) => void guardarCategoria(e)}
          >
            <h2 className="font-display text-xl font-extrabold text-slate-900">{editandoId === null ? 'Nueva categoría' : 'Editar categoría'}</h2>

            <label className="mt-5 block text-sm font-semibold text-slate-700" htmlFor="cat-nombre">
              Nombre
            </label>
            <input
              id="cat-nombre"
              className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-2.5 text-slate-900 outline-none focus:border-emerald-600"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              maxLength={100}
              autoFocus
            />

            <label className="mt-4 block text-sm font-semibold text-slate-700" htmlFor="cat-descripcion">
              Descripción (opcional)
            </label>
            <textarea
              id="cat-descripcion"
              className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-2.5 text-slate-900 outline-none focus:border-emerald-600"
              rows={3}
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
            />

            {error && (
              <p className="mt-4 rounded-xl border border-red-100 bg-red-50 px-4 py-2 text-sm text-red-700">
                {error}
              </p>
            )}

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                className="rounded-xl px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100"
                onClick={cerrarModal}
                disabled={guardando}
              >
                Cancelar
              </button>
              <Button variant="primary" type="submit" disabled={guardando}>
                {guardando ? 'Guardando...' : 'Guardar'}
              </Button>
            </div>
          </form>
        </div>
      )}
    </section>
  );
};