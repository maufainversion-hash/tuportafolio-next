'use client'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import Button from '@/components/ui/Button'

export default function RegisterPage() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (!name || !email || !password) { setError('Completá todos los campos.'); return }
    if (password.length < 6) { setError('La contraseña debe tener al menos 6 caracteres.'); return }
    if (password !== confirm) { setError('Las contraseñas no coinciden.'); return }
    setLoading(true)
    try {
      // TODO: Supabase auth
      // const supabase = createClient()
      // const { error } = await supabase.auth.signUp({ email, password, options: { data: { name } } })
      // if (error) throw error
      await new Promise((r) => setTimeout(r, 600))
      router.push('/onboarding')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No pudimos crear la cuenta. Intentá de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-bg-base px-4 py-12">
      <div className="w-full max-w-md animate-slide-up">
        <Link href="/" className="flex items-center justify-center gap-2 mb-8">
          <div className="w-9 h-9 rounded-lg bg-gradient-brand flex items-center justify-center">
            <span className="text-bg-base font-bold text-base font-display">T</span>
          </div>
          <span className="font-display font-semibold text-lg text-text-primary">TuPortafolioIA</span>
        </Link>
        <div className="card p-8">
          <h1 className="text-2xl font-display font-bold text-text-primary mb-1">Creá tu cuenta</h1>
          <p className="text-sm text-text-secondary mb-6">Empezá a construir tu portafolio con inteligencia.</p>
          {error && (
            <div className="mb-4 rounded-btn border border-danger/20 bg-danger/10 px-3 py-2 text-sm text-danger">{error}</div>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-text-secondary mb-1.5">Nombre</label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Tu nombre"
                autoComplete="name"
                className="w-full rounded-btn border border-border bg-bg-base px-3 py-2.5 text-sm text-text-primary placeholder:text-text-muted focus:border-accent-blue focus:outline-none focus:ring-1 focus:ring-accent-blue transition-colors"
              />
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-text-secondary mb-1.5">Email</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="vos@email.com"
                autoComplete="email"
                className="w-full rounded-btn border border-border bg-bg-base px-3 py-2.5 text-sm text-text-primary placeholder:text-text-muted focus:border-accent-blue focus:outline-none focus:ring-1 focus:ring-accent-blue transition-colors"
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-text-secondary mb-1.5">Contraseña</label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                autoComplete="new-password"
                className="w-full rounded-btn border border-border bg-bg-base px-3 py-2.5 text-sm text-text-primary placeholder:text-text-muted focus:border-accent-blue focus:outline-none focus:ring-1 focus:ring-accent-blue transition-colors"
              />
            </div>
            <div>
              <label htmlFor="confirm" className="block text-sm font-medium text-text-secondary mb-1.5">Confirmar contraseña</label>
              <input
                id="confirm"
                type="password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                placeholder="••••••••"
                autoComplete="new-password"
                className="w-full rounded-btn border border-border bg-bg-base px-3 py-2.5 text-sm text-text-primary placeholder:text-text-muted focus:border-accent-blue focus:outline-none focus:ring-1 focus:ring-accent-blue transition-colors"
              />
            </div>
            <Button type="submit" variant="gold" loading={loading} className="w-full">Crear cuenta</Button>
          </form>
          <p className="mt-6 text-center text-sm text-text-secondary">
            ¿Ya tenés cuenta?{' '}
            <Link href="/login" className="text-accent-blue hover:text-accent-blue-hover font-medium">Iniciá sesión</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
