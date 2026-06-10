// lib/portfolio-engine.ts
// Portfolio construction over the 135-instrument universe.
// Per-profile category allocations → top-N-by-Sharpe selection → metrics.

import type { RiskProfile } from '@/lib/profiler';
import { INSTRUMENTOS, getByTipo, type Instrumento, type TipoActivo } from '@/lib/instruments';

const RISK_FREE = 0.045;

export type Category =
  | 'Liquidez'
  | 'Letras'
  | 'BonosUSD'
  | 'ONs'
  | 'ETFs'
  | 'CEDEARs'
  | 'AccARG';

export interface EnginePosition {
  ticker: string;
  tipo: TipoActivo;
  weight: number; // fraction of total (0..1)
  expectedCagr: number;
  expectedVolatility: number;
  category: Category;
  currency: 'ARS' | 'USD';
}

export interface BuiltEnginePortfolio {
  positions: EnginePosition[];
  expectedCagr: number;
  expectedVolatility: number;
  sharpeRatio: number;
  hhi: number;
  hhiLabel: string;
  categoryExposure: Record<string, number>; // % per category
  currencyExposure: Record<string, number>; // % per currency
}

export interface ScenarioPoint {
  years: number;
  pessimistic: number;
  base: number;
  optimistic: number;
}

// ─── Per-profile category allocations (percent of total) ──────────────────────

const PROFILE_ALLOCATIONS: Record<RiskProfile, Record<Category, number>> = {
  conservador: { Liquidez: 30, Letras: 20, BonosUSD: 25, ONs: 15, ETFs: 7, CEDEARs: 3, AccARG: 0 },
  estable:     { Liquidez: 15, Letras: 10, BonosUSD: 28, ONs: 17, ETFs: 15, CEDEARs: 10, AccARG: 5 },
  moderado:    { Liquidez: 5,  Letras: 5,  BonosUSD: 20, ONs: 12, ETFs: 20, CEDEARs: 23, AccARG: 15 },
  agresivo:    { Liquidez: 2,  Letras: 3,  BonosUSD: 10, ONs: 10, ETFs: 15, CEDEARs: 30, AccARG: 30 },
};

const CATEGORY_TIPOS: Record<Category, TipoActivo[]> = {
  Liquidez: ['fci', 'mep'],
  Letras: ['letra'],
  BonosUSD: ['bono'],
  ONs: ['on'],
  ETFs: ['etf'],
  CEDEARs: ['cedear'],
  AccARG: ['accion_arg'],
};

// Base expected return / volatility per instrument type.
const TIPO_STATS: Record<TipoActivo, { cagr: number; vol: number }> = {
  mep:        { cagr: 0.0,   vol: 0.08 },
  fci:        { cagr: 0.04,  vol: 0.03 },
  letra:      { cagr: 0.06,  vol: 0.04 },
  bono:       { cagr: 0.11,  vol: 0.17 },
  on:         { cagr: 0.09,  vol: 0.09 },
  etf:        { cagr: 0.11,  vol: 0.17 },
  cedear:     { cagr: 0.14,  vol: 0.28 },
  accion_arg: { cagr: 0.20,  vol: 0.50 },
};

const USD_TIPOS = new Set<TipoActivo>(['bono', 'on', 'mep', 'etf', 'cedear']);

// Deterministic 0..1 jitter from the ticker so Sharpe differs per instrument.
function hashUnit(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return ((h >>> 0) % 1000) / 1000;
}

interface ScoredInstrument {
  inst: Instrumento;
  cagr: number;
  vol: number;
  sharpe: number;
}

// Expected stats for a single instrument (used to populate the whole universe).
export function statsFor(inst: Instrumento): { cagr: number; vol: number } {
  const base = TIPO_STATS[inst.tipo];
  const j = hashUnit(inst.ticker); // 0..1
  const cagr = Math.max(0, base.cagr + (j - 0.5) * 0.06);
  const vol = Math.max(0.005, base.vol + (j - 0.5) * 0.04);
  return { cagr, vol };
}

