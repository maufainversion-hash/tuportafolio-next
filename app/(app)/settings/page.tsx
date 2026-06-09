'use client'
import { useState } from 'react'
import Button from '@/components/ui/Button'
import { cn } from '@/lib/utils'

export default function SettingsPage() {
  const [name, setName] = useState('Mi cuenta')
  const [baseCurrency, setBaseCurrency] = useState<'ARS' | 'USD'>('USD')
  const [benchmark, setBenchmark] = useState<'SPY' | 'MERVAL'>('SPY')
  const [showDisclaimer, setShowDisclaimer] = useState(true)

  const inputClass =
    'w-full rounded-btn border border-border bg-bg-base px-3 py-2.5 text-sm text-text-primary placeholder:text-text-muted focus:border-accent-blue focus:outline-none focus:ring-1 focus:ring-accent-blue transition-colors'

  function handleLogout() {
    // TODO: Supabase auth signOut
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-display font-bold text-text-primary">Configuración</h1>
        <p className="text-sm text-text-secondary">Gestioná tu cuenta y preferencias.</p>
      </div>

      {/* Perfil */}
      <section className="card p-6">
        <h2 className="font-display font-semibold text-text-primary mb-4">Perfil</h2>
        <div className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-text-secondary mb-1.5">Nombre</label>
            <input id="name" type="text" value={name} onChange={(e) => setName(e.target.value)} className={inputClass} />
          </div>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-text-secondary mb-1.5">Email</label>
            <input
              id="email"
              type="email"
              value="vos@email.com"
              readOnly
              className={cn(inputClass, 'cursor-not-allowed text-text-secondary')}
            />
          </div>
        </div>
      </section>

      {/* Portafolio */}
      <section className="card p-6">
        <h2 className="font-display font-semibold text-text-primary mb-4">Portafolio</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="currency" className="block text-sm font-medium text-text-secondary mb-1.5">Moneda base</label>
            <select
              id="currency"
              value={baseCurrency}
              onChange={(e) => setBaseCurrency(e.target.value as 'ARS' | 'USD')}
              className={inputClass}
            >
              <option value="USD">USD</option>
              <option value="ARS">ARS</option>
            </select>
          </div>
          <div>
            <label htmlFor="benchmark" className="block text-sm font-medium text-text-secondary mb-1.5">Benchmark</label>
            <select
              id="benchmark"
              value={benchmark}
              onChange={(e) => setBenchmark(e.target.value as 'SPY' | 'MERVAL')}
              className={inputClass}
            >
              <option value="SPY">SPY</option>
              <option value="MERVAL">MERVAL</option>
            </select>
          </div>
        </div>
      </section>

      {/* Lucas */}
      <section className="card p-6">
        <h2 className="font-display font-semibold text-text-primary mb-4">Lucas</h2>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-text-primary">Mostrar descargo de responsabilidad</p>
            <p className="text-xs text-text-secondary mt-0.5">Recuerda que Lucas es una herramienta de análisis, no un asesor de inversiones.</p>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={showDisclaimer}
            onClick={() => setShowDisclaimer((v) => !v)}
            className={cn(
              'relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors',
              showDisclaimer ? 'bg-accent-blue' : 'bg-border'
            )}
          >
            <span
              className={cn(
                'inline-block h-4 w-4 transform rounded-full bg-bg-base transition-transform',
                showDisclaimer ? 'translate-x-6' : 'translate-x-1'
              )}
            />
          </button>
        </div>
      </section>

      {/* Cuenta */}
      <section className="card p-6">
        <h2 className="font-display font-semibold text-text-primary mb-4">Cuenta</h2>
        <Button
          variant="secondary"
          onClick={handleLogout}
          className="border-danger/30 text-danger hover:bg-danger/10 hover:border-danger/50"
        >
          Cerrar sesión
        </Button>
      </section>
    </div>
  )
}
