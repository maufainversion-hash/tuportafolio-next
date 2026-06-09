export interface User {
  id: string
  email: string
  name?: string
  avatar_url?: string
  created_at: string
}
export interface InvestorProfile {
  user_id: string
  capital: 'menos_10k' | '10k_50k' | '50k_200k' | 'mas_200k'
  risk: 'conservador' | 'moderado' | 'agresivo'
  timeframe: 'corto' | 'mediano' | 'largo'
  goals: string[]
  completed: boolean
}
export interface Asset {
  id: string
  user_id: string
  ticker: string
  name: string
  quantity: number
  avg_price: number
  current_price: number
  asset_type: 'accion' | 'etf' | 'bono' | 'crypto' | 'cedear'
  currency: 'USD' | 'ARS'
}
export interface PortfolioMetrics {
  total_value: number
  total_cost: number
  total_pnl: number
  total_pnl_pct: number
  day_change: number
  day_change_pct: number
}
export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}
