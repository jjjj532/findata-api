import { Quote, OHLCV } from '../types';

export interface DataSource {
  name: string;
  priority: number;
  rateLimit: number;
  rateLimitWindow: number;
  supports: {
    stocks: boolean;
    futures: boolean;
    indices: boolean;
    forex: boolean;
    crypto: boolean;
    chinaStocks: boolean;
    usStocks: boolean;
  };
  fetchQuote: (symbol: string) => Promise<Quote | null>;
  fetchQuotes: (symbols: string[]) => Promise<Quote[]>;
  fetchHistory: (symbol: string, days: number) => Promise<OHLCV[]>;
  search: (query: string) => Promise<{ symbol: string; name: string; market: string }[]>;
}

export interface AggregatedQuote extends Quote {
  sources: string[];
  confidence: number;
  lastUpdated: number;
}

export interface DataSourceConfig {
  alphaVantage?: {
    apiKey: string;
  };
  finnhub?: {
    apiKey: string;
  };
  enableScraper: boolean;
  scraperInterval: number;
}

export const DEFAULT_CONFIG: DataSourceConfig = {
  enableScraper: true,
  scraperInterval: 60000,
};