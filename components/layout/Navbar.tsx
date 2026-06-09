'use client'
import Link from 'next/link'
import { useState } from 'react'
export default function Navbar() {
  const [open, setOpen] = useState(false)
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border bg-bg-base/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-brand flex items-center justify-center"><span className="text-bg-base font-bold text-sm" style={{fontFamily:'Syne,sans-serif'}}>T</span></div>
            <span className="font-display font-semibold text-text-primary">TuPortafolioIA</span>
          </Link>
          <div className="hidden md:flex items-center gap-6">
            <Link href="/#features" className="text-sm text-text-secondary hover:text-text-primary transition-colors">Funciones</Link>
          </div>
          <div className="hidden md:flex items-center gap-3">
            <Link href="/login" className="text-sm text-text-secondary hover:text-text-primary px-3 py-2">Iniciar sesi\u00f3n</Link>
            <Link href="/register" className="text-sm bg-accent-gold text-bg-base font-semibold px-4 py-2 rounded-btn hover:bg-accent-gold-hover transition-colors">Empezar gratis</Link>
          </div>
          <button onClick={() => setOpen(!open)} className="md:hidden text-text-secondary">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {open?<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/>:<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16"/>}
            </svg>
          </button>
        </div>
      </div>
      {open&&<div className="md:hidden border-t border-border bg-bg-card px-4 py-4 space-y-3">
        <Link href="/#features" className="block text-text-secondary text-sm">Funciones</Link>
        <Link href="/login" className="block text-text-secondary text-sm">Iniciar sesi\u00f3n</Link>
        <Link href="/register" className="block text-center text-sm bg-accent-gold text-bg-base font-semibold px-4 py-2 rounded-btn">Empezar gratis</Link>
      </div>}
    </nav>
  )
}