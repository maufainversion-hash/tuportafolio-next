// lib/profiler.ts — 8-question risk profiler
export type RiskProfile = 'conservador' | 'estable' | 'moderado' | 'agresivo';
export interface ProfilerAnswer { questionId: string; value: number; }
export interface ProfilerResult { score: number; maxScore: number; pct: number; profile: RiskProfile; profileLabel: string; profileColor: string; horizon: number; }
export const PROFILER_QUESTIONS = [
  { id: 'motivation', label: '¿Cuál es tu principal objetivo al invertir?', options: [{ value: 0, label: 'Preservar capital, no perder lo que tengo' },{ value: 1, label: 'Crecer de forma estable con baja volatilidad' },{ value: 2, label: 'Crecer moderadamente aceptando algo de riesgo' },{ value: 3, label: 'Maximizar retornos aunque implique alta volatilidad' }] },
  { id: 'loss_reaction', label: 'Si tu portafolio cae un 20% en un mes, ¿qué harías?', options: [{ value: 0, label: 'Vendo todo inmediatamente para evitar más pérdidas' },{ value: 1, label: 'Vendo una parte para reducir exposición' },{ value: 2, label: 'Mantengo y espero la recuperación' },{ value: 3, label: 'Compro más, es una oportunidad' }] },
  { id: 'horizon', label: '¿En cuánto tiempo planeas necesitar este dinero?', options: [{ value: 0, label: 'Menos de 1 año' },{ value: 1, label: '1 a 2 años' },{ value: 2, label: '2 a 5 años' },{ value: 3, label: 'Más de 5 años' }] },
  { id: 'income_stability', label: '¿Cómo describirías tus ingresos actuales?', options: [{ value: 0, label: 'Inestables o insuficientes' },{ value: 1, label: 'Estables pero ajustados' },{ value: 2, label: 'Estables y cómodos' },{ value: 3, label: 'Muy estables o con múltiples fuentes' }] },
  { id: 'emergency_fund', label: '¿Tenés fondo de emergencia fuera de esta inversión?', options: [{ value: 0, label: 'No tengo fondo de emergencia' },{ value: 1, label: 'Tengo para 1-2 meses de gastos' },{ value: 2, label: 'Tengo para 3-6 meses de gastos' },{ value: 3, label: 'Tengo para más de 6 meses de gastos' }] },
  { id: 'risk_appetite', label: 'Elegí la frase que mejor te describe:', options: [{ value: 0, label: '"Prefiero rendimientos bajos seguros que arriesgar"' },{ value: 1, label: '"Acepto algo de riesgo por mejores rendimientos"' },{ value: 2, label: '"Me siento cómodo con fluctuaciones a cambio de crecer"' },{ value: 3, label: '"Busco el máximo retorno posible, acepto grandes fluctuaciones"' }] },
  { id: 'experience', label: '¿Cuánta experiencia tenés invirtiendo?', options: [{ value: 0, label: 'Ninguna, es mi primera vez' },{ value: 1, label: 'Poca, he comprado algún plazo fijo o FCI' },{ value: 2, label: 'Moderada, opero acciones o bonos' },{ value: 3, label: 'Amplia, opero activos complejos' }] },
  { id: 'mindset', label: '¿Cómo reaccionás frente a la incertidumbre financiera?', options: [{ value: 0, label: 'Me genera mucha ansiedad, prefiero certeza' },{ value: 1, label: 'Me incomoda, pero lo manejo' },{ value: 2, label: 'Lo veo con calma, entiendo que es normal' },{ value: 3, label: 'Me motiva, lo veo como oportunidad' }] },
];
export const HORIZON_MAP: Record<number,number> = { 0:1, 1:2, 2:5, 3:10 };
export const PROFILE_CONFIG: Record<RiskProfile,{label:string;color:string;description:string}> = {
  conservador: { label:'Conservador', color:'#22c55e', description:'Preservación de capital, mínima volatilidad' },
  estable:     { label:'Estable',     color:'#60a5fa', description:'Crecimiento estable con baja exposición al riesgo' },
  moderado:    { label:'Moderado',    color:'#f59e0b', description:'Crecimiento balanceado con riesgo controlado' },
  agresivo:    { label:'Agresivo',    color:'#ef4444', description:'Máximo crecimiento, alta tolerancia a la volatilidad' },
};
export function calculateProfile(answers: ProfilerAnswer[]): ProfilerResult {
  const score = answers.reduce((s,a) => s + a.value, 0);
  const maxScore = 24;
  const pct = score / maxScore;
  let profile: RiskProfile;
  if (pct < 0.2917) profile = 'conservador';
  else if (pct < 0.4792) profile = 'estable';
  else if (pct < 0.6875) profile = 'moderado';
  else profile = 'agresivo';
  const horizonAnswer = answers.find(a => a.questionId === 'horizon');
  const horizon = HORIZON_MAP[horizonAnswer?.value ?? 1] ?? 2;
  const cfg = PROFILE_CONFIG[profile];
  return { score, maxScore, pct, profile, profileLabel: cfg.label, profileColor: cfg.color, horizon };
}
export async function convertCapitalToUsd(amountArs: number, mepRate: number): Promise<number> {
  return amountArs / mepRate;
}
