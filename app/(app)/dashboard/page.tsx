'use client'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  ResponsiveContainer,
} from 'recharts'
import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import { cn, formatCurrency } from '@/lib/utils'
import { PROFILES } from '@/lib/profiler'
import type { BuiltPortfolio } from '@/lib/portfolio-engine'

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

interface EvoPoint {
  date: string
  value: number
}

// Simulated last-7-days evolution. Only called client-side (portfolio is loaded
// from localStorage after mount), so new Date() never runs during SSR.
function buildEvolution(p: BuiltPortfolio): EvoPoint[] {
  const days = 7
  const dailyR = p.expectedReturnAnnual / 252
  return Array.from({ length: days }, (_, i) => {
    const factor = (1 + dailyR * i) * (1 + 0.004 * Math.sin(i * 1.4))
    const d = new Date()
    d.setDate(d.getDate() - (days - 1 - i))
    const label = d.toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit' })
    return { date: label, value: p.totalCapital * factor }
  })
}

interface ChatMsg {
  role: 'user' | 'assistant'
  content: string
}

const GREETING: ChatMsg = {
  role: 'assistant',
  content:
    '¡Hola! Soy Lucas, tu herramienta de análisis. Podés preguntarme sobre tu cartera, instrumentos financieros o el mercado argentino.',
}

