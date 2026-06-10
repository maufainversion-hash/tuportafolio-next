// lib/instruments.ts
// 135-instrument universe for TuPortafolioIA.

export type TipoActivo =
  | 'bono'
  | 'etf'
  | 'cedear'
  | 'accion_arg'
  | 'on'
  | 'fci'
  | 'letra'
  | 'mep';

export interface Instrumento {
  ticker: string;
  nombre: string;
  tipo: TipoActivo;
  color: string;
  yfTicker?: string;
  aliases?: string[];
}

export const CATEGORIA_LABELS: Record<TipoActivo, string> = {
  bono: 'Bonos soberanos USD',
  etf: 'ETFs',
  cedear: 'CEDEARs',
  accion_arg: 'Acciones argentinas',
  on: 'Obligaciones negociables',
  fci: 'Fondos comunes (FCI)',
  letra: 'Letras',
  mep: 'Dólar MEP',
};

// Friendly names for the tickers we know; the rest fall back to the ticker.
const NOMBRES: Record<string, string> = {
  AL30: 'Bonar 2030', AL35: 'Bonar 2035', AL41: 'Bonar 2041', AL29: 'Bonar 2029', AE38: 'Bonar 2038',
  GD30: 'Global 2030', GD35: 'Global 2035', GD38: 'Global 2038', GD41: 'Global 2041', GD29: 'Global 2029',
  SPY: 'S&P 500 ETF', VOO: 'Vanguard S&P 500', QQQ: 'Nasdaq 100 ETF', EEM: 'Emerging Markets ETF',
  EWZ: 'Brazil ETF', GLD: 'Oro (SPDR Gold)', IAU: 'Oro (iShares)', SLV: 'Plata (iShares)',
  XLE: 'Energía (Select Sector)', XLF: 'Financiero (Select Sector)', XLK: 'Tecnología (Select Sector)',
  ARKK: 'ARK Innovation', DIA: 'Dow Jones ETF', IWM: 'Russell 2000 ETF',
  AAPL: 'Apple', MSFT: 'Microsoft', GOOGL: 'Alphabet', AMZN: 'Amazon', META: 'Meta Platforms',
  TSLA: 'Tesla', NVDA: 'NVIDIA', NFLX: 'Netflix', AMD: 'AMD', INTC: 'Intel', CRM: 'Salesforce',
  ORCL: 'Oracle', ADBE: 'Adobe', CSCO: 'Cisco', QCOM: 'Qualcomm', IBM: 'IBM',
  DIS: 'Disney', KO: 'Coca-Cola', PEP: 'PepsiCo', MCD: "McDonald's", SBUX: 'Starbucks', NKE: 'Nike',
  WMT: 'Walmart', PG: 'Procter & Gamble', COST: 'Costco', HD: 'Home Depot', TGT: 'Target',
  ABNB: 'Airbnb', UBER: 'Uber', SPOT: 'Spotify',
  JPM: 'JPMorgan', BAC: 'Bank of America', C: 'Citigroup', WFC: 'Wells Fargo', GS: 'Goldman Sachs',
  MS: 'Morgan Stanley', V: 'Visa', MA: 'Mastercard', PYPL: 'PayPal', AXP: 'American Express',
  JNJ: 'Johnson & Johnson', PFE: 'Pfizer', MRNA: 'Moderna', UNH: 'UnitedHealth', ABT: 'Abbott', MRK: 'Merck',
  XOM: 'Exxon Mobil', CVX: 'Chevron', BA: 'Boeing', CAT: 'Caterpillar', GE: 'General Electric',
  F: 'Ford', GM: 'General Motors',
  MELI: 'MercadoLibre', BABA: 'Alibaba', PBR: 'Petrobras', VALE: 'Vale', ITUB: 'Itaú',
  GGAL: 'Grupo Galicia', BMA: 'Banco Macro', BBAR: 'BBVA Argentina', SUPV: 'Supervielle', BHIP: 'Banco Hipotecario',
  VALO: 'Grupo Valores', YPFD: 'YPF', PAMP: 'Pampa Energía', TGSU2: 'TGS', TGNO4: 'TGN',
  EDN: 'Edenor', CEPU: 'Central Puerto', TRAN: 'Transener', METR: 'MetroGAS', CAPX: 'Capex',
  TXAR: 'Ternium Argentina', ALUA: 'Aluar', LOMA: 'Loma Negra', MIRG: 'Mirgor', BYMA: 'BYMA',
  CRES: 'Cresud', IRSA: 'IRSA', AGRO: 'Agrometal', TECO2: 'Telecom Argentina', COME: 'Sociedad Comercial del Plata',
  MOLI: 'Molinos Río de la Plata',
  'FCI-MM-COCOS': 'Cocos Ahorro (MM)', 'FCI-MM-BALANZ': 'Balanz Money Market', 'FCI-MM-IOL': 'IOL Dólar Ahorro',
  'FCI-RF-COCOS': 'Cocos Renta Fija', 'FCI-RF-BALANZ': 'Balanz Renta Fija', 'FCI-MIXTO': 'FCI Mixto',
  MEP: 'Dólar MEP', AL30D: 'Dólar MEP (AL30)', GD30D: 'Dólar MEP (GD30)',
};

interface Group {
  tickers: string[];
  tipo: TipoActivo;
  color: string;
  yf?: boolean; // set yfTicker = ticker (US-listed underlying)
}

