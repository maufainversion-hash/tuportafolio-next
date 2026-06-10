// app/api/market/benchmarks/route.ts
// Market overview benchmarks for dashboard
// GET /api/market/benchmarks

import { NextResponse } from 'next/server';
import { getBenchmarkChanges, getDolarRates } from '@/lib/market-data';

export const runtime = 'nodejs';
export const revalidate = 0;

export async function GET() {
  try {
    const [benchmarks, rates] = await Promise.all([
      getBenchmarkChanges(),
      getDolarRates(),
    ]);

    return NextResponse.json(
      { benchmarks, rates, timestamp: Date.now() },
      { headers: { 'Cache-Control': 'max-age=300' } }
    );
  } catch (err) {
    console.error('[/api/market/benchmarks]', err);
    return NextResponse.json({ error: 'Error fetching benchmarks' }, { status: 500 });
  }
}
