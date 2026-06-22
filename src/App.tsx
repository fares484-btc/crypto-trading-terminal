import { useState } from 'react';
import { MarketDataProvider } from './context/MarketDataContext';
import { AlertsProvider } from './context/AlertsContext';
import { PortfolioProvider } from './context/PortfolioContext';

import Header from './components/layout/Header';
import TabNav from './components/layout/TabNav';
import type { AppTab } from './components/layout/TabNav';
import AlertToastContainer from './components/alerts/AlertToastContainer';

import TerminalPage from './pages/TerminalPage';
import PaperTradingPage from './pages/PaperTradingPage';
import type { TradeIntent } from './components/portfolio/TradeForm';

function AppShell() {
  const [activeTab, setActiveTab] = useState<AppTab>('terminal');
  const [pendingTradeIntent, setPendingTradeIntent] = useState<TradeIntent | null>(null);

  function handleExecuteSignal(intent: TradeIntent) {
    setPendingTradeIntent(intent);
    setActiveTab('portfolio');
  }

  return (
    <div className="flex h-screen flex-col bg-bg">
      <Header />
      <TabNav activeTab={activeTab} onChange={setActiveTab} />

      <main className="flex-1 overflow-hidden">
        {activeTab === 'terminal' ? (
          <TerminalPage onExecuteSignal={handleExecuteSignal} />
        ) : (
          <PaperTradingPage prefill={pendingTradeIntent} onPrefillConsumed={() => setPendingTradeIntent(null)} />
        )}
      </main>

      <AlertToastContainer />
    </div>
  );
}

export default function App() {
  return (
    <MarketDataProvider>
      <AlertsProvider>
        <PortfolioProvider>
          <AppShell />
        </PortfolioProvider>
      </AlertsProvider>
    </MarketDataProvider>
  );
}
