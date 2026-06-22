import { useMarketData } from '../../context/MarketDataContext';
import Card from '../common/Card';
import WatchlistRow from './WatchlistRow';
import AddSymbolForm from './AddSymbolForm';

interface WatchlistPanelProps {
  selectedSymbol: string;
  onSelect: (symbol: string) => void;
}

export default function WatchlistPanel({ selectedSymbol, onSelect }: WatchlistPanelProps) {
  const { watchlist, tickers, removeSymbol } = useMarketData();

  return (
    <Card title="قائمة المراقبة" className="h-full" bodyClassName="flex flex-col overflow-hidden">
      <AddSymbolForm />
      <div className="flex-1 overflow-y-auto">
        {watchlist.length === 0 ? (
          <p className="px-3 py-6 text-center text-xs text-ink-faint">لا توجد عملات في القائمة بعد</p>
        ) : (
          watchlist.map((symbol) => (
            <WatchlistRow
              key={symbol}
              symbol={symbol}
              ticker={tickers[symbol]}
              isSelected={symbol === selectedSymbol}
              onSelect={onSelect}
              onRemove={removeSymbol}
            />
          ))
        )}
      </div>
    </Card>
  );
}
