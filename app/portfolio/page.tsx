'use client'
import { useState } from 'react'
import MetricCard from '@/components/ui/MetricCard'
import Badge from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import { cn, formatCurrency, formatPercent } from '@/lib/utils'
import type { Asset } from '@/lib/types'

const INITIAL_ASSETS: Asset[] = [
  { id: '1', user_id: 'demo', ticker: 'AAPL', name: 'Apple', quantity: 10, avg_price: 165.0, current_price: 178.5, asset_type: 'accion', currency: 'USD' },
  { id: '2', user_id: 'demo', ticker: 'MELI', name: 'MercadoLibre', quantity: 5, avg_price: 1900.0, current_price: 1842.0, asset_type: 'accion', currency: 'USD' },
  { id: '3', user_id: 'demo', ticker: 'SPY', name: 'SPDR S&P 500 ETF', quantity: 20, avg_price: 430.0, current_price: 445.0, asset_type: 'etf', currency: 'USD' },
  { id: '4', user_id: 'demo', ticker: 'GLD', name: 'SPDR Gold Shares', quantity: 8, avg_price: 178.0, current_price: 185.0, asset_type: 'etf', currency: 'USD' },
]

const TYPE_LABELS: Record<Asset['asset_type'], string> = {
  accion: 'Acción',
  etf: 'ETF',
  bono: 'Bono',
  crypto: 'Crypto',
  cedear: 'CEDEAR',
}

const emptyForm = {
  ticker: '',
  name: '',
  asset_type: 'accion' as Asset['asset_type'],
  quantity: '',
  avg_price: '',
  currency: 'USD' as Asset['currency'],
}

