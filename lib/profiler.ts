export type InvestorProfile = 'conservador' | 'estable' | 'moderado' | 'agresivo'

export interface Question {
  id: string
  emoji: string
  step: string
  title: string
  hint: string
  options: [string, number][]
}

export const QUESTIONS: Question[] = [
  {
    id: 'motivation',
    emoji: '🎯',
    step: 'Pregunta 1 de 8',
    title: '¿Qué te trae acá?',
    hint: 'Lo primero es entender tu motivación principal.',
    options: [
      ['Protegerme de la inflación', 0],
      ['Que la plata quieta me rinda algo', 1],
      ['Hacer crecer mi capital, entiendo el riesgo', 2],
      ['Buscar la máxima rentabilidad posible', 3],
    ],
  },
  {
    id: 'loss_reaction',
    emoji: '📉',
    step: 'Pregunta 2 de 8',
    title: 'Invertís $500k y al mes valen $430k, ¿qué hacés?',
    hint: 'Tu reacción ante una caída dice mucho de tu perfil.',
    options: [
      ['Saco todo inmediatamente', 0],
      ['Saco la mitad por las dudas', 1],
      ['No hago nada y espero que se recupere', 2],
      ['Meto más, está más barato', 3],
    ],
  },
  {
    id: 'horizon',
    emoji: '⏳',
    step: 'Pregunta 3 de 8',
    title: '¿En cuánto tiempo vas a necesitar la plata?',
    hint: 'El horizonte temporal define qué instrumentos te convienen.',
    options: [
      ['En menos de 1 año', 0],
      ['Entre 1 y 3 años', 1],
      ['Entre 3 y 7 años', 2],
      ['Largo plazo, no la necesito pronto', 3],
    ],
  },
  {
    id: 'income_stability',
    emoji: '💼',
    step: 'Pregunta 4 de 8',
    title: '¿Cómo son tus ingresos?',
    hint: 'La estabilidad de tus ingresos influye en cuánto riesgo podés tomar.',
    options: [
      ['Irregulares', 0],
      ['Varían bastante mes a mes', 1],
      ['Sueldo fijo', 2],
      ['Muy estables, múltiples fuentes', 3],
    ],
  },
  {
    id: 'emergency_fund',
    emoji: '🛟',
    step: 'Pregunta 5 de 8',
    title: '¿Podés cubrir un gasto inesperado sin tocar esta inversión?',
    hint: 'Tener un colchón de emergencia te permite invertir con más tranquilidad.',
    options: [
      ['No, no tengo nada', 0],
      ['1 a 2 meses de gastos', 1],
      ['3 a 6 meses de gastos', 2],
      ['Más de 6 meses de gastos', 3],
    ],
  },
  {
    id: 'risk_appetite',
    emoji: '🎲',
    step: 'Pregunta 6 de 8',
    title: '¿Con cuál te quedás?',
    hint: 'Elegí el escenario de rendimiento y riesgo con el que te sentís cómodo.',
    options: [
      ['5% fijo asegurado', 0],
      ['Hasta 15%, pero puedo perder 5%', 1],
      ['Hasta 30%, pero puedo perder 20%', 2],
      ['Hasta 60%, pero puedo perder 40%', 3],
    ],
  },
  {
    id: 'experience',
    emoji: '📚',
    step: 'Pregunta 7 de 8',
    title: '¿Cuánto sabés de inversiones?',
    hint: 'Tu experiencia previa nos ayuda a calibrar las recomendaciones.',
    options: [
      ['Nada, nunca invertí', 0],
      ['Solo plazo fijo', 1],
      ['Escuché de CEDEARs y bonos', 2],
      ['Opero acciones y bonos', 3],
    ],
  },
  {
    id: 'mindset',
    emoji: '🧠',
    step: 'Pregunta 8 de 8',
    title: '¿Con cuál frase te identificás?',
    hint: 'Por último, tu mentalidad frente a la inversión.',
    options: [
      ['Quiero dormir tranquilo', 0],
      ['Busco un equilibrio', 1],
      ['Pienso a largo plazo, no me asustan las caídas', 2],
      ['Quiero maximizar mi patrimonio', 3],
    ],
  },
]

