import { Quote } from '../types';
import { scrapeEastMoneyList, scrapeEastMoneyQuote, scrapeTencentFinance } from './webScraper';
import { yahooFinanceSource } from './yahooFinance';
import { sinaFinanceSource } from './sinaFinance';

interface MarketData {
  aShares: Quote[];
  indices: Quote[];
  futures: Quote[];
  usStocks: Quote[];
  crypto: Quote[];
  lastUpdate: number;
}

let marketData: MarketData = {
  aShares: [],
  indices: [],
  futures: [],
  usStocks: [],
  crypto: [],
  lastUpdate: 0,
};

let isCollecting = false;
let collectionInterval: NodeJS.Timeout | null = null;

const A_SHARE_WATCHLIST = [
  'sh600519', 'sh601318', 'sh600036', 'sh600000', 'sh601166', 'sh601398', 'sh601288', 'sh601088',
  'sh600028', 'sh601857', 'sh600050', 'sh600104', 'sh600309', 'sh601012', 'sh600276', 'sh601628',
  'sh600887', 'sh600030', 'sh600031', 'sh601888', 'sh603259', 'sh600745', 'sh002475', 'sz000858',
  'sz000333', 'sz000002', 'sz002594', 'sz000001', 'sz300750', 'sz300015', 'sz002415', 'sz000651',
  'sz300059', 'sz300760', 'sz002230', 'sz300122', 'sz300274', 'sz002371', 'sz300124', 'sz300751',
];

const INDEX_WATCHLIST = [
  'sh000001', 'sz399001', 'sz399006', 'sh000300', 'sh000016', 'sz399005',
];

const US_STOCK_WATCHLIST = [
  'AAPL', 'GOOGL', 'MSFT', 'AMZN', 'TSLA', 'NVDA', 'META', 'BRK.B', 'JPM', 'V',
  'JNJ', 'WMT', 'PG', 'MA', 'UNH', 'HD', 'DIS', 'BAC', 'ADBE', 'CRM',
];

const CRYPTO_WATCHLIST = [
  'BTC-USD', 'ETH-USD', 'BNB-USD', 'XRP-USD', 'ADA-USD', 'DOGE-USD', 'SOL-USD',
];

async function collectAShares(): Promise<Quote[]> {
  const quotes: Quote[] = [];
  
  try {
    const batchQuotes = await scrapeEastMoneyList('all');
    quotes.push(...batchQuotes);
  } catch (error) {
    console.error('East Money list collection error:', error);
  }

  for (const symbol of A_SHARE_WATCHLIST.slice(0, 20)) {
    try {
      const quote = await scrapeEastMoneyQuote(symbol);
      if (quote) {
        const existingIndex = quotes.findIndex(q => q.symbol === quote.symbol);
        if (existingIndex >= 0) {
          quotes[existingIndex] = quote;
        } else {
          quotes.push(quote);
        }
      }
    } catch (error) {
      console.error(`Error collecting ${symbol}:`, error);
    }
    await new Promise(resolve => setTimeout(resolve, 50));
  }

  return quotes;
}

async function collectIndices(): Promise<Quote[]> {
  const quotes: Quote[] = [];
  
  for (const symbol of INDEX_WATCHLIST) {
    try {
      const quote = await scrapeEastMoneyQuote(symbol);
      if (quote) quotes.push(quote);
    } catch (error) {
      console.error(`Index collection error for ${symbol}:`, error);
    }
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  return quotes;
}

async function collectUSStocks(): Promise<Quote[]> {
  const quotes: Quote[] = [];
  
  for (const symbol of US_STOCK_WATCHLIST) {
    try {
      const quote = await yahooFinanceSource.fetchQuote(symbol);
      if (quote) quotes.push(quote);
    } catch (error) {
      console.error(`US Stock collection error for ${symbol}:`, error);
    }
    await new Promise(resolve => setTimeout(resolve, 200));
  }

  return quotes;
}

async function collectCrypto(): Promise<Quote[]> {
  const quotes: Quote[] = [];
  
  for (const symbol of CRYPTO_WATCHLIST) {
    try {
      const quote = await yahooFinanceSource.fetchQuote(symbol);
      if (quote) quotes.push(quote);
    } catch (error) {
      console.error(`Crypto collection error for ${symbol}:`, error);
    }
    await new Promise(resolve => setTimeout(resolve, 200));
  }

  return quotes;
}

export async function collectAllMarketData(): Promise<MarketData> {
  if (isCollecting) {
    return marketData;
  }

  isCollecting = true;
  console.log('Starting full market data collection...');

  try {
    const [aShares, indices, usStocks, crypto] = await Promise.all([
      collectAShares(),
      collectIndices(),
      collectUSStocks(),
      collectCrypto(),
    ]);

    marketData = {
      aShares,
      indices,
      futures: [],
      usStocks,
      crypto,
      lastUpdate: Date.now(),
    };

    console.log(`Market data collected: ${aShares.length} A-shares, ${indices.length} indices, ${usStocks.length} US stocks, ${crypto.length} crypto`);
  } catch (error) {
    console.error('Market data collection error:', error);
  } finally {
    isCollecting = false;
  }

  return marketData;
}

export function startContinuousCollection(intervalMs: number = 60000): void {
  if (collectionInterval) {
    clearInterval(collectionInterval);
  }

  collectAllMarketData();
  
  collectionInterval = setInterval(() => {
    collectAllMarketData();
  }, intervalMs);

  console.log(`Continuous market data collection started (interval: ${intervalMs}ms)`);
}

export function stopContinuousCollection(): void {
  if (collectionInterval) {
    clearInterval(collectionInterval);
    collectionInterval = null;
    console.log('Market data collection stopped');
  }
}

export function getMarketData(): MarketData {
  return marketData;
}

export function getQuotesByMarket(market: 'aShares' | 'indices' | 'usStocks' | 'crypto' | 'futures'): Quote[] {
  return marketData[market] || [];
}

export function searchQuote(symbol: string): Quote | null {
  const allQuotes = [
    ...marketData.aShares,
    ...marketData.indices,
    ...marketData.usStocks,
    ...marketData.crypto,
    ...marketData.futures,
  ];
  
  const normalizedSymbol = symbol.toUpperCase().replace(/^(SH|SZ)/, '');
  
  return allQuotes.find(q => 
    q.symbol === symbol ||
    q.symbol === normalizedSymbol ||
    q.name?.includes(symbol)
  ) || null;
}

export function isDataFresh(): boolean {
  return Date.now() - marketData.lastUpdate < 120000;
}