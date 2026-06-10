// app/api/market/prices/route.ts
// Live price for a single ticker
// GET /api/market/prices?ticker=AAPL&tipo=cedear

import { NextRequest, NextResponse } from 'next/server';
import { getPrecioActivo, type TipoMercado } from '@/lib/market-data';
import { getIolPrice } from '@/lib/iol-client';

export const runtime = 'nodejs';
export const revalidate = 0; // no static caching — handled in lib

const TTL_HEADERS: Record<string, string> = {
  accion_arg: 'max-age=180',
  cedear:     'max-age=180',
  etf:        'max-age=180',
  bono:       'max-age=600',
  on:         'max-age=600',
  letra:      'max-age=600',
  fci:        'max-age=3600',
  mep:        'max-age=1800',
};

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const ticker = searchParams.get('ticker')?.toUpperCase();
  const tipo   = searchParams.get('tipo') as TipoMercado | null;

  if (!ticker || !tipo) {
    return NextResponse.json(
      { error: 'ticker and tipo are required' },
      { status: 400 }
    );
  }

  try {
    // IOL primary (if configured), data912 fallback
    let result = await getIolPrice(ticker, tipo);

    if (!result || result.precio === 0) {
      const fallback = await getPrecioActivo(ticker, tipo);
      if (fallback) {
        result = { precio: fallback.precio, variacion: fallback.variacion };
      }
    }

    if (!result || result.precio === 0) {
      return NextResponse.json({ error: 'Precio no disponible' }, { status: 404 });
    }

    const cacheControl = TTL_HEADERS[tipo] ?? 'max-age=180';

    return NextResponse.json(
      { ticker, tipo, precio: result.precio, variacion: result.variacion, timestamp: Date.now() },
      { headers: { 'Cache-Control': cacheControl } }
    );
  } catch (err) {
    console.error('[/api/market/prices]', err);
    return NextResponse.json({ error: 'Error fetching price' }, { status: 500 });
  }
}
