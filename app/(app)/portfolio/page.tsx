'use client'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ReferenceLine,
  LabelList,
} from 'recharts'
import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import { formatCurrency, formatPercent } from '@/lib/utils'
import { PROFILES } from '@/lib/data/legacy-profiler'
import {
  getCategoryWeights,
  projectPortfolio,
  type BuiltPortfolio,
} from '@/lib/data/legacy-engine'

// Metadata keyed by the real category names produced by the asset universe.
const CATEGORY_META: Record<string, { color: string; desc: string }> = {
  CEDEARs: { color: '#f97316', desc: 'Acciones de empresas extranjeras compradas en pesos' },
  'Acciones ARG': { color: '#ef4444', desc: 'Empresas del mercado argentino (Merval)' },
  'Bonos USD': { color: '#22c55e', desc: 'Deuda soberana o corporativa en dólares' },
  'ONs corporativas': { color: '#f0b429', desc: 'Obligaciones negociables de empresas argentinas' },
  Liquidez: { color: '#94a3b8', desc: 'Efectivo disponible para oportunidades' },
  'Renta fija ARS': { color: '#4fa3ff', desc: 'Renta fija en pesos: LECAP, CER y TAMAR' },
  FCI: { color: '#a78bfa', desc: 'Fondos comunes de inversión diversificados' },
  'Acciones Globales': { color: '#60a5fa', desc: 'ETFs de mercados globales' },
}

const CHART_GRID = 'rgba(99,120,180,0.1)'
const AXIS_TEXT = '#64748b'
const TOOLTIP_STYLE: React.CSSProperties = {
  background: '#0f1623',
  border: '1px solid rgba(99,120,180,0.22)',
  borderRadius: 8,
  color: '#eef2ff',
  fontSize: 12,
}

function compactNum(v: number): string {
  const abs = Math.abs(v)
  if (abs >= 1e9) return `${(v / 1e9).toFixed(1)}B`
  if (abs >= 1e6) return `${(v / 1e6).toFixed(1)}M`
  if (abs >= 1e3) return `${(v / 1e3).toFixed(0)}k`
  return String(Math.round(v))
}

