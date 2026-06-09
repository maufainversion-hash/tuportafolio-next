'use client'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import { cn, formatCurrency, formatPercent } from '@/lib/utils'
import { PROFILES } from '@/lib/profiler'
import type { BuiltPortfolio } from '@/lib/portfolio-engine'

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
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    try {
      const raw = localStorage.getItem('portfolio')
      if (raw) setPortfolio(JSON.parse(raw))
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
  const topTickers = portfolio
    ? [...portfolio.positions].sort((a, b) => b.weight - a.weight).slice(0, 5).map((p) => p.asset.ticker)
    : []

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
          <div className="relative z-10 flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="blue">
                  {info.emoji} {info.label}
                </Badge>
                <Badge variant="success">{formatPercent(portfolio.expectedReturnAnnual * 100)}/año esperado</Badge>
              </div>
              <p className="metric-value metric-value-white">
                {formatCurrency(portfolio.totalCapital, portfolio.currency)}
              </p>
              <p className="text-xs text-text-secondary mb-3 mt-1">Capital invertido · {portfolio.positions.length} posiciones</p>
              <div className="flex flex-wrap gap-1.5">
                {topTickers.map((t) => (
                  <span key={t} className="font-num text-xs px-2 py-0.5 rounded bg-bg-base border border-border text-text-secondary">
                    {t}
                  </span>
                ))}
              </div>
            </div>
            <span className="text-text-muted text-sm shrink-0">Ver cartera →</span>
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
