import { Link } from 'react-router-dom'
import { AuthTemplate } from '../../components/templates/AuthTemplate'
import { Button } from '../../components/atoms/Button'
import { Eyebrow } from '../../components/atoms/Typography'
import { RegisterForm } from '../../components/organisms/RegisterForm'

export function RegisterPage() {
  return <AuthTemplate><Eyebrow>Únete a SIGA</Eyebrow><h2 className="font-display text-4xl font-extrabold tracking-tight text-slate-900">Crear cuenta</h2><p className="mb-8 mt-2 text-sm leading-6 text-slate-500">Elige cómo quieres participar en el banco de alimentos.</p><RegisterForm /><Link className="mt-6 block" to="/login"><Button className="w-full" type="button" variant="secondary">Volver al inicio de sesión</Button></Link></AuthTemplate>
}
