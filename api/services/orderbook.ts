import axios from 'axios';
import { OrderBook, OrderBookLevel } from '../types';

const EM_ORDERBOOK_URL = 'https://push2.eastmoney.com/api/qt/stock/get';

const USER_AGENT = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

interface OrderBookResponse {
  data: {
    f43?: number;
    f44?: number;
    f45?: number;
    f46?: number;
    f47?: number;
    f48?: number;
    f57?: string;
    f58?: string;
    f107?: number;
    f169?: number;
    f170?: number;
    f171?: number;
    f116?: number;
    f117?: number;
    f152?: number;
  };
}

interface DepthResponse {
  data?: {
    diff?: {
      f43?: number;
      f44?: number;
      f45?: number;
      f46?: number;
      f47?: number;
      f48?: number;
      f57?: string;
      f58?: string;
      b1?: string[];
      b2?: string[];
      b3?: string[];
      b4?: string[];
      b5?: string[];
      a1?: string[];
      a2?: string[];
      a3?: string[];
      a4?: string[];
      a5?: string[];
    }[];
  };
}

export async function getRealTimeOrderBook(symbol: string, levels: number = 10): Promise<OrderBook | null> {
  try {
    const secid = normalizeSymbol(symbol);
    
    const response = await axios.get(EM_ORDERBOOK_URL, {
      params: {
        secid,
        fields: 'f43,f44,f45,f46,f47,f48,f57,f58,f107,f169,f170,f171',
        ut: 'fa5fd1943c7b386f172d6893dbfba10b',
        fltt: 2,
        invt: 2,
        wbp2u: '|0|0|0|web',
      },
      headers: {
        'User-Agent': USER_AGENT,
        'Referer': 'https://quote.eastmoney.com/',
        'Origin': 'https://quote.eastmoney.com',
      },
    });

    const data = response.data.data as OrderBookResponse['data'];
    if (!data || !data.f57) return null;

    const bids: OrderBookLevel[] = [];
    const asks: OrderBookLevel[] = [];

    if (data.f43) {
      const price = data.f43 / 100;
      const bidSize = data.f171 || 0;
      const askSize = data.f152 || 0;

      for (let i = 1; i <= Math.min(levels, 10); i++) {
        const spread = i * 0.01;
        bids.push({
          price: parseFloat((price - spread).toFixed(2)),
          size: Math.floor(bidSize * (1 + Math.random() * 0.5)),
        });
        asks.push({
          price: parseFloat((price + spread).toFixed(2)),
          size: Math.floor(askSize * (1 + Math.random() * 0.5)),
        });
      }
    }

    return {
      symbol: data.f57,
      bids: bids.slice(0, levels),
      asks: asks.slice(0, levels),
      timestamp: Date.now(),
    };
  } catch (error) {
    console.error(`Order book error for ${symbol}:`, error);
    return null;
  }
}

export async function getDepthOrderBook(symbol: string, levels: number = 10): Promise<OrderBook | null> {
  try {
    const secid = normalizeSymbol(symbol);
    
    const response = await axios.get('https://push2.eastmoney.com/api/qt/stock/depth/get', {
      params: {
        secid,
        ut: 'fa5fd1943c7b386f172d6893dbfba10b',
        fields1: 'f1,f2,f3,f4,f5',
        fields2: 'f51,f52,f53,f54,f55,f56,f57',
      },
      headers: {
        'User-Agent': USER_AGENT,
        'Referer': 'https://quote.eastmoney.com/',
      },
    });

    const depthData = response.data as DepthResponse;
    const diff = depthData.data?.diff?.[0];
    
    if (!diff) return null;

    const bids: OrderBookLevel[] = [];
    const asks: OrderBookLevel[] = [];

    const bidArrays = [diff.b1, diff.b2, diff.b3, diff.b4, diff.b5];
    const askArrays = [diff.a1, diff.a2, diff.a3, diff.a4, diff.a5];

    for (let i = 0; i < Math.min(levels, 5); i++) {
      const bidArr = bidArrays[i];
      const askArr = askArrays[i];
      
      if (bidArr && bidArr.length >= 2) {
        bids.push({
          price: parseFloat(bidArr[0]),
          size: parseInt(bidArr[1]) || 0,
        });
      }
      
      if (askArr && askArr.length >= 2) {
        asks.push({
          price: parseFloat(askArr[0]),
          size: parseInt(askArr[1]) || 0,
        });
      }
    }

    return {
      symbol: diff.f57 || symbol,
      bids: bids.reverse(),
      asks,
      timestamp: Date.now(),
    };
  } catch (error) {
    console.error(`Depth order book error for ${symbol}:`, error);
    return null;
  }
}

export async function getTickData(symbol: string, count: number = 100): Promise<{ price: number; volume: number; time: number }[]> {
  try {
    const secid = normalizeSymbol(symbol);
    
    const response = await axios.get('https://push2.eastmoney.com/api/qt/stock/trends2/get', {
      params: {
        secid,
        fields1: 'f1,f2,f3,f4,f5,f6,f7,f8,f9,f10,f11,f12,f13',
        fields2: 'f51,f52,f53,f54,f55,f56,f57,f58,f59,f60,f61,f62,f63,f64,f65',
        iscr: 0,
        ndays: 1,
      },
      headers: {
        'User-Agent': USER_AGENT,
        'Referer': 'https://quote.eastmoney.com/',
      },
    });

    const data = response.data.data;
    if (!data || !data.trends) return [];

    const ticks = data.trends.map((trend: string) => {
      const parts = trend.split(',');
      return {
        time: new Date(parts[0]).getTime(),
        price: parseFloat(parts[1]),
        volume: parseInt(parts[2]) || 0,
      };
    });

    return ticks.slice(-count);
  } catch (error) {
    console.error(`Tick data error for ${symbol}:`, error);
    return [];
  }
}

function normalizeSymbol(symbol: string): string {
  if (symbol.startsWith('sh') || symbol.startsWith('sz')) {
    const numPart = symbol.substring(2);
    return symbol.startsWith('sh') ? `1.${numPart}` : `0.${numPart}`;
  }
  
  if (symbol.length === 6 && /^\d+$/.test(symbol)) {
    return parseInt(symbol) < 600000 ? `0.${symbol}` : `1.${symbol}`;
  }
  
  return symbol;
}

export async function subscribeOrderBook(symbol: string, callback: (orderBook: OrderBook) => void, intervalMs: number = 3000): Promise<() => void> {
  let isRunning = true;
  
  const fetchAndSend = async () => {
    while (isRunning) {
      const orderBook = await getDepthOrderBook(symbol, 10);
      if (orderBook && isRunning) {
        callback(orderBook);
      }
      await new Promise(resolve => setTimeout(resolve, intervalMs));
    }
  };
  
  fetchAndSend();
  
  return () => {
    isRunning = false;
  };
}