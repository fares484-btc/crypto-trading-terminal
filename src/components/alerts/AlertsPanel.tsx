import { useAlerts } from '../../context/AlertsContext';
import type { AlertItem, AlertType } from '../../types/alerts';
import Card from '../common/Card';
import { formatTime } from '../../utils/format';

const ALERT_ICON: Record<AlertType, string> = {
  buy_signal: '🟢',
  sell_signal: '🔴',
  support_touch: '🛟',
  resistance_touch: '🚧',
};

function AlertRow({ alert, onDismiss }: { alert: AlertItem; onDismiss: (id: string) => void }) {
  return (
    <div className="flex items-start gap-2 border-b border-border-soft px-3 py-2.5">
      <span className="mt-0.5 text-sm" aria-hidden="true">
        {ALERT_ICON[alert.type]}
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-xs leading-relaxed text-ink">{alert.message}</p>
        <span className="num text-[10px] text-ink-faint">{formatTime(alert.timestamp)}</span>
      </div>
      <button
        type="button"
        onClick={() => onDismiss(alert.id)}
        className="shrink-0 text-ink-faint transition-colors hover:text-ink"
        aria-label="إخفاء التنبيه"
      >
        ✕
      </button>
    </div>
  );
}

export default function AlertsPanel() {
  const { alerts, dismissAlert, clearAlerts } = useAlerts();

  return (
    <Card
      title="التنبيهات"
      className="h-full"
      bodyClassName="flex flex-col overflow-hidden"
      action={
        alerts.length > 0 && (
          <button
            type="button"
            onClick={clearAlerts}
            className="text-[11px] text-ink-faint transition-colors hover:text-ink"
          >
            مسح الكل
          </button>
        )
      }
    >
      <div className="flex-1 overflow-y-auto">
        {alerts.length === 0 ? (
          <p className="px-3 py-6 text-center text-xs text-ink-faint">لا توجد تنبيهات بعد</p>
        ) : (
          alerts.map((alert) => <AlertRow key={alert.id} alert={alert} onDismiss={dismissAlert} />)
        )}
      </div>
    </Card>
  );
}
