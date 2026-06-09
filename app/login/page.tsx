'use client'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import Button from '@/components/ui/Button'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (!email || !password) { setError('Ingresá tu email y contraseña.'); return }
    setLoading(true)
    try {
      // TODO: Supabase auth
      // const supabase = createClient()
      // const { error } = await supabase.auth.signInWithPassword({ email, password })
      // if (error) throw error
      await new Promise((r) => setTimeout(r, 600))
      router.push('/dashboard')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No pudimos iniciar sesión. Intentá de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-bg-base px-4">
      <div className="w-full max-w-md animate-slide-up">
        <Link href="/" className="flex items-center justify-center gap-2 mb-8">
          <div className="w-9 h-9 rounded-lg bg-gradient-brand flex items-center justify-center">
            <span className="text-bg-base font-bold text-base font-display">T</span>
          </div>
          <span className="font-display font-semibold text-lg text-text-primary">TuPortafolioIA</span>
        </Link>
        <div className="card p-8">
          <h1 className="text-2xl font-display font-bold text-text-primary mb-1">Iniciá sesión</h1>
          <p className="text-sm text-text-secondary mb-6">Accedé a tu portafolio y a Lucas.</p>
          {error && (
            <div className="mb-4 rounded-btn border border-danger/20 bg-danger/10 px-3 py-2 text-sm text-danger">{error}</div>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
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
                autoComplete="current-password"
                className="w-full rounded-btn border border-border bg-bg-base px-3 py-2.5 text-sm text-text-primary placeholder:text-text-muted focus:border-accent-blue focus:outline-none focus:ring-1 focus:ring-accent-blue transition-colors"
              />
            </div>
            <Button type="submit" loading={loading} className="w-full">Iniciar sesión</Button>
          </form>
          <p className="mt-6 text-center text-sm text-text-secondary">
            ¿No tenés cuenta?{' '}
            <Link href="/register" className="text-accent-blue hover:text-accent-blue-hover font-medium">Creá una</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