// Horizon question score → years
export const HORIZON_MAP: Record<number, number> = {
  0: 1, // menos de 1 año
  1: 2, // 1-3 años
  2: 5, // 3-7 años
  3: 10, // largo plazo
}

export interface ProfileInfo {
  emoji: string
  label: string
  color: string
  tagline: string
  explanation: string
  whatMeans: string[]
}

export const PROFILES: Record<InvestorProfile, ProfileInfo> = {
  conservador: {
    emoji: '🛡️',
    label: 'Conservador',
    color: '#4fa3ff',
    tagline: 'Priorizás preservar tu capital por encima de todo.',
    explanation:
      'Tu prioridad es proteger lo que tenés. Preferís rendimientos modestos pero estables antes que arriesgarte a perder capital. Una cartera conservadora se apoya en instrumentos de bajo riesgo y alta liquidez.',
    whatMeans: [
      'Mayor peso en pesos remunerados, LECAP y bonos CER de corto plazo',
      'Exposición acotada a acciones y CEDEARs',
      'Dolarización parcial vía MEP y ONs corporativas sólidas',
      'Volatilidad baja, retornos más previsibles',
    ],
  },
  estable: {
    emoji: '⚖️',
    label: 'Estable',
    color: '#22c55e',
    tagline: 'Buscás crecer sin sobresaltos grandes.',
    explanation:
      'Querés que tu capital crezca por encima de la inflación, aceptando algo de volatilidad. Una cartera estable combina renta fija con una porción medida de renta variable.',
    whatMeans: [
      'Base sólida de renta fija en pesos y dólares',
      'Porción creciente de CEDEARs de empresas grandes',
      'Bonos soberanos y ONs para sumar rendimiento en dólares',
      'Volatilidad moderada con foco en el mediano plazo',
    ],
  },
  moderado: {
    emoji: '📊',
    label: 'Moderado',
    color: '#f0b429',
    tagline: 'Equilibrás crecimiento y riesgo de forma activa.',
    explanation:
      'Estás dispuesto a tolerar oscilaciones a cambio de mayor potencial de crecimiento. Una cartera moderada tiene un peso relevante en renta variable, balanceado con renta fija.',
    whatMeans: [
      'Mayor exposición a CEDEARs y acciones argentinas',
      'Renta fija como ancla, no como núcleo',
      'Diversificación entre pesos y dólares',
      'Volatilidad media-alta, horizonte de mediano a largo plazo',
    ],
  },
  agresivo: {
    emoji: '🚀',
    label: 'Agresivo',
    color: '#ef4444',
    tagline: 'Vas por la máxima rentabilidad y bancás la volatilidad.',
    explanation:
      'Tu objetivo es maximizar el crecimiento del capital y aceptás caídas fuertes en el camino. Una cartera agresiva se concentra en renta variable y activos de mayor potencial.',
    whatMeans: [
      'Peso dominante en acciones argentinas y CEDEARs de crecimiento',
      'Exposición a nombres de alta volatilidad (NVDA, MELI, BMA, VIST)',
      'Renta fija mínima, sólo para liquidez',
      'Volatilidad alta, horizonte de largo plazo',
    ],
  },
}

export function scoreToProfile(score: number, max: number): InvestorProfile {
  // Thresholds are defined out of 24; scale if max differs.
  const scaled = max === 24 ? score : Math.round((score / max) * 24)
  if (scaled <= 6) return 'conservador'
  if (scaled <= 11) return 'estable'
  if (scaled <= 16) return 'moderado'
  return 'agresivo'
}

export interface ProfileResult {
  profile: InvestorProfile
  score: number
  maxScore: number
  horizon: number
}

export function calculateProfile(answers: Record<string, number>): ProfileResult {
  const maxScore = QUESTIONS.length * 3 // 24
  const score = QUESTIONS.reduce((sum, q) => sum + (answers[q.id] ?? 0), 0)
  const profile = scoreToProfile(score, maxScore)
  const horizonScore = answers['horizon'] ?? 1
  const horizon = HORIZON_MAP[horizonScore] ?? 5
  return { profile, score, maxScore, horizon }
}
