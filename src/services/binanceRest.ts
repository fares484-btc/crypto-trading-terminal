// خدمة الاتصال بـ Binance REST API — جلب الشموع التاريخية والتحقق من صحة رمز العملة
// التوثيق الرسمي: https://binance-docs.github.io/apidocs/spot/en/

import type { Kline, Timeframe } from '../types/market';

const REST_BASE_URL = 'https://api.binance.com';

type RawKline = [
  number, // openTime
  string, // open
  string, // high
  string, // low
  string, // close
  string, // volume
  number, // closeTime
  string, // quoteAssetVolume
  number, // numberOfTrades
  string, // takerBuyBaseVolume
  string, // takerBuyQuoteVolume
  string // ignore
];

export class BinanceApiError extends Error {}

/** جلب الشموع التاريخية (Klines) لرمز وفريم زمني محددين */
export async function fetchKlines(symbol: string, interval: Timeframe, limit = 500): Promise<Kline[]> {
  const url = `${REST_BASE_URL}/api/v3/klines?symbol=${encodeURIComponent(symbol)}&interval=${interval}&limit=${limit}`;
  const response = await fetch(url);

  if (!response.ok) {
    throw new BinanceApiError(`تعذّر جلب بيانات الشموع لـ ${symbol} (HTTP ${response.status})`);
  }

  const raw = (await response.json()) as RawKline[];

  return raw.map((entry) => ({
    openTime: entry[0],
    open: parseFloat(entry[1]),
    high: parseFloat(entry[2]),
    low: parseFloat(entry[3]),
    close: parseFloat(entry[4]),
    volume: parseFloat(entry[5]),
    closeTime: entry[6],
    isClosed: true,
  }));
}

/** التحقق من وجود رمز العملة على منصة Binance قبل إضافته لقائمة المراقبة */
export async function validateSymbol(symbol: string): Promise<boolean> {
  try {
    const url = `${REST_BASE_URL}/api/v3/ticker/price?symbol=${encodeURIComponent(symbol)}`;
    const response = await fetch(url);
    return response.ok;
  } catch {
    return false;
  }
}
