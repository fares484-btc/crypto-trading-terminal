import type { AnalysisResult } from '../../types/analysis';
import Card from '../common/Card';
import Badge from '../common/Badge';
import Spinner from '../common/Spinner';

interface SignalCardProps {
  analysis: AnalysisResult | null;
  loading: boolean;
  onExecuteSignal: (side: 'buy' | 'sell') => void;
}

const TREND_LABEL: Record<AnalysisResult['trend'], string> = {
  up: 'صاعد',
  down: 'هابط',
  sideways: 'عرضي',
};

const SIGNAL_LABEL: Record<AnalysisResult['signal'], string> = {
  buy: 'شراء',
  sell: 'بيع',
  wait: 'انتظار',
};

function IndicatorReadout({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-0.5 rounded-md bg-bg-raised px-2.5 py-1.5">
      <span className="text-[10px] text-ink-faint">{label}</span>
      <span className="num text-xs text-ink">{value}</span>
    </div>
  );
}

export default function SignalCard({ analysis, loading, onExecuteSignal }: SignalCardProps) {
  if (loading) {
    return (
      <Card title="الإشارة والتحليل الفني">
        <Spinner label="جارٍ تحليل البيانات..." />
      </Card>
    );
  }

  if (!analysis) {
    return (
      <Card title="الإشارة والتحليل الفني">
        <p className="px-4 py-6 text-center text-xs text-ink-faint">بيانات غير كافية بعد لإجراء تحليل موثوق</p>
      </Card>
    );
  }

  const tone = analysis.signal === 'buy' ? 'buy' : analysis.signal === 'sell' ? 'sell' : 'wait';
  const ind = analysis.indicators;

  return (
    <Card title="الإشارة والتحليل الفني">
      <div className="flex flex-col gap-3 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Badge tone={tone} className="px-3 py-1 text-sm">
              {SIGNAL_LABEL[analysis.signal]}
            </Badge>
            <span className="text-xs text-ink-muted">الاتجاه: {TREND_LABEL[analysis.trend]}</span>
          </div>
          <div className="text-left">
            <div className="num text-lg font-bold text-ink">{analysis.confidence}%</div>
            <div className="text-[10px] text-ink-faint">درجة الثقة</div>
          </div>
        </div>

        <div className="h-1.5 w-full overflow-hidden rounded-full bg-bg-raised">
          <div
            className={`h-full rounded-full ${tone === 'buy' ? 'bg-buy' : tone === 'sell' ? 'bg-sell' : 'bg-wait'}`}
            style={{ width: `${analysis.confidence}%` }}
          />
        </div>

        <div className="grid grid-cols-3 gap-2">
          <IndicatorReadout label="EMA9" value={ind.ema9 !== null ? ind.ema9.toFixed(4) : '—'} />
          <IndicatorReadout label="EMA21" value={ind.ema21 !== null ? ind.ema21.toFixed(4) : '—'} />
          <IndicatorReadout label="RSI" value={ind.rsi !== null ? ind.rsi.toFixed(1) : '—'} />
          <IndicatorReadout label="MACD" value={ind.macdLine !== null ? ind.macdLine.toFixed(4) : '—'} />
          <IndicatorReadout
            label="Signal Line"
            value={ind.macdSignal !== null ? ind.macdSignal.toFixed(4) : '—'}
          />
          <IndicatorReadout
            label="Histogram"
            value={ind.macdHistogram !== null ? ind.macdHistogram.toFixed(4) : '—'}
          />
        </div>

        <div className="flex flex-col gap-1.5 border-t border-border-soft pt-3">
          <span className="text-[11px] font-medium text-ink-muted">الأسباب</span>
          <ul className="flex flex-col gap-1">
            {analysis.reasons.map((reason, idx) => (
              <li key={idx} className="text-xs leading-relaxed text-ink-muted">
                • {reason}
              </li>
            ))}
          </ul>
        </div>

        {(analysis.signal === 'buy' || analysis.signal === 'sell') && (
          <button
            type="button"
            onClick={() => onExecuteSignal(analysis.signal as 'buy' | 'sell')}
            className={`mt-1 rounded-md py-2 text-sm font-semibold transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent ${
              tone === 'buy' ? 'bg-buy/15 text-buy hover:bg-buy/25' : 'bg-sell/15 text-sell hover:bg-sell/25'
            }`}
          >
            نفّذ هذه الإشارة في المحفظة الافتراضية ←
          </button>
        )}
      </div>
    </Card>
  );
}
