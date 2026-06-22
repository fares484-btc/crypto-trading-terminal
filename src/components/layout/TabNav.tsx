export type AppTab = 'terminal' | 'portfolio';

interface TabNavProps {
  activeTab: AppTab;
  onChange: (tab: AppTab) => void;
}

const TABS: { id: AppTab; label: string }[] = [
  { id: 'terminal', label: 'الترمينال' },
  { id: 'portfolio', label: 'المحفظة الافتراضية' },
];

export default function TabNav({ activeTab, onChange }: TabNavProps) {
  return (
    <nav className="flex shrink-0 gap-1 border-b border-border bg-bg px-4 pt-2">
      {TABS.map((tab) => {
        const isActive = tab.id === activeTab;
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onChange(tab.id)}
            className={`rounded-t-md border-x border-t px-4 py-2 text-sm font-medium transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent ${
              isActive
                ? 'border-border bg-bg-panel text-accent'
                : 'border-transparent text-ink-muted hover:text-ink'
            }`}
            aria-current={isActive ? 'page' : undefined}
          >
            {tab.label}
          </button>
        );
      })}
    </nav>
  );
}
