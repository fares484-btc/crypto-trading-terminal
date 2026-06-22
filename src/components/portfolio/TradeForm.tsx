import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { useMarketData } from '../../context/MarketDataContext';
import { usePortfolio } from '../../context/PortfolioContext';
import { derivePositions, calculateCashBalance } from '../../utils/portfolio';
import { formatPrice, formatUsd } from '../../utils/format';
import type { TradeSide, TradeSource } from '../../types/trading';
import Card from '../common/Card';

export interface TradeIntent {
  symbol: string;
  side: TradeSide;
}

interface TradeFormProps {
  prefill?: TradeIntent | null;
  onPrefillConsumed?: () => void;
}

type AmountMode = 'quantity' | 'usd';

export default function TradeForm({ prefill, onPrefillConsumed }: TradeFormProps) {
  const { watchlist, tickers } = useMarketData();
  const { initialBalance, trades, addTrade } = usePortfolio();

  const [symbol, setSymbol] = useState<string>(prefill?.symbol ?? watchlist[0] ?? 'BTCUSDT');
  const [side, setSide] = useState<TradeSide>(prefill?.side ?? 'buy');
  const [amountMode, setAmountMode] = useState<AmountMode>('usd');
  const [amountValue, setAmountValue] = useState('');
  const [source, setSource] = useState<TradeSource>('manual');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (!prefill) return;
    setSymbol(prefill.symbol);
    setSide(prefill.side);
    setSource('signal');
    setError(null);
    onPrefillConsumed?.();
  }, [prefill, onPrefillConsumed]);

  const currentPrice = tickers[symbol]?.lastPrice ?? null;
  const cashBalance = calculateCashBalance(initialBalance, trades);
  const positions = derivePositions(trades);
  const currentPosition = positions.find((p) => p.symbol === symbol);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!currentPrice) {
      setError('السعر اللحظي غير متوفر بعد لهذه العملة');
      return;
    }

    const amount = parseFloat(amountValue);
    if (!amount || amount <= 0) {
      setError('الرجاء إدخال قيمة صحيحة أكبر من صفر');
      return;
    }

    const quantity = amountMode === 'quantity' ? amount : amount / currentPrice;
    const value = quantity * currentPrice;

    if (side === 'buy' && value > cashBalance) {
      setError(`الرصيد النقدي غير كافٍ (المتاح: ${formatUsd(cashBalance)})`);
      return;
    }

    if (side === 'sell' && (!currentPosition || quantity > currentPosition.quantity)) {
      setError(`الكمية المملوكة غير كافية (المتاح: ${currentPosition ? currentPosition.quantity.toFixed(6) : '0'})`);
      return;
    }

    addTrade({ symbol, side, price: currentPrice, quantity, source });
    setSuccess(side === 'buy' ? 'تم تنفيذ عملية الشراء بنجاح' : 'تم تنفيذ عملية البيع بنجاح');
    setAmountValue('');
    setSource('manual');
  }

  return (
    <Card title="تنفيذ صفقة افتراضية">
      <form onSubmit={handleSubmit} className="flex flex-col gap-3 p-4">
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setSide('buy')}
            className={`flex-1 rounded-md py-2 text-sm font-semibold transition-colors ${
              side === 'buy' ? 'bg-buy/20 text-buy' : 'bg-bg-raised text-ink-muted hover:text-ink'
            }`}
          >
            شراء
          </button>
          <button
            type="button"
            onClick={() => setSide('sell')}
            className={`flex-1 rounded-md py-2 text-sm font-semibold transition-colors ${
              side === 'sell' ? 'bg-sell/20 text-sell' : 'bg-bg-raised text-ink-muted hover:text-ink'
            }`}
          >
            بيع
          </button>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-[11px] text-ink-faint" htmlFor="trade-symbol">
            العملة
          </label>
          <select
            id="trade-symbol"
            value={symbol}
            onChange={(e) => setSymbol(e.target.value)}
            className="rounded-md border border-border bg-bg-raised px-2.5 py-2 text-sm text-ink focus:border-accent/50 focus:outline-none"
          >
            {watchlist.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
          <span className="num text-[11px] text-ink-faint">
            السعر الحالي: {currentPrice ? formatPrice(currentPrice) : '—'}
          </span>
        </div>

        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <label className="text-[11px] text-ink-faint" htmlFor="trade-amount">
              {amountMode === 'usd' ? 'القيمة بالدولار (USDT)' : 'الكمية'}
            </label>
            <button
              type="button"
              onClick={() => setAmountMode(amountMode === 'usd' ? 'quantity' : 'usd')}
              className="text-[11px] text-accent hover:underline"
            >
              التبديل إلى {amountMode === 'usd' ? 'الكمية' : 'القيمة بالدولار'}
            </button>
          </div>
          <input
            id="trade-amount"
            type="number"
            inputMode="decimal"
            min="0"
            step="any"
            value={amountValue}
            onChange={(e) => setAmountValue(e.target.value)}
            placeholder={amountMode === 'usd' ? 'مثال: 500' : 'مثال: 0.01'}
            className="num rounded-md border border-border bg-bg-raised px-2.5 py-2 text-sm text-ink placeholder:text-ink-faint focus:border-accent/50 focus:outline-none"
          />
        </div>

        {error && <p className="text-xs text-sell">{error}</p>}
        {success && <p className="text-xs text-buy">{success}</p>}

        <button
          type="submit"
          className={`rounded-md py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90 ${
            side === 'buy' ? 'bg-buy' : 'bg-sell'
          }`}
        >
          {side === 'buy' ? 'شراء الآن' : 'بيع الآن'}
        </button>
      </form>
    </Card>
  );
}
