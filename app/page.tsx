import Link from 'next/link'
import Navbar from '@/components/layout/Navbar'
import Card from '@/components/ui/Card'
import MetricCard from '@/components/ui/MetricCard'
import Badge from '@/components/ui/Badge'
export default function Home() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen">
        <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto animate-fade-in">
            <Badge variant="blue" className="mb-6">Herramienta de inversión inteligente</Badge>
            <h1 className="font-display text-5xl sm:text-6xl font-bold text-text-primary mb-6 leading-tight">Invertí con{' '}<span className="gradient-text">inteligencia</span></h1>
            <p className="text-xl text-text-secondary mb-10 leading-relaxed">Analizá tu portafolio, explorá activos y tomá decisiones financieras informadas con Lucas, tu herramienta de análisis financiero.</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/register" className="inline-flex items-center justify-center px-7 py-3.5 text-base font-semibold bg-accent-gold text-bg-base rounded-btn hover:bg-accent-gold-hover transition-all shadow-gold">Empezar gratis</Link>
              <Link href="/#features" className="inline-flex items-center justify-center px-7 py-3.5 text-base bg-bg-card border border-border text-text-primary rounded-btn hover:border-border-light transition-all">Ver funciones</Link>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-20 animate-slide-up">
            <MetricCard label="Portafolio total" value="42.850" prefix="$" change={3.42} />
            <MetricCard label="Rendimiento hoy" value="1.247" prefix="+$" change={2.98} />
            <MetricCard label="Activos" value="12" suffix=" posiciones" />
            <MetricCard label="Beta" value="0.87" />
          </div>
        </section>
        <section id="features" className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="font-display text-3xl font-bold text-text-primary mb-4">Todo lo que necesitás para invertir mejor</h2>
            <p className="text-text-secondary max-w-xl mx-auto">Herramientas profesionales diseñadas para el inversor latinoamericano.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[{icon:'\ud83d\udcca',title:'Portfolio Tracker',desc:'Seguí tus posiciones en tiempo real. Acciones, ETFs, bonos y más.'},{icon:'\ud83e\udd16',title:'Lucas \u2014 Herramienta IA',desc:'Consultá cualquier dato financiero. Lucas analiza tu portafolio y responde tus preguntas.'},{icon:'\ud83d\udcc8',title:'Análisis técnico',desc:'Gráficos interactivos, indicadores y señales para tomar mejores decisiones.'}].map((f)=>(
              <Card key={f.title} className="text-center"><div className="text-4xl mb-4">{f.icon}</div><h3 className="font-display text-lg font-semibold text-text-primary mb-2">{f.title}</h3><p className="text-text-secondary text-sm leading-relaxed">{f.desc}</p></Card>
            ))}
          </div>
        </section>
        <section className="py-20 px-4">
          <div className="max-w-2xl mx-auto text-center bg-bg-card border border-border rounded-2xl p-12">
            <h2 className="font-display text-3xl font-bold text-text-primary mb-4">Empezá a invertir mejor hoy</h2>
            <p className="text-text-secondary mb-8">Gratis para siempre. Sin tarjeta de crédito.</p>
            <Link href="/register" className="inline-flex items-center justify-center px-7 py-3.5 text-base font-semibold bg-accent-gold text-bg-base rounded-btn hover:bg-accent-gold-hover transition-all shadow-gold">Crear cuenta gratis</Link>
          </div>
        </section>
      </main>
      <footer className="border-t border-border py-8 px-4 text-center text-text-muted text-sm">
        <p>© 2024 TuPortafolioIA. Todos los derechos reservados.</p>
        <p className="mt-1">Lucas es una herramienta de análisis financiero, no un asesor de inversiones.</p>
      </footer>
    </>
  )
}