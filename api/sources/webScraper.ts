import axios from 'axios';
import { Quote } from '../types';

const EM_WAREHOUSE = 'https://push2.eastmoney.com/api/qt/stock/get';
const EM_LIST = 'https://push2.eastmoney.com/api/qt/clist/get';

const USER_AGENT = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

interface ScrapedQuote {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  high: number;
  low: number;
  open: number;
  prevClose: number;
  market: string;
}

async function rateLimit(ms: number = 100) {
  await new Promise(resolve => setTimeout(resolve, ms));
}

export async function scrapeEastMoneyQuote(symbol: string): Promise<Quote | null> {
  try {
    await rateLimit(100);
    
    const secid = symbol.startsWith('sh') || symbol.startsWith('sz')
      ? symbol.replace('sh', '1.').replace('sz', '0.')
      : (parseInt(symbol) < 600000 ? `0.${symbol}` : `1.${symbol}`);

    const response = await axios.get(EM_WAREHOUSE, {
      params: {
        secid,
        fields: 'f43,f44,f45,f46,f47,f48,f57,f58,f107,f169,f170',
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

    const data = response.data.data;
    if (!data) return null;

    const name = data.f58 || symbol;
    const price = data.f43 / 100;
    const open = data.f46 / 100;
    const prevClose = data.f44 / 100;
    const high = data.f45 / 100;
    const low = data.f47 / 100;
    const volume = data.f48;
    const change = data.f169 / 100;
    const changePercent = data.f170 / 100;

    return {
      symbol: symbol.replace(/^(sh|sz)/, ''),
      name,
      market: symbol.startsWith('sh') ? 'SSE' : 'SZSE',
      assetClass: 'stock',
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
    console.error(`East Money scrape error for ${symbol}:`, error);
    return null;
  }
}

export async function scrapeEastMoneyList(market: 'sha' | 'sza' | 'all' = 'all'): Promise<Quote[]> {
  try {
    await rateLimit(200);
    
    const params = {
      pn: 1,
      pz: 50,
      fs: market === 'sha' ? 'm:1+t:2,m:1+t:23,m:1+t:3' : 
          market === 'sza' ? 'm:0+t:6,m:0+t:80,m:0+t:81' :
          'm:1+t:2,m:1+t:3,m:0+t:6,m:0+t:80,m:0+t:81',
      fields: 'f12,f14,f2,f3,f4,f5,f6',
      ut: 'fa5fd1943c7b386f172d6893dbfba10b',
      fltt: 2,
      invt: 2,
    };

    const response = await axios.get(EM_LIST, {
      params,
      headers: {
        'User-Agent': USER_AGENT,
        'Referer': 'https://quote.eastmoney.com/',
      },
    });

    const quotes: Quote[] = [];
    const data = response.data.data;
    
    if (data && data.diff) {
      for (const item of data.diff.slice(0, 50)) {
        quotes.push({
          symbol: item.f12,
          name: item.f14,
          market: item.f12.startsWith('6') ? 'SSE' : 'SZSE',
          assetClass: 'stock',
          price: item.f2 / 100,
          change: item.f3 / 100,
          changePercent: item.f4 / 100,
          volume: item.f5,
          high: 0,
          low: 0,
          open: 0,
          timestamp: Date.now(),
        });
      }
    }

    return quotes;
  } catch (error) {
    console.error('East Money list scrape error:', error);
    return [];
  }
}

export async function scrapeTencentFinance(symbol: string): Promise<Quote | null> {
  try {
    await rateLimit(100);
    
    const qtSymbol = symbol.replace('sh', 'sh').replace('sz', 'sz');
    const response = await axios.get(
      `https://qt.gtimg.cn/q=${qtSymbol}`,
      {
        headers: {
          'User-Agent': USER_AGENT,
          'Referer': 'https://finance.qq.com/',
        },
      }
    );

    const data = response.data;
    const match = data.match(/"([^"]+)"/);
    if (!match) return null;

    const fields = match[1].split('~');
    if (fields.length < 50) return null;

    const name = fields[1];
    const price = parseFloat(fields[3]);
    const prevClose = parseFloat(fields[4]);
    const open = parseFloat(fields[5]);
    const volume = parseInt(fields[6]) * 100;
    const high = parseFloat(fields[33]);
    const low = parseFloat(fields[34]);
    const change = price - prevClose;
    const changePercent = prevClose > 0 ? (change / prevClose) * 100 : 0;

    return {
      symbol: symbol.replace(/^(sh|sz)/, ''),
      name,
      market: symbol.startsWith('sh') ? 'SSE' : 'SZSE',
      assetClass: 'stock',
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
    console.error(`Tencent Finance scrape error for ${symbol}:`, error);
    return null;
  }
}

export async function scrape163Money(symbol: string): Promise<Quote | null> {
  try {
    await rateLimit(100);
    
    const nsSymbol = symbol.replace('sh', '0').replace('sz', '1');
    const response = await axios.get(
      `http://api.money.126.net/data/feed/${nsSymbol}`,
      {
        headers: {
          'User-Agent': USER_AGENT,
          'Referer': 'https://money.163.com/',
        },
      }
    );

    const data = response.data;
    if (!data || !data.price) return null;

    const change = data.price - data.yestclose;
    const changePercent = data.yestclose > 0 ? (change / data.yestclose) * 100 : 0;

    return {
      symbol: symbol.replace(/^(sh|sz)/, ''),
      name: data.name || symbol,
      market: symbol.startsWith('sh') ? 'SSE' : 'SZSE',
      assetClass: 'stock',
      price: data.price,
      open: data.open,
      high: data.high,
      low: data.low,
      volume: data.volume * 100,
      change,
      changePercent,
      timestamp: Date.now(),
    };
  } catch (error) {
    console.error(`163 Money scrape error for ${symbol}:`, error);
    return null;
  }
}

export async function scrapeMultipleSources(symbol: string): Promise<Quote | null> {
  const sources = [
    scrapeEastMoneyQuote,
    scrapeTencentFinance,
    scrape163Money,
  ];

  for (const scraper of sources) {
    try {
      const result = await scraper(symbol);
      if (result && result.price > 0) {
        return result;
      }
    } catch (error) {
      continue;
    }
  }

  return null;
}