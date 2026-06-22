// خدمة الاتصال اللحظي بـ Binance WebSocket — أسعار التيكر وتحديثات الشموع الحية
// تشمل إعادة الاتصال التلقائي عند انقطاع الشبكة، مع تجنب إعادة الفتح غير الضرورية

import type { Kline, MiniTicker, Timeframe } from '../types/market';

const WS_BASE = 'wss://stream.binance.com:9443';
const RECONNECT_DELAY_MS = 3000;

type TickerHandler = (ticker: MiniTicker) => void;

interface RawCombinedMessage {
  stream: string;
  data: {
    e: string;
    s: string;
    c: string;
    o: string;
    h: string;
    l: string;
    v: string;
  };
}

/**
 * يفتح اتصالاً واحداً متعدد الرموز (Combined Stream) لمتابعة أسعار قائمة المراقبة بالكامل.
 * عند تغيّر قائمة الرموز يُعاد فتح الاتصال تلقائياً بالقائمة الجديدة.
 */
export class MiniTickerSocket {
  private ws: WebSocket | null = null;
  private symbols: string[] = [];
  private handlers = new Set<TickerHandler>();
  private reconnectTimer: number | null = null;
  private closedByClient = false;

  updateSymbols(symbols: string[]): void {
    const normalized = [...symbols].map((s) => s.toUpperCase()).sort();
    const current = [...this.symbols].sort();
    if (JSON.stringify(normalized) === JSON.stringify(current)) return;

    this.symbols = symbols.map((s) => s.toUpperCase());
    this.closedByClient = false;
    this.reopen();
  }

  subscribe(handler: TickerHandler): () => void {
    this.handlers.add(handler);
    return () => this.handlers.delete(handler);
  }

  disconnect(): void {
    this.closedByClient = true;
    this.clearReconnectTimer();
    this.ws?.close();
    this.ws = null;
  }

  private reopen(): void {
    this.clearReconnectTimer();
    this.ws?.close();
    this.ws = null;

    if (this.symbols.length === 0) return;

    const streams = this.symbols.map((s) => `${s.toLowerCase()}@miniTicker`).join('/');
    const url = `${WS_BASE}/stream?streams=${streams}`;

    const socket = new WebSocket(url);
    this.ws = socket;

    socket.onmessage = (event) => {
      try {
        const parsed = JSON.parse(event.data) as RawCombinedMessage;
        const d = parsed.data;
        if (!d) return;
        const open = parseFloat(d.o);
        const close = parseFloat(d.c);
        const ticker: MiniTicker = {
          symbol: d.s,
          lastPrice: close,
          openPrice: open,
          highPrice: parseFloat(d.h),
          lowPrice: parseFloat(d.l),
          volume: parseFloat(d.v),
          changePercent: open !== 0 ? ((close - open) / open) * 100 : 0,
          updatedAt: Date.now(),
        };
        this.handlers.forEach((handler) => handler(ticker));
      } catch {
        // تجاهل أي رسالة لا يمكن تحليلها لتفادي توقف الاتصال بالكامل
      }
    };

    socket.onclose = () => {
      if (!this.closedByClient) this.scheduleReconnect();
    };

    socket.onerror = () => {
      socket.close();
    };
  }

  private scheduleReconnect(): void {
    if (this.reconnectTimer !== null) return;
    this.reconnectTimer = window.setTimeout(() => {
      this.reconnectTimer = null;
      this.reopen();
    }, RECONNECT_DELAY_MS);
  }

  private clearReconnectTimer(): void {
    if (this.reconnectTimer !== null) {
      window.clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
  }
}

interface RawKlineMessage {
  e: string;
  k: {
    t: number;
    T: number;
    o: string;
    h: string;
    l: string;
    c: string;
    v: string;
    x: boolean;
  };
}

type KlineHandler = (kline: Kline) => void;

/** يتابع شموع رمز وفريم زمني واحد لحظياً (لتحديث الشارت دون إعادة جلب كاملة) */
export class KlineSocket {
  private ws: WebSocket | null = null;
  private reconnectTimer: number | null = null;
  private closedByClient = false;
  private symbol = '';
  private interval: Timeframe = '1m';
  private handler: KlineHandler | null = null;

  connect(symbol: string, interval: Timeframe, handler: KlineHandler): void {
    this.symbol = symbol.toLowerCase();
    this.interval = interval;
    this.handler = handler;
    this.closedByClient = false;
    this.open();
  }

  disconnect(): void {
    this.closedByClient = true;
    this.clearReconnectTimer();
    this.ws?.close();
    this.ws = null;
  }

  private open(): void {
    const url = `${WS_BASE}/ws/${this.symbol}@kline_${this.interval}`;
    const socket = new WebSocket(url);
    this.ws = socket;

    socket.onmessage = (event) => {
      try {
        const parsed = JSON.parse(event.data) as RawKlineMessage;
        const k = parsed.k;
        if (!k || !this.handler) return;
        this.handler({
          openTime: k.t,
          open: parseFloat(k.o),
          high: parseFloat(k.h),
          low: parseFloat(k.l),
          close: parseFloat(k.c),
          volume: parseFloat(k.v),
          closeTime: k.T,
          isClosed: k.x,
        });
      } catch {
        // تجاهل أي رسالة غير صالحة
      }
    };

    socket.onclose = () => {
      if (!this.closedByClient) this.scheduleReconnect();
    };

    socket.onerror = () => {
      socket.close();
    };
  }

  private scheduleReconnect(): void {
    if (this.reconnectTimer !== null) return;
    this.reconnectTimer = window.setTimeout(() => {
      this.reconnectTimer = null;
      this.open();
    }, RECONNECT_DELAY_MS);
  }

  private clearReconnectTimer(): void {
    if (this.reconnectTimer !== null) {
      window.clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
  }
}
