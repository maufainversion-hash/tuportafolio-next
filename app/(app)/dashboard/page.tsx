'use client'
import { useState } from 'react'
import MetricCard from '@/components/ui/MetricCard'
import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import { cn, formatCurrency, formatPercent } from '@/lib/utils'
import type { ChatMessage } from '@/lib/types'

const ASSETS = [
  { ticker: 'AAPL', name: 'Apple', shares: 10, price: 178.5, change: 2.3 },
  { ticker: 'MELI', name: 'MercadoLibre', shares: 5, price: 1842, change: -0.8 },
  { ticker: 'SPY', name: 'SPDR S&P 500 ETF', shares: 20, price: 445, change: 0.4 },
  { ticker: 'GLD', name: 'SPDR Gold Shares', shares: 8, price: 185, change: 1.1 },
]

const INITIAL_MESSAGES: ChatMessage[] = [
  {
    id: '1',
    role: 'user',
    content: '¿Cómo está mi portafolio hoy?',
    timestamp: new Date(0),
  },
  {
    id: '2',
    role: 'assistant',
    content:
      'Tu portafolio sube +0,9% en el día, impulsado por AAPL (+2,3%) y GLD (+1,1%). MELI cae -0,8% y resta algo de impulso. La mayor concentración está en AAPL. Recordá que esto es un análisis informativo, no una recomendación.',
    timestamp: new Date(0),
  },
]

export default function DashboardPage() {
  const totalValue = ASSETS.reduce((acc, a) => acc + a.shares * a.price, 0)
  const dayChangePct =
    ASSETS.reduce((acc, a) => acc + a.shares * a.price * (a.change / 100), 0) / totalValue * 100

  const [messages, setMessages] = useState<ChatMessage[]>(INITIAL_MESSAGES)
  const [input, setInput] = useState('')

  function handleSend(e: React.FormEvent) {
    e.preventDefault()
    const text = input.trim()
    if (!text) return
    const userMsg: ChatMessage = { id: `u-${messages.length}`, role: 'user', content: text, timestamp: new Date(0) }
    const reply: ChatMessage = {
      id: `a-${messages.length}`,
      role: 'assistant',
      content:
        'Gracias por tu consulta. Como herramienta de análisis, puedo ayudarte a interpretar los datos de tu portafolio. La conexión con el análisis en tiempo real estará disponible próximamente.',
      timestamp: new Date(0),
    }
    setMessages((prev) => [...prev, userMsg, reply])
    setInput('')
  }

  return (
    <div className="flex flex-col lg:flex-row gap-6 animate-fade-in">
      {/* Main area: portfolio summary */}
      <div className="flex-1 min-w-0 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-display font-bold text-text-primary">Dashboard</h1>
            <p className="text-sm text-text-secondary">Resumen de tu portafolio.</p>
          </div>
          <Button variant="gold" size="sm">+ Agregar activo</Button>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard label="Total portafolio" value={formatCurrency(totalValue)} />
          <MetricCard label="Rendimiento hoy" value={formatPercent(dayChangePct)} change={dayChangePct} />
          <MetricCard label="Activos" value={ASSETS.length} />
          <MetricCard label="Beta" value="1.04" />
        </div>

        <div className="card overflow-hidden">
          <div className="px-6 py-4 border-b border-border">
            <h2 className="font-display font-semibold text-text-primary">Mis activos</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs uppercase tracking-wider text-text-muted border-b border-border">
                  <th className="px-6 py-3 font-medium">Activo</th>
                  <th className="px-6 py-3 font-medium text-right">Cantidad</th>
                  <th className="px-6 py-3 font-medium text-right">Precio</th>
                  <th className="px-6 py-3 font-medium text-right">Valor</th>
                  <th className="px-6 py-3 font-medium text-right">Hoy</th>
                </tr>
              </thead>
              <tbody>
                {ASSETS.map((a) => (
                  <tr key={a.ticker} className="border-b border-border last:border-0 hover:bg-bg-card-hover transition-colors">
                    <td className="px-6 py-4">
                      <p className="font-num font-semibold text-text-primary">{a.ticker}</p>
                      <p className="text-xs text-text-secondary">{a.name}</p>
                    </td>
                    <td className="px-6 py-4 text-right font-num text-text-primary">{a.shares}</td>
                    <td className="px-6 py-4 text-right font-num text-text-primary">{formatCurrency(a.price)}</td>
                    <td className="px-6 py-4 text-right font-num text-text-primary">{formatCurrency(a.shares * a.price)}</td>
                    <td className="px-6 py-4 text-right">
                      <span className={cn('font-num font-medium', a.change >= 0 ? 'text-success' : 'text-danger')}>
                        {formatPercent(a.change)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Right sidebar: Lucas chat */}
      <div id="lucas" className="md:w-80 shrink-0">
        <div className="card flex flex-col h-[600px] overflow-hidden">
          <div className="px-4 py-3 border-b border-border flex items-center gap-2">
            <span className="text-xl leading-none">🤖</span>
            <div>
              <p className="font-display font-semibold text-text-primary leading-tight">Lucas</p>
              <p className="text-xs text-text-secondary">Herramienta de análisis financiero</p>
            </div>
            <Badge variant="blue" className="ml-auto">Beta</Badge>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.map((m) => (
              <div key={m.id} className={cn('flex', m.role === 'user' ? 'justify-end' : 'justify-start')}>
                <div
                  className={cn(
                    'max-w-[85%] rounded-card px-3 py-2 text-sm',
                    m.role === 'user'
                      ? 'bg-accent-blue text-bg-base'
                      : 'bg-bg-base border border-border text-text-primary'
                  )}
                >
                  {m.content}
                </div>
              </div>
            ))}
          </div>

          <form onSubmit={handleSend} className="border-t border-border p-3 flex items-center gap-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Preguntale a Lucas…"
              className="flex-1 rounded-btn border border-border bg-bg-base px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:border-accent-blue focus:outline-none focus:ring-1 focus:ring-accent-blue transition-colors"
            />
            <Button type="submit" size="sm" aria-label="Enviar">➤</Button>
          </form>

          <p className="px-4 py-2 text-[11px] leading-snug text-text-muted border-t border-border">
            Lucas es una herramienta de análisis, no un asesor de inversiones.
          </p>
        </div>
      </div>
    </div>
  )
}
