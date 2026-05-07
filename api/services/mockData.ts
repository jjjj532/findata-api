import { Quote, OrderBook, OHLCV } from '../types';

const STOCK_SYMBOLS = [
  { symbol: 'AAPL', name: 'Apple Inc.', market: 'NASDAQ', assetClass: 'stock' },
  { symbol: 'GOOGL', name: 'Alphabet Inc.', market: 'NASDAQ', assetClass: 'stock' },
  { symbol: 'MSFT', name: 'Microsoft Corp.', market: 'NASDAQ', assetClass: 'stock' },
  { symbol: 'AMZN', name: 'Amazon.com Inc.', market: 'NASDAQ', assetClass: 'stock' },
  { symbol: 'TSLA', name: 'Tesla Inc.', market: 'NASDAQ', assetClass: 'stock' },
  { symbol: 'NVDA', name: 'NVIDIA Corp.', market: 'NASDAQ', assetClass: 'stock' },
  { symbol: 'BABA', name: 'Alibaba Group', market: 'HKEX', assetClass: 'stock' },
  { symbol: 'TCEHY', name: 'Tencent Holdings', market: 'HKEX', assetClass: 'stock' },
  { symbol: '600519', name: 'Kweichow Moutai', market: 'SSE', assetClass: 'stock' },
  { symbol: '000858', name: 'Wuliangye', market: 'SZSE', assetClass: 'stock' },
];

const FUTURE_SYMBOLS = [
  { symbol: 'CL', name: 'Crude Oil', market: 'NYMEX', assetClass: 'future' },
  { symbol: 'GC', name: 'Gold', market: 'COMEX', assetClass: 'future' },
  { symbol: 'SI', name: 'Silver', market: 'COMEX', assetClass: 'future' },
  { symbol: 'CU', name: 'Copper', market: 'LME', assetClass: 'future' },
  { symbol: 'ZC', name: 'Corn', market: 'CBOT', assetClass: 'future' },
  { symbol: 'ES', name: 'S&P 500 E-mini', market: 'CME', assetClass: 'future' },
];

const INDICES = [
  { symbol: 'SPX', name: 'S&P 500', market: 'US', assetClass: 'index' },
  { symbol: 'NDX', name: 'NASDAQ 100', market: 'US', assetClass: 'index' },
  { symbol: 'DJI', name: 'Dow Jones', market: 'US', assetClass: 'index' },
  { symbol: 'HSI', name: 'Hang Seng', market: 'HK', assetClass: 'index' },
  { symbol: 'CSI300', name: 'CSI 300', market: 'CN', assetClass: 'index' },
  { symbol: 'SHCOMP', name: 'Shanghai Composite', market: 'CN', assetClass: 'index' },
];

export function generateQuotes(): Quote[] {
  const allSymbols = [...STOCK_SYMBOLS, ...FUTURE_SYMBOLS, ...INDICES];
  
  return allSymbols.map(item => {
    const basePrice = getBasePrice(item.symbol);
    const changePercent = (Math.random() - 0.5) * 4;
    const change = basePrice * changePercent / 100;
    const price = basePrice + change;
    const open = price / (1 + changePercent / 100);
    const high = price * (1 + Math.random() * 0.01);
    const low = price * (1 - Math.random() * 0.01);
    
    return {
      symbol: item.symbol,
      market: item.market,
      assetClass: item.assetClass,
      price: parseFloat(price.toFixed(2)),
      open: parseFloat(open.toFixed(2)),
      high: parseFloat(high.toFixed(2)),
      low: parseFloat(low.toFixed(2)),
      volume: Math.floor(Math.random() * 10000000) + 1000000,
      change: parseFloat(change.toFixed(2)),
      changePercent: parseFloat(changePercent.toFixed(2)),
      timestamp: Date.now(),
    };
  });
}

export function generateOrderBook(symbol: string): OrderBook {
  const basePrice = getBasePrice(symbol);
  const bids: OrderBook['bids'] = [];
  const asks: OrderBook['asks'] = [];
  
  for (let i = 1; i <= 10; i++) {
    bids.push({
      price: parseFloat((basePrice * (1 - i * 0.001)).toFixed(2)),
      size: Math.floor(Math.random() * 1000) + 100,
    });
    
    asks.push({
      price: parseFloat((basePrice * (1 + i * 0.001)).toFixed(2)),
      size: Math.floor(Math.random() * 1000) + 100,
    });
  }
  
  return {
    symbol,
    bids: bids.reverse(),
    asks,
    timestamp: Date.now(),
  };
}

export function generateHistoricalData(symbol: string, days: number = 30): OHLCV[] {
  const data: OHLCV[] = [];
  let basePrice = getBasePrice(symbol);
  const now = Date.now();
  
  for (let i = days; i >= 0; i--) {
    const timestamp = now - i * 24 * 60 * 60 * 1000;
    const volatility = 0.02;
    const change = (Math.random() - 0.5) * volatility * basePrice;
    const open = basePrice;
    const close = parseFloat((basePrice + change).toFixed(2));
    const high = parseFloat((Math.max(open, close) * (1 + Math.random() * 0.01)).toFixed(2));
    const low = parseFloat((Math.min(open, close) * (1 - Math.random() * 0.01)).toFixed(2));
    
    data.push({
      timestamp,
      open: parseFloat(open.toFixed(2)),
      high,
      low,
      close,
      volume: Math.floor(Math.random() * 10000000) + 1000000,
    });
    
    basePrice = close;
  }
  
  return data;
}

function getBasePrice(symbol: string): number {
  const prices: Record<string, number> = {
    'AAPL': 178.50,
    'GOOGL': 141.80,
    'MSFT': 378.90,
    'AMZN': 178.25,
    'TSLA': 248.50,
    'NVDA': 875.30,
    'BABA': 85.60,
    'TCEHY': 41.20,
    '600519': 1688.00,
    '000858': 145.50,
    'CL': 78.45,
    'GC': 2024.50,
    'SI': 23.85,
    'CU': 3.85,
    'ZC': 485.25,
    'ES': 5125.75,
    'SPX': 5130.25,
    'NDX': 17650.50,
    'DJI': 38650.75,
    'HSI': 17850.25,
    'CSI300': 3580.50,
    'SHCOMP': 3050.75,
  };
  
  return prices[symbol] || 100;
}

export function getSymbolInfo(symbol: string) {
  const allSymbols = [...STOCK_SYMBOLS, ...FUTURE_SYMBOLS, ...INDICES];
  return allSymbols.find(s => s.symbol === symbol);
}

export function searchSymbols(query: string) {
  const allSymbols = [...STOCK_SYMBOLS, ...FUTURE_SYMBOLS, ...INDICES];
  return allSymbols.filter(s => 
    s.symbol.toLowerCase().includes(query.toLowerCase()) ||
    s.name.toLowerCase().includes(query.toLowerCase())
  );
}