function scoredPool(category: Category): ScoredInstrument[] {
  const tipos = CATEGORY_TIPOS[category];
  const pool = tipos.flatMap((t) => getByTipo(t));
  return pool
    .map((inst) => {
      const { cagr, vol } = statsFor(inst);
      return { inst, cagr, vol, sharpe: (cagr - RISK_FREE) / vol };
    })
    .sort((a, b) => b.sharpe - a.sharpe);
}

function hhiLabelFor(hhi: number): string {
  if (hhi < 1500) return 'Bien diversificado';
  if (hhi < 2500) return 'Moderadamente concentrado';
  return 'Concentrado';
}

export function buildPortfolio(profile: RiskProfile, capitalUsd: number): BuiltEnginePortfolio {
  void capitalUsd; // weights are fractions; capital is applied by callers
  const allocations = PROFILE_ALLOCATIONS[profile];
  const positions: EnginePosition[] = [];

  (Object.keys(allocations) as Category[]).forEach((category) => {
    const catPct = allocations[category];
    if (catPct <= 0) return;

    const pool = scoredPool(category);
    if (pool.length === 0) return;

    const n = Math.min(category === 'Liquidez' || category === 'Letras' ? 2 : 4, pool.length);
    const top = pool.slice(0, n);

    // Distribute the category weight proportional to positive Sharpe (fallback equal).
    const sharpeSum = top.reduce((s, x) => s + Math.max(x.sharpe, 0), 0);
    top.forEach((x) => {
      const share = sharpeSum > 0 ? Math.max(x.sharpe, 0) / sharpeSum : 1 / top.length;
      const weight = (catPct / 100) * share;
      positions.push({
        ticker: x.inst.ticker,
        tipo: x.inst.tipo,
        weight,
        expectedCagr: x.cagr,
        expectedVolatility: x.vol,
        category,
        currency: USD_TIPOS.has(x.inst.tipo) ? 'USD' : 'ARS',
      });
    });
  });

  // Normalize weights to sum to 1.
  const wSum = positions.reduce((s, p) => s + p.weight, 0) || 1;
  positions.forEach((p) => (p.weight = p.weight / wSum));

  const expectedCagr = positions.reduce((s, p) => s + p.weight * p.expectedCagr, 0);
  const expectedVolatility = positions.reduce((s, p) => s + p.weight * p.expectedVolatility, 0);
  const sharpeRatio = expectedVolatility > 0 ? (expectedCagr - RISK_FREE) / expectedVolatility : 0;

  // Herfindahl-Hirschman Index over weight percentages.
  const hhi = positions.reduce((s, p) => s + Math.pow(p.weight * 100, 2), 0);

  const categoryExposure: Record<string, number> = {};
  const currencyExposure: Record<string, number> = {};
  for (const p of positions) {
    categoryExposure[p.category] = (categoryExposure[p.category] ?? 0) + p.weight * 100;
    currencyExposure[p.currency] = (currencyExposure[p.currency] ?? 0) + p.weight * 100;
  }

  return {
    positions,
    expectedCagr,
    expectedVolatility,
    sharpeRatio,
    hhi,
    hhiLabel: hhiLabelFor(hhi),
    categoryExposure,
    currencyExposure,
  };
}

export function projectScenarios(
  capitalUsd: number,
  portfolio: BuiltEnginePortfolio,
  years: number
): ScenarioPoint[] {
  const { expectedCagr: cagr, expectedVolatility: vol } = portfolio;
  const out: ScenarioPoint[] = [];
  const horizon = Math.max(1, Math.round(years));
  for (let y = 1; y <= horizon; y++) {
    const base = capitalUsd * Math.pow(1 + cagr, y);
    const pessimistic = capitalUsd * Math.pow(1 + Math.max(cagr - vol, -0.5), y);
    const optimistic = capitalUsd * Math.pow(1 + cagr + vol / 2, y);
    out.push({ years: y, pessimistic, base, optimistic });
  }
  return out;
}

// Convenience: full universe with expected stats (cagr/vol) for all 135.
export const ASSET_UNIVERSE = INSTRUMENTOS.map((inst) => ({
  ...inst,
  ...statsFor(inst),
}));
