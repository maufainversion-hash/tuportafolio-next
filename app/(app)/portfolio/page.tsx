'use client'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import { formatCurrency, formatPercent } from '@/lib/utils'
import { PROFILES } from '@/lib/profiler'
import {
  getCategoryWeights,
  projectPortfolio,
  type BuiltPortfolio,
} from '@/lib/portfolio-engine'

export default function PortfolioPage() {
  const router = useRouter()
  const [portfolio, setPortfolio] = useState<BuiltPortfolio | null>(null)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    try {
      const raw = localStorage.getItem('portfolio')
      if (raw) setPortfolio(JSON.parse(raw))
    } catch {
      // ignore malformed storage
    }
    setLoaded(true)
  }, [])

  if (!loaded) {
    return <div className="p-8 text-text-secondary">Cargando…</div>
  }

  if (!portfolio) {
    return (
      <div className="max-w-md mx-auto mt-20 text-center animate-fade-in">
        <div className="text-5xl mb-4">🧭</div>
        <h1 className="text-2xl font-display font-bold text-text-primary mb-2">Todavía no armaste tu cartera</h1>
        <p className="text-sm text-text-secondary mb-6">
          Hacé el test de perfil y te armamos una cartera personalizada en 2 minutos.
        </p>
        <Link href="/onboarding">
          <Button variant="gold">Armar mi cartera</Button>
        </Link>
      </div>
    )
  }

  const info = PROFILES[portfolio.profile]
  const cur = portfolio.currency
  const amountOf = (p: BuiltPortfolio['positions'][number]) => (cur === 'ARS' ? p.amountARS : p.amountUSD)
  const categories = getCategoryWeights(portfolio)
  const projection = projectPortfolio(portfolio, 5)
  const projYears = [1, 2, 3, 5]
  const colorFor = (category: string) =>
    portfolio.positions.find((p) => p.asset.category === category)?.asset.color

  return (
    <div className="max-w-6xl mx-auto px-2 py-2 space-y-6 animate-fade-in">
      {/* Header */}
      <div className="hero-card p-6 flex flex-wrap items-center justify-between gap-3">
        <div className="relative z-10">
          <h1 className="text-2xl font-display font-bold text-text-primary">Mi Portafolio</h1>
          <div className="flex items-center gap-2 mt-2">
            <Badge variant="blue">
              {info.emoji} {info.label}
            </Badge>
            <Badge variant="success">Retorno esperado {formatPercent(portfolio.expectedReturnAnnual * 100)}/año</Badge>
          </div>
        </div>
        <Button variant="secondary" onClick={() => router.push('/onboarding')} className="relative z-10">
          Rehacer test
        </Button>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="metric-card p-5">
          <span className="metric-label">Capital inicial</span>
          <p className="metric-value metric-value-white mt-2">{formatCurrency(portfolio.totalCapital, cur)}</p>
        </div>
        <div className="metric-card p-5">
          <span className="metric-label">Retorno anual</span>
          <p className="metric-value metric-value-green mt-2">{formatPercent(portfolio.expectedReturnAnnual * 100)}</p>
        </div>
        <div className="metric-card p-5">
          <span className="metric-label">Proyección 3 años</span>
          <p className="metric-value metric-value-blue mt-2">{formatCurrency(projection[3], cur)}</p>
        </div>
        <div className="metric-card p-5">
          <span className="metric-label">Volatilidad</span>
          <p className="metric-value metric-value-amber mt-2">{formatPercent(portfolio.weightedVolatility * 100)}</p>
        </div>
      </div>

      {/* Category distribution */}
      <div className="card p-6">
        <h2 className="section-title">Distribución por categoría</h2>
        <div className="flex w-full h-3 rounded-full overflow-hidden mb-4">
          {categories.map((c) => (
            <div
              key={c.name}
              style={{ width: `${c.pct}%`, background: colorFor(c.name) }}
              title={`${c.name}: ${c.pct.toFixed(1)}%`}
            />
          ))}
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {categories.map((c) => (
            <div key={c.name} className="flex items-center gap-2 text-sm">
              <span className="w-3 h-3 rounded-sm shrink-0" style={{ background: colorFor(c.name) }} />
              <span className="text-text-secondary">{c.name}</span>
              <span className="ml-auto font-num text-text-primary">{c.pct.toFixed(1)}%</span>
            </div>
          ))}
        </div>
      </div>

      {/* Projection table */}
      <div className="card p-6">
        <h2 className="section-title">Proyección estimada</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wider text-text-muted border-b border-border">
                <th className="py-2 font-medium">Plazo</th>
                <th className="py-2 font-medium text-right">Capital proyectado</th>
                <th className="py-2 font-medium text-right">Ganancia estimada</th>
              </tr>
            </thead>
            <tbody>
              {projYears.map((y) => {
                const val = projection[y]
                const gain = val - portfolio.totalCapital
                return (
                  <tr key={y} className="border-b border-border last:border-0">
                    <td className="py-3 text-text-primary">
                      {y} {y === 1 ? 'año' : 'años'}
                    </td>
                    <td className="py-3 text-right font-num text-text-primary">{formatCurrency(val, cur)}</td>
                    <td className="py-3 text-right font-num text-success">+{formatCurrency(gain, cur)}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
        <p className="text-xs text-text-muted mt-3">
          Proyección a retorno esperado constante ({formatPercent(portfolio.expectedReturnAnnual * 100)}/año). No
          representa rendimientos garantizados.
        </p>
      </div>

      {/* Positions table */}
      <div className="card overflow-hidden">
        <div className="px-6 py-4 border-b border-border">
          <h2 className="font-display font-semibold text-text-primary">Posiciones ({portfolio.positions.length})</h2>
        </div>{/* section header kept inline to preserve table border layout */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wider text-text-muted border-b border-border">
                <th className="px-6 py-3 font-medium">Ticker</th>
                <th className="px-6 py-3 font-medium">Categoría</th>
                <th className="px-6 py-3 font-medium text-right">Peso</th>
                <th className="px-6 py-3 font-medium text-right">Monto</th>
                <th className="px-6 py-3 font-medium text-right">Retorno esp. anual</th>
              </tr>
            </thead>
            <tbody>
              {portfolio.positions.map((p) => (
                <tr
                  key={p.assetId}
                  className="border-b border-border last:border-0 hover:bg-bg-card-hover transition-colors"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full shrink-0" style={{ background: p.asset.color }} />
                      <div>
                        <p className="font-num font-semibold text-text-primary">{p.asset.ticker}</p>
                        <p className="text-xs text-text-secondary">{p.asset.name}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <Badge variant="default">{p.asset.category}</Badge>
                  </td>
                  <td className="px-6 py-4 text-right font-num text-text-primary">{p.weight.toFixed(1)}%</td>
                  <td className="px-6 py-4 text-right font-num text-text-primary">{formatCurrency(amountOf(p), cur)}</td>
                  <td className="px-6 py-4 text-right font-num text-success">{formatPercent(p.asset.expectedReturn * 100)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <p className="text-xs text-text-muted leading-relaxed border-t border-border pt-4">
        Esta cartera es una sugerencia generada automáticamente a partir de tu perfil y tiene fines informativos y
        educativos. No constituye asesoramiento de inversión. Los rendimientos esperados son estimaciones y los
        resultados reales pueden variar. Consultá con un profesional matriculado antes de invertir.
      </p>
    </div>
  )
}
