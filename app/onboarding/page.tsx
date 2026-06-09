'use client'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import Button from '@/components/ui/Button'
import { cn } from '@/lib/utils'
import type { InvestorProfile } from '@/lib/types'

const CAPITAL_OPTIONS: { value: InvestorProfile['capital']; label: string; desc: string }[] = [
  { value: 'menos_10k', label: '< $10K', desc: 'Estás empezando a invertir.' },
  { value: '10k_50k', label: '$10K - $50K', desc: 'Ya tenés un capital inicial.' },
  { value: '50k_200k', label: '$50K - $200K', desc: 'Buscás hacer crecer tu patrimonio.' },
  { value: 'mas_200k', label: '> $200K', desc: 'Gestionás un portafolio significativo.' },
]

const RISK_OPTIONS: { value: InvestorProfile['risk']; label: string; desc: string }[] = [
  { value: 'conservador', label: 'Conservador', desc: 'Priorizás preservar tu capital sobre el rendimiento.' },
  { value: 'moderado', label: 'Moderado', desc: 'Buscás un equilibrio entre riesgo y rendimiento.' },
  { value: 'agresivo', label: 'Agresivo', desc: 'Aceptás más volatilidad a cambio de mayor potencial.' },
]

const TIMEFRAME_OPTIONS: { value: InvestorProfile['timeframe']; label: string; desc: string }[] = [
  { value: 'corto', label: 'Corto plazo', desc: 'Menos de 1 año.' },
  { value: 'mediano', label: 'Mediano plazo', desc: 'Entre 1 y 5 años.' },
  { value: 'largo', label: 'Largo plazo', desc: 'Más de 5 años.' },
]

const GOAL_OPTIONS = [
  { value: 'crecimiento', label: 'Crecimiento de capital' },
  { value: 'dividendos', label: 'Dividendos' },
  { value: 'preservar', label: 'Preservar capital' },
  { value: 'especulacion', label: 'Especulación' },
  { value: 'aprendizaje', label: 'Aprendizaje' },
]

const TOTAL_STEPS = 4

