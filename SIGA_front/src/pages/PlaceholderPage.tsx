import { Link } from 'react-router-dom'
import { Eyebrow } from '../components/atoms/Typography'

type PlaceholderPageProps = { title: string; description: string }

export function PlaceholderPage({ title, description }: PlaceholderPageProps) {
  return <section className="mx-auto max-w-5xl"><Eyebrow>Módulo SIGA</Eyebrow><h1 className="font-display text-4xl font-extrabold tracking-tight text-slate-900">{title}</h1><p className="mt-3 max-w-xl text-slate-500">{description}</p><Link className="mt-8 inline-flex rounded-lg bg-emerald-800 px-4 py-3 text-sm font-bold text-white hover:bg-emerald-900" to="/dashboard">Volver al dashboard</Link></section>
}
