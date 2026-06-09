import Card from './Card'
import { cn } from '@/lib/utils'
interface MetricCardProps { label:string; value:string|number; change?:number; prefix?:string; suffix?:string; className?:string }
export default function MetricCard({ label, value, change, prefix, suffix, className }: MetricCardProps) {
  const pos = change !== undefined && change >= 0
  return (
    <Card className={className}>
      <p className="text-xs font-medium text-text-muted uppercase tracking-wider mb-2">{label}</p>
      <p className="font-num text-2xl font-semibold text-text-primary">
        {prefix&&<span className="text-text-secondary text-base mr-0.5">{prefix}</span>}{value}{suffix&&<span className="text-text-secondary text-sm ml-0.5">{suffix}</span>}
      </p>
      {change!==undefined&&<p className={cn('text-sm font-num font-medium mt-1',pos?'text-success':'text-danger')}>{pos?'+':''}{change.toFixed(2)}%</p>}
    </Card>
  )
}