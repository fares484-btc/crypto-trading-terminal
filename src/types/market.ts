// أنواع بيانات السوق اللحظي (Binance)

export type Timeframe = '1m' | '5m' | '15m' | '1h';

export const TIMEFRAMES: { value: Timeframe; label: string }[] = [
  { value: '1m', label: '1د' },
  { value: '5m', label: '5د' },
  { value: '15m', label: '15د' },
  { value: '1h', label: '1س' },
];

// شمعة سعرية واحدة (Candlestick)
export interface Kline {
  openTime: number; // ms epoch
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  closeTime: number;
  isClosed: boolean;
}

// تحديث سعري لحظي مبسّط (miniTicker)
export interface MiniTicker {
  symbol: string;
  lastPrice: number;
  openPrice: number;
  highPrice: number;
  lowPrice: number;
  volume: number;
  changePercent: number;
  updatedAt: number;
}

export interface SupportResistance {
  support: number;
  resistance: number;
  supportDistancePct: number;
  resistanceDistancePct: number;
}
