import { usePortfolio } from '../../context/PortfolioContext';
import { formatPrice, formatTime, formatUsd } from '../../utils/format';
import Card from '../common/Card';
import Badge from '../common/Badge';

export default function TradeHistoryTable() {
  const { trades } = usePortfolio();
  const sorted = [...trades].sort((a, b) => b.timestamp - a.timestamp);

  return (
    <Card title="سجل الصفقات" bodyClassName="overflow-x-auto">
      {sorted.length === 0 ? (
        <p className="px-4 py-6 text-center text-xs text-ink-faint">لا توجد صفقات مسجّلة بعد</p>
      ) : (
        <table className="w-full min-w-[560px] text-xs">
          <thead>
            <tr className="border-b border-border-soft text-ink-faint">
              <th className="px-3 py-2 text-right font-medium">العملة</th>
              <th className="px-3 py-2 text-right font-medium">النوع</th>
              <th className="px-3 py-2 text-right font-medium">السعر</th>
              <th className="px-3 py-2 text-right font-medium">الكمية</th>
              <th className="px-3 py-2 text-right font-medium">القيمة</th>
              <th className="px-3 py-2 text-right font-medium">المصدر</th>
              <th className="px-3 py-2 text-right font-medium">الوقت</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((trade) => (
              <tr key={trade.id} className="border-b border-border-soft last:border-0">
                <td className="px-3 py-2 font-medium text-ink">{trade.symbol}</td>
                <td className="px-3 py-2">
                  <Badge tone={trade.side === 'buy' ? 'buy' : 'sell'}>
                    {trade.side === 'buy' ? 'شراء' : 'بيع'}
                  </Badge>
                </td>
                <td className="num px-3 py-2 text-ink">{formatPrice(trade.price)}</td>
                <td className="num px-3 py-2 text-ink">{trade.quantity.toFixed(6)}</td>
                <td className="num px-3 py-2 text-ink">{formatUsd(trade.value)}</td>
                <td className="px-3 py-2 text-ink-muted">{trade.source === 'signal' ? 'إشارة' : 'يدوي'}</td>
                <td className="num px-3 py-2 text-ink-faint">{formatTime(trade.timestamp)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </Card>
  );
}
