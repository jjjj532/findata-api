import axios from 'axios';
import { DataSource } from './base';
import { Quote, OHLCV } from '../types';

const SINA_STOCK_URL = 'https://hq.sinajs.cn/list';
const SINA_FUTURE_URL = 'https://hq.sinajs.cn/list';

const A_SHARE_SYMBOLS = [
  { symbol: 'sh600519', name: '贵州茅台', market: 'SSE' },
  { symbol: 'sh601318', name: '中国平安', market: 'SSE' },
  { symbol: 'sh600036', name: '招商银行', market: 'SSE' },
  { symbol: 'sz000858', name: '五粮液', market: 'SZSE' },
  { symbol: 'sz000333', name: '美的集团', market: 'SZSE' },
  { symbol: 'sz002594', name: '比亚迪', market: 'SZSE' },
  { symbol: 'sh600276', name: '恒瑞医药', market: 'SSE' },
  { symbol: 'sz300750', name: '宁德时代', market: 'SZSE' },
];

const INDEX_SYMBOLS = [
  { symbol: 'sh000001', name: '上证指数', market: 'SSE' },
  { symbol: 'sz399001', name: '深证成指', market: 'SZSE' },
  { symbol: 'sz399006', name: '创业板指', market: 'SZSE' },
  { symbol: 'sh000300', name: '沪深300', market: 'SSE' },
];

let lastCall = 0;
const minInterval = 500;

async function rateLimit() {
  const now = Date.now();
  const elapsed = now - lastCall;
  if (elapsed < minInterval) {
    await new Promise(resolve => setTimeout(resolve, minInterval - elapsed));
  }
  lastCall = Date.now();
}

function parseSinaStockData(data: string, symbol: string, name: string): Quote | null {
  try {
    const match = data.match(/"(.+)"/);
    if (!match) return null;

    const fields = match[1].split(',');
    if (fields.length < 32) return null;

    const price = parseFloat(fields[3]);
    const open = parseFloat(fields[1]);
    const prevClose = parseFloat(fields[2]);
    const high = parseFloat(fields[4]);
    const low = parseFloat(fields[5]);
    const volume = parseFloat(fields[8]) * 100;
    const change = price - prevClose;
    const changePercent = prevClose > 0 ? (change / prevClose) * 100 : 0;

    return {
      symbol: symbol.replace(/^(sh|sz)/, ''),
      market: symbol.startsWith('sh') ? 'SSE' : 'SZSE',
      assetClass: 'stock',
      name,
      price,
      open,
      high,
      low,
      volume,
      change,
      changePercent,
      timestamp: Date.now(),
    };
  } catch (error) {
    return null;
  }
}

export const sinaFinanceSource: DataSource = {
  name: 'Sina Finance (A股)',
  priority: 1,
  rateLimit: 2,
  rateLimitWindow: 1000,
  supports: {
    stocks: true,
    futures: true,
    indices: true,
    forex: false,
    crypto: false,
    chinaStocks: true,
    usStocks: false,
  },

  async fetchQuote(symbol: string): Promise<Quote | null> {
    try {
      await rateLimit();
      
      const sinaSymbol = symbol.startsWith('sh') || symbol.startsWith('sz') 
        ? symbol 
        : (symbol.length === 6 && /^\d+$/.test(symbol))
          ? (parseInt(symbol) < 600000 ? `sz${symbol}` : `sh${symbol}`)
          : symbol;

      const response = await axios.get(SINA_STOCK_URL, {
        params: { list: sinaSymbol },
        headers: {
          'Referer': 'https://finance.sina.com.cn/',
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
        },
      });

      const nameMatch = response.data.match(/"(.+?)"/);
      const name = nameMatch ? nameMatch[1] : symbol;

      return parseSinaStockData(response.data, sinaSymbol, name);
    } catch (error) {
      console.error(`Sina Finance error for ${symbol}:`, error);
      return null;
    }
  },

  async fetchQuotes(symbols: string[]): Promise<Quote[]> {
    const quotes: Quote[] = [];
    const chunks = [];
    
    for (let i = 0; i < symbols.length; i += 50) {
      chunks.push(symbols.slice(i, i + 50));
    }

    for (const chunk of chunks) {
      try {
        await rateLimit();
        const list = chunk.map(s => {
          if (s.startsWith('sh') || s.startsWith('sz')) return s;
          if (s.length === 6 && /^\d+$/.test(s)) {
            return parseInt(s) < 600000 ? `sz${s}` : `sh${s}`;
          }
          return s;
        }).join(',');

        const response = await axios.get(SINA_STOCK_URL, {
          params: { list },
          headers: {
            'Referer': 'https://finance.sina.com.cn/',
            'User-Agent': 'Mozilla/5.0',
          },
        });

        const stocks = response.data.split('\n');
        for (const stock of stocks) {
          if (!stock.trim()) continue;
          const symbolMatch = stock.match(/hq_str_(\w+)="(.+?)"/);
          if (symbolMatch) {
            const quote = parseSinaStockData(stock, symbolMatch[1], '');
            if (quote) quotes.push(quote);
          }
        }
      } catch (error) {
        console.error('Batch fetch error:', error);
      }
    }

    return quotes;
  },

  async fetchHistory(symbol: string, days: number): Promise<OHLCV[]> {
    try {
      await rateLimit();
      
      const sinaSymbol = symbol.startsWith('sh') || symbol.startsWith('sz') 
        ? symbol 
        : (parseInt(symbol) < 600000 ? `sz${symbol}` : `sh${symbol}`);

      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const response = await axios.get(
        `https://money.finance.sina.com.cn/quotes_service/api/json_v2.php/CN_MarketData.getKLineData`,
        {
          params: {
            symbol: sinaSymbol,
            scale: 240,
            ma: 'no',
            datalen: days,
          },
          headers: {
            'Referer': 'https://finance.sina.com.cn/',
          },
        }
      );

      const data = response.data;
      if (typeof data === 'string') return [];

      return data.map((d: any) => ({
        timestamp: new Date(d.day).getTime(),
        open: parseFloat(d.open),
        high: parseFloat(d.high),
        low: parseFloat(d.low),
        close: parseFloat(d.close),
        volume: parseInt(d.volume) * 100,
      }));
    } catch (error) {
      console.error(`Sina Finance history error for ${symbol}:`, error);
      return [];
    }
  },

  async search(query: string): Promise<{ symbol: string; name: string; market: string }[]> {
    const queryLower = query.toLowerCase();
    const allSymbols = [...A_SHARE_SYMBOLS, ...INDEX_SYMBOLS];
    
    return allSymbols
      .filter(s => 
        s.symbol.includes(query) ||
        s.name.toLowerCase().includes(queryLower)
      )
      .map(s => ({ symbol: s.symbol, name: s.name, market: s.market }));
  },
};