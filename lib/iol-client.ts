// lib/iol-client.ts
// IOL (InvertirOnline) OAuth2 client — ported from iol_client.py
// Credentials via env: IOL_USERNAME, IOL_PASSWORD

const IOL_BASE = 'https://api.invertironline.com';

interface IolToken {
  access_token: string;
  refresh_token: string;
  expires_at: number; // unix ms
}

interface IolCotizacion {
  simbolo: string;
  ultimoPrecio?: number;
  ultimoCierre?: number;
  apertura?: number;
  puntas?: Array<{ precioVenta?: number; precioCompra?: number }>;
  variacionDiaria?: number;
  cantidadOperaciones?: number;
  volumeNominal?: number;
}

// ─── Singleton token store (module-level, lives for process lifetime) ──────────

let _token: IolToken | null = null;

async function getToken(): Promise<string> {
  const now = Date.now();

  // Refresh 60s before expiry
  if (_token && now < _token.expires_at - 60_000) {
    return _token.access_token;
  }

  // Try refresh flow first if we have a refresh token
  if (_token?.refresh_token) {
    try {
      const refreshed = await refreshToken(_token.refresh_token);
      if (refreshed) {
        _token = refreshed;
        return _token.access_token;
      }
    } catch { /* fall through to full auth */ }
  }

  // Full password grant
  _token = await authenticate();
  return _token.access_token;
}

async function authenticate(): Promise<IolToken> {
  const username = process.env.IOL_USERNAME;
  const password = process.env.IOL_PASSWORD;

  if (!username || !password) {
    throw new Error('IOL_USERNAME / IOL_PASSWORD env vars not set');
  }

  const body = new URLSearchParams({
    username,
    password,
    grant_type: 'password',
  });

  const res = await fetch(`${IOL_BASE}/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: body.toString(),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`IOL auth failed ${res.status}: ${text}`);
  }

  const data = await res.json() as {
    access_token: string;
    refresh_token: string;
    expires_in?: number; // seconds
    '.expires'?: string; // ISO string
  };

  // expires_in is typically 900 (15 min)
  const expiresMs = data.expires_in
    ? Date.now() + data.expires_in * 1000
    : data['.expires']
    ? new Date(data['.expires']).getTime()
    : Date.now() + 900_000;

  return {
    access_token:  data.access_token,
    refresh_token: data.refresh_token,
    expires_at:    expiresMs,
  };
}

async function refreshToken(refreshTok: string): Promise<IolToken | null> {
  const body = new URLSearchParams({
    refresh_token: refreshTok,
    grant_type: 'refresh_token',
  });

  const res = await fetch(`${IOL_BASE}/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: body.toString(),
  });

  if (!res.ok) return null;

  const data = await res.json() as {
    access_token: string;
    refresh_token: string;
    expires_in?: number;
  };

  return {
    access_token:  data.access_token,
    refresh_token: data.refresh_token,
    expires_at:    Date.now() + (data.expires_in ?? 900) * 1000,
  };
}

// ─── Instrument type → IOL panel mapping ──────────────────────────────────────

type IolInstrumento = 'acciones' | 'cedears' | 'bonos' | 'obligacionesNegociables' | 'letras' | 'fondos';

function tipoToIolInstrumento(tipo: string): IolInstrumento {
  const map: Record<string, IolInstrumento> = {
    accion_arg: 'acciones',
    cedear:     'cedears',
    etf:        'cedears',
    bono:       'bonos',
    on:         'obligacionesNegociables',
    letra:      'letras',
    fci:        'fondos',
  };
  return map[tipo] ?? 'acciones';
}

// ─── Extract best price from cotizacion ───────────────────────────────────────

function extractPrice(cotiz: IolCotizacion): number {
  return (
    cotiz.ultimoPrecio ??
    cotiz.ultimoCierre ??
    cotiz.puntas?.[0]?.precioVenta ??
    cotiz.apertura ??
    0
  );
}

// ─── Public: get price for a single ticker via IOL ────────────────────────────

export async function getIolPrice(
  ticker: string,
  tipo: string
): Promise<{ precio: number; variacion: number } | null> {
  if (!process.env.IOL_USERNAME) return null; // skip if not configured

  try {
    const token = await getToken();
    const instrumento = tipoToIolInstrumento(tipo);
    const url = `${IOL_BASE}/api/v2/Cotizaciones/${instrumento}/Panel/argentina`;

    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!res.ok) return null;

    const data = await res.json() as { titulos?: IolCotizacion[] };
    const item = data.titulos?.find(
      t => t.simbolo?.toUpperCase() === ticker.toUpperCase()
    );

    if (!item) return null;

    return {
      precio:    extractPrice(item),
      variacion: item.variacionDiaria ?? 0,
    };
  } catch (err) {
    console.error('[iol-client] Error:', err);
    return null;
  }
}

// ─── Public: get full panel (all tickers) for an instrument type ───────────────

export async function getIolPanel(
  tipo: string
): Promise<Record<string, { precio: number; variacion: number }>> {
  if (!process.env.IOL_USERNAME) return {};

  try {
    const token = await getToken();
    const instrumento = tipoToIolInstrumento(tipo);
    const url = `${IOL_BASE}/api/v2/Cotizaciones/${instrumento}/Panel/argentina`;

    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!res.ok) return {};

    const data = await res.json() as { titulos?: IolCotizacion[] };
    const result: Record<string, { precio: number; variacion: number }> = {};

    for (const item of data.titulos ?? []) {
      if (item.simbolo) {
        result[item.simbolo.toUpperCase()] = {
          precio:    extractPrice(item),
          variacion: item.variacionDiaria ?? 0,
        };
      }
    }

    return result;
  } catch {
    return {};
  }
}
