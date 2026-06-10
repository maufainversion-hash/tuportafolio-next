// app/api/lucas/route.ts
// Lucas — herramienta IA de análisis financiero (NO asesor). Streaming via Gemini.
// POST { messages: [{role, content}], portfolio? }

import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { createClient } from '@/lib/supabase/server';

export const runtime = 'nodejs';

const DAILY_LIMIT = 50; // tier 1

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface LucasPortfolio {
  profile?: string;
  totalCapital?: number;
  currency?: string;
  expectedCagr?: number;
  expectedReturnAnnual?: number;
  positions?: Array<{ ticker?: string; weight?: number; category?: string }>;
}

const SYSTEM_PROMPT = `Sos Lucas, una herramienta IA de análisis financiero personal argentina. Ayudás a los usuarios a entender su portafolio y el mercado local.

IDENTIDAD: Sos una HERRAMIENTA de análisis financiero educativo, NO un asesor financiero regulado por la CNV. Nunca te presentes como asesor ni des recomendaciones personalizadas de compra/venta. Siempre aclará que sos una herramienta educativa.

REGLAS DE ORO (innegociables):
1. Usá SIEMPRE tickers reales del mercado argentino (AL30, GD30, GGAL, YPFD, SPY, AAPL, MELI, etc.). Nunca inventes símbolos.
2. Referite a brokers locales (IOL InvertirOnline, Cocos Capital, Balanz, Bull Market) cuando hables de cómo operar.
3. Aclará siempre si los montos o rendimientos están en ARS (pesos) o en USD (dólares), y mencioná el dólar MEP cuando corresponda.
4. Mostrá siempre el peor escenario posible además del esperado: el riesgo es tan importante como el retorno.
5. Explicá con analogías simples y cotidianas para que cualquiera lo entienda, sin jerga innecesaria.

FORMATO DE RESPUESTA: Respondé EXCLUSIVAMENTE con un objeto JSON válido (sin markdown, sin texto fuera del JSON) con esta forma:
{
  "intro": "string — resumen breve y cercano del análisis",
  "assets": [ { "ticker": "string", "what": "qué es", "purpose": "para qué sirve en la cartera", "worst_case": "peor escenario realista" } ],
  "synergy": "string — cómo se complementan los activos entre sí",
  "alerts": [ { "title": "string", "message": "string", "severity": "info" | "warning" | "danger" } ],
  "rebalancing_triggers": ["disparador 1", "disparador 2", "disparador 3"],
  "rebalancing_how": "string — cómo rebalancear en la práctica con brokers locales",
  "tips": ["tip 1", "tip 2", "tip 3", "tip 4", "tip 5"]
}
Recordá: sos una herramienta de análisis educativo, no un asesor financiero regulado.`;

function buildPortfolioContext(portfolio?: LucasPortfolio | null): string {
  if (!portfolio) return 'El usuario todavía no tiene una cartera armada.';
  const cagr = portfolio.expectedCagr ?? portfolio.expectedReturnAnnual;
  const lines: string[] = ['Contexto de la cartera del usuario:'];
  if (portfolio.profile) lines.push(`- Perfil de riesgo: ${portfolio.profile}`);
  if (portfolio.totalCapital != null) lines.push(`- Capital: ${portfolio.totalCapital} ${portfolio.currency ?? ''}`.trim());
  if (cagr != null) lines.push(`- Retorno esperado anual: ${(cagr * 100).toFixed(1)}%`);
  if (Array.isArray(portfolio.positions) && portfolio.positions.length) {
    const items = portfolio.positions
      .map((p) => `${p.ticker ?? '?'}${p.weight != null ? ` (${(p.weight * 100).toFixed(1)}%)` : ''}`)
      .join(', ');
    lines.push(`- Posiciones: ${items}`);
  }
  return lines.join('\n');
}

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: 'GEMINI_API_KEY no configurada' }, { status: 500 });
  }

  // ── Rate limit: max DAILY_LIMIT calls/day (best-effort; never block on infra) ──
  try {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const { count } = await supabase
      .from('ai_calls')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .gte('created_at', startOfDay.toISOString());
    if ((count ?? 0) >= DAILY_LIMIT) {
      return NextResponse.json(
        { error: `Límite diario alcanzado (${DAILY_LIMIT} consultas).` },
        { status: 429 }
      );
    }
  } catch {
    // ai_calls table not provisioned yet — allow through.
  }

  const body = (await request.json()) as { messages?: ChatMessage[]; portfolio?: LucasPortfolio };
  const messages = Array.isArray(body.messages) ? body.messages : [];
  const portfolioContext = buildPortfolioContext(body.portfolio);

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({
    model: 'gemini-2.5-flash-preview-05-20',
    systemInstruction: `${SYSTEM_PROMPT}\n\n${portfolioContext}`,
  });

  const contents = messages.map((m) => ({
    role: m.role === 'assistant' ? ('model' as const) : ('user' as const),
    parts: [{ text: String(m.content ?? '') }],
  }));

  // Log the call (best-effort, non-blocking).
  void supabase
    .from('ai_calls')
    .insert({ user_id: user.id, created_at: new Date().toISOString() })
    .then(() => {}, () => {});

  const encoder = new TextEncoder();
  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      try {
        const result = await model.generateContentStream({ contents });
        for await (const chunk of result.stream) {
          const text = chunk.text();
          if (text) {
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text })}\n\n`));
          }
        }
        controller.enqueue(encoder.encode('data: [DONE]\n\n'));
      } catch (err) {
        console.error('[/api/lucas] stream error', err);
        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify({ error: 'Error al generar la respuesta.' })}\n\n`)
        );
        controller.enqueue(encoder.encode('data: [DONE]\n\n'));
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream; charset=utf-8',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
    },
  });
}
