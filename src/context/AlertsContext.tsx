// سياق التنبيهات: يحتفظ بسجل آخر التنبيهات ويوفر دالة لإضافة تنبيه جديد من أي مكان في التطبيق
import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import type { AlertItem, AlertType } from '../types/alerts';
import { generateId } from '../utils/storage';
import { playAlertBeep } from '../utils/sound';

const MAX_ALERTS = 50;

interface PushAlertInput {
  type: AlertType;
  symbol: string;
  message: string;
  price: number;
}

interface AlertsContextValue {
  alerts: AlertItem[];
  latestAlert: AlertItem | null;
  pushAlert: (input: PushAlertInput) => void;
  dismissAlert: (id: string) => void;
  clearAlerts: () => void;
  soundEnabled: boolean;
  setSoundEnabled: (enabled: boolean) => void;
}

const AlertsContext = createContext<AlertsContextValue | null>(null);

export function AlertsProvider({ children }: { children: ReactNode }) {
  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const [soundEnabled, setSoundEnabled] = useState(true);

  const pushAlert = useCallback(
    (input: PushAlertInput) => {
      const item: AlertItem = {
        id: generateId(),
        timestamp: Date.now(),
        ...input,
      };
      setAlerts((prev) => [item, ...prev].slice(0, MAX_ALERTS));

      if (soundEnabled) {
        const kind = input.type === 'buy_signal' ? 'buy' : input.type === 'sell_signal' ? 'sell' : 'info';
        playAlertBeep(kind);
      }
    },
    [soundEnabled]
  );

  const dismissAlert = useCallback((id: string) => {
    setAlerts((prev) => prev.filter((a) => a.id !== id));
  }, []);

  const clearAlerts = useCallback(() => setAlerts([]), []);

  const value = useMemo<AlertsContextValue>(
    () => ({
      alerts,
      latestAlert: alerts[0] ?? null,
      pushAlert,
      dismissAlert,
      clearAlerts,
      soundEnabled,
      setSoundEnabled,
    }),
    [alerts, pushAlert, dismissAlert, clearAlerts, soundEnabled]
  );

  return <AlertsContext.Provider value={value}>{children}</AlertsContext.Provider>;
}

export function useAlerts(): AlertsContextValue {
  const ctx = useContext(AlertsContext);
  if (!ctx) throw new Error('useAlerts يجب أن يُستخدم داخل AlertsProvider');
  return ctx;
}
