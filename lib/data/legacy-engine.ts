// lib/data/legacy-engine.ts
// Original localStorage portfolio engine that powers the premium frontend.
// Decoupled from the new Supabase-backed lib/portfolio-engine.ts.

import type { InvestorProfile } from './legacy-profiler'
import { ASSET_MAP, type Asset } from './assets'
import { ALLOCATIONS_ARS, ALLOCATIONS_USD, type AllocationSlot } from './portfolio-allocations'

export interface Position {
  assetId: string
  asset: Asset
  weight: number // percent
  amountUSD: number
  amountARS: number
  expectedReturnARS: number // expected annual gain, in ARS
  notes?: string
}

export interface BuiltPortfolio {
  profile: InvestorProfile
  positions: Position[]
  totalCapital: number
  currency: 'ARS' | 'USD'
  expectedReturnAnnual: number // decimal
  weightedVolatility: number // decimal
  createdAt: string
}

export interface BuildInput {
  profile: InvestorProfile
  capital: number
  currency: 'ARS' | 'USD'
  horizon: number
  mepRate?: number
}

const HIGH_RISK_IDS = new Set(['nvda', 'meli', 'tsla', 'vist', 'galicia', 'bma', 'qqq', 'coin'])
const DEFAULT_MEP = 1300

function adjustForHorizon(slots: AllocationSlot[], currency: 'ARS' | 'USD'): AllocationSlot[] {
  const liquidityId = currency === 'ARS' ? 'money_market' : 'fci_usd_ahorro'
  let freed = 0
  const adjusted = slots.map((slot) => {
    if (HIGH_RISK_IDS.has(slot.assetId)) {
      const reduced = slot.weight * 0.5
      freed += slot.weight - reduced
      return { ...slot, weight: reduced, notes: 'Reducido por horizonte corto' }
    }
    return { ...slot }
  })

  if (freed > 0) {
    const liq = adjusted.find((s) => s.assetId === liquidityId)
    if (liq) {
      liq.weight += freed
    } else {
      adjusted.push({ assetId: liquidityId, weight: freed, notes: 'Liquidez por horizonte corto' })
    }
  }
  return adjusted
}

function normalize(slots: AllocationSlot[]): AllocationSlot[] {
  const total = slots.reduce((sum, s) => sum + s.weight, 0)
  if (total === 0) return slots
  return slots.map((s) => ({ ...s, weight: (s.weight / total) * 100 }))
}

export function buildPortfolio(input: BuildInput): BuiltPortfolio {
  const { profile, capital, currency, horizon } = input
  const mepRate = input.mepRate ?? DEFAULT_MEP

  const base = (currency === 'ARS' ? ALLOCATIONS_ARS : ALLOCATIONS_USD)[profile]
  let slots = base.map((s) => ({ ...s }))
  if (horizon < 3) slots = adjustForHorizon(slots, currency)
  slots = normalize(slots)

  const positions: Position[] = slots
    .filter((slot) => ASSET_MAP[slot.assetId])
    .map((slot) => {
      const asset = ASSET_MAP[slot.assetId]
      const fraction = slot.weight / 100
      const amountInCurrency = capital * fraction
      const amountUSD = currency === 'USD' ? amountInCurrency : amountInCurrency / mepRate
      const amountARS = currency === 'ARS' ? amountInCurrency : amountInCurrency * mepRate
      return {
        assetId: slot.assetId,
        asset,
        weight: slot.weight,
        amountUSD,
        amountARS,
        expectedReturnARS: amountARS * asset.expectedReturn,
        notes: slot.notes,
      }
    })

  const totalWeight = positions.reduce((sum, p) => sum + p.weight, 0) || 1
  const expectedReturnAnnual = positions.reduce(
    (sum, p) => sum + (p.weight / totalWeight) * p.asset.expectedReturn,
    0
  )
  const weightedVolatility = positions.reduce(
    (sum, p) => sum + (p.weight / totalWeight) * p.asset.volatility,
    0
  )

  return {
    profile,
    positions,
    totalCapital: capital,
    currency,
    expectedReturnAnnual,
    weightedVolatility,
    createdAt: new Date().toISOString(),
  }
}

export interface CategoryWeight {
  name: string
  weight: number
  pct: number
}

export function getCategoryWeights(portfolio: BuiltPortfolio): CategoryWeight[] {
  const totals: Record<string, number> = {}
  for (const p of portfolio.positions) {
    totals[p.asset.category] = (totals[p.asset.category] ?? 0) + p.weight
  }
  const sum = Object.values(totals).reduce((a, b) => a + b, 0) || 1
  return Object.entries(totals)
    .map(([name, weight]) => ({ name, weight, pct: (weight / sum) * 100 }))
    .sort((a, b) => b.pct - a.pct)
}

export function projectPortfolio(portfolio: BuiltPortfolio, years: number): number[] {
  const r = portfolio.expectedReturnAnnual
  const out: number[] = []
  for (let y = 0; y <= years; y++) {
    out.push(portfolio.totalCapital * Math.pow(1 + r, y))
  }
  return out
}
