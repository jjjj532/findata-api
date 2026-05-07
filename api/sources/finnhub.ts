import axios from 'axios';
import { DataSource } from './base';
import { Quote, OHLCV } from '../types';

const BASE_URL = 'https://finnhub.io/api/v1';

export function createFinnhubSource(apiKey: string): DataSource {
  let requestCount = 0;
  const resetTime = Date.now() + 60000;

  async function rateLimit() {
    const now = Date.now();
    if (now > resetTime) {
      requestCount = 0;
    }
    if (requestCount >= 60) {
      await new Promise(resolve => setTimeout(resolve, resetTime - now + 1000));
      requestCount = 0;
    }
    requestCount++;
  }

  return {
    name: 'Finnhub',
    priority: 3,
    rateLimit: 60,
    rateLimitWindow: 60000,
    supports: {
      stocks: true,
      futures: false,
      indices: true,
      forex: false,
      crypto: false,
      chinaStocks: false,
      usStocks: true,
    },

    async fetchQuote(symbol: string): Promise<Quote | null> {
      try {
        await rateLimit();
        
        const [quoteRes, profileRes] = await Promise.all([
          axios.get(`${BASE_URL}/quote`, {
            params: { symbol, token: apiKey },
          }),
          axios.get(`${BASE_URL}/stock/profile2`, {
            params: { symbol, token: apiKey },
          }),
        ]);

        const q = quoteRes.data;
        if (!q || q.c === 0) return null;

        const change = q.c - q.pc;
        const changePercent = q.pc > 0 ? (change / q.pc) * 100 : 0;

        return {
          symbol,
          market: profileRes.data.exchange || 'US',
          assetClass: symbol.startsWith('^') ? 'index' : 'stock',
          price: q.c,
          open: q.o,
          high: q.h,
          low: q.l,
          volume: q.v || 0,
          change,
          changePercent,
          timestamp: Date.now(),
        };
      } catch (error) {
        console.error(`Finnhub error for ${symbol}:`, error);
        return null;
      }
    },

    async fetchQuotes(symbols: string[]): Promise<Quote[]> {
      const quotes: Quote[] = [];
      for (const symbol of symbols) {
        const quote = await this.fetchQuote(symbol);
        if (quote) quotes.push(quote);
      }
      return quotes;
    },

    async fetchHistory(symbol: string, days: number): Promise<OHLCV[]> {
      try {
        await rateLimit();
        
        const to = Math.floor(Date.now() / 1000);
        const from = to - (days * 24 * 60 * 60);

        const response = await axios.get(`${BASE_URL}/stock/candle`, {
          params: {
            symbol,
            resolution: 'D',
            from,
            to,
            token: apiKey,
          },
        });

        const data = response.data;
        if (data.s !== 'ok' || !data.t) return [];

        const ohlcv: OHLCV[] = [];
        for (let i = 0; i < data.t.length; i++) {
          ohlcv.push({
            timestamp: data.t[i] * 1000,
            open: data.o[i],
            high: data.h[i],
            low: data.l[i],
            close: data.c[i],
            volume: data.v[i],
          });
        }

        return ohlcv;
      } catch (error) {
        console.error(`Finnhub history error for ${symbol}:`, error);
        return [];
      }
    },

    async search(query: string): Promise<{ symbol: string; name: string; market: string }[]> {
      try {
        await rateLimit();
        
        const response = await axios.get(`${BASE_URL}/search`, {
          params: { q: query, token: apiKey },
        });

        return (response.data.result || []).map((r: any) => ({
          symbol: r.symbol,
          name: r.description,
          market: r.exchange || 'US',
        }));
      } catch (error) {
        console.error(`Finnhub search error:`, error);
        return [];
      }
    },
  };
}