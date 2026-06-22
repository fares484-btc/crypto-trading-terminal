// أنواع نظام التنبيهات

export type AlertType =
  | 'buy_signal'
  | 'sell_signal'
  | 'support_touch'
  | 'resistance_touch';

export interface AlertItem {
  id: string;
  type: AlertType;
  symbol: string;
  message: string;
  price: number;
  timestamp: number;
}
