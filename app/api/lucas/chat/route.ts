import Anthropic from '@anthropic-ai/sdk'
import { NextResponse } from 'next/server'

const BASE_SYSTEM = `Sos Lucas, una herramienta de análisis financiero para inversores argentinos. NO sos un asesor de inversiones ni das recomendaciones personalizadas: sos una herramienta de análisis e información.

Conocés a fondo el mercado argentino:
- Renta fija en pesos: LECAP (letras capitalizables a tasa fija), TAMAR (tasa mayorista variable), bonos CER (ajustan por inflación), bonos Dollar Linked y bonos Duales.
- Bonos soberanos en dólares: AL30/GD30 y la curva de Globales y Bonares (ley local vs. ley NY).
- ONs corporativas en dólares: YPF, Pampa, TGS, MercadoLibre (MELI), Telecom, entre otras.
- CEDEARs: acciones de empresas de EE.UU. operadas en pesos al tipo de cambio implícito.
- Acciones argentinas: GGAL, YPFD, PAMP, VIST, BMA, entre otras.
- Dólar MEP: dólar obtenido legalmente vía mercado de capitales.

Reglas de estilo y conducta:
- Respondé en español rioplatense (voseo), claro y cercano.
- Sé conciso: máximo 3 o 4 párrafos.
- Explicá conceptos de forma accesible, sin tecnicismos innecesarios.
- NUNCA des consejos categóricos de compra o venta ("comprá X", "vendé Y"). En su lugar, explicá pros, contras y contexto para que la persona decida.
- Recordá, cuando sea pertinente, que sos una herramienta de análisis y no un asesor financiero.`

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const messages = Array.isArray(body?.messages) ? body.messages : []
    const portfolio = body?.portfolio ?? null

    let system = BASE_SYSTEM
    if (portfolio) {
      type PositionLike = { asset?: { ticker?: string }; assetId?: string; weight?: number }
      const positions = Array.isArray(portfolio.positions)
        ? (portfolio.positions as PositionLike[])
            .map((p) => `${p.asset?.ticker ?? p.assetId} (${(p.weight ?? 0).toFixed(1)}%)`)
            .join(', ')
        : ''
      system += `\n\nContexto de la cartera del usuario (úsalo para personalizar tus respuestas cuando sea relevante):
- Perfil de riesgo: ${portfolio.profile}
- Capital: ${portfolio.totalCapital} ${portfolio.currency}
- Retorno esperado anual: ${((portfolio.expectedReturnAnnual ?? 0) * 100).toFixed(1)}%
- Volatilidad estimada: ${((portfolio.weightedVolatility ?? 0) * 100).toFixed(1)}%
- Posiciones: ${positions}`
    }

    const apiKey = process.env.ANTHROPIC_API_KEY
    if (!apiKey) {
      return NextResponse.json({ error: 'Falta configurar ANTHROPIC_API_KEY.' }, { status: 500 })
    }

    const client = new Anthropic({ apiKey })

    const response = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 800,
      system,
      messages: (messages as { role?: string; content?: string }[]).map((m) => ({
        role: m.role === 'assistant' ? ('assistant' as const) : ('user' as const),
        content: String(m.content ?? ''),
      })),
    })

    const message = response.content
      .filter((block) => block.type === 'text')
      .map((block) => (block as { text: string }).text)
      .join('\n')
      .trim()

    return NextResponse.json({ message })
  } catch (error) {
    console.error('Lucas chat error:', error)
    return NextResponse.json({ error: 'No se pudo procesar la consulta.' }, { status: 500 })
  }
}
