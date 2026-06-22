import { useEffect, useRef } from 'react';
import { createChart, ColorType } from 'lightweight-charts';
import type { IChartApi, ISeriesApi, UTCTimestamp } from 'lightweight-charts';
import type { Kline } from '../../types/market';

interface TradingChartProps {
  klines: Kline[];
  ema9?: number[];
  ema21?: number[];
}

export default function TradingChart({ klines, ema9, ema21 }: TradingChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const candleSeriesRef = useRef<ISeriesApi<'Candlestick'> | null>(null);
  const volumeSeriesRef = useRef<ISeriesApi<'Histogram'> | null>(null);
  const ema9SeriesRef = useRef<ISeriesApi<'Line'> | null>(null);
  const ema21SeriesRef = useRef<ISeriesApi<'Line'> | null>(null);

  // إنشاء الشارت مرة واحدة فقط عند التحميل
  useEffect(() => {
    if (!containerRef.current) return;

    const chart = createChart(containerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: '#11151f' },
        textColor: '#7c8aa0',
        fontFamily: '"IBM Plex Mono", monospace',
      },
      grid: {
        vertLines: { color: '#171d29' },
        horzLines: { color: '#171d29' },
      },
      width: containerRef.current.clientWidth,
      height: 460,
      timeScale: { timeVisible: true, secondsVisible: false, borderColor: '#1f2735' },
      rightPriceScale: { borderColor: '#1f2735' },
      crosshair: { mode: 0 },
    });
    chartRef.current = chart;

    const candleSeries = chart.addCandlestickSeries({
      upColor: '#22c55e',
      downColor: '#ef4444',
      borderUpColor: '#22c55e',
      borderDownColor: '#ef4444',
      wickUpColor: '#22c55e',
      wickDownColor: '#ef4444',
    });
    candleSeriesRef.current = candleSeries;

    const volumeSeries = chart.addHistogramSeries({
      priceFormat: { type: 'volume' },
      priceScaleId: 'volume',
    });
    chart.priceScale('volume').applyOptions({ scaleMargins: { top: 0.82, bottom: 0 } });
    volumeSeriesRef.current = volumeSeries;

    const ema9Series = chart.addLineSeries({ color: '#f0b429', lineWidth: 1, priceLineVisible: false });
    ema9SeriesRef.current = ema9Series;

    const ema21Series = chart.addLineSeries({ color: '#38bdf8', lineWidth: 1, priceLineVisible: false });
    ema21SeriesRef.current = ema21Series;

    const handleResize = () => {
      if (containerRef.current) {
        chart.applyOptions({ width: containerRef.current.clientWidth });
      }
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      chart.remove();
      chartRef.current = null;
    };
  }, []);

  // تحديث بيانات الشموع والحجم عند تغيّرها
  useEffect(() => {
    if (!candleSeriesRef.current || !volumeSeriesRef.current || klines.length === 0) return;

    const candleData = klines.map((k) => ({
      time: (k.openTime / 1000) as UTCTimestamp,
      open: k.open,
      high: k.high,
      low: k.low,
      close: k.close,
    }));
    candleSeriesRef.current.setData(candleData);

    const volumeData = klines.map((k) => ({
      time: (k.openTime / 1000) as UTCTimestamp,
      value: k.volume,
      color: k.close >= k.open ? 'rgba(34,197,94,0.5)' : 'rgba(239,68,68,0.5)',
    }));
    volumeSeriesRef.current.setData(volumeData);

    chartRef.current?.timeScale().fitContent();
  }, [klines]);

  // تحديث خطوط EMA عند تغيّرها
  useEffect(() => {
    if (!ema9SeriesRef.current || !ema21SeriesRef.current || klines.length === 0) return;

    if (ema9) {
      const data = klines
        .map((k, i) => ({ time: (k.openTime / 1000) as UTCTimestamp, value: ema9[i] }))
        .filter((d) => !isNaN(d.value));
      ema9SeriesRef.current.setData(data);
    }

    if (ema21) {
      const data = klines
        .map((k, i) => ({ time: (k.openTime / 1000) as UTCTimestamp, value: ema21[i] }))
        .filter((d) => !isNaN(d.value));
      ema21SeriesRef.current.setData(data);
    }
  }, [klines, ema9, ema21]);

  return <div ref={containerRef} className="w-full" />;
}
