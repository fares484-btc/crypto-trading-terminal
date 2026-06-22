// سياق المحفظة الافتراضية (Paper Trading) — يخزّن سجل الصفقات فقط كمصدر وحيد للحقيقة
// كل الأرصدة والمراكز والأرباح تُحسب من هذا السجل عند الحاجة (انظر utils/portfolio.ts)
import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import type { Trade, TradeSide, TradeSource } from '../types/trading';
import { loadFromStorage, saveToStorage, generateId } from '../utils/storage';

const TRADES_STORAGE_KEY = 'trading-terminal:paper-trades';
export const DEFAULT_INITIAL_BALANCE = 10000;

interface AddTradeInput {
  symbol: string;
  side: TradeSide;
  price: number;
  quantity: number;
  source: TradeSource;
}

interface PortfolioContextValue {
  initialBalance: number;
  trades: Trade[];
  addTrade: (input: AddTradeInput) => void;
  resetPortfolio: () => void;
}

const PortfolioContext = createContext<PortfolioContextValue | null>(null);

export function PortfolioProvider({ children }: { children: ReactNode }) {
  const [trades, setTrades] = useState<Trade[]>(() => loadFromStorage(TRADES_STORAGE_KEY, [] as Trade[]));

  const persist = useCallback((next: Trade[]) => {
    setTrades(next);
    saveToStorage(TRADES_STORAGE_KEY, next);
  }, []);

  const addTrade = useCallback(
    (input: AddTradeInput) => {
      const trade: Trade = {
        id: generateId(),
        symbol: input.symbol,
        side: input.side,
        price: input.price,
        quantity: input.quantity,
        value: input.price * input.quantity,
        timestamp: Date.now(),
        source: input.source,
      };
      persist([...trades, trade]);
    },
    [trades, persist]
  );

  const resetPortfolio = useCallback(() => {
    persist([]);
  }, [persist]);

  const value = useMemo<PortfolioContextValue>(
    () => ({ initialBalance: DEFAULT_INITIAL_BALANCE, trades, addTrade, resetPortfolio }),
    [trades, addTrade, resetPortfolio]
  );

  return <PortfolioContext.Provider value={value}>{children}</PortfolioContext.Provider>;
}

export function usePortfolio(): PortfolioContextValue {
  const ctx = useContext(PortfolioContext);
  if (!ctx) throw new Error('usePortfolio يجب أن يُستخدم داخل PortfolioProvider');
  return ctx;
}
