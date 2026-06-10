// lib/market-data.ts
// Live market data fetching — ported from market_data.py
// Sources: data912.com (stocks/CEDEARs/bonds), dolarapi.com (USD rates), argentinadatos.com (FCIs)

export type TipoMercado =
  | 'accion_arg'
  | 'cedear'
  | 'etf'
  | 'bono'
  | 'on'
  | 'letra'
  | 'fci'
  | 'mep';

export interface PrecioActivo {
  ticker: string;
  precio: number;
  variacion: number; // porcentaje día
  volumen?: number;
  fuente: string;
  timestamp: number;
}

export interface DolarRates {
  oficial: number;
  blue: number;
  mep: number;
  ccl: number;
  crypto: number;
  mayorista: number;
  timestamp: number;
}

export interface BenchmarkChange {
  nombre: string;
  ticker: string;
  variacion: number;
}

interface CacheEntry<T> {
  data: T;
  expiresAt: number;
}

const _cache = new Map<string, CacheEntry<unknown>>();

function getCached<T>(key: string): T | null {
  const entry = _cache.get(key) as CacheEntry<T> | undefined;
  if (entry && Date.now() < entry.expiresAt) return entry.data;
  return null;
}

function setCached<T>(key: string, data: T, ttlMs: number): void {
  _cache.set(key, { data, expiresAt: Date.now() + ttlMs });
}

const TTL = {
  STOCKS:     180_000,
  BONDS:      600_000,
  LETRAS:     600_000,
  FCI:       3_600_000,
  MEP:       1_800_000,
  DOLAR:      120_000,
  BENCHMARKS: 300_000,
};

type Data912Panel = 'arg_stocks' | 'arg_cedears' | 'arg_bonds' | 'arg_corp' | 'arg_notes';

async function fetchData912Panel(panel: Data912Panel): Promise<Record<string, { price: number; change: number; volume?: number }>> {
  const cacheKey = `data912_${panel}`;
  const cached = getCached<Record<string, { price: number; change: number; volume?: number }>>(cacheKey);
  if (cached) return cached;

  const url = `https://data912.com/live/${panel}`;
  const res = await fetch(url, {
    headers: { 'Accept': 'application/json' },
    next: { revalidate: 60 },
  });

  if (!res.ok) throw new Error(`data912 ${panel} → ${res.status}`);

  const raw = await res.json() as Array<{ symbol: string; price: number; change?: number; volume?: number }>;

  const map: Record<string, { price: number; change: number; volume?: number }> = {};
  for (const item of raw) {
    if (item.symbol && item.price) {
      map[item.symbol.toUpperCase()] = {
        price:  item.price,
        change: item.change ?? 0,
        volume: item.volume,
      };
    }
  }

  const ttl = panel === 'arg_bonds' || panel === 'arg_corp' || panel === 'arg_notes'
    ? TTL.BONDS
    : TTL.STOCKS;

  setCached(cacheKey, map, ttl);
  return map;
}

async function fetchDolarRates(): Promise<DolarRates> {
  const cacheKey = 'dolar_rates';
  const cached = getCached<DolarRates>(cacheKey);
  if (cached) return cached;

  const casas = ['oficial', 'blue', 'bolsa', 'contadoconliqui', 'cripto', 'mayorista'] as const;
  const results = await Promise.allSettled(
    casas.map(casa =>
      fetch(`https://dolarapi.com/v1/dolares/${casa}`, {
        headers: { 'Accept': 'application/json' },
      }).then(r => r.json() as Promise<{ venta: number; compra: number; casa: string }>)
    )
  );

  const get = (i: number, fallback = 0) => {
    const r = results[i];
    return r.status === 'fulfilled' ? (r.value.venta ?? fallback) : fallback;
  };

  const rates: DolarRates = {
    oficial:    get(0, 1300),
    blue:       get(1, 1400),
    mep:        get(2, 1380),
    ccl:        get(3, 1400),
    crypto:     get(4, 1420),
    mayorista:  get(5, 1280),
    timestamp:  Date.now(),
  };

  setCached(cacheKey, rates, TTL.DOLAR);
  return rates;
}

export async function getMepRate(): Promise<number> {
  const cacheKey = 'mep_rate';
  const cached = getCached<number>(cacheKey);
  if (cached) return cached;

  try {
    const res = await fetch('https://dolarapi.com/v1/dolares/bolsa', {
      headers: { 'Accept': 'application/json' },
    });
    const data = await res.json() as { venta: number };
    const mep = data.venta ?? 1380;
    setCached(cacheKey, mep, TTL.MEP);
    return mep;
  } catch {
    return 1380;
  }
}

interface FciData {
  fondo: string;
  vcp: number;
  fecha: string;
}

async function fetchFciData(): Promise<Map<string, number>> {
  const cacheKey = 'fci_data';
  const cached = getCached<Map<string, number>>(cacheKey);
  if (cached) return cached;

  const fciMap = new Map<string, number>();

  try {
    const [mmRes, rfRes] = await Promise.allSettled([
      fetch('https://api.argentinadatos.com/v1/finanzas/fci/mercadoDinero/ultimo', {
        headers: { 'Accept': 'application/json' },
      }).then(r => r.json() as Promise<FciData[]>),
      fetch('https://api.argentinadatos.com/v1/finanzas/fci/rentaFija/ultimo', {
        headers: { 'Accept': 'application/json' },
      }).then(r => r.json() as Promise<FciData[]>),
    ]);

    if (mmRes.status === 'fulfilled') {
      for (const fci of mmRes.value) {
        fciMap.set(fci.fondo.toUpperCase(), fci.vcp);
      }
    }
    if (rfRes.status === 'fulfilled') {
      for (const fci of rfRes.value) {
        fciMap.set(fci.fondo.toUpperCase(), fci.vcp);
      }
    }
  } catch {
    // return empty map
  }

  setCached(cacheKey, fciMap, TTL.FCI);
  return fciMap;
}

