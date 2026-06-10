// app/api/market/rates/route.ts
// USD exchange rates (MEP, CCL, blue, oficial, etc.)
// GET /api/market/rates

import { NextResponse } from 'next/server';
import { getDolarRates, getMepRate } from '@/lib/market-data';

export const runtime = 'nodejs';
export const revalidate = 0;

export async function GET() {
  try {
    const [rates, mep] = await Promise.all([
      getDolarRates(),
      getMepRate(),
    ]);

    return NextResponse.json(
      { ...rates, mep, timestamp: Date.now() },
      { headers: { 'Cache-Control': 'max-age=120' } }
    );
  } catch (err) {
    console.error('[/api/market/rates]', err);
    return NextResponse.json({ error: 'Error fetching rates' }, { status: 500 });
  }
}
