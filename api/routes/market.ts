import express, { Request, Response } from 'express';
import { Quote, OrderBook, OHLCV, ApiResponse } from '../types';
import { generateQuotes, generateOrderBook, generateHistoricalData, searchSymbols as mockSearchSymbols } from '../services/mockData';
import { getQuotes, getQuote, getHistoricalData, searchSymbols } from '../services/yahooFinance';
import { getRateLimit, updateRateLimit } from '../services/cache';

const router = express.Router();

const RATE_LIMIT = 100;
const USE_REAL_DATA = process.env.USE_REAL_DATA === 'true';

router.use(async (req: Request, res: Response, next) => {
  const apiKey = req.headers['x-api-key'] || 'default';
  const ip = req.ip || 'unknown';
  const key = `${apiKey}:${ip}`;
  
  const rateLimitInfo = await getRateLimit(key);
  const allowed = await updateRateLimit(key, RATE_LIMIT);
  
  res.setHeader('X-RateLimit-Limit', RATE_LIMIT.toString());
  res.setHeader('X-RateLimit-Remaining', rateLimitInfo.remaining.toString());
  res.setHeader('X-RateLimit-Reset', rateLimitInfo.resetTime.toString());
  
  if (!allowed) {
    return res.status(429).json({
      success: false,
      error: 'Rate limit exceeded',
    });
  }
  
  next();
});

router.get('/quotes', async (req: Request, res: Response) => {
  try {
    const { symbols, market, assetClass } = req.query;
    const symbolList = symbols ? (symbols as string).split(',') : undefined;
    
    let quotes: Quote[];
    
    if (USE_REAL_DATA) {
      quotes = await getQuotes(symbolList);
    } else {
      quotes = generateQuotes();
    }
    
    if (market) {
      quotes = quotes.filter(q => q.market === market);
    }
    
    if (assetClass) {
      quotes = quotes.filter(q => q.assetClass === assetClass);
    }
    
    const response: ApiResponse<Quote[]> = {
      success: true,
      data: quotes,
    };
    
    res.json(response);
  } catch (error) {
    console.error('Error fetching quotes:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
});

router.get('/quotes/:symbol', async (req: Request, res: Response) => {
  try {
    const { symbol } = req.params;
    
    let quote: Quote | null;
    
    if (USE_REAL_DATA) {
      quote = await getQuote(symbol);
    } else {
      const quotes = generateQuotes();
      quote = quotes.find(q => q.symbol === symbol) || null;
    }
    
    if (!quote) {
      return res.status(404).json({
        success: false,
        error: 'Symbol not found',
      });
    }
    
    const response: ApiResponse<Quote> = {
      success: true,
      data: quote,
    };
    
    res.json(response);
  } catch (error) {
    console.error('Error fetching quote:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
});

router.get('/orderbook/:symbol', async (req: Request, res: Response) => {
  try {
    const { symbol } = req.params;
    const levels = parseInt(req.query.levels as string) || 10;
    
    const orderBook = generateOrderBook(symbol);
    
    const response: ApiResponse<OrderBook> = {
      success: true,
      data: {
        ...orderBook,
        bids: orderBook.bids.slice(0, levels),
        asks: orderBook.asks.slice(0, levels),
      },
    };
    
    res.json(response);
  } catch (error) {
    console.error('Error fetching orderbook:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
});

router.get('/history/:symbol', async (req: Request, res: Response) => {
  try {
    const { symbol } = req.params;
    const days = parseInt(req.query.days as string) || 30;
    const interval = req.query.interval as string || '1d';
    
    let data: OHLCV[];
    
    if (USE_REAL_DATA) {
      data = await getHistoricalData(symbol, days);
    } else {
      data = generateHistoricalData(symbol, days);
    }
    
    const response: ApiResponse<{ symbol: string; interval: string; data: OHLCV[] }> = {
      success: true,
      data: {
        symbol,
        interval,
        data,
      },
    };
    
    res.json(response);
  } catch (error) {
    console.error('Error fetching history:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
});

router.get('/search', async (req: Request, res: Response) => {
  try {
    const { query } = req.query;
    
    if (!query) {
      return res.status(400).json({
        success: false,
        error: 'Query parameter is required',
      });
    }
    
    let results;
    if (USE_REAL_DATA) {
      results = await searchSymbols(query as string);
    } else {
      results = mockSearchSymbols(query as string);
    }
    
    const response: ApiResponse<{ symbol: string; name: string; market: string; assetClass: string }[]> = {
      success: true,
      data: results,
    };
    
    res.json(response);
  } catch (error) {
    console.error('Error searching symbols:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
});

export default router;