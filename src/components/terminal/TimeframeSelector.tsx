import { TIMEFRAMES } from '../../types/market';
import type { Timeframe } from '../../types/market';

interface TimeframeSelectorProps {
  value: Timeframe;
  onChange: (tf: Timeframe) => void;
}

export default function TimeframeSelector({ value, onChange }: TimeframeSelectorProps) {
  return (
    <div className="flex items-center gap-1 rounded-md border border-border bg-bg-raised p-0.5">
      {TIMEFRAMES.map((tf) => (
        <button
          key={tf.value}
          type="button"
          onClick={() => onChange(tf.value)}
          className={`rounded px-2.5 py-1 text-xs font-medium transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent ${
            value === tf.value ? 'bg-accent/15 text-accent' : 'text-ink-muted hover:text-ink'
          }`}
          aria-pressed={value === tf.value}
        >
          {tf.label}
        </button>
      ))}
    </div>
  );
}
