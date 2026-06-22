import PortfolioSummary from '../components/portfolio/PortfolioSummary';
import TradeForm from '../components/portfolio/TradeForm';
import type { TradeIntent } from '../components/portfolio/TradeForm';
import PositionsTable from '../components/portfolio/PositionsTable';
import TradeHistoryTable from '../components/portfolio/TradeHistoryTable';

interface PaperTradingPageProps {
  prefill: TradeIntent | null;
  onPrefillConsumed: () => void;
}

export default function PaperTradingPage({ prefill, onPrefillConsumed }: PaperTradingPageProps) {
  return (
    <div className="flex h-full flex-col gap-3 overflow-y-auto p-3">
      <PortfolioSummary />

      <div className="grid grid-cols-1 gap-3 lg:grid-cols-[320px_1fr]">
        <TradeForm prefill={prefill} onPrefillConsumed={onPrefillConsumed} />
        <div className="flex flex-col gap-3">
          <PositionsTable />
          <TradeHistoryTable />
        </div>
      </div>
    </div>
  );
}
