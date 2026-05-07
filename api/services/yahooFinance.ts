import yfinance from 'yfinance';
import { Quote, OrderBook, OHLCV } from '../types';

interface YTicker {
  symbol: string;
  info: any;
  history: (params?: any) => any;
  optionChain: (params?: any) => any;
}

const POPULAR_SYMBOLS = [
  { symbol: 'AAPL', name: 'Apple Inc.', market: 'NASDAQ' },
  { symbol: 'GOOGL', name: 'Alphabet Inc.', market: 'NASDAQ' },
  { symbol: 'MSFT', name: 'Microsoft Corp.', market: 'NASDAQ' },
  { symbol: 'AMZN', name: 'Amazon.com Inc.', market: 'NASDAQ' },
  { symbol: 'TSLA', name: 'Tesla Inc.', market: 'NASDAQ' },
  { symbol: 'NVDA', name: 'NVIDIA Corp.', market: 'NASDAQ' },
  { symbol: 'META', name: 'Meta Platforms', market: 'NASDAQ' },
  { symbol: 'BRK.B', name: 'Berkshire Hathaway', market: 'NYSE' },
  { symbol: 'JPM', name: 'JPMorgan Chase', market: 'NYSE' },
  { symbol: 'V', name: 'Visa Inc.', market: 'NYSE' },
];

const INDEX_SYMBOLS = [
  { symbol: '^GSPC', name: 'S&P 500', market: 'US' },
  { symbol: '^DJI', name: 'Dow Jones', market: 'US' },
  { symbol: '^IXIC', name: 'NASDAQ Composite', market: 'US' },
  { symbol: '^HSI', name: 'Hang Seng', market: 'HK' },
  { symbol: '000001.SS', name: 'Shanghai Composite', market: 'CN' },
];

const FUTURE_SYMBOLS = [
  { symbol: 'CL=F', name: 'Crude Oil', market: 'NYMEX' },
  { symbol: 'GC=F', name: 'Gold', market: 'COMEX' },
  { symbol: 'SI=F', name: 'Silver', market: 'COMEX' },
  { symbol: 'ES=F', name: 'S&P 500 E-mini', market: 'CME' },
];

export async function getQuotes(symbols?: string[]): Promise<Quote[]> {
  const quotes: Quote[] = [];
  const symbolsToFetch = symbols && symbols.length > 0 ? symbols : [...POPULAR_SYMBOLS, ...INDEX_SYMBOLS].map(s => s.symbol);

  for (const symbol of symbolsToFetch) {
    try {
      const ticker = yfinance as any as (symbol: string) => YTicker;
      const t = ticker(symbol);
      const info = await t.info;
      
      if (info && info.regularMarketPrice) {
        const price = info.regularMarketPrice || 0;
        const previousClose = info.previousClose || info.regularMarketPreviousClose || price;
        const change = price - previousClose;
        const changePercent = previousClose > 0 ? (change / previousClose) * 100 : 0;
        
        let assetClass = 'stock';
        if (symbol.startsWith('^')) assetClass = 'index';
        if (symbol.includes('=')) assetClass = 'future';
        
        let market = info.exchange || 'US';
        if (market === 'NMS') market = 'NASDAQ';
        if (market === 'NYQ') market = 'NYSE';

        quotes.push({
          symbol: info.symbol || symbol,
          market,
          assetClass,
          price: parseFloat(price.toFixed(2)),
          open: parseFloat((info.open || price).toFixed(2)),
          high: parseFloat((info.dayHigh || price).toFixed(2)),
          low: parseFloat((info.dayLow || price).toFixed(2)),
          volume: info.volume || 0,
          change: parseFloat(change.toFixed(2)),
          changePercent: parseFloat(changePercent.toFixed(2)),
          timestamp: Date.now(),
        });
      }
    } catch (error) {
      console.error(`Error fetching ${symbol}:`, error);
    }
  }

  return quotes;
}

export async function getQuote(symbol: string): Promise<Quote | null> {
  const quotes = await getQuotes([symbol]);
  return quotes.length > 0 ? quotes[0] : null;
}

export async function getHistoricalData(symbol: string, days: number = 30): Promise<OHLCV[]> {
  try {
    const ticker = yfinance as any as (symbol: string) => YTicker;
    const t = ticker(symbol);
    const history = await t.history({ period: `${days}d`, interval: '1d' });
    
    const data: OHLCV[] = [];
    if (history && history.timestamps) {
      const timestamps = history.timestamps;
      const opens = history.opens || [];
      const highs = history.highs || [];
      const lows = history.lows || [];
      const closes = history.close || [];
      const volumes = history.volumes || [];

      for (let i = 0; i < timestamps.length; i++) {
        data.push({
          timestamp: new Date(timestamps[i]).getTime(),
          open: opens[i] || closes[i],
          high: highs[i] || closes[i],
          low: lows[i] || closes[i],
          close: closes[i],
          volume: volumes[i] || 0,
        });
      }
    }
    
    return data;
  } catch (error) {
    console.error(`Error fetching historical data for ${symbol}:`, error);
    return [];
  }
}

export async function searchSymbols(query: string): Promise<{ symbol: string; name: string; market: string; assetClass: string }[]> {
  const queryLower = query.toLowerCase();
  const allSymbols = [...POPULAR_SYMBOLS, ...INDEX_SYMBOLS];
  
  return allSymbols.filter(s => 
    s.symbol.toLowerCase().includes(queryLower) ||
    s.name.toLowerCase().includes(queryLower)
  ).map(s => ({
    symbol: s.symbol,
    name: s.name,
    market: s.market,
    assetClass: s.symbol.startsWith('^') ? 'index' : 'stock'
  }));
}

export function getSymbolInfo(symbol: string) {
  const allSymbols = [...POPULAR_SYMBOLS, ...INDEX_SYMBOLS, ...FUTURE_SYMBOLS];
  return allSymbols.find(s => s.symbol === symbol);
}