import type { ReactNode } from 'react';

interface CardProps {
  title?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
  bodyClassName?: string;
}

export default function Card({ title, action, children, className = '', bodyClassName = '' }: CardProps) {
  return (
    <div className={`panel flex flex-col overflow-hidden ${className}`}>
      {title && (
        <div className="flex items-center justify-between border-b border-border-soft px-4 py-2.5">
          <h2 className="text-sm font-semibold text-ink">{title}</h2>
          {action}
        </div>
      )}
      <div className={`flex-1 ${bodyClassName}`}>{children}</div>
    </div>
  );
}
