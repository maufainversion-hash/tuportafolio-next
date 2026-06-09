import type { Config } from 'tailwindcss'
const config: Config = {
  content: ['./pages/**/*.{js,ts,jsx,tsx,mdx}','./components/**/*.{js,ts,jsx,tsx,mdx}','./app/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        bg: { base:'#050810', card:'#0f1623', 'card-hover':'#141d2e', sidebar:'#080d18' },
        accent: { blue:'#4fa3ff', 'blue-hover':'#6fb4ff', gold:'#f0b429', 'gold-hover':'#f5c842' },
        text: { primary:'#eef2ff', secondary:'#94a3b8', muted:'#475569' },
        border: { DEFAULT:'#1e2d42', light:'#243447' },
        success:'#22c55e', danger:'#ef4444', warning:'#f59e0b',
      },
      fontFamily: {
        display: ['var(--font-syne)','Syne','sans-serif'],
        body: ['var(--font-dm-sans)','DM Sans','sans-serif'],
        num: ['var(--font-space-grotesk)','Space Grotesk','sans-serif'],
      },
      backgroundImage: { 'gradient-brand': 'linear-gradient(135deg, #4fa3ff 0%, #f0b429 100%)' },
      borderRadius: { card:'12px', btn:'8px' },
      boxShadow: {
        card: '0 4px 24px rgba(79,163,255,0.06)',
        'card-hover': '0 8px 40px rgba(79,163,255,0.12)',
        blue: '0 0 20px rgba(79,163,255,0.3)',
        gold: '0 0 20px rgba(240,180,41,0.3)',
      },
      keyframes: {
        fadeIn: { '0%': { opacity: '0' }, '100%': { opacity: '1' } },
        slideUp: { '0%': { opacity:'0', transform:'translateY(16px)' }, '100%': { opacity:'1', transform:'translateY(0)' } },
      },
      animation: { 'fade-in':'fadeIn 0.3s ease-out', 'slide-up':'slideUp 0.4s ease-out' },
    },
  },
  plugins: [],
}
export default config