export default function OnboardingPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [capital, setCapital] = useState<InvestorProfile['capital'] | null>(null)
  const [risk, setRisk] = useState<InvestorProfile['risk'] | null>(null)
  const [timeframe, setTimeframe] = useState<InvestorProfile['timeframe'] | null>(null)
  const [goals, setGoals] = useState<string[]>([])

  const canContinue =
    (step === 1 && capital) ||
    (step === 2 && risk) ||
    (step === 3 && timeframe) ||
    (step === 4 && goals.length > 0)

  function toggleGoal(value: string) {
    setGoals((prev) => (prev.includes(value) ? prev.filter((g) => g !== value) : [...prev, value]))
  }

  function handleNext() {
    if (step < TOTAL_STEPS) {
      setStep((s) => s + 1)
    } else {
      // TODO: persist InvestorProfile to Supabase
      router.push('/dashboard')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-bg-base px-4 py-12">
      <div className="w-full max-w-xl animate-slide-up">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-text-secondary">Paso {step} de {TOTAL_STEPS}</span>
            <span className="text-sm font-num text-accent-blue">{Math.round((step / TOTAL_STEPS) * 100)}%</span>
          </div>
          <div className="h-1.5 w-full rounded-full bg-bg-card overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-brand transition-all duration-300"
              style={{ width: `${(step / TOTAL_STEPS) * 100}%` }}
            />
          </div>
        </div>

        <div className="card p-8">
          {step === 1 && (
            <>
              <h1 className="text-2xl font-display font-bold text-text-primary mb-1">¿Cuánto capital tenés disponible?</h1>
              <p className="text-sm text-text-secondary mb-6">Esto nos ayuda a contextualizar tu portafolio.</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {CAPITAL_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setCapital(opt.value)}
                    className={cn(
                      'text-left rounded-card border p-4 transition-all',
                      capital === opt.value
                        ? 'border-accent-blue bg-accent-blue/5 shadow-blue'
                        : 'border-border bg-bg-base hover:border-border-light'
                    )}
                  >
                    <p className="font-num text-lg font-semibold text-text-primary">{opt.label}</p>
                    <p className="text-xs text-text-secondary mt-1">{opt.desc}</p>
                  </button>
                ))}
              </div>
            </>
          )}

          {step === 2 && (
            <>
              <h1 className="text-2xl font-display font-bold text-text-primary mb-1">¿Cuál es tu tolerancia al riesgo?</h1>
              <p className="text-sm text-text-secondary mb-6">Definí cuánta volatilidad estás dispuesto a aceptar.</p>
              <div className="space-y-3">
                {RISK_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setRisk(opt.value)}
                    className={cn(
                      'w-full text-left rounded-card border p-4 transition-all',
                      risk === opt.value
                        ? 'border-accent-blue bg-accent-blue/5 shadow-blue'
                        : 'border-border bg-bg-base hover:border-border-light'
                    )}
                  >
                    <p className="font-display font-semibold text-text-primary">{opt.label}</p>
                    <p className="text-xs text-text-secondary mt-1">{opt.desc}</p>
                  </button>
                ))}
              </div>
            </>
          )}

          {step === 3 && (
            <>
              <h1 className="text-2xl font-display font-bold text-text-primary mb-1">¿Cuál es tu horizonte temporal?</h1>
              <p className="text-sm text-text-secondary mb-6">El plazo en el que pensás mantener tus inversiones.</p>
              <div className="space-y-3">
                {TIMEFRAME_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setTimeframe(opt.value)}
                    className={cn(
                      'w-full text-left rounded-card border p-4 transition-all',
                      timeframe === opt.value
                        ? 'border-accent-blue bg-accent-blue/5 shadow-blue'
                        : 'border-border bg-bg-base hover:border-border-light'
                    )}
                  >
                    <p className="font-display font-semibold text-text-primary">{opt.label}</p>
                    <p className="text-xs text-text-secondary mt-1">{opt.desc}</p>
                  </button>
                ))}
              </div>
            </>
          )}

          {step === 4 && (
            <>
              <h1 className="text-2xl font-display font-bold text-text-primary mb-1">¿Cuáles son tus objetivos?</h1>
              <p className="text-sm text-text-secondary mb-6">Podés seleccionar más de uno.</p>
              <div className="space-y-3">
                {GOAL_OPTIONS.map((opt) => {
                  const selected = goals.includes(opt.value)
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => toggleGoal(opt.value)}
                      className={cn(
                        'w-full flex items-center gap-3 text-left rounded-card border p-4 transition-all',
                        selected
                          ? 'border-accent-blue bg-accent-blue/5 shadow-blue'
                          : 'border-border bg-bg-base hover:border-border-light'
                      )}
                    >
                      <span
                        className={cn(
                          'flex h-5 w-5 shrink-0 items-center justify-center rounded border',
                          selected ? 'border-accent-blue bg-accent-blue text-bg-base' : 'border-border'
                        )}
                      >
                        {selected && (
                          <svg className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M16.7 5.3a1 1 0 010 1.4l-7.5 7.5a1 1 0 01-1.4 0L3.3 9.7a1 1 0 011.4-1.4l3.3 3.3 6.8-6.8a1 1 0 011.4 0z" clipRule="evenodd" />
                          </svg>
                        )}
                      </span>
                      <span className="font-medium text-text-primary">{opt.label}</span>
                    </button>
                  )
                })}
              </div>
            </>
          )}

          <div className="mt-8 flex items-center justify-between gap-3">
            <Button
              variant="ghost"
              onClick={() => setStep((s) => Math.max(1, s - 1))}
              disabled={step === 1}
            >
              Atrás
            </Button>
            <Button variant={step === TOTAL_STEPS ? 'gold' : 'primary'} onClick={handleNext} disabled={!canContinue}>
              {step === TOTAL_STEPS ? 'Finalizar' : 'Siguiente'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
