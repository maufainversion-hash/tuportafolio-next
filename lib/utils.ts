import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
export function cn(...inputs: ClassValue[]) { return twMerge(clsx(inputs)) }
export function formatCurrency(v: number, c='USD', l='es-AR') { return new Intl.NumberFormat(l,{style:'currency',currency:c,maximumFractionDigits:2}).format(v) }
export function formatPercent(v: number, d=2) { return `${v>=0?'+':''}${v.toFixed(d)}%` }
export function formatNumber(v: number, l='es-AR') { return new Intl.NumberFormat(l,{maximumFractionDigits:2}).format(v) }