export default function PortfolioPage() {
  const [assets, setAssets] = useState<Asset[]>(INITIAL_ASSETS)
  const [modalOpen, setModalOpen] = useState(false)
  const [form, setForm] = useState(emptyForm)

  const totalValue = assets.reduce((acc, a) => acc + a.quantity * a.current_price, 0)
  const totalCost = assets.reduce((acc, a) => acc + a.quantity * a.avg_price, 0)
  const totalPnl = totalValue - totalCost
  const totalPnlPct = totalCost > 0 ? (totalPnl / totalCost) * 100 : 0

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const quantity = parseFloat(form.quantity)
    const avg_price = parseFloat(form.avg_price)
    if (!form.ticker || !form.name || isNaN(quantity) || isNaN(avg_price)) return
    const newAsset: Asset = {
      id: `${assets.length + 1}-${form.ticker}`,
      user_id: 'demo',
      ticker: form.ticker.toUpperCase(),
      name: form.name,
      quantity,
      avg_price,
      current_price: avg_price,
      asset_type: form.asset_type,
      currency: form.currency,
    }
    setAssets((prev) => [...prev, newAsset])
    setForm(emptyForm)
    setModalOpen(false)
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-text-primary">Mi Portafolio</h1>
          <p className="text-sm text-text-secondary">Seguimiento de tus posiciones.</p>
        </div>
        <Button variant="gold" onClick={() => setModalOpen(true)}>+ Agregar posición</Button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard label="Valor total" value={formatCurrency(totalValue)} />
        <MetricCard label="Ganancia / Pérdida" value={formatCurrency(totalPnl)} change={totalPnlPct} />
        <MetricCard label="Rendimiento total" value={formatPercent(totalPnlPct)} change={totalPnlPct} />
        <MetricCard label="Posiciones" value={assets.length} />
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wider text-text-muted border-b border-border">
                <th className="px-4 py-3 font-medium">Activo</th>
                <th className="px-4 py-3 font-medium">Tipo</th>
                <th className="px-4 py-3 font-medium text-right">Cantidad</th>
                <th className="px-4 py-3 font-medium text-right">Precio promedio</th>
                <th className="px-4 py-3 font-medium text-right">Precio actual</th>
                <th className="px-4 py-3 font-medium text-right">P&amp;L</th>
                <th className="px-4 py-3 font-medium text-right">P&amp;L %</th>
                <th className="px-4 py-3 font-medium text-right">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {assets.map((a) => {
                const value = a.quantity * a.current_price
                const cost = a.quantity * a.avg_price
                const pnl = value - cost
                const pnlPct = cost > 0 ? (pnl / cost) * 100 : 0
                const pos = pnl >= 0
                return (
                  <tr key={a.id} className="border-b border-border last:border-0 hover:bg-bg-card-hover transition-colors">
                    <td className="px-4 py-4">
                      <p className="font-num font-semibold text-text-primary">{a.ticker}</p>
                      <p className="text-xs text-text-secondary">{a.name}</p>
                    </td>
                    <td className="px-4 py-4">
                      <Badge variant="default">{TYPE_LABELS[a.asset_type]}</Badge>
                    </td>
                    <td className="px-4 py-4 text-right font-num text-text-primary">{a.quantity}</td>
                    <td className="px-4 py-4 text-right font-num text-text-primary">{formatCurrency(a.avg_price, a.currency)}</td>
                    <td className="px-4 py-4 text-right font-num text-text-primary">{formatCurrency(a.current_price, a.currency)}</td>
                    <td className={cn('px-4 py-4 text-right font-num font-medium', pos ? 'text-success' : 'text-danger')}>
                      {pos ? '+' : ''}{formatCurrency(pnl, a.currency)}
                    </td>
                    <td className={cn('px-4 py-4 text-right font-num font-medium', pos ? 'text-success' : 'text-danger')}>
                      {formatPercent(pnlPct)}
                    </td>
                    <td className="px-4 py-4 text-right">
                      <button
                        onClick={() => setAssets((prev) => prev.filter((x) => x.id !== a.id))}
                        className="text-text-muted hover:text-danger transition-colors text-xs"
                      >
                        Eliminar
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add position modal */}
      {modalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4"
          onClick={() => setModalOpen(false)}
        >
          <div className="card w-full max-w-md p-6 animate-slide-up" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-display font-bold text-text-primary">Agregar posición</h2>
              <button onClick={() => setModalOpen(false)} className="text-text-muted hover:text-text-primary">✕</button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-1.5">Ticker</label>
                  <input
                    value={form.ticker}
                    onChange={(e) => setForm({ ...form, ticker: e.target.value })}
                    placeholder="AAPL"
                    className="w-full rounded-btn border border-border bg-bg-base px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:border-accent-blue focus:outline-none focus:ring-1 focus:ring-accent-blue transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-1.5">Tipo</label>
                  <select
                    value={form.asset_type}
                    onChange={(e) => setForm({ ...form, asset_type: e.target.value as Asset['asset_type'] })}
                    className="w-full rounded-btn border border-border bg-bg-base px-3 py-2 text-sm text-text-primary focus:border-accent-blue focus:outline-none focus:ring-1 focus:ring-accent-blue transition-colors"
                  >
                    {Object.entries(TYPE_LABELS).map(([value, label]) => (
                      <option key={value} value={value}>{label}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1.5">Nombre</label>
                <input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Apple Inc."
                  className="w-full rounded-btn border border-border bg-bg-base px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:border-accent-blue focus:outline-none focus:ring-1 focus:ring-accent-blue transition-colors"
                />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-1.5">Cantidad</label>
                  <input
                    type="number"
                    step="any"
                    value={form.quantity}
                    onChange={(e) => setForm({ ...form, quantity: e.target.value })}
                    placeholder="10"
                    className="w-full rounded-btn border border-border bg-bg-base px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:border-accent-blue focus:outline-none focus:ring-1 focus:ring-accent-blue transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-1.5">Precio prom.</label>
                  <input
                    type="number"
                    step="any"
                    value={form.avg_price}
                    onChange={(e) => setForm({ ...form, avg_price: e.target.value })}
                    placeholder="165.00"
                    className="w-full rounded-btn border border-border bg-bg-base px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:border-accent-blue focus:outline-none focus:ring-1 focus:ring-accent-blue transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-1.5">Moneda</label>
                  <select
                    value={form.currency}
                    onChange={(e) => setForm({ ...form, currency: e.target.value as Asset['currency'] })}
                    className="w-full rounded-btn border border-border bg-bg-base px-3 py-2 text-sm text-text-primary focus:border-accent-blue focus:outline-none focus:ring-1 focus:ring-accent-blue transition-colors"
                  >
                    <option value="USD">USD</option>
                    <option value="ARS">ARS</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <Button type="button" variant="ghost" onClick={() => setModalOpen(false)}>Cancelar</Button>
                <Button type="submit" variant="gold">Agregar</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
