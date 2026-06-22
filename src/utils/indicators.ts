// محرك حساب المؤشرات الفنية — حسابات رياضية بحتة بدون أي تبعيات خارجية
// كل دالة تُرجع مصفوفة بنفس طول المدخل، مع NaN في الأماكن التي لا تتوفر لها بيانات كافية بعد

import type { Kline, SupportResistance } from '../types/market';

/** المتوسط المتحرك الأسي (Exponential Moving Average) */
export function calculateEMA(values: number[], period: number): number[] {
  const result: number[] = new Array(values.length).fill(NaN);
  if (values.length < period) return result;

  const k = 2 / (period + 1);

  // البذرة الأولى = المتوسط البسيط لأول `period` قيمة
  let seed = 0;
  for (let i = 0; i < period; i++) seed += values[i];
  seed = seed / period;
  result[period - 1] = seed;

  let prevEma = seed;
  for (let i = period; i < values.length; i++) {
    const ema = values[i] * k + prevEma * (1 - k);
    result[i] = ema;
    prevEma = ema;
  }
  return result;
}

/** المتوسط المتحرك البسيط (Simple Moving Average) */
export function calculateSMA(values: number[], period: number): number[] {
  const result: number[] = new Array(values.length).fill(NaN);
  if (values.length < period) return result;

  let sum = 0;
  for (let i = 0; i < values.length; i++) {
    sum += values[i];
    if (i >= period) sum -= values[i - period];
    if (i >= period - 1) result[i] = sum / period;
  }
  return result;
}

/** مؤشر القوة النسبية بطريقة Wilder (RSI) */
export function calculateRSI(values: number[], period = 14): number[] {
  const result: number[] = new Array(values.length).fill(NaN);
  if (values.length <= period) return result;

  let gainSum = 0;
  let lossSum = 0;
  for (let i = 1; i <= period; i++) {
    const diff = values[i] - values[i - 1];
    if (diff >= 0) gainSum += diff;
    else lossSum -= diff;
  }

  let avgGain = gainSum / period;
  let avgLoss = lossSum / period;
  result[period] = avgLoss === 0 ? 100 : 100 - 100 / (1 + avgGain / avgLoss);

  for (let i = period + 1; i < values.length; i++) {
    const diff = values[i] - values[i - 1];
    const gain = diff > 0 ? diff : 0;
    const loss = diff < 0 ? -diff : 0;
    avgGain = (avgGain * (period - 1) + gain) / period;
    avgLoss = (avgLoss * (period - 1) + loss) / period;
    result[i] = avgLoss === 0 ? 100 : 100 - 100 / (1 + avgGain / avgLoss);
  }

  return result;
}

export interface MACDResult {
  macdLine: number[];
  signalLine: number[];
  histogram: number[];
}

/** مؤشر MACD (الافتراضي 12 / 26 / 9) */
export function calculateMACD(values: number[], fast = 12, slow = 26, signalPeriod = 9): MACDResult {
  const emaFast = calculateEMA(values, fast);
  const emaSlow = calculateEMA(values, slow);

  const macdLine: number[] = values.map((_, i) => {
    if (isNaN(emaFast[i]) || isNaN(emaSlow[i])) return NaN;
    return emaFast[i] - emaSlow[i];
  });

  // حساب خط الإشارة كمتوسط أسي للقيم الصالحة فقط من خط الـ MACD، ثم إعادة فردها لمحاذاة الطول الأصلي
  const validMacd: number[] = [];
  const validIndexes: number[] = [];
  macdLine.forEach((v, i) => {
    if (!isNaN(v)) {
      validMacd.push(v);
      validIndexes.push(i);
    }
  });

  const signalOnValid = calculateEMA(validMacd, signalPeriod);
  const signalLine: number[] = new Array(values.length).fill(NaN);
  validIndexes.forEach((originalIndex, i) => {
    signalLine[originalIndex] = signalOnValid[i];
  });

  const histogram: number[] = values.map((_, i) => {
    if (isNaN(macdLine[i]) || isNaN(signalLine[i])) return NaN;
    return macdLine[i] - signalLine[i];
  });

  return { macdLine, signalLine, histogram };
}

/**
 * دعم ومقاومة مبسّطة: تعتمد على أعلى قمة وأقل قاع خلال نافذة زمنية محددة (lookback)
 * هذه طريقة مبسّطة مناسبة لنسخة الـ MVP — يمكن تطويرها لاحقاً إلى مناطق سيولة وعرض/طلب حقيقية
 */
export function findSupportResistance(klines: Kline[], lookback = 50): SupportResistance | null {
  if (klines.length < 5) return null;

  const window = klines.slice(-lookback);
  const currentPrice = klines[klines.length - 1].close;

  const highsAbove = window.map((k) => k.high).filter((h) => h > currentPrice);
  const lowsBelow = window.map((k) => k.low).filter((l) => l < currentPrice);

  const allHighs = window.map((k) => k.high);
  const allLows = window.map((k) => k.low);

  const resistance = highsAbove.length > 0 ? Math.min(...highsAbove) : Math.max(...allHighs);
  const support = lowsBelow.length > 0 ? Math.max(...lowsBelow) : Math.min(...allLows);

  return {
    support,
    resistance,
    supportDistancePct: ((currentPrice - support) / currentPrice) * 100,
    resistanceDistancePct: ((resistance - currentPrice) / currentPrice) * 100,
  };
}

/** آخر قيمة صالحة (غير NaN) من مصفوفة مؤشر */
export function lastValid(values: number[]): number | null {
  for (let i = values.length - 1; i >= 0; i--) {
    if (!isNaN(values[i])) return values[i];
  }
  return null;
}