const GROUPS: Group[] = [
  // 10 bonos soberanos — AL* azul, GD*/AE* celeste
  { tickers: ['AL30', 'AL35', 'AL41', 'AL29'], tipo: 'bono', color: '#3b82f6' },
  { tickers: ['AE38'], tipo: 'bono', color: '#3b82f6' },
  { tickers: ['GD30', 'GD35', 'GD38', 'GD41', 'GD29'], tipo: 'bono', color: '#60a5fa' },
  // 14 ETFs
  { tickers: ['SPY', 'VOO', 'QQQ', 'EEM', 'EWZ', 'GLD', 'IAU', 'SLV', 'XLE', 'XLF', 'XLK', 'ARKK', 'DIA', 'IWM'], tipo: 'etf', color: '#8b5cf6', yf: true },
  // 16 CEDEARs Tech
  { tickers: ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'META', 'TSLA', 'NVDA', 'NFLX', 'AMD', 'INTC', 'CRM', 'ORCL', 'ADBE', 'CSCO', 'QCOM', 'IBM'], tipo: 'cedear', color: '#10b981', yf: true },
  // 14 CEDEARs Consumer
  { tickers: ['DIS', 'KO', 'PEP', 'MCD', 'SBUX', 'NKE', 'WMT', 'PG', 'COST', 'HD', 'TGT', 'ABNB', 'UBER', 'SPOT'], tipo: 'cedear', color: '#f59e0b', yf: true },
  // 10 CEDEARs Finance
  { tickers: ['JPM', 'BAC', 'C', 'WFC', 'GS', 'MS', 'V', 'MA', 'PYPL', 'AXP'], tipo: 'cedear', color: '#0ea5e9', yf: true },
  // 6 CEDEARs Health
  { tickers: ['JNJ', 'PFE', 'MRNA', 'UNH', 'ABT', 'MRK'], tipo: 'cedear', color: '#ef4444', yf: true },
  // 7 CEDEARs Energy / Industrial
  { tickers: ['XOM', 'CVX', 'BA', 'CAT', 'GE', 'F', 'GM'], tipo: 'cedear', color: '#d97706', yf: true },
  // 5 CEDEARs Latam
  { tickers: ['MELI', 'BABA', 'PBR', 'VALE', 'ITUB'], tipo: 'cedear', color: '#f97316', yf: true },
  // 26 Acciones ARG
  { tickers: ['GGAL', 'BMA', 'BBAR', 'SUPV', 'BHIP', 'VALO', 'YPFD', 'PAMP', 'TGSU2', 'TGNO4', 'EDN', 'CEPU', 'TRAN', 'METR', 'CAPX', 'TXAR', 'ALUA', 'LOMA', 'MIRG', 'BYMA', 'CRES', 'IRSA', 'AGRO', 'TECO2', 'COME', 'MOLI'], tipo: 'accion_arg', color: '#22c55e' },
  // 14 ONs
  { tickers: ['YMCXO', 'PN35O', 'TSC3O', 'VSCVO', 'TLCMO', 'PN36O', 'MGCQO', 'RC1CO', 'BACGO', 'IRCFO', 'CS48O', 'TTCDO', 'GN49O', 'TLCPO'], tipo: 'on', color: '#6366f1' },
  // 6 FCIs
  { tickers: ['FCI-MM-COCOS', 'FCI-MM-BALANZ', 'FCI-MM-IOL', 'FCI-RF-COCOS', 'FCI-RF-BALANZ', 'FCI-MIXTO'], tipo: 'fci', color: '#14b8a6' },
  // 4 Letras
  { tickers: ['S30Y6', 'S31L6', 'S29G6', 'T2X6'], tipo: 'letra', color: '#a3e635' },
  // 3 MEP
  { tickers: ['MEP', 'AL30D', 'GD30D'], tipo: 'mep', color: '#f0b429' },
];

export const INSTRUMENTOS: Instrumento[] = GROUPS.flatMap((g) =>
  g.tickers.map((ticker) => ({
    ticker,
    nombre: NOMBRES[ticker] ?? ticker,
    tipo: g.tipo,
    color: g.color,
    ...(g.yf ? { yfTicker: ticker } : {}),
  }))
);

const BY_TICKER: Record<string, Instrumento> = INSTRUMENTOS.reduce((acc, inst) => {
  acc[inst.ticker.toUpperCase()] = inst;
  return acc;
}, {} as Record<string, Instrumento>);

export function buscarInstrumento(ticker: string): Instrumento | null {
  if (!ticker) return null;
  const t = ticker.toUpperCase().trim();
  if (BY_TICKER[t]) return BY_TICKER[t];
  return (
    INSTRUMENTOS.find((i) => i.aliases?.some((a) => a.toUpperCase() === t)) ?? null
  );
}

export function buscarActivos(query: string): Instrumento[] {
  const q = (query ?? '').toLowerCase().trim();
  if (!q) return INSTRUMENTOS;
  return INSTRUMENTOS.filter(
    (i) =>
      i.ticker.toLowerCase().includes(q) ||
      i.nombre.toLowerCase().includes(q) ||
      (i.aliases?.some((a) => a.toLowerCase().includes(q)) ?? false)
  );
}

export function getByTipo(tipo: TipoActivo): Instrumento[] {
  return INSTRUMENTOS.filter((i) => i.tipo === tipo);
}
