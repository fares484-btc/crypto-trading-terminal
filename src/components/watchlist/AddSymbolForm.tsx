import { useState } from 'react';
import type { FormEvent } from 'react';
import { useMarketData } from '../../context/MarketDataContext';

export default function AddSymbolForm() {
  const { addSymbol } = useMarketData();
  const [value, setValue] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!value.trim() || submitting) return;

    setSubmitting(true);
    setError(null);

    // إذا لم يكتب المستخدم لاحقة الزوج، نفترض USDT تلقائياً (مثال: "doge" → "DOGEUSDT")
    const symbol = value.trim().toUpperCase().endsWith('USDT') ? value.trim().toUpperCase() : `${value.trim().toUpperCase()}USDT`;

    const result = await addSymbol(symbol);
    setSubmitting(false);

    if (result.success) {
      setValue('');
    } else {
      setError(result.error ?? 'تعذّرت إضافة العملة');
    }
  }

  return (
    <form onSubmit={handleSubmit} className="border-b border-border-soft p-2">
      <div className="flex gap-1.5">
        <input
          type="text"
          value={value}
          onChange={(e) => {
            setValue(e.target.value);
            if (error) setError(null);
          }}
          placeholder="أضف عملة، مثال: DOGE"
          className="min-w-0 flex-1 rounded-md border border-border bg-bg-raised px-2.5 py-1.5 text-xs text-ink placeholder:text-ink-faint focus:border-accent/50 focus:outline-none"
        />
        <button
          type="submit"
          disabled={submitting || !value.trim()}
          className="shrink-0 rounded-md bg-accent/10 px-3 py-1.5 text-xs font-medium text-accent transition-colors hover:bg-accent/20 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {submitting ? '...' : '+ إضافة'}
        </button>
      </div>
      {error && <p className="mt-1.5 text-[11px] text-sell">{error}</p>}
    </form>
  );
}
