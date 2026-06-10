// app/api/portfolio/build/route.ts
// Build a portfolio recommendation for a given profile + capital
// POST /api/portfolio/build

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { buildPortfolio, projectScenarios } from '@/lib/portfolio-engine';
import { getMepRate } from '@/lib/market-data';
import type { RiskProfile } from '@/lib/profiler';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  const body = await request.json() as {
    profile?: RiskProfile;
    capitalUsd?: number;
    capitalArs?: number;
    horizonYears?: number;
  };

  const { profile, capitalArs, horizonYears = 5 } = body;
  let capitalUsd = body.capitalUsd;

  if (!profile) {
    return NextResponse.json({ error: 'profile is required' }, { status: 400 });
  }

  // If capital given in ARS, convert to USD via MEP
  if (!capitalUsd && capitalArs) {
    const mep = await getMepRate();
    capitalUsd = capitalArs / mep;
  }

  if (!capitalUsd || capitalUsd <= 0) {
    return NextResponse.json({ error: 'capitalUsd or capitalArs is required' }, { status: 400 });
  }

  try {
    const portfolio  = buildPortfolio(profile, capitalUsd);
    const scenarios  = projectScenarios(capitalUsd, portfolio, horizonYears);
    const mepRate    = await getMepRate();

    // Persist portfolio to Supabase profiles table
    const portfolioForStorage = {
      positions: portfolio.positions.map(p => ({
        ticker:            p.ticker,
        tipo:              p.tipo,
        weight:            p.weight,
        expected_cagr:     p.expectedCagr,
        expected_vol:      p.expectedVolatility,
        category:          p.category,
        currency:          p.currency,
        // Approximate ARS amount for position
        unidades:          1, // placeholder — real units set at transaction time
        precio_compra_ars: p.weight * capitalUsd * mepRate,
      })),
      expected_cagr:       portfolio.expectedCagr,
      expected_volatility: portfolio.expectedVolatility,
      sharpe_ratio:        portfolio.sharpeRatio,
      hhi:                 portfolio.hhi,
      hhi_label:           portfolio.hhiLabel,
      category_exposure:   portfolio.categoryExposure,
      currency_exposure:   portfolio.currencyExposure,
      built_at:            new Date().toISOString(),
    };

    // Save to profiles + push to portfolio_history (max 5 FIFO)
    const { data: currentProfile } = await supabase
      .from('profiles')
      .select('portfolio_history')
      .eq('user_id', user.id)
      .single();

    const history: unknown[] = Array.isArray(currentProfile?.portfolio_history)
      ? currentProfile.portfolio_history
      : [];

    history.push({ ...portfolioForStorage, capital_usd: capitalUsd });
    const trimmedHistory = history.slice(-5); // keep last 5

    await supabase
      .from('profiles')
      .update({
        portfolio:         portfolioForStorage,
        portfolio_history: trimmedHistory,
        capital:           capitalUsd,
        risk_profile:      profile,
        horizon:           horizonYears,
        updated_at:        new Date().toISOString(),
      })
      .eq('user_id', user.id);

    return NextResponse.json({
      portfolio,
      scenarios,
      capitalUsd,
      mepRate,
    });
  } catch (err) {
    console.error('[/api/portfolio/build]', err);
    return NextResponse.json({ error: 'Portfolio build failed' }, { status: 500 });
  }
}
