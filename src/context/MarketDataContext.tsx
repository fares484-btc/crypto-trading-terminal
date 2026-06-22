// سياق بيانات السوق اللحظية: قائمة المراقبة + الأسعار الحية لكل عملة فيها
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import type { MiniTicker } from '../types/market';
import { MiniTickerSocket } from '../services/binanceSocket';
import { validateSymbol } from '../services/binanceRest';
import { loadFromStorage, saveToStorage } from '../utils/storage';

const WATCHLIST_STORAGE_KEY = 'trading-terminal:watchlist';
const DEFAULT_WATCHLIST = ['BTCUSDT', 'ETHUSDT', 'BNBUSDT', 'SOLUSDT', 'XRPUSDT'];

interface MarketDataContextValue {
  watchlist: string[];
  tickers: Record<string, MiniTicker>;
  addSymbol: (symbol: string) => Promise<{ success: boolean; error?: string }>;
  removeSymbol: (symbol: string) => void;
  isConnected: boolean;
}

const MarketDataContext = createContext<MarketDataContextValue | null>(null);

export function MarketDataProvider({ children }: { children: ReactNode }) {
  const [watchlist, setWatchlist] = useState<string[]>(() =>
    loadFromStorage(WATCHLIST_STORAGE_KEY, DEFAULT_WATCHLIST)
  );
  const [tickers, setTickers] = useState<Record<string, MiniTicker>>({});
  const [isConnected, setIsConnected] = useState(false);
  const socketRef = useRef<MiniTickerSocket | null>(null);

  if (!socketRef.current) {
    socketRef.current = new MiniTickerSocket();
  }

  useEffect(() => {
    const socket = socketRef.current as MiniTickerSocket;
    const unsubscribe = socket.subscribe((ticker) => {
      setIsConnected(true);
      setTickers((prev) => ({ ...prev, [ticker.symbol]: ticker }));
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    socketRef.current?.updateSymbols(watchlist);
    saveToStorage(WATCHLIST_STORAGE_KEY, watchlist);
  }, [watchlist]);

  useEffect(() => {
    return () => {
      socketRef.current?.disconnect();
    };
  }, []);

  const addSymbol = useCallback(
    async (rawSymbol: string): Promise<{ success: boolean; error?: string }> => {
      const symbol = rawSymbol.trim().toUpperCase();
      if (!symbol) return { success: false, error: 'الرجاء إدخال رمز العملة' };
      if (watchlist.includes(symbol)) return { success: false, error: 'هذه العملة موجودة بالفعل في القائمة' };

      const valid = await validateSymbol(symbol);
      if (!valid) return { success: false, error: `الرمز "${symbol}" غير موجود على Binance` };

      setWatchlist((prev) => [...prev, symbol]);
      return { success: true };
    },
    [watchlist]
  );

  const removeSymbol = useCallback((symbol: string) => {
    setWatchlist((prev) => prev.filter((s) => s !== symbol));
    setTickers((prev) => {
      const next = { ...prev };
      delete next[symbol];
      return next;
    });
  }, []);

  const value = useMemo<MarketDataContextValue>(
    () => ({ watchlist, tickers, addSymbol, removeSymbol, isConnected }),
    [watchlist, tickers, addSymbol, removeSymbol, isConnected]
  );

  return <MarketDataContext.Provider value={value}>{children}</MarketDataContext.Provider>;
}

export function useMarketData(): MarketDataContextValue {
  const ctx = useContext(MarketDataContext);
  if (!ctx) throw new Error('useMarketData يجب أن يُستخدم داخل MarketDataProvider');
  return ctx;
}
