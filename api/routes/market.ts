import express, { Request, Response } from 'express';
import { Quote, OrderBook, OHLCV, ApiResponse } from '../types';
import { generateQuotes, generateOrderBook, generateHistoricalData, searchSymbols } from '../services/mockData';
import { getCachedQuotes, setCachedQuotes, getCachedOrderBook, setCachedOrderBook, getCachedHistory, setCachedHistory, getRateLimit, updateRateLimit } from '../services/cache';

const router = express.Router();

const RATE_LIMIT = 100;

router.use(async (req: Request, res: Response, next) => {
  const apiKey = req.headers['x-api-key'] || 'default';
  const ip = req.ip || 'unknown';
  const key = `${apiKey}:${ip}`;
  
  const rateLimitInfo = await getRateLimit(key);
  const allowed = await updateRateLimit(key, RATE_LIMIT);
  
  res.setHeader('X-RateLimit-Limit', RATE_LIMIT);
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
    
    let quotes: Quote[];
    const cached = await getCachedQuotes();
    
    if (cached) {
      quotes = cached;
    } else {
      quotes = generateQuotes();
      await setCachedQuotes(quotes);
    }
    
    if (symbols) {
      const symbolList = (symbols as string).split(',');
      quotes = quotes.filter(q => symbolList.includes(q.symbol));
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
    res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
});

router.get('/quotes/:symbol', async (req: Request, res: Response) => {
  try {
    const { symbol } = req.params;
    
    let quotes = await getCachedQuotes();
    if (!quotes) {
      quotes = generateQuotes();
      await setCachedQuotes(quotes);
    }
    
    const quote = quotes.find(q => q.symbol === symbol);
    
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
    
    let orderBook = await getCachedOrderBook(symbol);
    
    if (!orderBook) {
      orderBook = generateOrderBook(symbol);
      await setCachedOrderBook(symbol, orderBook);
    }
    
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
    
    let history = await getCachedHistory(symbol);
    
    if (!history) {
      history = generateHistoricalData(symbol, days);
      await setCachedHistory(symbol, history);
    }
    
    const response: ApiResponse<{ symbol: string; interval: string; data: OHLCV[] }> = {
      success: true,
      data: {
        symbol,
        interval,
        data: history,
      },
    };
    
    res.json(response);
  } catch (error) {
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
    
    const results = searchSymbols(query as string);
    
    const response: ApiResponse<{ symbol: string; name: string; market: string; assetClass: string }[]> = {
      success: true,
      data: results,
    };
    
    res.json(response);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
});

export default router;