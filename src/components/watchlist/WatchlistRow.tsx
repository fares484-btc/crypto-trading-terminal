import { useEffect, useRef, useState } from 'react';
import type { MiniTicker } from '../../types/market';
import { formatPercent, formatPrice } from '../../utils/format';

interface WatchlistRowProps {
  symbol: string;
  ticker: MiniTicker | undefined;
  isSelected: boolean;
  onSelect: (symbol: string) => void;
  onRemove: (symbol: string) => void;
}

export default function WatchlistRow({ symbol, ticker, isSelected, onSelect, onRemove }: WatchlistRowProps) {
  const [flash, setFlash] = useState<'up' | 'down' | null>(null);
  const prevPriceRef = useRef<number | null>(null);

  useEffect(() => {
    if (!ticker) return;
    const prev = prevPriceRef.current;
    if (prev !== null && ticker.lastPrice !== prev) {
      setFlash(ticker.lastPrice > prev ? 'up' : 'down');
      const timer = window.setTimeout(() => setFlash(null), 900);
      prevPriceRef.current = ticker.lastPrice;
      return () => window.clearTimeout(timer);
    }
    prevPriceRef.current = ticker.lastPrice;
  }, [ticker]);

  const isPositive = (ticker?.changePercent ?? 0) >= 0;

  return (
    <div
      onClick={() => onSelect(symbol)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') onSelect(symbol);
      }}
      className={`group flex cursor-pointer items-center justify-between border-b border-border-soft px-3 py-2.5 transition-colors hover:bg-bg-hover focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent ${
        isSelected ? 'bg-bg-hover' : ''
      } ${flash === 'up' ? 'animate-flash-up' : flash === 'down' ? 'animate-flash-down' : ''}`}
    >
      <div className="flex items-center gap-2">
        {isSelected && <span className="h-1.5 w-1.5 rounded-full bg-accent" aria-hidden="true" />}
        <span className="text-sm font-medium text-ink">{symbol.replace('USDT', '')}</span>
        <span className="text-[10px] text-ink-faint">/USDT</span>
      </div>

      <div className="flex items-center gap-2">
        <div className="text-left">
          <div className="num text-sm text-ink">{ticker ? formatPrice(ticker.lastPrice) : '—'}</div>
          <div className={`num text-[11px] ${isPositive ? 'text-buy' : 'text-sell'}`}>
            {ticker ? formatPercent(ticker.changePercent) : '—'}
          </div>
        </div>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onRemove(symbol);
          }}
          className="invisible rounded px-1.5 py-0.5 text-xs text-ink-faint opacity-0 transition-opacity hover:text-sell group-hover:visible group-hover:opacity-100 focus-visible:visible focus-visible:opacity-100 focus-visible:outline focus-visible:outline-1 focus-visible:outline-accent"
          aria-label={`إزالة ${symbol} من قائمة المراقبة`}
        >
          ✕
        </button>
      </div>
    </div>
  );
}
