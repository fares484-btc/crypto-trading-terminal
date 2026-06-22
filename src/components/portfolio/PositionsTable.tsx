import { usePortfolio } from '../../context/PortfolioContext';
import { useMarketData } from '../../context/MarketDataContext';
import { derivePositions } from '../../utils/portfolio';
import { formatPercent, formatPrice, formatUsd } from '../../utils/format';
import Card from '../common/Card';

export default function PositionsTable() {
  const { trades } = usePortfolio();
  const { tickers } = useMarketData();
  const positions = derivePositions(trades);

  return (
    <Card title="المراكز المفتوحة" bodyClassName="overflow-x-auto">
      {positions.length === 0 ? (
        <p className="px-4 py-6 text-center text-xs text-ink-faint">لا توجد مراكز مفتوحة حالياً</p>
      ) : (
        <table className="w-full min-w-[520px] text-xs">
          <thead>
            <tr className="border-b border-border-soft text-ink-faint">
              <th className="px-3 py-2 text-right font-medium">العملة</th>
              <th className="px-3 py-2 text-right font-medium">الكمية</th>
              <th className="px-3 py-2 text-right font-medium">متوسط التكلفة</th>
              <th className="px-3 py-2 text-right font-medium">السعر الحالي</th>
              <th className="px-3 py-2 text-right font-medium">القيمة الحالية</th>
              <th className="px-3 py-2 text-right font-medium">ربح/خسارة غير محقق</th>
            </tr>
          </thead>
          <tbody>
            {positions.map((position) => {
              const currentPrice = tickers[position.symbol]?.lastPrice ?? position.avgCost;
              const marketValue = position.quantity * currentPrice;
              const pnl = (currentPrice - position.avgCost) * position.quantity;
              const pnlPct = position.avgCost > 0 ? ((currentPrice - position.avgCost) / position.avgCost) * 100 : 0;
              const isPositive = pnl >= 0;

              return (
                <tr key={position.symbol} className="border-b border-border-soft last:border-0">
                  <td className="px-3 py-2 font-medium text-ink">{position.symbol}</td>
                  <td className="num px-3 py-2 text-ink">{position.quantity.toFixed(6)}</td>
                  <td className="num px-3 py-2 text-ink">{formatPrice(position.avgCost)}</td>
                  <td className="num px-3 py-2 text-ink">{formatPrice(currentPrice)}</td>
                  <td className="num px-3 py-2 text-ink">{formatUsd(marketValue)}</td>
                  <td className={`num px-3 py-2 ${isPositive ? 'text-buy' : 'text-sell'}`}>
                    {formatUsd(pnl)} ({formatPercent(pnlPct)})
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </Card>
  );
}
