// هوك يراقب نتيجة التحليل الفني لرمز معيّن، ويصدر تنبيهات عند:
// 1) تغيّر الإشارة إلى Buy أو Sell
// 2) اقتراب السعر من الدعم أو المقاومة (مع تثبيط التكرار Debounce)
import { useEffect, useRef } from 'react';
import type { AnalysisResult } from '../types/analysis';
import { useAlerts } from '../context/AlertsContext';

const SR_PROXIMITY_PCT = 0.3; // نسبة الاقتراب من الدعم/المقاومة لإصدار تنبيه
const SR_ALERT_COOLDOWN_MS = 2 * 60 * 1000; // فترة تثبيط بين تنبيهات الدعم/المقاومة لنفس الرمز

interface SymbolAlertState {
  lastSignal: AnalysisResult['signal'] | null;
  lastSupportAlertAt: number;
  lastResistanceAlertAt: number;
}

export function useSignalAlerts(symbol: string, analysis: AnalysisResult | null, currentPrice: number | null): void {
  const { pushAlert } = useAlerts();
  const stateRef = useRef<Map<string, SymbolAlertState>>(new Map());

  useEffect(() => {
    if (!analysis || currentPrice === null) return;

    const map = stateRef.current;
    const prevState: SymbolAlertState = map.get(symbol) ?? {
      lastSignal: null,
      lastSupportAlertAt: 0,
      lastResistanceAlertAt: 0,
    };

    // 1) تنبيه عند تغيّر الإشارة إلى شراء أو بيع
    if (analysis.signal !== prevState.lastSignal && (analysis.signal === 'buy' || analysis.signal === 'sell')) {
      pushAlert({
        type: analysis.signal === 'buy' ? 'buy_signal' : 'sell_signal',
        symbol,
        price: currentPrice,
        message:
          analysis.signal === 'buy'
            ? `إشارة شراء على ${symbol} — ثقة ${analysis.confidence}%`
            : `إشارة بيع على ${symbol} — ثقة ${analysis.confidence}%`,
      });
    }
    prevState.lastSignal = analysis.signal;

    // 2) تنبيه الاقتراب من الدعم/المقاومة
    const sr = analysis.supportResistance;
    const now = Date.now();
    if (sr) {
      if (sr.supportDistancePct <= SR_PROXIMITY_PCT && now - prevState.lastSupportAlertAt > SR_ALERT_COOLDOWN_MS) {
        pushAlert({
          type: 'support_touch',
          symbol,
          price: currentPrice,
          message: `${symbol} اقترب من منطقة الدعم عند ${sr.support.toFixed(4)}`,
        });
        prevState.lastSupportAlertAt = now;
      }
      if (
        sr.resistanceDistancePct <= SR_PROXIMITY_PCT &&
        now - prevState.lastResistanceAlertAt > SR_ALERT_COOLDOWN_MS
      ) {
        pushAlert({
          type: 'resistance_touch',
          symbol,
          price: currentPrice,
          message: `${symbol} اقترب من منطقة المقاومة عند ${sr.resistance.toFixed(4)}`,
        });
        prevState.lastResistanceAlertAt = now;
      }
    }

    map.set(symbol, prevState);
  }, [symbol, analysis, currentPrice, pushAlert]);
}
