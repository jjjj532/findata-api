export interface Quote {
  symbol: string;
  name?: string;
  market: string;
  assetClass: string;
  price: number;
  open: number;
  high: number;
  low: number;
  volume: number;
  change: number;
  changePercent: number;
  timestamp: number;
}

export interface OrderBookLevel {
  price: number;
  size: number;
}

export interface OrderBook {
  symbol: string;
  bids: OrderBookLevel[];
  asks: OrderBookLevel[];
  timestamp: number;
}

export interface OHLCV {
  timestamp: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface Trade {
  symbol: string;
  price: number;
  size: number;
  side: 'buy' | 'sell';
  timestamp: number;
}

export interface Webhook {
  id: string;
  url: string;
  events: ('quote' | 'orderbook' | 'trade')[];
  symbols: string[];
  createdAt: Date;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  meta?: {
    total?: number;
    lastUpdate?: number;
    sources?: string[];
  };
}

export interface RateLimitInfo {
  limit: number;
  remaining: number;
  resetTime: number;
}