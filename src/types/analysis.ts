// أنواع محرك التحليل الفني (Rule-Based)

import type { SupportResistance } from './market';

export type Trend = 'up' | 'down' | 'sideways';
export type SignalType = 'buy' | 'sell' | 'wait';

export interface IndicatorSnapshot {
  ema9: number | null;
  ema21: number | null;
  rsi: number | null;
  macdLine: number | null;
  macdSignal: number | null;
  macdHistogram: number | null;
  volume: number | null;
  avgVolume: number | null;
}

export interface AnalysisResult {
  trend: Trend;
  signal: SignalType;
  confidence: number; // 0-100
  reasons: string[];
  indicators: IndicatorSnapshot;
  supportResistance: SupportResistance | null;
}
