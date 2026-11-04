import React, { useEffect, useState, useMemo } from 'react';
import {
  LuPlus,
  LuSearch,
  LuPencil,
  LuTrash2,
  LuEye,
  LuUsers,
  LuHouse,
  LuPhone,
  LuMail,
  LuMapPin,
  LuX,
  LuTriangleAlert,
  LuRefreshCw,
  LuHeart,
} from 'react-icons/lu';
import { Button } from '../../components/atoms/Button';
import { Badge } from '../../components/atoms/Badge';
import { Spinner } from '../../components/atoms/Spinner';
import { Eyebrow } from '../../components/atoms/Typography';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { useAuthStore } from '../../stores/authStore';
import {
  getBeneficiarios,
  createBeneficiario,
  updateBeneficiario,
  deleteBeneficiario,
} from '../../services/beneficiarios';
import type { Beneficiario, BeneficiarioRequest } from '../../types/catalogs';

export const BeneficiariesPage: React.FC = () => {
  const user = useAuthStore((state) => state.user);
  const isAdmin = user?.rol === 'ADMINISTRADOR';

  const [beneficiarios, setBeneficiarios] = useState<Beneficiario[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [vulnerabilidadFilter, setVulnerabilidadFilter] = useState<'todos' | 'comedor' | 'familiar' | 'pequeno'>('todos');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBeneficiario, setEditingBeneficiario] = useState<Beneficiario | null>(null);
  const [detailBeneficiario, setDetailBeneficiario] = useState<Beneficiario | null>(null);
  const [deletingBeneficiario, setDeletingBeneficiario] = useState<Beneficiario | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);

  // Form State
  const [documento, setDocumento] = useState('');
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [telefono, setTelefono] = useState('');
  const [direccion, setDireccion] = useState('');
  const [numPersonasHogar, setNumPersonasHogar] = useState<number>(1);

  const cargarDatos = async () => {
    try {
      setRefreshing(true);
      const data = await getBeneficiarios();
      setBeneficiarios(data);
    } catch (err) {
      console.error('Error al cargar beneficiarios:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  const resetForm = () => {
    setDocumento('');
    setNombre('');
    setEmail('');
    setTelefono('');
    setDireccion('');
    setNumPersonasHogar(1);
    setEditingBeneficiario(null);
    setModalError(null);
  };

  const handleOpenCreateModal = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (b: Beneficiario) => {
    setEditingBeneficiario(b);
    setDocumento(b.documento);
    setNombre(b.nombre);
    setEmail(b.email || '');
    setTelefono(b.telefono || '');
    setDireccion(b.direccion || '');
    setNumPersonasHogar(b.numPersonasHogar);
    setModalError(null);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setModalError(null);

    if (!documento.trim()) {
      setModalError('El documento (Cédula/NIT) es obligatorio.');
      return;
    }
    if (!nombre.trim()) {
      setModalError('El nombre o razón social es obligatorio.');
      return;
    }
    if (!numPersonasHogar || numPersonasHogar < 1) {
      setModalError('El número de personas en el hogar/comunidad debe ser al menos 1.');
      return;
    }

    const payload: BeneficiarioRequest = {
      documento: documento.trim(),
      nombre: nombre.trim(),
      email: email.trim() || undefined,
      telefono: telefono.trim() || undefined,
      direccion: direccion.trim() || undefined,
      numPersonasHogar,
    };

    try {
      setSubmitting(true);
      if (editingBeneficiario) {
        await updateBeneficiario(editingBeneficiario.id, payload);
      } else {
        await createBeneficiario(payload);
      }
      setIsModalOpen(false);
      resetForm();
      await cargarDatos();
    } catch (err: unknown) {
      const errorMsg =
        (err as { response?: { data?: { mensaje?: string; error?: string } } })?.response?.data?.mensaje ||
        (err as { response?: { data?: { error?: string } } })?.response?.data?.error ||
        'Ocurrió un error al guardar el beneficiario.';
      setModalError(errorMsg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingBeneficiario) return;
    try {
      setSubmitting(true);
      await deleteBeneficiario(deletingBeneficiario.id);
      setDeletingBeneficiario(null);
      await cargarDatos();
    } catch (err: unknown) {
      const errorMsg =
        (err as { response?: { data?: { mensaje?: string; error?: string } } })?.response?.data?.mensaje ||
        'Error al desactivar el beneficiario.';
      alert(errorMsg);
    } finally {
      setSubmitting(false);
    }
  };

  // Metrics summary
  const metricas = useMemo(() => {
    const total = beneficiarios.length;
    const totalImpactadas = beneficiarios.reduce((acc, b) => acc + (b.activo ? b.numPersonasHogar : 0), 0);
    const comedores = beneficiarios.filter((b) => b.numPersonasHogar >= 20).length;
    const familias = beneficiarios.filter((b) => b.numPersonasHogar < 20).length;
    return { total, totalImpactadas, comedores, familias };
  }, [beneficiarios]);

  // Filtering
  const filteredBeneficiarios = useMemo(() => {
    return beneficiarios.filter((b) => {
      const matchesSearch =
        b.nombre.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.documento.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (b.email && b.email.toLowerCase().includes(searchQuery.toLowerCase()));

      let matchesVulnerabilidad = true;
      if (vulnerabilidadFilter === 'comedor') {
        matchesVulnerabilidad = b.numPersonasHogar >= 20;
      } else if (vulnerabilidadFilter === 'familiar') {
        matchesVulnerabilidad = b.numPersonasHogar >= 5 && b.numPersonasHogar < 20;
      } else if (vulnerabilidadFilter === 'pequeno') {
        matchesVulnerabilidad = b.numPersonasHogar < 5;
      }

      return matchesSearch && matchesVulnerabilidad;
    });
  }, [beneficiarios, searchQuery, vulnerabilidadFilter]);

  const getPriorityBadge = (personas: number) => {
    if (personas >= 20) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-800 border border-red-200">
          Prioridad Muy Alta (Comunidad: {personas})
        </span>
      );
    }
    if (personas >= 5) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-200">
          Prioridad Alta (Familia: {personas})
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
        Prioridad Regular ({personas} pers.)
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <Eyebrow>Módulo de Población Vulnerable (RF-04)</Eyebrow>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 mt-1">
            Gestión de Beneficiarios
          </h1>
          <p className="text-sm text-slate-600 mt-0.5">
            Registro, evaluación de vulnerabilidad por núcleo poblacional y priorización de entregas.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={cargarDatos}
            disabled={refreshing}
            className="flex items-center gap-2 cursor-pointer"
          >
            <LuRefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            Actualizar
          </Button>
          <Button
            variant="primary"
            onClick={handleOpenCreateModal}
            className="flex items-center gap-2 cursor-pointer"
          >
            <LuPlus className="w-4 h-4" />
            Nuevo Beneficiario
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-slate-200 bg-white shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-medium uppercase tracking-wider text-slate-500">
              Total Beneficiarios
            </CardTitle>
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
              <LuUsers className="w-5 h-5" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">{metricas.total}</div>
            <p className="text-xs text-slate-500 mt-1">Entidades y familias registradas</p>
          </CardContent>
        </Card>

        <Card className="border-slate-200 bg-white shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-medium uppercase tracking-wider text-slate-500">
              Personas Beneficiadas
            </CardTitle>
            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
              <LuHeart className="w-5 h-5" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-700">{metricas.totalImpactadas}</div>
            <p className="text-xs text-slate-500 mt-1">Población total con cobertura activa</p>
          </CardContent>
        </Card>

        <Card className="border-slate-200 bg-white shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-medium uppercase tracking-wider text-slate-500">
              Comedores / Fundaciones
            </CardTitle>
            <div className="p-2 bg-purple-50 text-purple-600 rounded-lg">
              <LuHouse className="w-5 h-5" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-700">{metricas.comedores}</div>
            <p className="text-xs text-slate-500 mt-1">Centros comunitarios (≥20 personas)</p>
          </CardContent>
        </Card>

        <Card className="border-slate-200 bg-white shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-medium uppercase tracking-wider text-slate-500">
              Familias Vulnerables
            </CardTitle>
            <div className="p-2 bg-amber-50 text-amber-600 rounded-lg">
              <LuUsers className="w-5 h-5" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-700">{metricas.familias}</div>
            <p className="text-xs text-slate-500 mt-1">Hogares con atención directa</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search Bar */}
      <Card className="border-slate-200 bg-white shadow-sm">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-3">
            <div className="relative flex-1">
              <LuSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Buscar por nombre, documento o correo..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
              />
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <select
                aria-label="Filtrar por escala de vulnerabilidad"
                value={vulnerabilidadFilter}
                onChange={(e) => setVulnerabilidadFilter(e.target.value as 'todos' | 'comedor' | 'familiar' | 'pequeno')}
                className="px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-colors cursor-pointer"
              >
                <option value="todos">Todas las escalas</option>
                <option value="comedor">Comunidades / Comedores (≥20 pers.)</option>
                <option value="familiar">Hogares Medianos (5 - 19 pers.)</option>
                <option value="pequeno">Hogares Pequeños (1 - 4 pers.)</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Beneficiaries Table/List */}
      <Card className="border-slate-200 bg-white shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex flex-col items-center justify-center p-12">
            <Spinner />
            <p className="text-sm text-slate-500 mt-3">Cargando beneficiarios...</p>
          </div>
        ) : filteredBeneficiarios.length === 0 ? (
          <div className="text-center py-16 px-4">
            <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto text-slate-400 mb-3">
              <LuUsers className="w-6 h-6" />
            </div>
            <h3 className="text-base font-semibold text-slate-900">No se encontraron beneficiarios</h3>
            <p className="text-sm text-slate-500 mt-1 max-w-sm mx-auto">
              {searchQuery || vulnerabilidadFilter !== 'todos'
                ? 'Prueba modificando los filtros de búsqueda.'
                : 'Comienza registrando beneficiarios para gestionar las asignaciones alimentarias.'}
            </p>
            {!searchQuery && vulnerabilidadFilter === 'todos' && (
              <Button
                variant="primary"
                onClick={handleOpenCreateModal}
                className="mt-4 inline-flex items-center gap-2 cursor-pointer"
              >
                <LuPlus className="w-4 h-4" />
                Registrar Beneficiario
              </Button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
              <thead className="bg-slate-50 text-slate-600 font-semibold uppercase text-xs tracking-wider">
                <tr>
                  <th scope="col" className="px-6 py-3.5">Beneficiario / Entidad</th>
                  <th scope="col" className="px-6 py-3.5">Documento</th>
                  <th scope="col" className="px-6 py-3.5">Vulnerabilidad (Personas)</th>
                  <th scope="col" className="px-6 py-3.5">Contacto</th>
                  <th scope="col" className="px-6 py-3.5">Estado</th>
                  <th scope="col" className="px-6 py-3.5 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {filteredBeneficiarios.map((b) => (
                  <tr key={b.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-semibold text-slate-900">{b.nombre}</div>
                      {b.direccion && (
                        <div className="flex items-center gap-1 text-xs text-slate-500 mt-0.5">
                          <LuMapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span className="truncate max-w-xs">{b.direccion}</span>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 font-mono text-xs text-slate-700">
                      {b.documento}
                    </td>
                    <td className="px-6 py-4">
                      {getPriorityBadge(b.numPersonasHogar)}
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-600 space-y-1">
                      {b.telefono && (
                        <div className="flex items-center gap-1.5">
                          <LuPhone className="w-3.5 h-3.5 text-slate-400" />
                          <span>{b.telefono}</span>
                        </div>
                      )}
                      {b.email && (
                        <div className="flex items-center gap-1.5">
                          <LuMail className="w-3.5 h-3.5 text-slate-400" />
                          <span className="truncate max-w-[180px]">{b.email}</span>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant={b.activo ? 'success' : 'neutral'}>
                        {b.activo ? 'Activo' : 'Inactivo'}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => setDetailBeneficiario(b)}
                          className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-md transition-colors cursor-pointer"
                          title="Ver detalles"
                        >
                          <LuEye className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleOpenEditModal(b)}
                          className="p-1.5 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-md transition-colors cursor-pointer"
                          title="Editar"
                        >
                          <LuPencil className="w-4 h-4" />
                        </button>
                        {isAdmin && (
                          <button
                            type="button"
                            onClick={() => setDeletingBeneficiario(b)}
                            className="p-1.5 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-md transition-colors cursor-pointer"
                            title="Desactivar"
                          >
                            <LuTrash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Modal Crear / Editar */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden border border-slate-200">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
              <h2 className="text-lg font-bold text-slate-900">
                {editingBeneficiario ? 'Editar Beneficiario' : 'Nuevo Beneficiario'}
              </h2>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-md transition-colors cursor-pointer"
              >
                <LuX className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {modalError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-sm text-red-700">
                  <LuTriangleAlert className="w-4 h-4 shrink-0" />
                  <span>{modalError}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                    Documento (Cédula / NIT) *
                  </label>
                  <input
                    type="text"
                    required
                    value={documento}
                    onChange={(e) => setDocumento(e.target.value)}
                    placeholder="Ej. 901234567-8"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                    Personas en Hogar / Centro *
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={numPersonasHogar}
                    onChange={(e) => setNumPersonasHogar(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                  <p className="text-[11px] text-slate-500 mt-0.5">Define la prioridad FEFO (RF-04)</p>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                  Nombre Completo / Razón Social *
                </label>
                <input
                  type="text"
                  required
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  placeholder="Ej. Comedor Comunitario Los Ángeles"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                    Correo Electrónico
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="contacto@entidad.org"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                    Teléfono de Contacto
                  </label>
                  <input
                    type="tel"
                    value={telefono}
                    onChange={(e) => setTelefono(e.target.value)}
                    placeholder="3101234567"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                  Dirección de Residencia / Sede
                </label>
                <input
                  type="text"
                  value={direccion}
                  onChange={(e) => setDireccion(e.target.value)}
                  placeholder="Carrera 15 # 45-20, Bucaramanga"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsModalOpen(false)}
                  disabled={submitting}
                  className="cursor-pointer"
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  disabled={submitting}
                  className="cursor-pointer"
                >
                  {submitting ? 'Guardando...' : editingBeneficiario ? 'Actualizar Beneficiario' : 'Registrar Beneficiario'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Detalle */}
      {detailBeneficiario && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden border border-slate-200">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <LuUsers className="w-5 h-5 text-emerald-600" />
                Ficha del Beneficiario
              </h2>
              <button
                type="button"
                onClick={() => setDetailBeneficiario(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-md cursor-pointer"
              >
                <LuX className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4 text-sm">
              <div>
                <p className="text-xs uppercase tracking-wider font-semibold text-slate-400">Nombre / Razón Social</p>
                <p className="text-base font-bold text-slate-900 mt-0.5">{detailBeneficiario.nombre}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs uppercase tracking-wider font-semibold text-slate-400">Documento</p>
                  <p className="font-mono text-slate-800 mt-0.5">{detailBeneficiario.documento}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wider font-semibold text-slate-400">Personas Impactadas</p>
                  <p className="text-emerald-700 font-bold mt-0.5">{detailBeneficiario.numPersonasHogar} personas</p>
                </div>
              </div>
              <div className="border-t border-slate-100 pt-3 space-y-2">
                <div>
                  <p className="text-xs uppercase tracking-wider font-semibold text-slate-400">Teléfono</p>
                  <p className="text-slate-700 mt-0.5">{detailBeneficiario.telefono || 'No registrado'}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wider font-semibold text-slate-400">Correo Electrónico</p>
                  <p className="text-slate-700 mt-0.5">{detailBeneficiario.email || 'No registrado'}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wider font-semibold text-slate-400">Dirección</p>
                  <p className="text-slate-700 mt-0.5">{detailBeneficiario.direccion || 'No registrada'}</p>
                </div>
              </div>
              <div className="pt-2">
                <p className="text-xs uppercase tracking-wider font-semibold text-slate-400 mb-1">Clasificación Prioritaria</p>
                {getPriorityBadge(detailBeneficiario.numPersonasHogar)}
              </div>
            </div>
            <div className="p-4 bg-slate-50 border-t border-slate-200 text-right">
              <Button
                variant="outline"
                onClick={() => setDetailBeneficiario(null)}
                className="cursor-pointer"
              >
                Cerrar
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Desactivar */}
      {deletingBeneficiario && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden border border-slate-200">
            <div className="p-6">
              <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mb-4">
                <LuTrash2 className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">
                ¿Desactivar beneficiario?
              </h3>
              <p className="text-sm text-slate-600 mt-2">
                ¿Estás seguro de que deseas desactivar a{' '}
                <span className="font-semibold text-slate-900">{deletingBeneficiario.nombre}</span>?
                El beneficiario ya no aparecerá como elegible para nuevas solicitudes de alimentos.
              </p>
              <div className="flex items-center justify-end gap-3 mt-6">
                <Button
                  variant="outline"
                  onClick={() => setDeletingBeneficiario(null)}
                  disabled={submitting}
                  className="cursor-pointer"
                >
                  Cancelar
                </Button>
                <Button
                  variant="primary"
                  onClick={handleDelete}
                  disabled={submitting}
                  className="bg-red-600 hover:bg-red-700 text-white cursor-pointer"
                >
                  {submitting ? 'Desactivando...' : 'Sí, Desactivar'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
