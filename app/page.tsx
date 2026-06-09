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
            <Badge variant="blue" className="mb-6">Herramienta de inversi\u00f3n inteligente</Badge>
            <h1 className="font-display text-5xl sm:text-6xl font-bold text-text-primary mb-6 leading-tight">Invert\u00ed con{' '}<span className="gradient-text">inteligencia</span></h1>
            <p className="text-xl text-text-secondary mb-10 leading-relaxed">Analiz\u00e1 tu portafolio, explor\u00e1 activos y tom\u00e1 decisiones financieras informadas con Lucas, tu herramienta de an\u00e1lisis financiero.</p>
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
            <h2 className="font-display text-3xl font-bold text-text-primary mb-4">Todo lo que necesit\u00e1s para invertir mejor</h2>
            <p className="text-text-secondary max-w-xl mx-auto">Herramientas profesionales dise\u00f1adas para el inversor latinoamericano.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[{icon:'\ud83d\udcca',title:'Portfolio Tracker',desc:'Segu\u00ed tus posiciones en tiempo real. Acciones, ETFs, bonos y m\u00e1s.'},{icon:'\ud83e\udd16',title:'Lucas \u2014 Herramienta IA',desc:'Consult\u00e1 cualquier dato financiero. Lucas analiza tu portafolio y responde tus preguntas.'},{icon:'\ud83d\udcc8',title:'An\u00e1lisis t\u00e9cnico',desc:'Gr\u00e1ficos interactivos, indicadores y se\u00f1ales para tomar mejores decisiones.'}].map((f)=>(
              <Card key={f.title} className="text-center"><div className="text-4xl mb-4">{f.icon}</div><h3 className="font-display text-lg font-semibold text-text-primary mb-2">{f.title}</h3><p className="text-text-secondary text-sm leading-relaxed">{f.desc}</p></Card>
            ))}
          </div>
        </section>
        <section className="py-20 px-4">
          <div className="max-w-2xl mx-auto text-center bg-bg-card border border-border rounded-2xl p-12">
            <h2 className="font-display text-3xl font-bold text-text-primary mb-4">Empez\u00e1 a invertir mejor hoy</h2>
            <p className="text-text-secondary mb-8">Gratis para siempre. Sin tarjeta de cr\u00e9dito.</p>
            <Link href="/register" className="inline-flex items-center justify-center px-7 py-3.5 text-base font-semibold bg-accent-gold text-bg-base rounded-btn hover:bg-accent-gold-hover transition-all shadow-gold">Crear cuenta gratis</Link>
          </div>
        </section>
      </main>
      <footer className="border-t border-border py-8 px-4 text-center text-text-muted text-sm">
        <p>\u00a9 2024 TuPortafolioIA. Todos los derechos reservados.</p>
        <p className="mt-1">Lucas es una herramienta de an\u00e1lisis financiero, no un asesor de inversiones.</p>
      </footer>
    </>
  )
}