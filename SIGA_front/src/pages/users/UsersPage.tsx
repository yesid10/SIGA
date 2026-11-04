import React, { useEffect, useState, useMemo } from 'react';
import {
  LuUsers,
  LuSearch,
  LuShield,
  LuPencil,
  LuRefreshCw,
  LuX,
  LuTriangleAlert,
  LuHeartHandshake,
  LuWarehouse,
  LuShieldAlert,
} from 'react-icons/lu';
import { Button } from '../../components/atoms/Button';
import { Spinner } from '../../components/atoms/Spinner';
import { Eyebrow } from '../../components/atoms/Typography';
import { Card } from '../../components/ui/card';
import { ImageUpload } from '../../components/molecules/ImageUpload';
import { getUsuarios, updateUsuario, changeRol, changeEstado } from '../../services/usuarios';
import type { UsuarioAdmin, ActualizarUsuarioRequest } from '../../types/catalogs';

export const UsersPage: React.FC = () => {
  const [usuarios, setUsuarios] = useState<UsuarioAdmin[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filtroRol, setFiltroRol] = useState<string>('todos');
  const [filtroEstado, setFiltroEstado] = useState<string>('todos');

  // Edit Modal State
  const [editingUsuario, setEditingUsuario] = useState<UsuarioAdmin | null>(null);
  const [nombre, setNombre] = useState('');
  const [rol, setRol] = useState<'ADMINISTRADOR' | 'ENCARGADO' | 'BENEFICIARIO'>('BENEFICIARIO');
  const [activo, setActivo] = useState(true);
  const [fotoUrl, setFotoUrl] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const cargarUsuarios = async () => {
    try {
      setRefreshing(true);
      const data = await getUsuarios();
      setUsuarios(data);
    } catch (err) {
      console.error('Error al cargar usuarios:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    cargarUsuarios();
  }, []);

  const handleOpenEdit = (usuario: UsuarioAdmin) => {
    setEditingUsuario(usuario);
    setNombre(usuario.nombre || '');
    setRol(usuario.rol);
    setActivo(usuario.activo);
    setFotoUrl(usuario.fotoUrl || null);
    setErrorMsg(null);
  };

  const handleSaveUsuario = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUsuario) return;

    try {
      setSubmitting(true);
      setErrorMsg(null);

      const request: ActualizarUsuarioRequest = {
        nombre: nombre.trim() ? nombre.trim() : undefined,
        rol,
        activo,
        fotoUrl: fotoUrl || undefined,
      };

      await updateUsuario(editingUsuario.id, request);
      await cargarUsuarios();
      setEditingUsuario(null);
    } catch (err: unknown) {
      console.error('Error al actualizar usuario:', err);
      setErrorMsg('No se pudo guardar la información del usuario.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleEstado = async (usuario: UsuarioAdmin) => {
    try {
      await changeEstado(usuario.id, !usuario.activo);
      await cargarUsuarios();
    } catch (err) {
      console.error('Error al cambiar estado del usuario:', err);
    }
  };

  const handleQuickRolChange = async (
    usuario: UsuarioAdmin,
    nuevoRol: 'ADMINISTRADOR' | 'ENCARGADO' | 'BENEFICIARIO'
  ) => {
    try {
      await changeRol(usuario.id, nuevoRol);
      await cargarUsuarios();
    } catch (err) {
      console.error('Error al cambiar rol:', err);
    }
  };

  const stats = useMemo(() => {
    const total = usuarios.length;
    const activos = usuarios.filter((u) => u.activo).length;
    const admins = usuarios.filter((u) => u.rol === 'ADMINISTRADOR').length;
    const encargados = usuarios.filter((u) => u.rol === 'ENCARGADO').length;
    const beneficiarios = usuarios.filter((u) => u.rol === 'BENEFICIARIO').length;
    return { total, activos, admins, encargados, beneficiarios };
  }, [usuarios]);

  const usuariosFiltrados = useMemo(() => {
    return usuarios.filter((u) => {
      if (filtroRol !== 'todos' && u.rol !== filtroRol) return false;
      if (filtroEstado === 'activo' && !u.activo) return false;
      if (filtroEstado === 'inactivo' && u.activo) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchNombre = u.nombre?.toLowerCase().includes(q) ?? false;
        const matchEmail = u.email.toLowerCase().includes(q);
        if (!matchNombre && !matchEmail) return false;
      }
      return true;
    });
  }, [usuarios, filtroRol, filtroEstado, searchQuery]);

  const getRolBadge = (rolUser: string) => {
    switch (rolUser) {
      case 'ADMINISTRADOR':
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-purple-100 text-purple-900 border border-purple-200 px-2.5 py-0.5 text-xs font-bold">
            <LuShieldAlert className="size-3 text-purple-700" />
            Administrador
          </span>
        );
      case 'ENCARGADO':
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 text-amber-900 border border-amber-200 px-2.5 py-0.5 text-xs font-bold">
            <LuWarehouse className="size-3 text-amber-700" />
            Encargado de Bodega
          </span>
        );
      case 'BENEFICIARIO':
      default:
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 text-emerald-900 border border-emerald-200 px-2.5 py-0.5 text-xs font-bold">
            <LuHeartHandshake className="size-3 text-emerald-700" />
            Beneficiario
          </span>
        );
    }
  };

  return (
    <section className="mx-auto max-w-7xl space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-200 pb-5">
        <div>
          <Eyebrow>Seguridad y Control de Acceso (RBAC)</Eyebrow>
          <h1 className="font-display text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
            Administración de Usuarios
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Control de identidades, fotos de perfil en Cloudinary y asignación de privilegios (RF-01).
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="secondary"
            onClick={cargarUsuarios}
            disabled={refreshing}
            className="flex items-center gap-2"
          >
            <LuRefreshCw className={`size-4 ${refreshing ? 'animate-spin' : ''}`} />
            <span>Actualizar</span>
          </Button>
        </div>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Total Cuentas
            </span>
            <div className="grid size-8 place-items-center rounded-lg bg-blue-50 text-blue-700">
              <LuUsers className="size-4" />
            </div>
          </div>
          <p className="mt-2 font-display text-2xl font-extrabold text-slate-900">{stats.total}</p>
          <p className="mt-0.5 text-xs text-emerald-700 font-semibold">{stats.activos} activos en el sistema</p>
        </Card>

        <Card className="p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Administradores
            </span>
            <div className="grid size-8 place-items-center rounded-lg bg-purple-50 text-purple-700">
              <LuShield className="size-4" />
            </div>
          </div>
          <p className="mt-2 font-display text-2xl font-extrabold text-slate-900">{stats.admins}</p>
          <p className="mt-0.5 text-xs text-slate-400">Control total y seguridad</p>
        </Card>

        <Card className="p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Encargados Bodega
            </span>
            <div className="grid size-8 place-items-center rounded-lg bg-amber-50 text-amber-700">
              <LuWarehouse className="size-4" />
            </div>
          </div>
          <p className="mt-2 font-display text-2xl font-extrabold text-slate-900">{stats.encargados}</p>
          <p className="mt-0.5 text-xs text-slate-400">Operaciones de inventario</p>
        </Card>

        <Card className="p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Beneficiarios
            </span>
            <div className="grid size-8 place-items-center rounded-lg bg-emerald-50 text-emerald-700">
              <LuHeartHandshake className="size-4" />
            </div>
          </div>
          <p className="mt-2 font-display text-2xl font-extrabold text-slate-900">{stats.beneficiarios}</p>
          <p className="mt-0.5 text-xs text-slate-400">Solicitantes de alimentos</p>
        </Card>
      </div>

      {/* Toolbar */}
      <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs">
        <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-12">
          <div className="relative lg:col-span-6">
            <input
              type="text"
              placeholder="Buscar usuario por nombre o correo electrónico..."
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

          <div className="lg:col-span-3">
            <select
              value={filtroRol}
              onChange={(e) => setFiltroRol(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 focus:border-emerald-700 focus:outline-none focus:ring-1 focus:ring-emerald-700 cursor-pointer"
            >
              <option value="todos">Todos los roles</option>
              <option value="ADMINISTRADOR">Solo Administradores</option>
              <option value="ENCARGADO">Solo Encargados de Bodega</option>
              <option value="BENEFICIARIO">Solo Beneficiarios</option>
            </select>
          </div>

          <div className="lg:col-span-3">
            <select
              value={filtroEstado}
              onChange={(e) => setFiltroEstado(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 focus:border-emerald-700 focus:outline-none focus:ring-1 focus:ring-emerald-700 cursor-pointer"
            >
              <option value="todos">Todos los estados</option>
              <option value="activo">Solo Activos</option>
              <option value="inactivo">Solo Inactivos</option>
            </select>
          </div>
        </div>
      </div>

      {/* Users Table / Grid */}
      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <Spinner />
        </div>
      ) : usuariosFiltrados.length === 0 ? (
        <div className="rounded-2xl border-2 border-dashed border-slate-200 bg-white p-12 text-center">
          <LuUsers className="mx-auto size-10 text-slate-400 mb-2" />
          <h3 className="font-display text-base font-bold text-slate-800">No se encontraron usuarios</h3>
          <p className="text-xs text-slate-500 mt-1">Intenta cambiar los términos de búsqueda o filtros.</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full min-w-160 text-left text-sm">
              <thead className="border-b border-slate-200 bg-slate-50/70 text-xs uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="px-5 py-3.5 font-bold">Usuario / Perfil</th>
                  <th className="px-5 py-3.5 font-bold">Correo Electrónico</th>
                  <th className="px-5 py-3.5 font-bold">Rol Asignado</th>
                  <th className="px-5 py-3.5 font-bold">Estado</th>
                  <th className="px-5 py-3.5 font-bold text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {usuariosFiltrados.map((usuario) => (
                  <tr
                    key={usuario.id}
                    className="hover:bg-slate-50/80 transition-colors"
                  >
                    {/* User Profile */}
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="relative size-10 shrink-0 overflow-hidden rounded-full border border-slate-200 bg-slate-100">
                          {usuario.fotoUrl ? (
                            <img
                              src={usuario.fotoUrl}
                              alt={usuario.nombre || usuario.email}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center font-bold text-slate-600 bg-slate-200">
                              {(usuario.nombre || usuario.email).charAt(0).toUpperCase()}
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 leading-tight">
                            {usuario.nombre || 'Sin nombre registrado'}
                          </p>
                          <p className="text-[11px] font-mono text-slate-400">ID #{usuario.id}</p>
                        </div>
                      </div>
                    </td>

                    {/* Email */}
                    <td className="px-5 py-4 font-mono text-xs text-slate-700">
                      {usuario.email}
                    </td>

                    {/* Rol */}
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        {getRolBadge(usuario.rol)}
                        {/* Quick switch */}
                        <select
                          value={usuario.rol}
                          onChange={(e) =>
                            handleQuickRolChange(
                              usuario,
                              e.target.value as 'ADMINISTRADOR' | 'ENCARGADO' | 'BENEFICIARIO'
                            )
                          }
                          className="rounded-lg border border-slate-200 bg-slate-50 px-2 py-1 text-[11px] text-slate-700 focus:border-emerald-700 focus:outline-none cursor-pointer"
                        >
                          <option value="ADMINISTRADOR">Admin</option>
                          <option value="ENCARGADO">Encargado</option>
                          <option value="BENEFICIARIO">Beneficiario</option>
                        </select>
                      </div>
                    </td>

                    {/* Estado */}
                    <td className="px-5 py-4">
                      {usuario.activo ? (
                        <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700">
                          <span className="size-2 rounded-full bg-emerald-600 animate-pulse" />
                          Activo
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs font-semibold text-slate-400">
                          <span className="size-2 rounded-full bg-slate-400" />
                          Inactivo
                        </span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => handleToggleEstado(usuario)}
                          className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition cursor-pointer ${
                            usuario.activo
                              ? 'text-red-700 hover:bg-red-50'
                              : 'text-emerald-700 hover:bg-emerald-50'
                          }`}
                          title={usuario.activo ? 'Desactivar usuario' : 'Activar usuario'}
                        >
                          {usuario.activo ? 'Desactivar' : 'Activar'}
                        </button>

                        <button
                          type="button"
                          onClick={() => handleOpenEdit(usuario)}
                          className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-bold text-slate-700 hover:bg-slate-100 transition cursor-pointer"
                        >
                          <LuPencil className="size-3.5" />
                          <span>Editar</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {editingUsuario && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-purple-700">
                  Gestión de Identidad
                </span>
                <h3 className="font-display text-xl font-bold text-slate-900">
                  Editar Usuario
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setEditingUsuario(null)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 cursor-pointer"
              >
                <LuX className="size-5" />
              </button>
            </div>

            <form onSubmit={handleSaveUsuario} className="mt-4 space-y-4">
              {errorMsg && (
                <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-800 flex items-center gap-2">
                  <LuTriangleAlert className="size-4 shrink-0 text-red-600" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                  Correo Electrónico (No modificable)
                </label>
                <input
                  type="email"
                  disabled
                  value={editingUsuario.email}
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-100 px-3.5 py-2 text-sm text-slate-500 font-mono cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                  Nombre Completo
                </label>
                <input
                  type="text"
                  placeholder="Nombre de la persona o entidad..."
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-200 px-3.5 py-2 text-sm text-slate-900 focus:border-purple-700 focus:outline-none focus:ring-1 focus:ring-purple-700"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                  Rol del Sistema (Permisos RBAC)
                </label>
                <select
                  value={rol}
                  onChange={(e) =>
                    setRol(e.target.value as 'ADMINISTRADOR' | 'ENCARGADO' | 'BENEFICIARIO')
                  }
                  className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-900 focus:border-purple-700 focus:outline-none focus:ring-1 focus:ring-purple-700 cursor-pointer"
                >
                  <option value="ADMINISTRADOR">Administrador (Control Total)</option>
                  <option value="ENCARGADO">Encargado de Bodega (Operaciones)</option>
                  <option value="BENEFICIARIO">Beneficiario (Portal de Solicitudes)</option>
                </select>
              </div>

              <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={activo}
                    onChange={(e) => setActivo(e.target.checked)}
                    className="size-4 rounded border-slate-300 text-purple-700 focus:ring-purple-700 cursor-pointer"
                  />
                  <div>
                    <span className="text-xs font-bold text-slate-800">
                      Cuenta activa
                    </span>
                    <p className="text-[11px] text-slate-500">
                      Si se desactiva, el usuario no podrá iniciar sesión en la plataforma.
                    </p>
                  </div>
                </label>
              </div>

              {/* Cloudinary Avatar Upload */}
              <ImageUpload
                value={fotoUrl}
                onChange={setFotoUrl}
                folder="usuarios"
                label="Fotografía de Perfil (Cloudinary)"
              />

              <div className="mt-6 flex items-center justify-end gap-3 border-t border-slate-100 pt-4">
                <button
                  type="button"
                  onClick={() => setEditingUsuario(null)}
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
                  <span>Guardar Cambios</span>
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
};
