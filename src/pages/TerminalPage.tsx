import { useMemo, useState } from 'react';
import { useMarketData } from '../context/MarketDataContext';
import { useKlineSeries } from '../hooks/useKlineSeries';
import { useSignalAlerts } from '../hooks/useSignalAlerts';
import { analyzeKlines, getEma9Series, getEma21Series } from '../utils/signals';
import type { Timeframe } from '../types/market';
import type { TradeIntent } from '../components/portfolio/TradeForm';

import WatchlistPanel from '../components/watchlist/WatchlistPanel';
import TimeframeSelector from '../components/terminal/TimeframeSelector';
import TradingChart from '../components/terminal/TradingChart';
import SignalCard from '../components/terminal/SignalCard';
import SupportResistancePanel from '../components/terminal/SupportResistancePanel';
import AlertsPanel from '../components/alerts/AlertsPanel';
import Card from '../components/common/Card';
import Spinner from '../components/common/Spinner';

interface TerminalPageProps {
  onExecuteSignal: (intent: TradeIntent) => void;
}

export default function TerminalPage({ onExecuteSignal }: TerminalPageProps) {
  const { watchlist, tickers } = useMarketData();
  const [selectedSymbol, setSelectedSymbol] = useState(watchlist[0] ?? 'BTCUSDT');
  const [timeframe, setTimeframe] = useState<Timeframe>('15m');

  const { klines, loading } = useKlineSeries(selectedSymbol, timeframe);

  const analysis = useMemo(() => analyzeKlines(klines), [klines]);
  const ema9 = useMemo(() => getEma9Series(klines), [klines]);
  const ema21 = useMemo(() => getEma21Series(klines), [klines]);

  const currentPrice = tickers[selectedSymbol]?.lastPrice ?? klines[klines.length - 1]?.close ?? null;

  useSignalAlerts(selectedSymbol, analysis, currentPrice);

  return (
    <div className="grid h-full grid-cols-1 gap-3 overflow-hidden p-3 lg:grid-cols-[260px_1fr_280px]">
      <div className="hidden h-full lg:block">
        <WatchlistPanel selectedSymbol={selectedSymbol} onSelect={setSelectedSymbol} />
      </div>

      <div className="flex flex-col gap-3 overflow-y-auto">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-base font-bold text-ink">{selectedSymbol}</h1>
            <span className="num text-xs text-ink-muted">
              {currentPrice ? currentPrice.toLocaleString('en-US', { maximumFractionDigits: 6 }) : '—'}
            </span>
          </div>
          <TimeframeSelector value={timeframe} onChange={setTimeframe} />
        </div>

        <Card bodyClassName="p-2">
          {loading ? <Spinner label="جارٍ تحميل الشموع..." /> : <TradingChart klines={klines} ema9={ema9} ema21={ema21} />}
        </Card>

        <SignalCard
          analysis={analysis}
          loading={loading}
          onExecuteSignal={(side) => onExecuteSignal({ symbol: selectedSymbol, side })}
        />

        <SupportResistancePanel data={analysis?.supportResistance ?? null} />
      </div>

      <div className="hidden h-full lg:block">
        <AlertsPanel />
      </div>
    </div>
  );
}
