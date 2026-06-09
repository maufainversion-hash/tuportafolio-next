'use client'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { QUESTIONS, calculateProfile, PROFILES, type ProfileResult } from '@/lib/profiler'
import { buildPortfolio } from '@/lib/portfolio-engine'

type Stage = 'intro' | 'questions' | 'capital' | 'loading' | 'result'

const COLORS = {
  base: '#050810',
  card: '#0f1623',
  blue: '#4fa3ff',
  gold: '#f0b429',
  text: '#eef2ff',
  muted: '#94a3b8',
  border: '#1e2d42',
  green: '#22c55e',
}

export default function OnboardingPage() {
  const router = useRouter()
  const [stage, setStage] = useState<Stage>('intro')
  const [current, setCurrent] = useState(0)
  const [answers, setAnswers] = useState<Record<string, number>>({})
  const [currency, setCurrency] = useState<'ARS' | 'USD'>('ARS')
  const [capital, setCapital] = useState('1000000')
  const [result, setResult] = useState<ProfileResult | null>(null)

  function selectOption(score: number) {
    const q = QUESTIONS[current]
    const next = { ...answers, [q.id]: score }
    setAnswers(next)
    if (current < QUESTIONS.length - 1) {
      setCurrent(current + 1)
    } else {
      setStage('capital')
    }
  }

  function goBack() {
    if (current > 0) setCurrent(current - 1)
    else setStage('intro')
  }

  function finish() {
    const cap = parseFloat(capital)
    if (isNaN(cap) || cap <= 0) return
    const profileResult = calculateProfile(answers)
    const portfolio = buildPortfolio({
      profile: profileResult.profile,
      capital: cap,
      currency,
      horizon: profileResult.horizon,
    })
    if (typeof window !== 'undefined') {
      localStorage.setItem('portfolio', JSON.stringify(portfolio))
      localStorage.setItem('investorProfile', JSON.stringify(profileResult))
    }
    setResult(profileResult)
    setStage('loading')
    setTimeout(() => setStage('result'), 2500)
  }

  const page: React.CSSProperties = {
    minHeight: '100vh',
    background: COLORS.base,
    color: COLORS.text,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '24px',
    fontFamily: "'DM Sans', sans-serif",
  }
  const cardStyle: React.CSSProperties = {
    width: '100%',
    maxWidth: 560,
    background: COLORS.card,
    border: `1px solid ${COLORS.border}`,
    borderRadius: 16,
    padding: 32,
  }
  const primaryBtn: React.CSSProperties = {
    background: COLORS.blue,
    color: COLORS.base,
    border: 'none',
    borderRadius: 8,
    padding: '12px 24px',
    fontSize: 15,
    fontWeight: 600,
    cursor: 'pointer',
  }

  // ───────── intro ─────────
  if (stage === 'intro') {
    return (
      <div style={page}>
        <div style={{ ...cardStyle, textAlign: 'center' }}>
          <div style={{ fontSize: 56, marginBottom: 16 }}>🧭</div>
          <h1 style={{ fontFamily: "'Syne', sans-serif", fontSize: 28, fontWeight: 700, margin: '0 0 8px' }}>
            Armemos tu cartera personalizada
          </h1>
          <p style={{ color: COLORS.muted, fontSize: 16, margin: '0 0 28px' }}>8 preguntas, 2 minutos.</p>
          <button style={primaryBtn} onClick={() => setStage('questions')}>
            Empecemos
          </button>
        </div>
      </div>
    )
  }

  // ───────── questions ─────────
  if (stage === 'questions') {
    const q = QUESTIONS[current]
    const progress = ((current + 1) / QUESTIONS.length) * 100
    const selected = answers[q.id]
    return (
      <div style={page}>
        <div style={cardStyle}>
          <div style={{ marginBottom: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <span style={{ fontSize: 13, color: COLORS.muted }}>{q.step}</span>
              <span style={{ fontSize: 13, color: COLORS.blue, fontFamily: "'Space Grotesk', sans-serif" }}>
                {Math.round(progress)}%
              </span>
            </div>
            <div style={{ height: 6, background: COLORS.base, borderRadius: 3, overflow: 'hidden' }}>
              <div
                style={{
                  height: '100%',
                  width: `${progress}%`,
                  background: `linear-gradient(135deg, ${COLORS.blue}, ${COLORS.gold})`,
                  transition: 'width 0.3s',
                }}
              />
            </div>
          </div>

          <div style={{ fontSize: 40, marginBottom: 8 }}>{q.emoji}</div>
          <h2 style={{ fontFamily: "'Syne', sans-serif", fontSize: 22, fontWeight: 700, margin: '0 0 6px' }}>
            {q.title}
          </h2>
          <p style={{ color: COLORS.muted, fontSize: 14, margin: '0 0 20px' }}>{q.hint}</p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {q.options.map(([label, score]) => {
              const active = selected === score
              return (
                <button
                  key={label}
                  onClick={() => selectOption(score)}
                  style={{
                    textAlign: 'left',
                    padding: '14px 16px',
                    borderRadius: 10,
                    border: `1px solid ${active ? COLORS.blue : COLORS.border}`,
                    background: active ? 'rgba(79,163,255,0.08)' : COLORS.base,
                    color: COLORS.text,
                    fontSize: 15,
                    cursor: 'pointer',
                    transition: 'all 0.15s',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = COLORS.blue
                    e.currentTarget.style.background = 'rgba(79,163,255,0.08)'
                  }}
                  onMouseLeave={(e) => {
                    if (!active) {
                      e.currentTarget.style.borderColor = COLORS.border
                      e.currentTarget.style.background = COLORS.base
                    }
                  }}
                >
                  {label}
                </button>
              )
            })}
          </div>

          <button
            onClick={goBack}
            style={{
              marginTop: 20,
              background: 'transparent',
              border: 'none',
              color: COLORS.muted,
              fontSize: 14,
              cursor: 'pointer',
            }}
          >
            ← Atrás
          </button>
        </div>
      </div>
    )
  }

  // ───────── capital ─────────
  if (stage === 'capital') {
    const cap = parseFloat(capital)
    const valid = !isNaN(cap) && cap > 0
    return (
      <div style={page}>
        <div style={cardStyle}>
          <div style={{ fontSize: 40, marginBottom: 8 }}>💰</div>
          <h2 style={{ fontFamily: "'Syne', sans-serif", fontSize: 22, fontWeight: 700, margin: '0 0 6px' }}>
            ¿Cuánto querés invertir?
          </h2>
          <p style={{ color: COLORS.muted, fontSize: 14, margin: '0 0 20px' }}>
            Elegí la moneda y el monto a destinar a esta cartera.
          </p>

          <div style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
            {(['ARS', 'USD'] as const).map((c) => {
              const active = currency === c
              return (
                <button
                  key={c}
                  onClick={() => setCurrency(c)}
                  style={{
                    flex: 1,
                    padding: '12px',
                    borderRadius: 10,
                    border: `1px solid ${active ? COLORS.blue : COLORS.border}`,
                    background: active ? 'rgba(79,163,255,0.08)' : COLORS.base,
                    color: active ? COLORS.text : COLORS.muted,
                    fontSize: 15,
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  {c === 'ARS' ? 'Pesos (ARS)' : 'Dólares (USD)'}
                </button>
              )
            })}
          </div>

          <input
            type="number"
            value={capital}
            onChange={(e) => setCapital(e.target.value)}
            placeholder={currency === 'ARS' ? '1.000.000' : '5.000'}
            style={{
              width: '100%',
              padding: '14px 16px',
              borderRadius: 10,
              border: `1px solid ${COLORS.border}`,
              background: COLORS.base,
              color: COLORS.text,
              fontSize: 18,
              fontFamily: "'Space Grotesk', sans-serif",
              outline: 'none',
              marginBottom: 24,
            }}
          />

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <button
              onClick={() => {
                setStage('questions')
                setCurrent(QUESTIONS.length - 1)
              }}
              style={{ background: 'transparent', border: 'none', color: COLORS.muted, fontSize: 14, cursor: 'pointer' }}
            >
              ← Atrás
            </button>
            <button
              onClick={finish}
              disabled={!valid}
              style={{ ...primaryBtn, background: COLORS.gold, opacity: valid ? 1 : 0.5, cursor: valid ? 'pointer' : 'not-allowed' }}
            >
              Armar mi cartera
            </button>
          </div>
        </div>
      </div>
    )
  }

  // ───────── loading ─────────
  if (stage === 'loading') {
    return (
      <div style={page}>
        <div style={{ ...cardStyle, textAlign: 'center' }}>
          <div
            style={{
              width: 48,
              height: 48,
              margin: '0 auto 20px',
              border: `4px solid ${COLORS.border}`,
              borderTopColor: COLORS.blue,
              borderRadius: '50%',
              animation: 'spin 0.8s linear infinite',
            }}
          />
          <h2 style={{ fontFamily: "'Syne', sans-serif", fontSize: 20, fontWeight: 700, margin: '0 0 6px' }}>
            Armando tu cartera personalizada…
          </h2>
          <p style={{ color: COLORS.muted, fontSize: 14 }}>Estamos seleccionando los instrumentos para tu perfil.</p>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      </div>
    )
  }

  // ───────── result ─────────
  const info = result ? PROFILES[result.profile] : null
  return (
    <div style={page}>
      <div className="hero-card" style={{ width: '100%', maxWidth: 560, padding: 32, textAlign: 'center' }}>
        <div style={{ position: 'relative', zIndex: 1 }}>
        <div style={{ fontSize: 56, marginBottom: 12 }}>{info?.emoji}</div>
        <p style={{ color: COLORS.muted, fontSize: 14, margin: '0 0 4px' }}>Tu perfil de inversor es</p>
        <h1 style={{ fontFamily: "'Syne', sans-serif", fontSize: 30, fontWeight: 700, margin: '0 0 8px', color: info?.color }}>
          {info?.label}
        </h1>
        <p style={{ color: COLORS.text, fontSize: 16, margin: '0 0 28px', maxWidth: 420, marginLeft: 'auto', marginRight: 'auto' }}>
          {info?.tagline}
        </p>
        <button style={{ ...primaryBtn, background: COLORS.green }} onClick={() => router.push('/dashboard')}>
          Ver mi cartera →
        </button>
        </div>
      </div>
    </div>
  )
}
