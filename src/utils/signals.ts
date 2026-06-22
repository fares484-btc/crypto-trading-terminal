// محرك الإشارات القائم على القواعد (Rule-Based) — بدون أي ذكاء اصطناعي توليدي
// يحوّل قيم المؤشرات إلى قرار: اتجاه + إشارة + درجة ثقة + أسباب واضحة

import type { Kline, SupportResistance } from '../types/market';
import type { AnalysisResult, IndicatorSnapshot, Trend, SignalType } from '../types/analysis';
import { calculateEMA, calculateMACD, calculateRSI, calculateSMA, findSupportResistance, lastValid } from './indicators';

const VOLUME_SPIKE_MULTIPLIER = 1.5;
const BUY_SELL_THRESHOLD = 50; // الحد الأدنى لدرجة الثقة لإصدار إشارة شراء/بيع بدلاً من "انتظار"

export function analyzeKlines(klines: Kline[]): AnalysisResult | null {
  if (klines.length < 30) return null; // بيانات غير كافية لتحليل موثوق

  const closes = klines.map((k) => k.close);
  const volumes = klines.map((k) => k.volume);

  const ema9Series = calculateEMA(closes, 9);
  const ema21Series = calculateEMA(closes, 21);
  const rsiSeries = calculateRSI(closes, 14);
  const macdResult = calculateMACD(closes, 12, 26, 9);
  const avgVolumeSeries = calculateSMA(volumes, 20);

  const ema9 = lastValid(ema9Series);
  const ema21 = lastValid(ema21Series);
  const rsi = lastValid(rsiSeries);
  const macdLine = lastValid(macdResult.macdLine);
  const macdSignal = lastValid(macdResult.signalLine);
  const macdHistogram = lastValid(macdResult.histogram);
  const currentVolume = volumes[volumes.length - 1] ?? null;
  const avgVolume = lastValid(avgVolumeSeries);

  const indicators: IndicatorSnapshot = {
    ema9,
    ema21,
    rsi,
    macdLine,
    macdSignal,
    macdHistogram,
    volume: currentVolume,
    avgVolume,
  };

  const supportResistance: SupportResistance | null = findSupportResistance(klines, 50);

  const reasons: string[] = [];
  let buyScore = 0;
  let sellScore = 0;

  // 1) اتجاه EMA 9/21
  let trend: Trend = 'sideways';
  if (ema9 !== null && ema21 !== null) {
    if (ema9 > ema21) {
      trend = 'up';
      buyScore += 30;
      reasons.push('تقاطع EMA9 فوق EMA21 — اتجاه صاعد');
    } else if (ema9 < ema21) {
      trend = 'down';
      sellScore += 30;
      reasons.push('تقاطع EMA9 أسفل EMA21 — اتجاه هابط');
    }
  }

  // 2) RSI
  if (rsi !== null) {
    if (rsi > 70) {
      sellScore += 20;
      reasons.push(`RSI عند ${rsi.toFixed(0)} — تشبع شراء`);
    } else if (rsi < 30) {
      buyScore += 20;
      reasons.push(`RSI عند ${rsi.toFixed(0)} — تشبع بيع`);
    } else if (rsi >= 45 && rsi <= 60) {
      reasons.push(`RSI عند ${rsi.toFixed(0)} — منطقة صحية`);
    }
  }

  // 3) تأكيد MACD
  if (macdLine !== null && macdSignal !== null && macdHistogram !== null) {
    if (macdLine > macdSignal && macdHistogram > 0) {
      buyScore += 25;
      reasons.push('MACD إيجابي ويؤكد الزخم الصاعد');
    } else if (macdLine < macdSignal && macdHistogram < 0) {
      sellScore += 25;
      reasons.push('MACD سلبي ويؤكد الزخم الهابط');
    }
  }

  // 4) ارتفاع حجم التداول (Volume Spike) — يدعم الاتجاه الأقوى حالياً
  if (currentVolume !== null && avgVolume !== null && avgVolume > 0) {
    if (currentVolume > avgVolume * VOLUME_SPIKE_MULTIPLIER) {
      if (buyScore > sellScore) {
        buyScore += 15;
        reasons.push('ارتفاع ملحوظ في حجم التداول يدعم الاتجاه الصاعد');
      } else if (sellScore > buyScore) {
        sellScore += 15;
        reasons.push('ارتفاع ملحوظ في حجم التداول يدعم الاتجاه الهابط');
      } else {
        reasons.push('ارتفاع ملحوظ في حجم التداول — تستحق المتابعة');
      }
    }
  }

  buyScore = Math.min(buyScore, 100);
  sellScore = Math.min(sellScore, 100);

  let signal: SignalType = 'wait';
  let confidence = Math.max(buyScore, sellScore);

  if (buyScore >= BUY_SELL_THRESHOLD && buyScore > sellScore) {
    signal = 'buy';
    confidence = buyScore;
  } else if (sellScore >= BUY_SELL_THRESHOLD && sellScore > buyScore) {
    signal = 'sell';
    confidence = sellScore;
  } else {
    signal = 'wait';
    if (reasons.length === 0) reasons.push('لا توجد إشارات كافية حالياً — السوق في حالة عرضية');
  }

  return {
    trend,
    signal,
    confidence,
    reasons,
    indicators,
    supportResistance,
  };
}

/** سلسلة EMA9 لرسمها فوق الشارت */
export function getEma9Series(klines: Kline[]): number[] {
  return calculateEMA(klines.map((k) => k.close), 9);
}

/** سلسلة EMA21 لرسمها فوق الشارت */
export function getEma21Series(klines: Kline[]): number[] {
  return calculateEMA(klines.map((k) => k.close), 21);
}
