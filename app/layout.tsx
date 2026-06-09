import type { Metadata } from 'next'
import { Syne, DM_Sans, Space_Grotesk } from 'next/font/google'
import './globals.css'
const syne = Syne({ subsets:['latin'], variable:'--font-syne', weight:['400','500','600','700','800'], display:'swap' })
const dmSans = DM_Sans({ subsets:['latin'], variable:'--font-dm-sans', weight:['300','400','500','600'], display:'swap' })
const spaceGrotesk = Space_Grotesk({ subsets:['latin'], variable:'--font-space-grotesk', weight:['300','400','500','600','700'], display:'swap' })
export const metadata: Metadata = { title: 'TuPortafolioIA \u2014 Invert\u00ed con inteligencia', description: 'Herramienta de inversi\u00f3n inteligente para el inversor latinoamericano.' }
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={`${syne.variable} ${dmSans.variable} ${spaceGrotesk.variable}`}>
      <body className="font-body bg-bg-base text-text-primary antialiased">{children}</body>
    </html>
  )
}