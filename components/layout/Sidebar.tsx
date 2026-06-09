'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'

const NAV_LINKS = [
  { href: '/dashboard', label: 'Dashboard', icon: '📊' },
  { href: '/portfolio', label: 'Portafolio', icon: '💼' },
  { href: '/dashboard#lucas', label: 'Lucas', icon: '🤖' },
  { href: '/settings', label: 'Configuración', icon: '⚙️' },
]

export default function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="hidden md:flex w-64 shrink-0 flex-col border-r border-border bg-bg-sidebar">
      <Link href="/dashboard" className="flex items-center gap-2 px-6 h-16 border-b border-border">
        <div className="w-8 h-8 rounded-lg bg-gradient-brand flex items-center justify-center">
          <span className="text-bg-base font-bold text-sm font-display">T</span>
        </div>
        <span className="font-display font-semibold text-text-primary">TuPortafolioIA</span>
      </Link>

      <nav className="flex-1 px-3 py-4 space-y-1">
        {NAV_LINKS.map((link) => {
          const base = link.href.split('#')[0]
          const active = pathname === base
          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                'flex items-center gap-3 rounded-btn px-3 py-2.5 text-sm font-medium transition-colors border-l-2',
                active
                  ? 'bg-bg-card text-text-primary border-accent-blue'
                  : 'text-text-secondary border-transparent hover:text-text-primary hover:bg-bg-card'
              )}
            >
              <span className="text-base leading-none">{link.icon}</span>
              {link.label}
            </Link>
          )
        })}
      </nav>

      <div className="border-t border-border p-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-bg-card border border-border flex items-center justify-center text-sm">
            👤
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-text-primary truncate">Mi cuenta</p>
            <p className="text-xs text-text-secondary truncate">vos@email.com</p>
          </div>
        </div>
      </div>
    </aside>
  )
}
