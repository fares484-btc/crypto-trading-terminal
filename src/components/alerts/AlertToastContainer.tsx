import { useEffect, useState } from 'react';
import { useAlerts } from '../../context/AlertsContext';
import type { AlertItem, AlertType } from '../../types/alerts';

const TOAST_DURATION_MS = 4000;

const ALERT_STYLE: Record<AlertType, string> = {
  buy_signal: 'border-buy/40 bg-buy-soft text-buy',
  sell_signal: 'border-sell/40 bg-sell-soft text-sell',
  support_touch: 'border-accent/40 bg-accent/10 text-accent',
  resistance_touch: 'border-accent/40 bg-accent/10 text-accent',
};

export default function AlertToastContainer() {
  const { latestAlert } = useAlerts();
  const [visibleAlert, setVisibleAlert] = useState<AlertItem | null>(null);

  useEffect(() => {
    if (!latestAlert) return;
    setVisibleAlert(latestAlert);
    const timer = window.setTimeout(() => setVisibleAlert(null), TOAST_DURATION_MS);
    return () => window.clearTimeout(timer);
  }, [latestAlert]);

  if (!visibleAlert) return null;

  return (
    <div className="pointer-events-none fixed inset-x-0 top-16 z-50 flex justify-center px-4">
      <div
        className={`animate-toast-in pointer-events-auto flex items-center gap-2 rounded-lg border px-4 py-2.5 text-sm shadow-lg shadow-black/30 ${ALERT_STYLE[visibleAlert.type]}`}
        role="status"
      >
        <span className="font-medium">{visibleAlert.symbol}</span>
        <span className="text-ink">{visibleAlert.message}</span>
      </div>
    </div>
  );
}