export async function getPrecioActivo(ticker: string, tipo: TipoMercado): Promise<PrecioActivo | null> {
  const t = ticker.toUpperCase();

  try {
    switch (tipo) {
      case 'accion_arg': {
        const data = await fetchData912Panel('arg_stocks');
        const item = data[t];
        if (!item) return null;
        return { ticker: t, precio: item.price, variacion: item.change, volumen: item.volume, fuente: 'data912', timestamp: Date.now() };
      }

      case 'cedear':
      case 'etf': {
        const data = await fetchData912Panel('arg_cedears');
        const item = data[t];
        if (!item) return null;
        return { ticker: t, precio: item.price, variacion: item.change, volumen: item.volume, fuente: 'data912', timestamp: Date.now() };
      }

      case 'bono': {
        const data = await fetchData912Panel('arg_bonds');
        const item = data[t];
        if (!item) return null;
        return { ticker: t, precio: item.price, variacion: item.change, fuente: 'data912', timestamp: Date.now() };
      }

      case 'on': {
        const [corp, notes] = await Promise.allSettled([
          fetchData912Panel('arg_corp'),
          fetchData912Panel('arg_notes'),
        ]);
        const item =
          (corp.status === 'fulfilled' ? corp.value[t] : null) ??
          (notes.status === 'fulfilled' ? notes.value[t] : null);
        if (!item) return null;
        return { ticker: t, precio: item.price, variacion: item.change, fuente: 'data912', timestamp: Date.now() };
      }

      case 'letra': {
        const data = await fetchData912Panel('arg_notes');
        const item = data[t];
        if (!item) return null;
        return { ticker: t, precio: item.price, variacion: item.change, fuente: 'data912', timestamp: Date.now() };
      }

      case 'fci': {
        const fciMap = await fetchFciData();
        const vcp = fciMap.get(t) ?? fciMap.get(t.replace('FCI-MM-', '').replace('FCI-RF-', ''));
        if (!vcp) return null;
        return { ticker: t, precio: vcp, variacion: 0, fuente: 'argentinadatos', timestamp: Date.now() };
      }

      case 'mep': {
        const mep = await getMepRate();
        return { ticker: t, precio: mep, variacion: 0, fuente: 'dolarapi', timestamp: Date.now() };
      }

      default:
        return null;
    }
  } catch (err) {
    console.error(`[market-data] Error fetching ${ticker} (${tipo}):`, err);
    return null;
  }
}

export async function getDolarRates(): Promise<DolarRates> {
  return fetchDolarRates();
}

export async function getBenchmarkChanges(): Promise<BenchmarkChange[]> {
  const cacheKey = 'benchmarks';
  const cached = getCached<BenchmarkChange[]>(cacheKey);
  if (cached) return cached;

  const benchmarkTickers = [
    { nombre: 'S&P 500 (SPY)',      ticker: 'SPY',  panel: 'arg_cedears' as const },
    { nombre: 'NASDAQ (QQQ)',        ticker: 'QQQ',  panel: 'arg_cedears' as const },
    { nombre: 'MercadoLibre (MELI)', ticker: 'MELI', panel: 'arg_cedears' as const },
    { nombre: 'GD30',               ticker: 'GD30', panel: 'arg_bonds' as const },
    { nombre: 'AL30',               ticker: 'AL30', panel: 'arg_bonds' as const },
  ];

  const results: BenchmarkChange[] = [];

  await Promise.allSettled(
    benchmarkTickers.map(async bm => {
      const data = await fetchData912Panel(bm.panel);
      const item = data[bm.ticker];
      if (item) {
        results.push({ nombre: bm.nombre, ticker: bm.ticker, variacion: item.change });
      }
    })
  );

  try {
    const mep = await getMepRate();
    results.push({ nombre: 'Dólar MEP', ticker: 'MEP', variacion: 0 });
    void mep;
  } catch { /* ignore */ }

  setCached(cacheKey, results, TTL.BENCHMARKS);
  return results;
}

export interface PortfolioPosition {
  ticker: string;
  tipo: TipoMercado;
  unidades: number;
  precioCompraArs: number;
}

export interface ValuatedPosition extends PortfolioPosition {
  precioActualArs: number;
  valorActualArs: number;
  valorCompraArs: number;
  gananciaArs: number;
  gananciaPct: number;
  variacionDia: number;
  fuente: string;
}

export async function valuarPortfolio(
  positions: PortfolioPosition[]
): Promise<{ positions: ValuatedPosition[]; totalActualArs: number; totalCompraArs: number }> {
  const valuated = await Promise.all(
    positions.map(async pos => {
      const precio = await getPrecioActivo(pos.ticker, pos.tipo);
      const precioActualArs = precio?.precio ?? pos.precioCompraArs;
      const valorActualArs = precioActualArs * pos.unidades;
      const valorCompraArs = pos.precioCompraArs * pos.unidades;
      return {
        ...pos,
        precioActualArs,
        valorActualArs,
        valorCompraArs,
        gananciaArs:  valorActualArs - valorCompraArs,
        gananciaPct:  valorCompraArs > 0 ? (valorActualArs - valorCompraArs) / valorCompraArs : 0,
        variacionDia: precio?.variacion ?? 0,
        fuente:       precio?.fuente ?? 'estimado',
      } satisfies ValuatedPosition;
    })
  );

  const totalActualArs = valuated.reduce((s, p) => s + p.valorActualArs, 0);
  const totalCompraArs = valuated.reduce((s, p) => s + p.valorCompraArs, 0);

  return { positions: valuated, totalActualArs, totalCompraArs };
}