export default function PortfolioPage() {
  const router = useRouter()
  const [portfolio, setPortfolio] = useState<BuiltPortfolio | null>(null)
  const [loaded, setLoaded] = useState(false)
  const [openCats, setOpenCats] = useState<Record<string, boolean>>({})

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
  const metaColor = (category: string) => CATEGORY_META[category]?.color ?? colorFor(category) ?? '#94a3b8'
  const metaDesc = (category: string) => CATEGORY_META[category]?.desc ?? ''

  // Donut data — categories with a non-zero weight.
  const donutData = categories
    .filter((c) => c.pct > 0)
    .map((c) => ({ name: c.name, value: c.pct, color: metaColor(c.name) }))

  // Growth-by-scenario data for the grouped bar chart.
  const cagr = portfolio.expectedReturnAnnual
  const vol = portfolio.weightedVolatility
  const capital = portfolio.totalCapital
  const pct = (v: number) => `${v - capital >= 0 ? '+' : ''}${(((v - capital) / capital) * 100).toFixed(0)}%`
  const scenarioData = [1, 3, 5].map((years) => {
    const pesimo = capital * (1 + (cagr - vol) * years)
    const base = capital * Math.pow(1 + cagr, years)
    const excelente = capital * (1 + (cagr + vol / 2) * years)
    return {
      name: `${years} ${years === 1 ? 'año' : 'años'}`,
      Pesimo: pesimo,
      Base: base,
      Excelente: excelente,
      PesimoPct: pct(pesimo),
      BasePct: pct(base),
      ExcelentePct: pct(excelente),
    }
  })

  const toggleCat = (name: string) => setOpenCats((prev) => ({ ...prev, [name]: !prev[name] }))

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

      {/* Category distribution — donut */}
      <div className="card p-6">
        <h2 className="section-title">Distribución por categoría</h2>
        <div className="grid md:grid-cols-2 gap-6 items-center">
          {/* Donut on the left, with the profile name in the center */}
          <div className="relative" style={{ height: 320 }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={donutData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={2}
                  stroke="#0f1623"
                  strokeWidth={3}
                >
                  {donutData.map((d) => (
                    <Cell key={d.name} fill={d.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={TOOLTIP_STYLE}
                  itemStyle={{ color: '#eef2ff' }}
                  formatter={(value) => `${Number(value).toFixed(1)}%`}
                />
                <Legend
                  verticalAlign="bottom"
                  height={36}
                  iconType="circle"
                  wrapperStyle={{ fontSize: 12, color: AXIS_TEXT }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none" style={{ marginTop: -18 }}>
              <span className="metric-label">Perfil</span>
              <span className="font-display font-bold text-lg" style={{ color: info.color }}>
                {info.label}
              </span>
            </div>
          </div>

          {/* Category list on the right */}
          <div className="space-y-2">
            {categories
              .filter((c) => c.pct > 0)
              .map((c) => (
                <div key={c.name} className="flex items-center gap-3 text-sm py-1.5 border-b border-border last:border-0">
                  <span className="w-3 h-3 rounded-sm shrink-0" style={{ background: metaColor(c.name) }} />
                  <span className="text-text-secondary">{c.name}</span>
                  <span className="ml-auto font-num font-semibold" style={{ color: metaColor(c.name) }}>
                    {c.pct.toFixed(1)}%
                  </span>
                </div>
              ))}
          </div>
        </div>
      </div>

      {/* Composición — accordion category cards */}
      <div className="card p-6">
        <h2 className="section-title">Composición</h2>
        <div className="space-y-2">
          {categories
            .filter((c) => c.pct > 0)
            .map((c) => {
              const color = metaColor(c.name)
              const open = openCats[c.name]
              return (
                <button
                  key={c.name}
                  onClick={() => toggleCat(c.name)}
                  className="metric-card w-full text-left p-4 flex flex-col"
                  style={{ borderLeft: `4px solid ${color}` }}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <span className="font-display font-semibold text-text-primary">{c.name}</span>
                      <span className="text-text-muted text-xs">{open ? '▲' : '▼'}</span>
                    </div>
                    <span className="metric-value text-xl" style={{ color }}>
                      {c.pct.toFixed(1)}%
                    </span>
                  </div>
                  {open && <p className="text-sm text-text-secondary mt-2">{metaDesc(c.name)}</p>}
                </button>
              )
            })}
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

      {/* Growth projection by scenario */}
      <div className="card p-6">
        <h2 className="section-title">Proyección de crecimiento por escenario</h2>
        <div style={{ height: 340 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={scenarioData} margin={{ top: 24, right: 8, left: 8, bottom: 0 }}>
              <CartesianGrid stroke={CHART_GRID} vertical={false} />
              <XAxis dataKey="name" tick={{ fill: AXIS_TEXT, fontSize: 12 }} axisLine={{ stroke: CHART_GRID }} tickLine={false} />
              <YAxis
                tick={{ fill: AXIS_TEXT, fontSize: 12 }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v: number) => compactNum(v)}
              />
              <Tooltip
                cursor={{ fill: 'rgba(99,120,180,0.08)' }}
                contentStyle={TOOLTIP_STYLE}
                itemStyle={{ color: '#eef2ff' }}
                labelStyle={{ color: AXIS_TEXT }}
                formatter={(value) => formatCurrency(Number(value), cur)}
              />
              <Legend wrapperStyle={{ fontSize: 12, color: AXIS_TEXT }} />
              <ReferenceLine y={capital} stroke="#eef2ff" strokeDasharray="4 4" strokeOpacity={0.6} />
              <Bar dataKey="Pesimo" name="Pésimo" fill="#ef4444" radius={[4, 4, 0, 0]}>
                <LabelList dataKey="PesimoPct" position="top" fill={AXIS_TEXT} fontSize={11} />
              </Bar>
              <Bar dataKey="Base" name="Base" fill="#f59e0b" radius={[4, 4, 0, 0]}>
                <LabelList dataKey="BasePct" position="top" fill={AXIS_TEXT} fontSize={11} />
              </Bar>
              <Bar dataKey="Excelente" name="Excelente" fill="#22c55e" radius={[4, 4, 0, 0]}>
                <LabelList dataKey="ExcelentePct" position="top" fill={AXIS_TEXT} fontSize={11} />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        <p className="text-xs text-text-muted mt-3">
          Escenarios estimados a partir del retorno esperado y la volatilidad de la cartera. La línea punteada marca tu
          capital inicial. No representan rendimientos garantizados.
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
