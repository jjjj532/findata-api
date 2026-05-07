import express, { Request, Response } from 'express';
import { Quote, OrderBook, OHLCV, ApiResponse } from '../types';
import { generateOrderBook } from '../services/mockData';
import { getRateLimit, updateRateLimit } from '../services/cache';
import { getAggregatedQuote, getAggregatedHistory, getAvailableSources } from '../sources/aggregator';
import { collectAllMarketData, getMarketData, startContinuousCollection, searchQuote } from '../sources/fullDataCollector';
import { scrapeEastMoneyQuote } from '../sources/webScraper';
import { sinaFinanceSource } from '../sources/sinaFinance';
import { yahooFinanceSource } from '../sources/yahooFinance';

const router = express.Router();

const RATE_LIMIT = 200;

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
    const { symbols, market, assetClass, source } = req.query;
    
    if (source === 'all' || market || assetClass) {
      const marketData = getMarketData();
      let quotes: Quote[] = [];
      
      if (!market || market === 'aShares' || market === 'all') {
        quotes.push(...marketData.aShares);
      }
      if (!market || market === 'indices' || market === 'all') {
        quotes.push(...marketData.indices);
      }
      if (!market || market === 'usStocks' || market === 'all') {
        quotes.push(...marketData.usStocks);
      }
      if (!market || market === 'crypto' || market === 'all') {
        quotes.push(...marketData.crypto);
      }
      
      if (assetClass) {
        quotes = quotes.filter(q => q.assetClass === assetClass);
      }
      
      if (symbols) {
        const symbolList = (symbols as string).split(',');
        quotes = quotes.filter(q => symbolList.includes(q.symbol));
      }
      
      return res.json({
        success: true,
        data: quotes,
        meta: {
          total: quotes.length,
          lastUpdate: marketData.lastUpdate,
          sources: getAvailableSources(),
        },
      });
    }
    
    const symbolList = symbols ? (symbols as string).split(',') : [];
    const quotes: Quote[] = [];
    
    for (const symbol of symbolList) {
      const quote = await getAggregatedQuote(symbol.trim());
      if (quote) quotes.push(quote as Quote);
    }
    
    res.json({
      success: true,
      data: quotes,
      meta: {
        total: quotes.length,
        sources: getAvailableSources(),
      },
    });
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
    
    let quote = await getAggregatedQuote(symbol);
    
    if (!quote) {
      quote = await scrapeEastMoneyQuote(symbol) || await yahooFinanceSource.fetchQuote(symbol);
    }
    
    if (!quote) {
      return res.status(404).json({
        success: false,
        error: 'Symbol not found',
      });
    }
    
    res.json({
      success: true,
      data: quote,
    });
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
    
    res.json({
      success: true,
      data: {
        ...orderBook,
        bids: orderBook.bids.slice(0, levels),
        asks: orderBook.asks.slice(0, levels),
      },
    });
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
    
    const data = await getAggregatedHistory(symbol, days);
    
    if (!data || data.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Historical data not found',
      });
    }
    
    res.json({
      success: true,
      data: {
        symbol,
        interval: '1d',
        data,
      },
    });
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

    const result = searchQuote(query as string);
    
    if (result) {
      return res.json({
        success: true,
        data: [result],
      });
    }

    const yahooResults = await yahooFinanceSource.search(query as string);
    const sinaResults = await sinaFinanceSource.search(query as string);
    
    const combined = [...yahooResults, ...sinaResults];
    const unique = combined.filter((item, index, self) => 
      index === self.findIndex(t => t.symbol === item.symbol)
    );
    
    res.json({
      success: true,
      data: unique.slice(0, 20),
    });
  } catch (error) {
    console.error('Error searching:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
});

router.get('/market/:type', async (req: Request, res: Response) => {
  try {
    const { type } = req.params;
    const validTypes = ['aShares', 'indices', 'usStocks', 'crypto', 'futures', 'all'];
    
    if (!validTypes.includes(type)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid market type',
      });
    }
    
    if (type === 'all') {
      const data = getMarketData();
      return res.json({
        success: true,
        data,
      });
    }
    
    const data = getMarketData();
    const quotes = data[type as keyof typeof data] || [];
    
    res.json({
      success: true,
      data: quotes,
      meta: {
        total: quotes.length,
        lastUpdate: data.lastUpdate,
      },
    });
  } catch (error) {
    console.error('Error fetching market data:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
});

router.post('/collect', async (req: Request, res: Response) => {
  try {
    const data = await collectAllMarketData();
    res.json({
      success: true,
      message: 'Market data collection triggered',
      data: {
        aShares: data.aShares.length,
        indices: data.indices.length,
        usStocks: data.usStocks.length,
        crypto: data.crypto.length,
        lastUpdate: data.lastUpdate,
      },
    });
  } catch (error) {
    console.error('Error triggering collection:', error);
    res.status(500).json({
      success: false,
      error: 'Collection failed',
    });
  }
});

router.get('/sources', async (req: Request, res: Response) => {
  res.json({
    success: true,
    data: getAvailableSources(),
  });
});

startContinuousCollection(60000);

export default router;