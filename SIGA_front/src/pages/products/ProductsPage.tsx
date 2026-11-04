import React, { useEffect, useState, useMemo } from 'react';
import {
  LuPlus,
  LuSearch,
  LuPencil,
  LuTrash2,
  LuEye,
  LuPackage,
  LuSnowflake,
  LuSun,
  LuX,
  LuTriangleAlert,
  LuRefreshCw,
} from 'react-icons/lu';
import { Button } from '../../components/atoms/Button';
import { Badge } from '../../components/atoms/Badge';
import { Spinner } from '../../components/atoms/Spinner';
import { Eyebrow } from '../../components/atoms/Typography';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '../../components/ui/card';
import { ImageUpload } from '../../components/molecules/ImageUpload';
import { useAuthStore } from '../../stores/authStore';
import {
  getProductos,
  createProducto,
  updateProducto,
  deleteProducto,
} from '../../services/productos';
import { getCategorias } from '../../services/categorias';
import type { Producto, Categoria, ProductoRequest } from '../../types/catalogs';

export const ProductsPage: React.FC = () => {
  const user = useAuthStore((state) => state.user);
  const canEdit = user?.rol === 'ADMINISTRADOR' || user?.rol === 'ENCARGADO';

  const [productos, setProductos] = useState<Producto[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [filtroCategoria, setFiltroCategoria] = useState<string>('todas');
  const [filtroPerecedero, setFiltroPerecedero] = useState<string>('todos');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProducto, setEditingProducto] = useState<Producto | null>(null);
  const [detailProducto, setDetailProducto] = useState<Producto | null>(null);
  const [deletingProducto, setDeletingProducto] = useState<Producto | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);

  // Form State
  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [categoriaId, setCategoriaId] = useState<number | ''>('');
  const [esPerecedero, setEsPerecedero] = useState(false);
  const [unidadMedida, setUnidadMedida] = useState('kg');
  const [imagenUrl, setImagenUrl] = useState<string | null>(null);

  const cargarDatos = async () => {
    try {
      setRefreshing(true);
      const [prods, cats] = await Promise.all([
        getProductos(),
        getCategorias(),
      ]);
      setProductos(prods);
      setCategorias(cats);
    } catch (err) {
      console.error('Error al cargar productos y categorías:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  const resetForm = () => {
    setNombre('');
    setDescripcion('');
    setCategoriaId(categorias[0]?.id ?? '');
    setEsPerecedero(false);
    setUnidadMedida('kg');
    setImagenUrl(null);
    setEditingProducto(null);
    setModalError(null);
  };

  const handleOpenCreateModal = () => {
    resetForm();
    if (categorias.length > 0) {
      setCategoriaId(categorias[0].id);
    }
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (producto: Producto) => {
    setEditingProducto(producto);
    setNombre(producto.nombre);
    setDescripcion(producto.descripcion || '');
    setCategoriaId(producto.categoriaId);
    setEsPerecedero(producto.esPerecedero);
    setUnidadMedida(producto.unidadMedida);
    setImagenUrl(producto.imagenUrl || null);
    setModalError(null);
    setIsModalOpen(true);
  };

  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre.trim()) {
      setModalError('El nombre del producto es obligatorio.');
      return;
    }
    if (!categoriaId) {
      setModalError('Debes seleccionar una categoría.');
      return;
    }
    if (!unidadMedida.trim()) {
      setModalError('La unidad de medida es obligatoria.');
      return;
    }

    try {
      setSubmitting(true);
      setModalError(null);

      const request: ProductoRequest = {
        nombre: nombre.trim(),
        descripcion: descripcion.trim() ? descripcion.trim() : undefined,
        categoriaId: Number(categoriaId),
        esPerecedero,
        unidadMedida: unidadMedida.trim().toLowerCase(),
        imagenUrl: imagenUrl || undefined,
      };

      if (editingProducto) {
        await updateProducto(editingProducto.id, request);
      } else {
        await createProducto(request);
      }

      await cargarDatos();
      setIsModalOpen(false);
      resetForm();
    } catch (err: unknown) {
      console.error('Error al guardar producto:', err);
      setModalError('No se pudo guardar el producto. Verifica los datos ingresados.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deletingProducto) return;
    try {
      setSubmitting(true);
      await deleteProducto(deletingProducto.id);
      await cargarDatos();
      setDeletingProducto(null);
    } catch (err) {
      console.error('Error al eliminar producto:', err);
    } finally {
      setSubmitting(false);
    }
  };

  // Filtered products list
  const productosFiltrados = useMemo(() => {
    return productos.filter((p) => {
      if (filtroCategoria !== 'todas' && p.categoriaId !== Number(filtroCategoria)) {
        return false;
      }
      if (filtroPerecedero === 'perecedero' && !p.esPerecedero) return false;
      if (filtroPerecedero === 'no-perecedero' && p.esPerecedero) return false;

      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchNombre = p.nombre.toLowerCase().includes(query);
        const matchDesc = p.descripcion?.toLowerCase().includes(query) ?? false;
        const matchCat = p.categoriaNombre?.toLowerCase().includes(query) ?? false;
        if (!matchNombre && !matchDesc && !matchCat) return false;
      }

      return true;
    });
  }, [productos, filtroCategoria, filtroPerecedero, searchQuery]);

  return (
    <section className="mx-auto max-w-7xl space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-200 pb-5">
        <div>
          <Eyebrow>Catálogo Maestro</Eyebrow>
          <h1 className="font-display text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
            Catálogo de Productos
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Clasificación de alimentos, almacenamiento fotográfico en Cloudinary y control de temperatura (RF-03).
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="secondary"
            onClick={cargarDatos}
            disabled={refreshing}
            className="flex items-center gap-2"
          >
            <LuRefreshCw className={`size-4 ${refreshing ? 'animate-spin' : ''}`} />
            <span>Actualizar</span>
          </Button>
          {canEdit && (
            <Button
              variant="primary"
              onClick={handleOpenCreateModal}
              className="flex items-center gap-2"
            >
              <LuPlus className="size-4" />
              <span>Nuevo Producto</span>
            </Button>
          )}
        </div>
      </div>

      {/* Filters Toolbar */}
      <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs">
        <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-12">
          {/* Search Input */}
          <div className="relative lg:col-span-6">
            <input
              type="text"
              placeholder="Buscar producto por nombre o descripción..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50/50 pl-10 pr-4 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:border-emerald-700 focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-700 transition"
            />
            <LuSearch className="absolute left-3.5 top-3.5 size-4 text-slate-400" />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <LuX className="size-4" />
              </button>
            )}
          </div>

          {/* Categoría Filter */}
          <div className="lg:col-span-3">
            <select
              value={filtroCategoria}
              onChange={(e) => setFiltroCategoria(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 focus:border-emerald-700 focus:outline-none focus:ring-1 focus:ring-emerald-700 cursor-pointer"
            >
              <option value="todas">Todas las categorías</option>
              {categorias.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nombre}
                </option>
              ))}
            </select>
          </div>

          {/* Perecedero Filter */}
          <div className="lg:col-span-3">
            <select
              value={filtroPerecedero}
              onChange={(e) => setFiltroPerecedero(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 focus:border-emerald-700 focus:outline-none focus:ring-1 focus:ring-emerald-700 cursor-pointer"
            >
              <option value="todos">Todos los tipos de conservación</option>
              <option value="perecedero">Solo Perecederos (Cámara Fría)</option>
              <option value="no-perecedero">No Perecederos (Estantería Seca)</option>
            </select>
          </div>
        </div>

        <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-2 text-xs text-slate-500">
          <span>Mostrando <strong>{productosFiltrados.length}</strong> de {productos.length} productos</span>
          {(searchQuery || filtroCategoria !== 'todas' || filtroPerecedero !== 'todos') && (
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setFiltroCategoria('todas');
                setFiltroPerecedero('todos');
              }}
              className="font-semibold text-emerald-800 hover:text-emerald-950 cursor-pointer underline"
            >
              Limpiar filtros
            </button>
          )}
        </div>
      </div>

      {/* Products Cards Grid matching shadcn & design */}
      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <Spinner />
        </div>
      ) : productosFiltrados.length === 0 ? (
        <div className="rounded-2xl border-2 border-dashed border-slate-200 bg-white p-12 text-center">
          <div className="mx-auto grid size-12 place-items-center rounded-full bg-slate-100 text-slate-500 mb-3">
            <LuPackage className="size-6" />
          </div>
          <h3 className="font-display text-lg font-bold text-slate-800">
            No se encontraron productos
          </h3>
          <p className="mt-1 text-sm text-slate-500 max-w-md mx-auto">
            No hay productos que coincidan con los filtros aplicados. Intenta ajustar la búsqueda o añade uno nuevo.
          </p>
          {canEdit && (
            <Button
              variant="primary"
              onClick={handleOpenCreateModal}
              className="mt-5 inline-flex items-center gap-2"
            >
              <LuPlus className="size-4" />
              <span>Registrar primer producto</span>
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {productosFiltrados.map((producto) => (
            <Card
              key={producto.id}
              className="group overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-xs transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:border-emerald-200 flex flex-col justify-between"
            >
              <div>
                {/* Image Container with Badges */}
                <div className="relative aspect-4/3 w-full overflow-hidden bg-slate-100">
                  {producto.imagenUrl ? (
                    <img
                      src={producto.imagenUrl}
                      alt={producto.nombre}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-108"
                      loading="lazy"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-slate-50 to-slate-200 text-slate-400">
                      <LuPackage className="size-14 transition-transform duration-300 group-hover:scale-110" />
                    </div>
                  )}

                  {/* Badges Overlay */}
                  <div className="absolute top-2.5 left-2.5 flex flex-wrap gap-1.5">
                    {producto.esPerecedero ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/90 backdrop-blur-xs px-2.5 py-0.5 text-[11px] font-bold text-white shadow-xs">
                        <LuSnowflake className="size-3" />
                        Perecedero
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded-full bg-blue-600/90 backdrop-blur-xs px-2.5 py-0.5 text-[11px] font-bold text-white shadow-xs">
                        <LuSun className="size-3" />
                        Seco
                      </span>
                    )}
                  </div>

                  <div className="absolute top-2.5 right-2.5">
                    <span className="rounded-full bg-slate-900/70 backdrop-blur-xs px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white">
                      {producto.unidadMedida}
                    </span>
                  </div>
                </div>

                {/* Card Header & Content */}
                <CardHeader className="p-4 pb-2">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-emerald-800">
                    {producto.categoriaNombre || 'General'}
                  </div>
                  <CardTitle className="mt-1 text-base font-bold text-slate-900 line-clamp-1 group-hover:text-emerald-900 transition-colors">
                    {producto.nombre}
                  </CardTitle>
                </CardHeader>

                <CardContent className="px-4 pb-3">
                  <p className="text-xs text-slate-500 line-clamp-2 min-h-8">
                    {producto.descripcion || 'Sin descripción detallada registrada.'}
                  </p>
                </CardContent>
              </div>

              {/* Card Footer with Actions */}
              <CardFooter className="border-t border-slate-100 bg-slate-50/50 p-3 flex items-center justify-between gap-1">
                <button
                  type="button"
                  onClick={() => setDetailProducto(producto)}
                  className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-200/60 hover:text-slate-900 transition cursor-pointer"
                  title="Ver detalle"
                >
                  <LuEye className="size-3.5" />
                  <span>Detalle</span>
                </button>

                {canEdit && (
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => handleOpenEditModal(producto)}
                      className="rounded-lg p-1.5 text-slate-500 hover:bg-emerald-50 hover:text-emerald-800 transition cursor-pointer"
                      title="Editar producto"
                    >
                      <LuPencil className="size-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeletingProducto(producto)}
                      className="rounded-lg p-1.5 text-slate-500 hover:bg-red-50 hover:text-red-700 transition cursor-pointer"
                      title="Eliminar producto"
                    >
                      <LuTrash2 className="size-4" />
                    </button>
                  </div>
                )}
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      {/* Modal: Crear / Editar Producto */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-800">
                  {editingProducto ? 'Actualizar Producto' : 'Nuevo Registro'}
                </span>
                <h3 className="font-display text-xl font-bold text-slate-900">
                  {editingProducto ? editingProducto.nombre : 'Crear Producto'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 cursor-pointer"
              >
                <LuX className="size-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitForm} className="mt-5 space-y-4">
              {modalError && (
                <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-800 flex items-center gap-2">
                  <LuTriangleAlert className="size-4 shrink-0 text-red-600" />
                  <span>{modalError}</span>
                </div>
              )}

              {/* Nombre */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                  Nombre del Producto *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Arroz Blanco 1kg, Leche Deslactosada..."
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-200 px-3.5 py-2 text-sm text-slate-900 focus:border-emerald-700 focus:outline-none focus:ring-1 focus:ring-emerald-700"
                />
              </div>

              {/* Categoría y Unidad */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                    Categoría *
                  </label>
                  <select
                    required
                    value={categoriaId}
                    onChange={(e) => setCategoriaId(Number(e.target.value))}
                    className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-900 focus:border-emerald-700 focus:outline-none focus:ring-1 focus:ring-emerald-700 cursor-pointer"
                  >
                    {categorias.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.nombre}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                    Unidad de Medida *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="kg, litros, latas..."
                    value={unidadMedida}
                    onChange={(e) => setUnidadMedida(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-slate-200 px-3.5 py-2 text-sm text-slate-900 focus:border-emerald-700 focus:outline-none focus:ring-1 focus:ring-emerald-700"
                  />
                </div>
              </div>

              {/* Descripción */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                  Descripción
                </label>
                <textarea
                  rows={2}
                  placeholder="Detalles sobre presentación, empaque o características..."
                  value={descripcion}
                  onChange={(e) => setDescripcion(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-200 px-3.5 py-2 text-sm text-slate-900 focus:border-emerald-700 focus:outline-none focus:ring-1 focus:ring-emerald-700"
                />
              </div>

              {/* Condición Perecedera (RF-14) */}
              <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-3">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={esPerecedero}
                    onChange={(e) => setEsPerecedero(e.target.checked)}
                    className="size-4.5 rounded border-slate-300 text-emerald-800 focus:ring-emerald-700 cursor-pointer"
                  />
                  <div>
                    <span className="text-xs font-bold text-slate-800">
                      ¿Es producto perecedero?
                    </span>
                    <p className="text-[11px] text-slate-500">
                      Requiere almacenamiento exclusivo en cámaras frías / refrigeradas (Regla RF-14).
                    </p>
                  </div>
                </label>
              </div>

              {/* Cloudinary Image Upload */}
              <ImageUpload
                value={imagenUrl}
                onChange={setImagenUrl}
                folder="productos"
                label="Fotografía del Producto (Cloudinary)"
              />

              {/* Actions */}
              <div className="mt-6 flex items-center justify-end gap-3 border-t border-slate-100 pt-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  disabled={submitting}
                  className="rounded-lg px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 cursor-pointer transition"
                >
                  Cancelar
                </button>
                <Button
                  variant="primary"
                  type="submit"
                  disabled={submitting}
                  className="flex items-center gap-2"
                >
                  {submitting && <LuRefreshCw className="size-4 animate-spin" />}
                  <span>{editingProducto ? 'Guardar Cambios' : 'Registrar Producto'}</span>
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Detalle de Producto */}
      {detailProducto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <div className="flex items-start justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-800">
                  Ficha de Producto #{detailProducto.id}
                </span>
                <h3 className="font-display text-xl font-bold text-slate-900">
                  {detailProducto.nombre}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setDetailProducto(null)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 cursor-pointer"
              >
                <LuX className="size-5" />
              </button>
            </div>

            <div className="mt-4 space-y-4">
              <div className="overflow-hidden rounded-xl border border-slate-200 bg-slate-100 h-48 flex items-center justify-center">
                {detailProducto.imagenUrl ? (
                  <img
                    src={detailProducto.imagenUrl}
                    alt={detailProducto.nombre}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <LuPackage className="size-16 text-slate-400" />
                )}
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="rounded-xl bg-slate-50 p-3">
                  <span className="text-slate-500">Categoría:</span>
                  <p className="mt-1 font-bold text-slate-900">{detailProducto.categoriaNombre || 'Sin categoría'}</p>
                </div>
                <div className="rounded-xl bg-slate-50 p-3">
                  <span className="text-slate-500">Unidad de Medida:</span>
                  <p className="mt-1 font-bold text-slate-900 uppercase font-mono">{detailProducto.unidadMedida}</p>
                </div>
              </div>

              <div className="rounded-xl border border-slate-200 p-3 text-xs">
                <span className="text-slate-500">Tipo de Conservación:</span>
                <div className="mt-1.5 flex items-center gap-2">
                  {detailProducto.esPerecedero ? (
                    <Badge className="bg-amber-100 text-amber-900 border border-amber-200">
                      Perecedero (Refrigeración requerida)
                    </Badge>
                  ) : (
                    <Badge className="bg-blue-100 text-blue-900 border border-blue-200">
                      No Perecedero (Almacenamiento en Seco)
                    </Badge>
                  )}
                </div>
              </div>

              {detailProducto.descripcion && (
                <div className="rounded-xl border border-slate-200 p-3 text-xs">
                  <span className="text-slate-500">Descripción:</span>
                  <p className="mt-1 text-slate-700 leading-relaxed">{detailProducto.descripcion}</p>
                </div>
              )}
            </div>

            <div className="mt-6 flex justify-end">
              <Button variant="secondary" onClick={() => setDetailProducto(null)}>
                Cerrar
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Confirmar Eliminación */}
      {deletingProducto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl text-center">
            <div className="mx-auto grid size-12 place-items-center rounded-full bg-red-100 text-red-700 mb-3">
              <LuTrash2 className="size-6" />
            </div>
            <h3 className="font-display text-lg font-bold text-slate-900">
              ¿Eliminar producto?
            </h3>
            <p className="mt-1.5 text-xs text-slate-500 leading-relaxed">
              ¿Estás seguro de que deseas desactivar <strong>{deletingProducto.nombre}</strong>? Esta acción no eliminará las donaciones pasadas pero impedirá seleccionarlo en nuevos lotes.
            </p>
            <div className="mt-6 flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => setDeletingProducto(null)}
                disabled={submitting}
                className="rounded-lg px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={submitting}
                className="rounded-lg bg-red-600 hover:bg-red-700 px-4 py-2 text-xs font-bold text-white shadow-xs cursor-pointer transition"
              >
                {submitting ? 'Eliminando...' : 'Sí, eliminar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
