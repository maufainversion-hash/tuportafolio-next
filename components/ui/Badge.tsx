import { cn } from '@/lib/utils'
interface BadgeProps { children: React.ReactNode; variant?:'blue'|'gold'|'success'|'danger'|'default'; className?:string }
export default function Badge({ children, variant='default', className }: BadgeProps) {
  const v = { blue:'bg-accent-blue/10 text-accent-blue border-accent-blue/20', gold:'bg-accent-gold/10 text-accent-gold border-accent-gold/20', success:'bg-success/10 text-success border-success/20', danger:'bg-danger/10 text-danger border-danger/20', default:'bg-bg-card text-text-secondary border-border' }
  return <span className={cn('inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border',v[variant],className)}>{children}</span>
}