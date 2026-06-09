import { ButtonHTMLAttributes, forwardRef } from 'react'
import { cn } from '@/lib/utils'
interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> { variant?:'primary'|'secondary'|'ghost'|'gold'; size?:'sm'|'md'|'lg'; loading?:boolean }
const Button = forwardRef<HTMLButtonElement, ButtonProps>(({ className, variant='primary', size='md', loading, children, disabled, ...props }, ref) => {
  const base = 'inline-flex items-center justify-center font-medium rounded-btn transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-bg-base disabled:opacity-50 disabled:cursor-not-allowed'
  const variants = { primary:'bg-accent-blue text-bg-base hover:bg-accent-blue-hover focus:ring-accent-blue', secondary:'bg-bg-card border border-border text-text-primary hover:border-border-light', ghost:'text-text-secondary hover:text-text-primary hover:bg-bg-card', gold:'bg-accent-gold text-bg-base hover:bg-accent-gold-hover font-semibold' }
  const sizes = { sm:'px-3 py-1.5 text-sm', md:'px-5 py-2.5 text-sm', lg:'px-7 py-3.5 text-base' }
  return <button ref={ref} disabled={disabled||loading} className={cn(base,variants[variant],sizes[size],className)} {...props}>{loading&&<svg className="animate-spin h-4 w-4 mr-2" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>}{children}</button>
})
Button.displayName = 'Button'
export default Button