export default function DashboardPage() {
  const router = useRouter()
  const [portfolio, setPortfolio] = useState<BuiltPortfolio | null>(null)
  const [messages, setMessages] = useState<ChatMsg[]>([GREETING])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [horizon, setHorizon] = useState<number | null>(null)
  const [evoOpen, setEvoOpen] = useState(true)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    try {
      const raw = localStorage.getItem('portfolio')
      if (raw) setPortfolio(JSON.parse(raw))
      const prof = localStorage.getItem('investorProfile')
      if (prof) {
        const parsed = JSON.parse(prof) as { horizon?: number }
        if (typeof parsed.horizon === 'number') setHorizon(parsed.horizon)
      }
    } catch {
      // ignore
    }
  }, [])

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages, loading])

  async function send(e: React.FormEvent) {
    e.preventDefault()
    const text = input.trim()
    if (!text || loading) return
    const userMsg: ChatMsg = { role: 'user', content: text }
    const next = [...messages, userMsg]
    setMessages(next)
    setInput('')
    setLoading(true)
    try {
      const res = await fetch('/api/lucas/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: next.filter((m) => m !== GREETING).map((m) => ({ role: m.role, content: m.content })),
          portfolio,
        }),
      })
      const data = await res.json()
      if (data.message) {
        setMessages((prev) => [...prev, { role: 'assistant', content: data.message }])
      } else {
        setMessages((prev) => [
          ...prev,
          { role: 'assistant', content: 'Disculpá, tuve un problema para responder. Probá de nuevo en un momento.' },
        ])
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: 'No pude conectarme. Revisá tu conexión e intentá otra vez.' },
      ])
    } finally {
      setLoading(false)
    }
  }

  const info = portfolio ? PROFILES[portfolio.profile] : null
  const evoData = portfolio ? buildEvolution(portfolio) : []
  const startValue = portfolio?.totalCapital ?? 0
  const todayValue = evoData.length ? evoData[evoData.length - 1].value : startValue
  const evoGain = todayValue - startValue

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-display font-bold text-text-primary">Dashboard</h1>
        <p className="text-sm text-text-secondary">Tu resumen y tu herramienta de análisis.</p>
      </div>

      {/* Portfolio summary or CTA */}
      {portfolio && info ? (
        <button
          onClick={() => router.push('/portfolio')}
          className="hero-card p-6 w-full text-left"
        >
          <div className="relative z-10">
            <div className="flex items-center justify-between gap-3 mb-4">
              <div className="flex items-center gap-2">
                <h2 className="font-display font-bold text-lg text-text-primary">Tu cartera</h2>
                <span
                  className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold border"
                  style={{ color: info.color, borderColor: `${info.color}55`, background: `${info.color}14` }}
                >
                  {info.emoji} {info.label}
                </span>
              </div>
              <span className="text-text-muted text-sm shrink-0">Ver cartera →</span>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <span className="metric-label">Capital</span>
                <p className="metric-value metric-value-white text-2xl mt-1">
                  {formatCurrency(portfolio.totalCapital, portfolio.currency)}
                </p>
              </div>
              <div>
                <span className="metric-label">Horizonte</span>
                <p className="font-display font-semibold text-text-primary text-lg mt-1">
                  {horizon != null ? `${horizon} ${horizon === 1 ? 'año' : 'años'}` : '—'}
                </p>
              </div>
              <div>
                <span className="metric-label">Perfil</span>
                <p className="font-display font-semibold text-lg mt-1" style={{ color: info.color }}>
                  {info.label}
                </p>
              </div>
            </div>

            <p className="text-[11px] text-text-muted mt-4">
              Herramienta educativa · No reemplaza el asesoramiento de un profesional regulado
            </p>
          </div>
        </button>
      ) : (
        <div className="hero-card p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative z-10">
            <h2 className="font-display font-semibold text-text-primary text-lg">Armá tu cartera</h2>
            <p className="text-sm text-text-secondary">Respondé 8 preguntas y te armamos una cartera a tu medida.</p>
          </div>
          <Link href="/onboarding" className="relative z-10">
            <Button variant="gold">Empezar test</Button>
          </Link>
        </div>
      )}

      {/* Evolución de tu cartera */}
      {portfolio && (
        <div className="card p-6">
          <button
            onClick={() => setEvoOpen((v) => !v)}
            className="section-title w-full flex items-center justify-between !mb-0 !border-0 !pb-0"
          >
            <span>📈 Evolución de tu cartera</span>
            <span className="text-text-muted text-sm">{evoOpen ? '▲' : '▼'}</span>
          </button>

          {evoOpen && (
            <div className="mt-4">
              <div className="mb-4">
                <p className="metric-label">Hoy tu cartera vale</p>
                <p className="metric-value metric-value-blue text-3xl mt-1">
                  {formatCurrency(todayValue, portfolio.currency)}
                </p>
                <p className="text-sm text-text-secondary mt-1">
                  Hace 6 días pusiste {formatCurrency(startValue, portfolio.currency)}.{' '}
                  <span className={evoGain >= 0 ? 'text-success' : 'text-danger'}>
                    {evoGain >= 0 ? 'Ganaste' : 'Perdiste'} {formatCurrency(Math.abs(evoGain), portfolio.currency)}
                  </span>
                  .
                </p>
              </div>

              <div style={{ height: 280 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={evoData} margin={{ top: 8, right: 8, left: 8, bottom: 0 }}>
                    <CartesianGrid stroke={CHART_GRID} vertical={false} />
                    <XAxis dataKey="date" tick={{ fill: AXIS_TEXT, fontSize: 12 }} axisLine={{ stroke: CHART_GRID }} tickLine={false} />
                    <YAxis
                      tick={{ fill: AXIS_TEXT, fontSize: 12 }}
                      axisLine={false}
                      tickLine={false}
                      domain={['auto', 'auto']}
                      tickFormatter={(v: number) => compactNum(v)}
                    />
                    <Tooltip
                      contentStyle={TOOLTIP_STYLE}
                      itemStyle={{ color: '#eef2ff' }}
                      labelStyle={{ color: AXIS_TEXT }}
                      formatter={(value) => formatCurrency(Number(value), portfolio.currency)}
                    />
                    <ReferenceLine y={startValue} stroke="#eef2ff" strokeDasharray="4 4" strokeOpacity={0.6} />
                    <Line type="monotone" dataKey="value" stroke="#60a5fa" strokeWidth={2.5} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <p className="text-xs text-text-muted mt-3">
                Evolución simulada con fines ilustrativos. La línea punteada marca tu capital inicial.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Lucas chat */}
      <div id="lucas" className="card flex flex-col h-[560px] overflow-hidden">
        <div className="px-4 py-3 border-b border-border flex items-center gap-2">
          <span className="text-xl leading-none">🤖</span>
          <div>
            <p className="font-display font-semibold text-text-primary leading-tight">Lucas</p>
            <p className="text-xs text-text-secondary">Herramienta de análisis financiero</p>
          </div>
          <Badge variant="blue" className="ml-auto">Beta</Badge>
        </div>

        <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3">
          {messages.map((m, i) => (
            <div key={i} className={cn('flex', m.role === 'user' ? 'justify-end' : 'justify-start')}>
              <div
                className={cn(
                  'max-w-[80%] rounded-card px-3 py-2 text-sm whitespace-pre-wrap',
                  m.role === 'user'
                    ? 'bg-accent-blue text-bg-base'
                    : 'bg-bg-base border border-border text-text-primary'
                )}
              >
                {m.content}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="bg-bg-base border border-border rounded-card px-3 py-2.5 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-text-muted animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-1.5 h-1.5 rounded-full bg-text-muted animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-1.5 h-1.5 rounded-full bg-text-muted animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          )}
        </div>

        <form onSubmit={send} className="border-t border-border p-3 flex items-center gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Preguntale a Lucas…"
            className="flex-1 rounded-btn border border-border bg-bg-base px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:border-accent-blue focus:outline-none focus:ring-1 focus:ring-accent-blue transition-colors"
          />
          <Button type="submit" size="sm" loading={loading} aria-label="Enviar">➤</Button>
        </form>

        <p className="px-4 py-2 text-[11px] leading-snug text-text-muted border-t border-border">
          Lucas es una herramienta de análisis, no un asesor financiero.
        </p>
      </div>
    </div>
  )
}
