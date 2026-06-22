import type { ReactNode } from 'react';

type BadgeTone = 'buy' | 'sell' | 'wait' | 'neutral' | 'accent';

const TONE_CLASSES: Record<BadgeTone, string> = {
  buy: 'bg-buy-soft text-buy border-buy/30',
  sell: 'bg-sell-soft text-sell border-sell/30',
  wait: 'bg-wait-soft text-wait border-wait/30',
  neutral: 'bg-bg-raised text-ink-muted border-border',
  accent: 'bg-accent/10 text-accent border-accent/30',
};

interface BadgeProps {
  tone?: BadgeTone;
  children: ReactNode;
  className?: string;
}

export default function Badge({ tone = 'neutral', children, className = '' }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-xs font-medium ${TONE_CLASSES[tone]} ${className}`}
    >
      {children}
    </span>
  );
}
