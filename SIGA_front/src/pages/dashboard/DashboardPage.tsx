import { Link } from 'react-router-dom'
import {
  LuBox,
  LuClipboardList,
  LuTruck,
  LuBoxes,
  LuUsers,
  LuMapPin,
  LuHeartHandshake,
  LuArrowRight,
  LuTriangleAlert,
} from 'react-icons/lu'
import { useAuthStore } from '../../stores/authStore'
import { Badge } from '../../components/atoms/Badge'
import { Eyebrow } from '../../components/atoms/Typography'

export const DashboardPage = () => {
  const user = useAuthStore((state) => state.user)
  const rol = user?.rol ?? 'BENEFICIARIO'

  const renderBeneficiarioDashboard = () => (
    <div className="mt-8 space-y-8">
      <div className="rounded-2xl border border-emerald-100 bg-gradient-to-br from-emerald-50/70 via-white to-emerald-50/30 p-6 md:p-8">
        <h2 className="font-display text-2xl font-bold text-slate-900">
          Hola, {user?.nombre || user?.email}
        </h2>
        <p className="mt-2 max-w-3xl text-sm leading-relaxed text-slate-600 md:text-base">
          Bienvenido al portal de beneficiarios de <strong>SIGA</strong>. Aquí puedes consultar los productos
          alimenticios disponibles para entrega y consultar el estado de tus solicitudes en tiempo real.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <article className="flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-6 shadow-xs transition hover:shadow-md">
          <div>
            <div className="flex items-center justify-between">
              <span className="grid size-10 place-items-center rounded-lg bg-emerald-50 text-emerald-700">
                <LuBox className="size-5" />
              </span>
              <Badge className="bg-emerald-50 text-emerald-800">Disponible</Badge>
            </div>
            <h3 className="mt-5 font-display text-lg font-bold text-slate-900">
              Catálogo de Alimentos
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-slate-500">
              Explora los alimentos perecederos y no perecederos registrados en el banco para armar tu solicitud.
            </p>
          </div>
          <div className="mt-6 border-t border-slate-100 pt-4">
            <Link
              to="/products"
              className="inline-flex items-center gap-2 text-sm font-semibold text-emerald-700 hover:text-emerald-900"
            >
              <span>Explorar productos disponibles</span>
              <LuArrowRight className="size-4" />
            </Link>
          </div>
        </article>

        <article className="flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-6 shadow-xs transition hover:shadow-md">
          <div>
            <div className="flex items-center justify-between">
              <span className="grid size-10 place-items-center rounded-lg bg-indigo-50 text-indigo-700">
                <LuClipboardList className="size-5" />
              </span>
              <Badge className="bg-indigo-50 text-indigo-800">Seguimiento</Badge>
            </div>
            <h3 className="mt-5 font-display text-lg font-bold text-slate-900">
              Mis Solicitudes
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-slate-500">
              Consulta en tiempo real si tus pedidos se encuentran pendientes, aprobados, atendidos parcialmente o listos para retiro.
            </p>
          </div>
          <div className="mt-6 border-t border-slate-100 pt-4">
            <Link
              to="/requests"
              className="inline-flex items-center gap-2 text-sm font-semibold text-indigo-700 hover:text-indigo-900"
            >
              <span>Consultar historial de solicitudes</span>
              <LuArrowRight className="size-4" />
            </Link>
          </div>
        </article>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-6">
        <h4 className="font-display text-base font-bold text-slate-900">
          ¿Cómo gestionamos la asignación de alimentos?
        </h4>
        <p className="mt-2 text-sm leading-relaxed text-slate-600">
          En SIGA cuidamos que los alimentos lleguen a tiempo a quienes más lo necesitan aplicando el principio{' '}
          <strong>FEFO (First Expired, First Out)</strong>. Las solicitudes son revisadas por el equipo de bodega y
          atendidas en base a la disponibilidad y rotación segura de productos.
        </p>
      </div>
    </div>
  )

  const renderEncargadoDashboard = () => (
    <div className="mt-8 space-y-8">
      <div className="rounded-2xl border border-amber-100 bg-gradient-to-br from-amber-50/70 via-white to-amber-50/30 p-6 md:p-8">
        <h2 className="font-display text-2xl font-bold text-slate-900">
          Panel de Operación de Bodega
        </h2>
        <p className="mt-2 max-w-3xl text-sm leading-relaxed text-slate-600 md:text-base">
          Monitorea los lotes de inventario, atiende solicitudes con priorización automática{' '}
          <strong>FEFO</strong> y gestiona el ingreso de donaciones cumpliendo las reglas de refrigeración.
        </p>
      </div>

      <div>
        <div className="flex items-center gap-2">
          <LuTriangleAlert className="size-5 text-amber-600" />
          <h3 className="font-display text-lg font-bold text-slate-900">
            Monitoreo y Alertas de Vencimiento (HU-03 / RF-05)
          </h3>
        </div>
        <p className="mt-1 text-sm text-slate-500">
          Semaforización preventiva para priorizar la distribución antes del deterioro.
        </p>
        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          <div className="rounded-xl border border-red-200 bg-red-50/60 p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-red-800">Urgencia Crítica</span>
              <span className="rounded-full bg-red-600 px-2 py-0.5 text-xs font-bold text-white">1 Día</span>
            </div>
            <p className="mt-3 font-display text-2xl font-extrabold text-red-950">Prioridad 1</p>
            <p className="mt-1 text-xs text-red-700">Despacho inmediato obligatorio.</p>
          </div>

          <div className="rounded-xl border border-amber-200 bg-amber-50/60 p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-800">Atención Alta</span>
              <span className="rounded-full bg-amber-600 px-2 py-0.5 text-xs font-bold text-white">3 Días</span>
            </div>
            <p className="mt-3 font-display text-2xl font-extrabold text-amber-950">Prioridad 2</p>
            <p className="mt-1 text-xs text-amber-700">Asignar en próximas solicitudes.</p>
          </div>

          <div className="rounded-xl border border-blue-200 bg-blue-50/60 p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-blue-800">Alerta Preventiva</span>
              <span className="rounded-full bg-blue-600 px-2 py-0.5 text-xs font-bold text-white">7 Días</span>
            </div>
            <p className="mt-3 font-display text-2xl font-extrabold text-blue-950">Prioridad 3</p>
            <p className="mt-1 text-xs text-blue-700">Monitoreo y rotación en bodega.</p>
          </div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <article className="rounded-xl border border-slate-200 bg-white p-6 shadow-xs">
          <span className="grid size-10 place-items-center rounded-lg bg-emerald-50 text-emerald-700">
            <LuTruck className="size-5" />
          </span>
          <h4 className="mt-4 font-display text-base font-bold text-slate-900">Ingreso de Donaciones</h4>
          <p className="mt-2 text-sm text-slate-500">
            Registra donaciones recibidas de personas o empresas y genera sus lotes trazables en bodega.
          </p>
          <Link to="/donations" className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-emerald-700 hover:text-emerald-900">
            <span>Ir a donaciones</span>
            <LuArrowRight className="size-4" />
          </Link>
        </article>

        <article className="rounded-xl border border-slate-200 bg-white p-6 shadow-xs">
          <span className="grid size-10 place-items-center rounded-lg bg-blue-50 text-blue-700">
            <LuBoxes className="size-5" />
          </span>
          <h4 className="mt-4 font-display text-base font-bold text-slate-900">Control de Inventario</h4>
          <p className="mt-2 text-sm text-slate-500">
            Revisa existencias por lote, estanterías secas y cámaras refrigeradas (regla RF-14).
          </p>
          <Link to="/inventory" className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-blue-700 hover:text-blue-900">
            <span>Consultar inventario</span>
            <LuArrowRight className="size-4" />
          </Link>
        </article>

        <article className="rounded-xl border border-slate-200 bg-white p-6 shadow-xs">
          <span className="grid size-10 place-items-center rounded-lg bg-indigo-50 text-indigo-700">
            <LuClipboardList className="size-5" />
          </span>
          <h4 className="mt-4 font-display text-base font-bold text-slate-900">Bandeja de Solicitudes</h4>
          <p className="mt-2 text-sm text-slate-500">
            Aprueba o rechaza pedidos de beneficiarios activando la asignación automática FEFO.
          </p>
          <Link to="/requests" className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-indigo-700 hover:text-indigo-900">
            <span>Gestionar solicitudes</span>
            <LuArrowRight className="size-4" />
          </Link>
        </article>
      </div>
    </div>
  )

  const renderAdminDashboard = () => (
    <div className="mt-8 space-y-8">
      <div className="rounded-2xl border border-indigo-100 bg-gradient-to-br from-indigo-50/70 via-white to-indigo-50/30 p-6 md:p-8">
        <h2 className="font-display text-2xl font-bold text-slate-900">
          Panel de Administración y Gobierno
        </h2>
        <p className="mt-2 max-w-3xl text-sm leading-relaxed text-slate-600 md:text-base">
          Gestión central del banco de alimentos: configuración de infraestructura, roles de acceso, catálogos maestros y
          reportes globales de impacto y desperdicio.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-4">
        <article className="rounded-xl border border-slate-200 bg-white p-6 shadow-xs">
          <span className="grid size-10 place-items-center rounded-lg bg-indigo-50 text-indigo-700">
            <LuUsers className="size-5" />
          </span>
          <div className="mt-3 text-xs font-bold uppercase tracking-wider text-indigo-600">Seguridad & RBAC</div>
          <h4 className="mt-1 font-display text-base font-bold text-slate-900">Usuarios y Roles</h4>
          <p className="mt-2 text-sm text-slate-500">
            Crea cuentas internas y asigna roles de Encargado o Administrador (RF-15, HU-10).
          </p>
          <Link to="/users" className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-indigo-700 hover:text-indigo-900">
            <span>Gestionar usuarios</span>
            <LuArrowRight className="size-4" />
          </Link>
        </article>

        <article className="rounded-xl border border-slate-200 bg-white p-6 shadow-xs">
          <span className="grid size-10 place-items-center rounded-lg bg-emerald-50 text-emerald-700">
            <LuBox className="size-5" />
          </span>
          <div className="mt-3 text-xs font-bold uppercase tracking-wider text-emerald-600">Catálogos</div>
          <h4 className="mt-1 font-display text-base font-bold text-slate-900">Productos</h4>
          <p className="mt-2 text-sm text-slate-500">
            Clasifica productos por categorías y marca perecederos (RF-03).
          </p>
          <Link to="/products" className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-emerald-700 hover:text-emerald-900">
            <span>Ver catálogo</span>
            <LuArrowRight className="size-4" />
          </Link>
        </article>

        <article className="rounded-xl border border-slate-200 bg-white p-6 shadow-xs">
          <span className="grid size-10 place-items-center rounded-lg bg-blue-50 text-blue-700">
            <LuMapPin className="size-5" />
          </span>
          <div className="mt-3 text-xs font-bold uppercase tracking-wider text-blue-600">Infraestructura</div>
          <h4 className="mt-1 font-display text-base font-bold text-slate-900">Ubicaciones</h4>
          <p className="mt-2 text-sm text-slate-500">
            Gestiona bodegas secas y refrigeradas con control de capacidad (RF-13, RF-14).
          </p>
          <Link to="/locations" className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-blue-700 hover:text-blue-900">
            <span>Ver bodegas</span>
            <LuArrowRight className="size-4" />
          </Link>
        </article>

        <article className="rounded-xl border border-slate-200 bg-white p-6 shadow-xs">
          <span className="grid size-10 place-items-center rounded-lg bg-amber-50 text-amber-700">
            <LuHeartHandshake className="size-5" />
          </span>
          <div className="mt-3 text-xs font-bold uppercase tracking-wider text-amber-600">Directorio</div>
          <h4 className="mt-1 font-display text-base font-bold text-slate-900">Donantes</h4>
          <p className="mt-2 text-sm text-slate-500">
            Directorio de aliados estratégicos, empresas y personas naturales donantes.
          </p>
          <Link to="/donors" className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-amber-700 hover:text-amber-900">
            <span>Ver donantes</span>
            <LuArrowRight className="size-4" />
          </Link>
        </article>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-6">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h4 className="font-display text-base font-bold text-slate-900">
              Reportes Globales de Impacto (RF-16 / HU-11)
            </h4>
            <p className="mt-1 text-sm text-slate-500">
              Consolidación de kilogramos recibidos, distribuidos a beneficiarios y mermas por vencimiento en rango de fechas.
            </p>
          </div>
          <Badge className="w-fit bg-slate-100 text-slate-700">Próxima Fase</Badge>
        </div>
      </div>
    </div>
  )

  const getRoleBadge = () => {
    switch (rol) {
      case 'ADMINISTRADOR':
        return <Badge className="border border-indigo-200 bg-indigo-50 text-indigo-800">Administrador</Badge>
      case 'ENCARGADO':
        return <Badge className="border border-amber-200 bg-amber-50 text-amber-800">Encargado de Bodega</Badge>
      case 'BENEFICIARIO':
      default:
        return <Badge className="border border-emerald-200 bg-emerald-50 text-emerald-800">Beneficiario</Badge>
    }
  }

  return (
    <section className="mx-auto max-w-6xl">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <Eyebrow>Sistema Integral de Gestión de Alimentos</Eyebrow>
          <h1 className="font-display text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
            Bienvenido a SIGA
          </h1>
        </div>
        <div>{getRoleBadge()}</div>
      </div>

      {rol === 'BENEFICIARIO' && renderBeneficiarioDashboard()}
      {rol === 'ENCARGADO' && renderEncargadoDashboard()}
      {rol === 'ADMINISTRADOR' && renderAdminDashboard()}
    </section>
  )
}
