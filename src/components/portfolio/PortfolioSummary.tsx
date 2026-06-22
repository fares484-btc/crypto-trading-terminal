import { usePortfolio } from '../../context/PortfolioContext';
import { useMarketData } from '../../context/MarketDataContext';
import { buildPortfolioSummary } from '../../utils/portfolio';
import { formatPercent, formatUsd } from '../../utils/format';
import Card from '../common/Card';

function StatBlock({ label, value, tone }: { label: string; value: string; tone?: 'buy' | 'sell' }) {
  const toneClass = tone === 'buy' ? 'text-buy' : tone === 'sell' ? 'text-sell' : 'text-ink';
  return (
    <div className="flex flex-col gap-1 px-4 py-3">
      <span className="text-[11px] text-ink-faint">{label}</span>
      <span className={`num text-lg font-semibold ${toneClass}`}>{value}</span>
    </div>
  );
}

export default function PortfolioSummary() {
  const { initialBalance, trades } = usePortfolio();
  const { tickers } = useMarketData();

  const currentPrices: Record<string, number> = {};
  Object.values(tickers).forEach((t) => {
    currentPrices[t.symbol] = t.lastPrice;
  });

  const summary = buildPortfolioSummary(initialBalance, trades, currentPrices);
  const pnlTone = summary.totalPnl >= 0 ? 'buy' : 'sell';

  return (
    <Card title="ملخص المحفظة الافتراضية">
      <div className="grid grid-cols-2 divide-x divide-y divide-border-soft sm:grid-cols-4 sm:divide-y-0">
        <StatBlock label="الرصيد النقدي" value={formatUsd(summary.cashBalance)} />
        <StatBlock label="قيمة المراكز" value={formatUsd(summary.positionsValue)} />
        <StatBlock label="إجمالي قيمة المحفظة" value={formatUsd(summary.equity)} />
        <StatBlock
          label="الربح/الخسارة الإجمالي"
          value={`${formatUsd(summary.totalPnl)} (${formatPercent(summary.totalPnlPct)})`}
          tone={pnlTone}
        />
      </div>
    </Card>
  );
}
