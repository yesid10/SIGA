import { useState } from 'react'
import type { FormEvent } from 'react'
import { clearSession, getStoredUser, login, type Usuario } from './services/auth'

function App() {
  const [user, setUser] = useState<Usuario | null>(getStoredUser)
  const [email, setEmail] = useState('admin@siga.local')
  const [password, setPassword] = useState('Admin123!')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')
    setIsLoading(true)
    try {
      const response = await login(email, password)
      setUser(response.usuario)
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Error inesperado.')
    } finally {
      setIsLoading(false)
    }
  }

  function handleLogout() {
    clearSession()
    setUser(null)
  }

  if (user) {
    return (
      <main className="app-shell">
        <header className="topbar">
          <div className="brand compact-brand"><span className="brand-mark">S</span><span>SIGA</span></div>
          <div className="user-menu">
            <div><strong>{user.email}</strong><span>{user.rol}</span></div>
            <button className="button button-secondary" type="button" onClick={handleLogout}>Cerrar sesión</button>
          </div>
        </header>
        <section className="welcome-card">
          <div className="eyebrow">Acceso confirmado</div>
          <h1>Bienvenido a SIGA</h1>
          <p>Tu sesión está activa. En la siguiente etapa construiremos el dashboard de inventario, lotes y distribución FEFO.</p>
          <div className="feature-grid">
            <article><span className="feature-icon">▦</span><h2>Inventario por lotes</h2><p>Control de existencias, ubicaciones y fechas de vencimiento.</p></article>
            <article><span className="feature-icon">↗</span><h2>Priorización FEFO</h2><p>Distribución ordenada por el lote que vence primero.</p></article>
            <article><span className="feature-icon">✓</span><h2>Trazabilidad</h2><p>Registro de movimientos y responsables de cada operación.</p></article>
          </div>
        </section>
      </main>
    )
  }

  return (
    <main className="login-layout">
      <section className="login-hero">
        <div className="brand"><span className="brand-mark">S</span><span>SIGA</span></div>
        <div className="hero-content">
          <div className="eyebrow">Sistema de gestión de alimentos</div>
          <h1>Menos desperdicio.<br /><em>Más impacto.</em></h1>
          <p>Gestiona donaciones, inventario y distribución de alimentos con trazabilidad y priorización inteligente.</p>
        </div>
        <div className="hero-note">Banco de alimentos · UIS</div>
      </section>
      <section className="login-panel">
        <div className="login-form-wrapper">
          <div className="mobile-brand brand"><span className="brand-mark">S</span><span>SIGA</span></div>
          <div className="eyebrow">Área segura</div>
          <h2>Iniciar sesión</h2>
          <p className="form-intro">Ingresa tus credenciales para continuar al sistema.</p>
          <form onSubmit={handleSubmit} noValidate>
            <label htmlFor="email">Correo electrónico</label>
            <input id="email" type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="nombre@organizacion.org" required />
            <label htmlFor="password">Contraseña</label>
            <input id="password" type="password" autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="••••••••" required />
            {error && <div className="error-message" role="alert">{error}</div>}
            <button className="button button-primary submit-button" type="submit" disabled={isLoading}>{isLoading ? 'Validando…' : 'Entrar al sistema'}{!isLoading && <span aria-hidden="true">→</span>}</button>
          </form>
          <p className="security-note"><span aria-hidden="true">▣</span> Conexión protegida con autenticación JWT</p>
        </div>
      </section>
    </main>
  )
}

export default App
