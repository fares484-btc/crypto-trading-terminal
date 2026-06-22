// أنواع المحفظة والتداول الافتراضي (Paper Trading)

export type TradeSide = 'buy' | 'sell';
export type TradeSource = 'manual' | 'signal';

export interface Trade {
  id: string;
  symbol: string;
  side: TradeSide;
  price: number;
  quantity: number;
  value: number; // price * quantity
  timestamp: number;
  source: TradeSource;
}

export interface Position {
  symbol: string;
  quantity: number;
  avgCost: number;
}

export interface PortfolioSummary {
  initialBalance: number;
  cashBalance: number;
  positionsValue: number;
  equity: number;
  realizedPnl: number;
  unrealizedPnl: number;
  totalPnl: number;
  totalPnlPct: number;
}
