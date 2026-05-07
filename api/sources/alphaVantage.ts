import axios from 'axios';
import { DataSource } from './base';
import { Quote, OHLCV } from '../types';

const BASE_URL = 'https://www.alphavantage.co/query';

export function createAlphaVantageSource(apiKey: string): DataSource {
  let lastCall = 0;
  const minInterval = 12000;

  async function rateLimit() {
    const now = Date.now();
    const elapsed = now - lastCall;
    if (elapsed < minInterval) {
      await new Promise(resolve => setTimeout(resolve, minInterval - elapsed));
    }
    lastCall = Date.now();
  }

  return {
    name: 'Alpha Vantage',
    priority: 2,
    rateLimit: 5,
    rateLimitWindow: 60000,
    supports: {
      stocks: true,
      futures: false,
      indices: true,
      forex: true,
      crypto: true,
      chinaStocks: false,
      usStocks: true,
    },

    async fetchQuote(symbol: string): Promise<Quote | null> {
      try {
        await rateLimit();
        
        const response = await axios.get(BASE_URL, {
          params: {
            function: 'GLOBAL_QUOTE',
            symbol,
            apikey: apiKey,
          },
        });

        const data = response.data['Global Quote'];
        if (!data || !data['05. price']) return null;

        return {
          symbol: data['01. symbol'],
          market: 'US',
          assetClass: symbol.startsWith('^') ? 'index' : 'stock',
          price: parseFloat(data['05. price']),
          open: parseFloat(data['02. open']),
          high: parseFloat(data['03. high']),
          low: parseFloat(data['04. low']),
          volume: parseInt(data['06. volume']),
          change: parseFloat(data['09. change']),
          changePercent: parseFloat(data['10. change percent']?.replace('%', '') || '0'),
          timestamp: parseInt(data['07. latest trading day']?.replace(/-/g, '')) * 1000,
        };
      } catch (error) {
        console.error(`Alpha Vantage error for ${symbol}:`, error);
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
        
        const response = await axios.get(BASE_URL, {
          params: {
            function: 'TIME_SERIES_DAILY',
            symbol,
            apikey: apiKey,
            outputsize: days > 100 ? 'full' : 'compact',
          },
        });

        const timeSeries = response.data['Time Series (Daily)'];
        if (!timeSeries) return [];

        const data: OHLCV[] = [];
        const entries = Object.entries(timeSeries).slice(0, days);

        for (const [date, values] of entries) {
          const v = values as any;
          data.push({
            timestamp: new Date(date).getTime(),
            open: parseFloat(v['1. open']),
            high: parseFloat(v['2. high']),
            low: parseFloat(v['3. low']),
            close: parseFloat(v['4. close']),
            volume: parseInt(v['5. volume']),
          });
        }

        return data.reverse();
      } catch (error) {
        console.error(`Alpha Vantage history error for ${symbol}:`, error);
        return [];
      }
    },

    async search(query: string): Promise<{ symbol: string; name: string; market: string }[]> {
      try {
        await rateLimit();
        
        const response = await axios.get(BASE_URL, {
          params: {
            function: 'SYMBOL_SEARCH',
            keywords: query,
            apikey: apiKey,
          },
        });

        const matches = response.data.bestMatches || [];
        return matches.map((m: any) => ({
          symbol: m['1. symbol'],
          name: m['2. name'],
          market: m['4. region'],
        }));
      } catch (error) {
        console.error(`Alpha Vantage search error:`, error);
        return [];
      }
    },
  };
}