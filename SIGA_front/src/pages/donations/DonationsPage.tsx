import React, { useEffect, useState } from 'react';
import {
  LuPlus,
  LuTrash2,
  LuEye,
  LuX,
  LuArrowLeft,
  LuCheck,
  LuTriangleAlert,
  LuBuilding2,
  LuUser,
  LuPackageCheck,
  LuCalendar,
} from 'react-icons/lu';
import { Button } from '../../components/atoms/Button';
import { Badge } from '../../components/atoms/Badge';
import { Spinner } from '../../components/atoms/Spinner';
import { Eyebrow } from '../../components/atoms/Typography';
import { DataTable } from '../../components/organisms/DataTable';
import { getDonaciones, createDonacion } from '../../services/donaciones';
import { getDonantes } from '../../services/donantes';
import { getProductos } from '../../services/productos';
import { getUbicaciones } from '../../services/ubicaciones';
import type {
  Donacion,
  Donante,
  Producto,
  Ubicacion,
  LoteItemRequest,
  DonacionRequest,
} from '../../types/catalogs';

type TemporaryItem = LoteItemRequest & {
  productoNombre: string;
  esPerecedero: boolean;
  ubicacionNombre?: string;
};

export const DonationsPage = () => {
  const [donaciones, setDonaciones] = useState<Donacion[]>([]);
  const [donantes, setDonantes] = useState<Donante[]>([]);
  const [productos, setProductos] = useState<Producto[]>([]);
  const [ubicaciones, setUbicaciones] = useState<Ubicacion[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [selectedDonacion, setSelectedDonacion] = useState<Donacion | null>(null);

  // Form states for creating a donation
  const [donanteId, setDonanteId] = useState<number | ''>('');
  const [fechaRecepcion, setFechaRecepcion] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [observaciones, setObservaciones] = useState('');
  const [items, setItems] = useState<TemporaryItem[]>([]);
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);

  // Modal "Agregar producto" states
  const [showProductModal, setShowProductModal] = useState(false);
  const [modalProductoId, setModalProductoId] = useState<number | ''>('');
  const [modalNumeroLote, setModalNumeroLote] = useState('');
  const [modalCantidad, setModalCantidad] = useState<number | ''>('');
  const [modalUnidadMedida, setModalUnidadMedida] = useState('Kg');
  const [modalFechaVencimiento, setModalFechaVencimiento] = useState('');
  const [modalUbicacionId, setModalUbicacionId] = useState<number | ''>('');
  const [modalError, setModalError] = useState<string | null>(null);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      const [donacionesData, donantesData, productosData, ubicacionesData] = await Promise.all([
        getDonaciones(),
        getDonantes(),
        getProductos(),
        getUbicaciones(),
      ]);
      setDonaciones(donacionesData);
      setDonantes(donantesData.filter((d) => d.activo));
      setProductos(productosData.filter((p) => p.activo));
      setUbicaciones(ubicacionesData.filter((u) => u.activo));
    } catch {
      // Ignorar error inicial
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void cargarDatos();
  }, []);

  const resetForm = () => {
    setDonanteId('');
    setFechaRecepcion(new Date().toISOString().split('T')[0]);
    setObservaciones('');
    setItems([]);
    setFormError(null);
    setFormSuccess(null);
  };

  const handleOpenProductModal = () => {
    setModalProductoId(productos.length > 0 ? productos[0].id : '');
    const randomLoteNum = `L${String(Math.floor(100 + Math.random() * 900))}`;
    setModalNumeroLote(randomLoteNum);
    setModalCantidad('');
    setModalUnidadMedida(productos.length > 0 ? productos[0].unidadMedida : 'Kg');
    // Default expiration date to 30 days from now
    const defaultExp = new Date();
    defaultExp.setDate(defaultExp.getDate() + 30);
    setModalFechaVencimiento(defaultExp.toISOString().split('T')[0]);
    setModalUbicacionId('');
    setModalError(null);
    setShowProductModal(true);
  };

  const handleProductoChange = (id: number) => {
    setModalProductoId(id);
    const prod = productos.find((p) => p.id === id);
    if (prod) {
      setModalUnidadMedida(prod.unidadMedida);
    }
  };

  const handleSaveModalProduct = () => {
    setModalError(null);
    if (!modalProductoId) {
      setModalError('Debe seleccionar un producto.');
      return;
    }
    if (!modalNumeroLote.trim()) {
      setModalError('El número de lote es obligatorio.');
      return;
    }
    if (!modalCantidad || Number(modalCantidad) <= 0) {
      setModalError('La cantidad debe ser mayor a cero.');
      return;
    }
    if (!modalFechaVencimiento) {
      setModalError('La fecha de vencimiento es obligatoria.');
      return;
    }

    const prod = productos.find((p) => p.id === Number(modalProductoId));
    if (!prod) return;

    // Check expiration date not in past
    const today = new Date().toISOString().split('T')[0];
    if (modalFechaVencimiento < today) {
      setModalError('La fecha de vencimiento no puede ser anterior a la fecha actual.');
      return;
    }

    let ubicacion: Ubicacion | undefined;
    if (modalUbicacionId) {
      ubicacion = ubicaciones.find((u) => u.id === Number(modalUbicacionId));
      if (prod.esPerecedero && ubicacion?.tipo === 'SECO') {
        setModalError(
          `El producto '${prod.nombre}' es perecedero y no puede almacenarse en una ubicación seca (${ubicacion.nombre}).`
        );
        return;
      }
    }

    const newItem: TemporaryItem = {
      productoId: prod.id,
      productoNombre: prod.nombre,
      esPerecedero: prod.esPerecedero,
      numeroLote: modalNumeroLote.trim(),
      cantidad: Number(modalCantidad),
      unidadMedida: modalUnidadMedida,
      fechaVencimiento: modalFechaVencimiento,
      ubicacionId: ubicacion?.id,
      ubicacionNombre: ubicacion ? `${ubicacion.codigo} - ${ubicacion.nombre}` : undefined,
    };

    setItems((prev) => [...prev, newItem]);
    setShowProductModal(false);
  };

  const handleRemoveItem = (index: number) => {
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  const handleRegisterDonation = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setFormSuccess(null);

    if (!donanteId) {
      setFormError('Por favor seleccione el donante que entrega los alimentos.');
      return;
    }

    if (items.length === 0) {
      setFormError('Debe agregar al menos un producto a la donación.');
      return;
    }

    try {
      setSubmitting(true);
      const payload: DonacionRequest = {
        donanteId: Number(donanteId),
        fechaRecepcion,
        observaciones: observaciones.trim() || undefined,
        items: items.map((it) => ({
          productoId: it.productoId,
          numeroLote: it.numeroLote,
          cantidad: it.cantidad,
          unidadMedida: it.unidadMedida,
          fechaVencimiento: it.fechaVencimiento,
          ubicacionId: it.ubicacionId,
        })),
      };

      const created = await createDonacion(payload);
      setFormSuccess(`¡Donación #${created.id} registrada con éxito! Los lotes han ingresado al inventario.`);
      resetForm();
      void cargarDatos();
      setTimeout(() => {
        setIsRegistering(false);
        setFormSuccess(null);
      }, 2000);
    } catch (err: unknown) {
      const errorMsg =
        err instanceof Error ? err.message : 'Error al registrar la donación. Inténtalo de nuevo.';
      setFormError(errorMsg);
    } finally {
      setSubmitting(false);
    }
  };

  const selectedDonante = donantes.find((d) => d.id === Number(donanteId));
  const selectedProdForModal = productos.find((p) => p.id === Number(modalProductoId));

  return (
    <section className="mx-auto max-w-6xl space-y-6">
      {/* View 1: Registration Form (Figura 4) */}
      {isRegistering ? (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => {
                setIsRegistering(false);
                resetForm();
              }}
              className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-slate-900"
            >
              <LuArrowLeft className="size-4" />
              <span>Volver al listado de donaciones</span>
            </button>
          </div>

          <div>
            <Eyebrow>Entrada de Alimentos (RF02 / Figura 4)</Eyebrow>
            <h1 className="font-display text-3xl font-extrabold text-slate-900">
              Registrar donación
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Complete la información de la donación y agregue los productos recibidos para ingresar los lotes a bodega.
            </p>
          </div>

          {formError && (
            <div className="flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
              <LuTriangleAlert className="size-5 shrink-0 text-red-600" />
              <span>{formError}</span>
            </div>
          )}

          {formSuccess && (
            <div className="flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">
              <LuCheck className="size-5 shrink-0 text-emerald-600" />
              <span>{formSuccess}</span>
            </div>
          )}

          <form onSubmit={handleRegisterDonation} className="space-y-6">
            {/* Card 1: Información de la donación */}
            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-xs">
              <h2 className="flex items-center gap-2 font-display text-base font-bold text-slate-900">
                <LuPackageCheck className="size-5 text-emerald-700" />
                <span>Información de la donación</span>
              </h2>

              <div className="mt-5 grid gap-5 md:grid-cols-3">
                {/* Donante selector */}
                <div className="space-y-1.5 md:col-span-1">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                    Donante <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={donanteId}
                    onChange={(e) => setDonanteId(e.target.value ? Number(e.target.value) : '')}
                    className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-800 focus:border-emerald-700 focus:outline-none focus:ring-1 focus:ring-emerald-700"
                    required
                  >
                    <option value="">Seleccione o busque donante...</option>
                    {donantes.map((don) => (
                      <option key={don.id} value={don.id}>
                        {don.nombre} ({don.identificacion})
                      </option>
                    ))}
                  </select>

                  {/* Donor preview card */}
                  {selectedDonante && (
                    <div className="mt-3 rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs space-y-1">
                      <div className="flex items-center gap-1.5 font-bold text-slate-900">
                        {selectedDonante.tipo === 'EMPRESA' ? (
                          <LuBuilding2 className="size-3.5 text-indigo-600" />
                        ) : (
                          <LuUser className="size-3.5 text-emerald-600" />
                        )}
                        <span>{selectedDonante.nombre}</span>
                      </div>
                      <div className="text-slate-500">NIT / Doc: {selectedDonante.identificacion}</div>
                      {selectedDonante.telefono && (
                        <div className="text-slate-500">Tel: {selectedDonante.telefono}</div>
                      )}
                      {selectedDonante.email && (
                        <div className="text-slate-500">Email: {selectedDonante.email}</div>
                      )}
                    </div>
                  )}
                </div>

                {/* Fecha de recepcion */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                    Fecha de recepción <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={fechaRecepcion}
                    onChange={(e) => setFechaRecepcion(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-800 focus:border-emerald-700 focus:outline-none focus:ring-1 focus:ring-emerald-700"
                    required
                  />
                </div>

                {/* Observaciones */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                    Observaciones
                  </label>
                  <input
                    type="text"
                    value={observaciones}
                    onChange={(e) => setObservaciones(e.target.value)}
                    placeholder="Ingrese observaciones (opcional)..."
                    className="w-full rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-800 focus:border-emerald-700 focus:outline-none focus:ring-1 focus:ring-emerald-700"
                  />
                </div>
              </div>
            </div>

            {/* Card 2: Productos de la donación */}
            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-xs">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <h2 className="flex items-center gap-2 font-display text-base font-bold text-slate-900">
                  <LuCalendar className="size-5 text-emerald-700" />
                  <span>Productos de la donación</span>
                </h2>
                <Button
                  variant="primary"
                  type="button"
                  onClick={handleOpenProductModal}
                  className="flex items-center gap-2 py-2"
                >
                  <LuPlus className="size-4" />
                  <span>Agregar producto</span>
                </Button>
              </div>

              {/* Table of items */}
              <div className="mt-5 overflow-x-auto rounded-lg border border-slate-200">
                <table className="w-full text-left text-sm">
                  <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wider text-slate-500">
                    <tr>
                      <th className="px-4 py-3 font-bold">#</th>
                      <th className="px-4 py-3 font-bold">Producto</th>
                      <th className="px-4 py-3 font-bold">Lote</th>
                      <th className="px-4 py-3 font-bold">Cantidad</th>
                      <th className="px-4 py-3 font-bold">Unidades</th>
                      <th className="px-4 py-3 font-bold">Fecha de vencimiento</th>
                      <th className="px-4 py-3 font-bold">Ubicación</th>
                      <th className="px-4 py-3 font-bold text-right">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="px-4 py-8 text-center text-slate-400">
                          No se han agregado productos a esta donación. Haz clic en "Agregar producto" para comenzar.
                        </td>
                      </tr>
                    ) : (
                      items.map((item, idx) => (
                        <tr key={idx} className="border-b border-slate-100 hover:bg-slate-50/70">
                          <td className="px-4 py-3 font-semibold text-slate-500">{idx + 1}</td>
                          <td className="px-4 py-3 font-bold text-slate-900">
                            <div>{item.productoNombre}</div>
                            {item.esPerecedero && (
                              <span className="text-[10px] uppercase font-bold text-amber-700">Perecedero</span>
                            )}
                          </td>
                          <td className="px-4 py-3 font-mono text-xs font-semibold text-indigo-700">
                            {item.numeroLote}
                          </td>
                          <td className="px-4 py-3 font-bold text-slate-800">{item.cantidad}</td>
                          <td className="px-4 py-3 text-slate-600">{item.unidadMedida}</td>
                          <td className="px-4 py-3 text-slate-700">{item.fechaVencimiento}</td>
                          <td className="px-4 py-3 text-xs text-slate-500">
                            {item.ubicacionNombre || <span className="text-slate-400 italic">Autoasignada</span>}
                          </td>
                          <td className="px-4 py-3 text-right">
                            <button
                              type="button"
                              onClick={() => handleRemoveItem(idx)}
                              className="rounded-md p-1.5 text-red-500 hover:bg-red-50 hover:text-red-700"
                              title="Eliminar producto"
                            >
                              <LuTrash2 className="size-4" />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
              <Button
                variant="ghost"
                type="button"
                onClick={() => {
                  setIsRegistering(false);
                  resetForm();
                }}
              >
                Cancelar
              </Button>
              <Button
                variant="primary"
                type="submit"
                disabled={submitting || items.length === 0 || !donanteId}
                className="min-w-44"
              >
                {submitting ? (
                  <>
                    <Spinner /> Registrando...
                  </>
                ) : (
                  'Registrar donación'
                )}
              </Button>
            </div>
          </form>

          {/* Modal "Agregar producto" (Figura 4) */}
          {showProductModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
              <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-150">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div>
                    <h3 className="font-display text-lg font-bold text-slate-900">Agregar producto</h3>
                    <p className="text-xs text-slate-500">Ingrese la información del producto a donar</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowProductModal(false)}
                    className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                  >
                    <LuX className="size-5" />
                  </button>
                </div>

                {modalError && (
                  <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-xs text-red-800">
                    <LuTriangleAlert className="size-4 shrink-0 text-red-600" />
                    <span>{modalError}</span>
                  </div>
                )}

                <div className="space-y-4 text-sm">
                  {/* Producto */}
                  <div className="space-y-1">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                      Producto <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={modalProductoId}
                      onChange={(e) => handleProductoChange(Number(e.target.value))}
                      className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 focus:border-emerald-700 focus:outline-none focus:ring-1 focus:ring-emerald-700"
                    >
                      {productos.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.nombre} {p.esPerecedero ? '(Perecedero)' : '(No perecedero)'}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Número de lote */}
                  <div className="space-y-1">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                      Número de lote <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={modalNumeroLote}
                      onChange={(e) => setModalNumeroLote(e.target.value)}
                      placeholder="Ej: L004"
                      className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 focus:border-emerald-700 focus:outline-none focus:ring-1 focus:ring-emerald-700"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    {/* Cantidad */}
                    <div className="space-y-1">
                      <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                        Cantidad <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        min="0.1"
                        step="any"
                        value={modalCantidad}
                        onChange={(e) => setModalCantidad(e.target.value ? Number(e.target.value) : '')}
                        placeholder="Ej: 500"
                        className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 focus:border-emerald-700 focus:outline-none focus:ring-1 focus:ring-emerald-700"
                      />
                    </div>

                    {/* Unidades */}
                    <div className="space-y-1">
                      <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                        Unidades <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={modalUnidadMedida}
                        onChange={(e) => setModalUnidadMedida(e.target.value)}
                        className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 focus:border-emerald-700 focus:outline-none focus:ring-1 focus:ring-emerald-700"
                      >
                        <option value="Kg">Kg</option>
                        <option value="Litros">Litros</option>
                        <option value="Unidades">Unidades</option>
                        <option value="Latas">Latas</option>
                        <option value="Gramos">Gramos</option>
                        <option value="Paquetes">Paquetes</option>
                      </select>
                    </div>
                  </div>

                  {/* Fecha de vencimiento */}
                  <div className="space-y-1">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                      Fecha de vencimiento <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      value={modalFechaVencimiento}
                      onChange={(e) => setModalFechaVencimiento(e.target.value)}
                      className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 focus:border-emerald-700 focus:outline-none focus:ring-1 focus:ring-emerald-700"
                    />
                  </div>

                  {/* Ubicación (opcional) */}
                  <div className="space-y-1">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                      Ubicación de almacenamiento (opcional)
                    </label>
                    <select
                      value={modalUbicacionId}
                      onChange={(e) => setModalUbicacionId(e.target.value ? Number(e.target.value) : '')}
                      className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 focus:border-emerald-700 focus:outline-none focus:ring-1 focus:ring-emerald-700"
                    >
                      <option value="">Autoasignar según compatibilidad</option>
                      {ubicaciones.map((u) => (
                        <option key={u.id} value={u.id}>
                          {u.codigo} - {u.nombre} ({u.tipo})
                        </option>
                      ))}
                    </select>
                    {selectedProdForModal?.esPerecedero && (
                      <p className="text-[11px] text-amber-600">
                        * Producto perecedero: requiere ubicación de tipo REFRIGERADO.
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                  <Button variant="ghost" type="button" onClick={() => setShowProductModal(false)}>
                    Cancelar
                  </Button>
                  <Button variant="primary" type="button" onClick={handleSaveModalProduct}>
                    Guardar producto
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* View 2: List of Donations */
        <div className="space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <Eyebrow>Entrada de Alimentos (RF02)</Eyebrow>
              <h1 className="font-display text-3xl font-extrabold text-slate-900">
                Donaciones Recibidas
              </h1>
              <p className="mt-1 text-sm text-slate-500">
                Historial de donaciones recibidas y lotes ingresados al inventario de bodega.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="secondary" type="button" onClick={() => void cargarDatos()}>
                Actualizar
              </Button>
              <Button
                variant="primary"
                type="button"
                onClick={() => {
                  resetForm();
                  setIsRegistering(true);
                }}
                className="flex items-center gap-2"
              >
                <LuPlus className="size-4" />
                <span>Registrar donación</span>
              </Button>
            </div>
          </div>

          <DataTable
            headers={['ID', 'Donante', 'Fecha de Recepción', 'Productos', 'Total Cantidad', 'Estado', 'Acciones']}
            emptyMessage={loading ? 'Cargando donaciones...' : 'No se han registrado donaciones aún.'}
          >
            {donaciones.map((don) => (
              <tr key={don.id} className="border-b border-slate-100 hover:bg-slate-50/70 transition">
                <td className="px-4 py-3 font-mono text-xs font-bold text-slate-700">#{don.id}</td>
                <td className="px-4 py-3 font-semibold text-slate-900">
                  <div>{don.donanteNombre}</div>
                  <div className="text-xs text-slate-400">NIT: {don.donanteIdentificacion}</div>
                </td>
                <td className="px-4 py-3 text-slate-600">{don.fechaRecepcion}</td>
                <td className="px-4 py-3 font-bold text-slate-800">{don.totalProductos} ítems</td>
                <td className="px-4 py-3 font-bold text-emerald-800">{don.totalCantidad}</td>
                <td className="px-4 py-3">
                  <Badge className="bg-emerald-50 text-emerald-800">
                    {don.estado === 'RECIBIDA' ? 'Recibida' : don.estado}
                  </Badge>
                </td>
                <td className="px-4 py-3">
                  <button
                    type="button"
                    onClick={() => setSelectedDonacion(don)}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:text-slate-900 shadow-2xs"
                  >
                    <LuEye className="size-3.5" />
                    <span>Ver lotes</span>
                  </button>
                </td>
              </tr>
            ))}
          </DataTable>

          {/* Modal to view donation lot details */}
          {selectedDonacion && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
              <div className="w-full max-w-2xl rounded-2xl bg-white p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-150">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div>
                    <h3 className="font-display text-lg font-bold text-slate-900">
                      Detalle de Donación #{selectedDonacion.id}
                    </h3>
                    <p className="text-xs text-slate-500">
                      {selectedDonacion.donanteNombre} — Fecha: {selectedDonacion.fechaRecepcion}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelectedDonacion(null)}
                    className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                  >
                    <LuX className="size-5" />
                  </button>
                </div>

                {selectedDonacion.observaciones && (
                  <div className="rounded-lg bg-slate-50 p-3 text-xs text-slate-600">
                    <strong>Observaciones:</strong> {selectedDonacion.observaciones}
                  </div>
                )}

                <div className="space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                    Lotes generados en inventario ({selectedDonacion.items.length})
                  </h4>
                  <div className="overflow-x-auto rounded-lg border border-slate-200">
                    <table className="w-full text-left text-xs">
                      <thead className="border-b border-slate-200 bg-slate-50 uppercase text-slate-500">
                        <tr>
                          <th className="px-3 py-2">Lote</th>
                          <th className="px-3 py-2">Producto</th>
                          <th className="px-3 py-2">Cantidad Inicial</th>
                          <th className="px-3 py-2">Disponible</th>
                          <th className="px-3 py-2">Vencimiento</th>
                          <th className="px-3 py-2">Ubicación</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedDonacion.items.map((lote) => (
                          <tr key={lote.id} className="border-b border-slate-100">
                            <td className="px-3 py-2 font-mono font-bold text-indigo-700">
                              {lote.numeroLote}
                            </td>
                            <td className="px-3 py-2 font-semibold text-slate-900">
                              {lote.productoNombre}
                            </td>
                            <td className="px-3 py-2">
                              {lote.cantidadInicial} {lote.unidadMedida}
                            </td>
                            <td className="px-3 py-2 font-bold text-emerald-700">
                              {lote.cantidadDisponible} {lote.unidadMedida}
                            </td>
                            <td className="px-3 py-2 text-slate-700">{lote.fechaVencimiento}</td>
                            <td className="px-3 py-2 text-slate-500">
                              {lote.ubicacionCodigo || 'Sin asignar'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <Button variant="secondary" type="button" onClick={() => setSelectedDonacion(null)}>
                    Cerrar
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </section>
  );
};
