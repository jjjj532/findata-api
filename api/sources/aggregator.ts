import { Quote, OHLCV } from '../types';
import { DataSource, AggregatedQuote } from './base';
import { yahooFinanceSource } from './yahooFinance';
import { createAlphaVantageSource } from './alphaVantage';
import { createFinnhubSource } from './finnhub';
import { sinaFinanceSource } from './sinaFinance';
import { scrapeEastMoneyQuote, scrapeMultipleSources } from './webScraper';

const sources: DataSource[] = [];

if (process.env.ALPHA_VANTAGE_KEY) {
  sources.push(createAlphaVantageSource(process.env.ALPHA_VANTAGE_KEY));
}

if (process.env.FINNHUB_KEY) {
  sources.push(createFinnhubSource(process.env.FINNHUB_KEY));
}

sources.push(yahooFinanceSource);
sources.push(sinaFinanceSource);

sources.sort((a, b) => a.priority - b.priority);

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  source: string;
}

const quoteCache = new Map<string, CacheEntry<Quote>>();
const historyCache = new Map<string, CacheEntry<OHLCV[]>>();

const CACHE_TTL = 10000;
const HISTORY_CACHE_TTL = 5 * 60 * 1000;

function isCacheValid<T>(entry: CacheEntry<T>): boolean {
  return Date.now() - entry.timestamp < CACHE_TTL;
}

function calculateConfidence(sources: string[], dataFreshness: number): number {
  let confidence = 0.5;
  
  if (sources.includes('East Money')) confidence += 0.2;
  if (sources.includes('Yahoo Finance')) confidence += 0.15;
  if (sources.includes('Alpha Vantage')) confidence += 0.15;
  if (sources.includes('Finnhub')) confidence += 0.1;
  
  if (dataFreshness < 5000) confidence += 0.2;
  else if (dataFreshness < 30000) confidence += 0.1;
  
  return Math.min(confidence, 1);
}

export async function getAggregatedQuote(symbol: string): Promise<AggregatedQuote | null> {
  const cacheKey = symbol.toUpperCase();
  const cached = quoteCache.get(cacheKey);
  
  if (cached && isCacheValid(cached)) {
    const freshness = Date.now() - cached.timestamp;
    return {
      ...cached.data,
      sources: [cached.source],
      confidence: calculateConfidence([cached.source], freshness),
      lastUpdated: cached.timestamp,
    };
  }

  const results: Quote[] = [];
  const sourceNames: string[] = [];

  for (const source of sources) {
    try {
      const quote = await source.fetchQuote(symbol);
      if (quote && quote.price > 0) {
        results.push(quote);
        sourceNames.push(source.name);
      }
    } catch (error) {
      console.error(`${source.name} failed for ${symbol}:`, error);
    }
  }

  if (results.length === 0) {
    const scraped = await scrapeMultipleSources(symbol);
    if (scraped) {
      results.push(scraped);
      sourceNames.push('Web Scraper');
    }
  }

  if (results.length === 0) {
    return null;
  }

  const prices = results.map(r => r.price);
  const avgPrice = prices.reduce((a, b) => a + b, 0) / prices.length;
  
  const bestQuote = results.reduce((best, current) => {
    return current.price > best.price ? current : best;
  });

  const aggregated: AggregatedQuote = {
    ...bestQuote,
    price: parseFloat(avgPrice.toFixed(2)),
    sources: sourceNames,
    confidence: calculateConfidence(sourceNames, 0),
    lastUpdated: Date.now(),
  };

  quoteCache.set(cacheKey, {
    data: aggregated,
    timestamp: Date.now(),
    source: sourceNames[0] || 'Unknown',
  });

  return aggregated;
}

export async function getAggregatedQuotes(symbols: string[]): Promise<AggregatedQuote[]> {
  const promises = symbols.map(symbol => getAggregatedQuote(symbol));
  const results = await Promise.all(promises);
  return results.filter((r): r is AggregatedQuote => r !== null);
}

export async function getAggregatedHistory(symbol: string, days: number = 30): Promise<OHLCV[] | null> {
  const cacheKey = `${symbol.toUpperCase()}_${days}`;
  const cached = historyCache.get(cacheKey);
  
  if (cached && isCacheValid(cached)) {
    return cached.data;
  }

  for (const source of sources) {
    try {
      const history = await source.fetchHistory(symbol, days);
      if (history.length > 0) {
        historyCache.set(cacheKey, {
          data: history,
          timestamp: Date.now(),
          source: source.name,
        });
        return history;
      }
    } catch (error) {
      console.error(`${source.name} history failed for ${symbol}:`, error);
    }
  }

  return null;
}

export function getAvailableSources(): string[] {
  return sources.map(s => s.name);
}

export function clearCache(): void {
  quoteCache.clear();
  historyCache.clear();
}

setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of quoteCache.entries()) {
    if (now - entry.timestamp > CACHE_TTL * 2) {
      quoteCache.delete(key);
    }
  }
  for (const [key, entry] of historyCache.entries()) {
    if (now - entry.timestamp > HISTORY_CACHE_TTL * 2) {
      historyCache.delete(key);
    }
  }
}, 60000);