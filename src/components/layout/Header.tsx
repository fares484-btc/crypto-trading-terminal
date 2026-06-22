import { useEffect, useState } from 'react';
import { useMarketData } from '../../context/MarketDataContext';
import { useAlerts } from '../../context/AlertsContext';
import { formatClock } from '../../utils/format';

export default function Header() {
  const { isConnected } = useMarketData();
  const { soundEnabled, setSoundEnabled } = useAlerts();
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  return (
    <header className="flex h-14 shrink-0 items-center justify-between border-b border-border bg-bg-panel px-4">
      <div className="flex items-center gap-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-md bg-accent/10 font-mono text-sm font-bold text-accent">
          ₿
        </div>
        <div>
          <div className="text-sm font-bold leading-tight text-ink">ترمينال التداول اللحظي</div>
          <div className="text-[11px] leading-tight text-ink-faint">Crypto Day-Trading Terminal</div>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1.5 text-xs">
          <span
            className={`h-2 w-2 rounded-full ${isConnected ? 'bg-buy animate-pulse-dot' : 'bg-ink-faint'}`}
            aria-hidden="true"
          />
          <span className={isConnected ? 'text-buy' : 'text-ink-faint'}>
            {isConnected ? 'مباشر' : 'جارٍ الاتصال…'}
          </span>
        </div>

        <button
          type="button"
          onClick={() => setSoundEnabled(!soundEnabled)}
          className="rounded-md border border-border px-2 py-1 text-xs text-ink-muted transition-colors hover:border-accent/40 hover:text-accent focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent"
          aria-pressed={soundEnabled}
        >
          {soundEnabled ? '🔔 الصوت مفعّل' : '🔕 الصوت متوقف'}
        </button>

        <div className="num text-xs text-ink-muted">{formatClock(now)}</div>
      </div>
    </header>
  );
}
