import type { SupportResistance } from '../../types/market';
import Card from '../common/Card';
import { formatPrice, formatPercent } from '../../utils/format';

interface SupportResistancePanelProps {
  data: SupportResistance | null;
}

export default function SupportResistancePanel({ data }: SupportResistancePanelProps) {
  if (!data) return null;

  return (
    <Card title="الدعم والمقاومة">
      <div className="grid grid-cols-2 divide-x divide-border-soft">
        <div className="flex flex-col items-center gap-1 px-4 py-3">
          <span className="text-[11px] text-ink-faint">أقرب مقاومة</span>
          <span className="num text-base font-semibold text-sell">{formatPrice(data.resistance)}</span>
          <span className="num text-[11px] text-ink-muted">
            تبعد {formatPercent(data.resistanceDistancePct, false)}
          </span>
        </div>
        <div className="flex flex-col items-center gap-1 px-4 py-3">
          <span className="text-[11px] text-ink-faint">أقرب دعم</span>
          <span className="num text-base font-semibold text-buy">{formatPrice(data.support)}</span>
          <span className="num text-[11px] text-ink-muted">
            تبعد {formatPercent(data.supportDistancePct, false)}
          </span>
        </div>
      </div>
    </Card>
  );
}
