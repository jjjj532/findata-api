import yfinance from 'yfinance';
import { DataSource } from './base';
import { Quote, OHLCV } from '../types';

const POPULAR_SYMBOLS = [
  { symbol: 'AAPL', name: 'Apple Inc.', market: 'NASDAQ' },
  { symbol: 'GOOGL', name: 'Alphabet Inc.', market: 'NASDAQ' },
  { symbol: 'MSFT', name: 'Microsoft Corp.', market: 'NASDAQ' },
  { symbol: 'AMZN', name: 'Amazon.com Inc.', market: 'NASDAQ' },
  { symbol: 'TSLA', name: 'Tesla Inc.', market: 'NASDAQ' },
  { symbol: 'NVDA', name: 'NVIDIA Corp.', market: 'NASDAQ' },
  { symbol: 'META', name: 'Meta Platforms', market: 'NASDAQ' },
  { symbol: 'JPM', name: 'JPMorgan Chase', market: 'NYSE' },
];

const INDEX_SYMBOLS = [
  { symbol: '^GSPC', name: 'S&P 500', market: 'US' },
  { symbol: '^DJI', name: 'Dow Jones', market: 'US' },
  { symbol: '^IXIC', name: 'NASDAQ Composite', market: 'US' },
];

const CRYPTO_SYMBOLS = [
  { symbol: 'BTC-USD', name: 'Bitcoin', market: 'CRYPTO' },
  { symbol: 'ETH-USD', name: 'Ethereum', market: 'CRYPTO' },
];

const FUTURE_SYMBOLS = [
  { symbol: 'CL=F', name: 'Crude Oil', market: 'NYMEX' },
  { symbol: 'GC=F', name: 'Gold', market: 'COMEX' },
];

export const yahooFinanceSource: DataSource = {
  name: 'Yahoo Finance',
  priority: 1,
  rateLimit: 2000,
  rateLimitWindow: 60000,
  supports: {
    stocks: true,
    futures: true,
    indices: true,
    forex: true,
    crypto: true,
    chinaStocks: false,
    usStocks: true,
  },

  async fetchQuote(symbol: string): Promise<Quote | null> {
    try {
      const ticker = (yfinance as any)(symbol);
      const info = await ticker.info;
      
      if (!info || !info.regularMarketPrice) return null;
      
      const price = info.regularMarketPrice;
      const previousClose = info.previousClose || info.regularMarketPreviousClose || price;
      const change = price - previousClose;
      const changePercent = previousClose > 0 ? (change / previousClose) * 100 : 0;
      
      let assetClass = 'stock';
      if (symbol.startsWith('^')) assetClass = 'index';
      if (symbol.includes('=') || symbol.includes('-USD')) assetClass = 'future';
      
      return {
        symbol: info.symbol || symbol,
        market: info.exchange === 'NMS' ? 'NASDAQ' : info.exchange || 'US',
        assetClass,
        price: parseFloat(price.toFixed(2)),
        open: parseFloat((info.open || price).toFixed(2)),
        high: parseFloat((info.dayHigh || price).toFixed(2)),
        low: parseFloat((info.dayLow || price).toFixed(2)),
        volume: info.volume || 0,
        change: parseFloat(change.toFixed(2)),
        changePercent: parseFloat(changePercent.toFixed(2)),
        timestamp: Date.now(),
      };
    } catch (error) {
      console.error(`Yahoo Finance error for ${symbol}:`, error);
      return null;
    }
  },

  async fetchQuotes(symbols: string[]): Promise<Quote[]> {
    const quotes: Quote[] = [];
    for (const symbol of symbols) {
      const quote = await this.fetchQuote(symbol);
      if (quote) quotes.push(quote);
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    return quotes;
  },

  async fetchHistory(symbol: string, days: number): Promise<OHLCV[]> {
    try {
      const ticker = (yfinance as any)(symbol);
      const history = await ticker.history({ period: `${days}d`, interval: '1d' });
      
      const data: OHLCV[] = [];
      if (history && history.timestamps) {
        for (let i = 0; i < history.timestamps.length; i++) {
          data.push({
            timestamp: new Date(history.timestamps[i]).getTime(),
            open: history.opens?.[i] || history.close?.[i] || 0,
            high: history.highs?.[i] || history.close?.[i] || 0,
            low: history.lows?.[i] || history.close?.[i] || 0,
            close: history.close?.[i] || 0,
            volume: history.volumes?.[i] || 0,
          });
        }
      }
      return data;
    } catch (error) {
      console.error(`Yahoo Finance history error for ${symbol}:`, error);
      return [];
    }
  },

  async search(query: string): Promise<{ symbol: string; name: string; market: string }[]> {
    const queryLower = query.toLowerCase();
    const allSymbols = [...POPULAR_SYMBOLS, ...INDEX_SYMBOLS, ...CRYPTO_SYMBOLS, ...FUTURE_SYMBOLS];
    
    return allSymbols
      .filter(s => 
        s.symbol.toLowerCase().includes(queryLower) ||
        s.name.toLowerCase().includes(queryLower)
      )
      .map(s => ({ symbol: s.symbol, name: s.name, market: s.market }));
  },
};