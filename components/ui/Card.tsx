import { HTMLAttributes } from 'react'
import { cn } from '@/lib/utils'
interface CardProps extends HTMLAttributes<HTMLDivElement> { hover?:boolean; padding?:'none'|'sm'|'md'|'lg' }
export default function Card({ className, hover=true, padding='md', children, ...props }: CardProps) {
  const p = { none:'', sm:'p-4', md:'p-6', lg:'p-8' }
  return <div className={cn('card',p[padding],hover&&'hover:shadow-card',className)} {...props}>{children}</div>
}