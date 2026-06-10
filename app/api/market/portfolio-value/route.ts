// app/api/market/portfolio-value/route.ts
// Returns live valuation of the authenticated user's portfolio
// GET /api/market/portfolio-value

import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { valuarPortfolio, type PortfolioPosition } from '@/lib/market-data';
import { getMepRate } from '@/lib/market-data';
import type { TipoMercado } from '@/lib/market-data';

export const runtime = 'nodejs';
export const revalidate = 0;

interface StoredPosition {
  ticker: string;
  tipo: string;
  unidades: number;
  precio_compra_ars: number;
}

export async function GET() {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  // Fetch user's portfolio from profiles table
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('portfolio, capital, risk_profile')
    .eq('user_id', user.id)
    .single();

  if (profileError || !profile) {
    return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
  }

  const portfolioData = profile.portfolio as { positions?: StoredPosition[] } | null;
  if (!portfolioData?.positions?.length) {
    return NextResponse.json({
      totalActualArs: 0,
      totalCompraArs: 0,
      positions: [],
      mepRate: await getMepRate(),
    });
  }

  // Map stored positions to PortfolioPosition
  const positions: PortfolioPosition[] = portfolioData.positions.map(p => ({
    ticker:           p.ticker,
    tipo:             p.tipo as TipoMercado,
    unidades:         p.unidades,
    precioCompraArs:  p.precio_compra_ars,
  }));

  try {
    const [valuation, mepRate] = await Promise.all([
      valuarPortfolio(positions),
      getMepRate(),
    ]);

    // Persist updated portfolio value snapshot if changed materially (>0.5%)
    const capitalUsd = profile.capital ?? 0;
    const totalActualUsd = valuation.totalActualArs / mepRate;
    const changePct = capitalUsd > 0 ? Math.abs(totalActualUsd - capitalUsd) / capitalUsd : 0;

    if (changePct > 0.005) {
      // Non-blocking upsert — don't await
      void supabase
        .from('profiles')
        .update({ capital: totalActualUsd, updated_at: new Date().toISOString() })
        .eq('user_id', user.id)
        .then(() => {}, () => {});
    }

    return NextResponse.json(
      {
        totalActualArs: valuation.totalActualArs,
        totalCompraArs: valuation.totalCompraArs,
        gananciaArs:    valuation.totalActualArs - valuation.totalCompraArs,
        gananciaPct:    valuation.totalCompraArs > 0
          ? (valuation.totalActualArs - valuation.totalCompraArs) / valuation.totalCompraArs
          : 0,
        totalActualUsd,
        mepRate,
        positions: valuation.positions,
        timestamp: Date.now(),
      },
      { headers: { 'Cache-Control': 'max-age=30' } }
    );
  } catch (err) {
    console.error('[/api/market/portfolio-value]', err);
    return NextResponse.json({ error: 'Valuation failed' }, { status: 500 });
  }
}
