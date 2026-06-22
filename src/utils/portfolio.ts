// منطق حساب المحفظة الافتراضية — مبني بالكامل على سجل الصفقات (Trades) كمصدر وحيد للحقيقة
// كل القيم (المراكز، الرصيد، الأرباح) تُشتق من السجل بدل تخزينها بشكل منفصل، لتفادي تعارض البيانات

import type { Trade, Position, PortfolioSummary } from '../types/trading';

/** اشتقاق المراكز المفتوحة الحالية من سجل الصفقات (متوسط التكلفة المرجح) */
export function derivePositions(trades: Trade[]): Position[] {
  const bySymbol = new Map<string, Position>();

  for (const trade of trades) {
    const existing = bySymbol.get(trade.symbol) ?? { symbol: trade.symbol, quantity: 0, avgCost: 0 };

    if (trade.side === 'buy') {
      const totalCost = existing.avgCost * existing.quantity + trade.price * trade.quantity;
      const newQuantity = existing.quantity + trade.quantity;
      existing.avgCost = newQuantity > 0 ? totalCost / newQuantity : 0;
      existing.quantity = newQuantity;
    } else {
      existing.quantity -= trade.quantity;
      if (existing.quantity < 1e-9) {
        existing.quantity = 0;
        existing.avgCost = 0;
      }
    }

    bySymbol.set(trade.symbol, existing);
  }

  return Array.from(bySymbol.values()).filter((p) => p.quantity > 0);
}

/** الرصيد النقدي المتبقي بعد كل عمليات الشراء/البيع */
export function calculateCashBalance(initialBalance: number, trades: Trade[]): number {
  let cash = initialBalance;
  for (const trade of trades) {
    if (trade.side === 'buy') cash -= trade.value;
    else cash += trade.value;
  }
  return cash;
}

/** الأرباح/الخسائر المحققة فعلياً (عند البيع) بطريقة متوسط التكلفة */
export function calculateRealizedPnl(trades: Trade[]): number {
  const bySymbol = new Map<string, { quantity: number; avgCost: number }>();
  let realized = 0;

  for (const trade of trades) {
    const pos = bySymbol.get(trade.symbol) ?? { quantity: 0, avgCost: 0 };

    if (trade.side === 'buy') {
      const totalCost = pos.avgCost * pos.quantity + trade.price * trade.quantity;
      pos.quantity += trade.quantity;
      pos.avgCost = pos.quantity > 0 ? totalCost / pos.quantity : 0;
    } else {
      const sellQuantity = Math.min(trade.quantity, pos.quantity);
      realized += (trade.price - pos.avgCost) * sellQuantity;
      pos.quantity -= sellQuantity;
      if (pos.quantity < 1e-9) pos.quantity = 0;
    }

    bySymbol.set(trade.symbol, pos);
  }

  return realized;
}

/** بناء ملخص شامل للمحفظة بالاعتماد على الأسعار اللحظية الحالية */
export function buildPortfolioSummary(
  initialBalance: number,
  trades: Trade[],
  currentPrices: Record<string, number>
): PortfolioSummary {
  const positions = derivePositions(trades);
  const cashBalance = calculateCashBalance(initialBalance, trades);
  const realizedPnl = calculateRealizedPnl(trades);

  let positionsValue = 0;
  let unrealizedPnl = 0;

  for (const position of positions) {
    const currentPrice = currentPrices[position.symbol] ?? position.avgCost;
    const marketValue = position.quantity * currentPrice;
    positionsValue += marketValue;
    unrealizedPnl += (currentPrice - position.avgCost) * position.quantity;
  }

  const equity = cashBalance + positionsValue;
  const totalPnl = equity - initialBalance;
  const totalPnlPct = initialBalance > 0 ? (totalPnl / initialBalance) * 100 : 0;

  return {
    initialBalance,
    cashBalance,
    positionsValue,
    equity,
    realizedPnl,
    unrealizedPnl,
    totalPnl,
    totalPnlPct,
  };
}
