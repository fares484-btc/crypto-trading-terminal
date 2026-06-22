export default function Spinner({ label }: { label?: string }) {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-3 py-10 text-ink-muted">
      <div className="h-6 w-6 animate-spin rounded-full border-2 border-border border-t-accent" />
      {label && <span className="text-xs">{label}</span>}
    </div>
  );
}
