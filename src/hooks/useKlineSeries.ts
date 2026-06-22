// هوك يجلب الشموع التاريخية لرمز/فريم معيّن ثم يبقيها محدّثة لحظياً عبر WebSocket
import { useEffect, useRef, useState } from 'react';
import type { Kline, Timeframe } from '../types/market';
import { fetchKlines } from '../services/binanceRest';
import { KlineSocket } from '../services/binanceSocket';

const MAX_CANDLES = 1000;

interface UseKlineSeriesResult {
  klines: Kline[];
  loading: boolean;
  error: string | null;
}

export function useKlineSeries(symbol: string, interval: Timeframe): UseKlineSeriesResult {
  const [klines, setKlines] = useState<Kline[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const socketRef = useRef<KlineSocket | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    setKlines([]);

    fetchKlines(symbol, interval, 500)
      .then((data) => {
        if (cancelled) return;
        setKlines(data);
        setLoading(false);
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        const message = err instanceof Error ? err.message : 'تعذّر جلب بيانات الشموع';
        setError(message);
        setLoading(false);
      });

    const socket = new KlineSocket();
    socketRef.current = socket;
    socket.connect(symbol, interval, (candle) => {
      setKlines((prev) => {
        if (prev.length === 0) return prev;
        const last = prev[prev.length - 1];

        if (candle.openTime === last.openTime) {
          const next = prev.slice();
          next[next.length - 1] = candle;
          return next;
        }

        if (candle.openTime > last.openTime) {
          const next = [...prev, candle];
          return next.length > MAX_CANDLES ? next.slice(next.length - MAX_CANDLES) : next;
        }

        return prev;
      });
    });

    return () => {
      cancelled = true;
      socket.disconnect();
    };
  }, [symbol, interval]);

  return { klines, loading, error };
}
