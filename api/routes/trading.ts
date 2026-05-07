import express, { Request, Response } from 'express';
import { ApiResponse } from '../types';
import { getDepthOrderBook, getRealTimeOrderBook, getTickData } from '../services/orderbook';
import { calculateAllIndicators, TechnicalIndicators } from '../services/indicators';
import { getAllMarketStatuses, getMarketStatus, MarketStatus } from '../services/marketStatus';
import { getAggregatedQuote, getAggregatedHistory } from '../sources/aggregator';

const router = express.Router();

router.get('/orderbook/:symbol', async (req: Request, res: Response) => {
  try {
    const { symbol } = req.params;
    const levels = parseInt(req.query.levels as string) || 10;
    
    const orderBook = await getDepthOrderBook(symbol, levels);
    
    if (!orderBook) {
      return res.status(404).json({
        success: false,
        error: 'Order book not available',
      });
    }
    
    res.json({
      success: true,
      data: orderBook,
    });
  } catch (error) {
    console.error('Order book error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
});

router.get('/ticks/:symbol', async (req: Request, res: Response) => {
  try {
    const { symbol } = req.params;
    const count = parseInt(req.query.count as string) || 100;
    
    const ticks = await getTickData(symbol, count);
    
    res.json({
      success: true,
      data: ticks,
    });
  } catch (error) {
    console.error('Ticks error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
});

router.get('/indicators/:symbol', async (req: Request, res: Response) => {
  try {
    const { symbol } = req.params;
    const days = parseInt(req.query.days as string) || 60;
    
    const history = await getAggregatedHistory(symbol, days);
    
    if (!history || history.length < 20) {
      return res.status(404).json({
        success: false,
        error: 'Insufficient historical data for indicators',
      });
    }
    
    const indicators = calculateAllIndicators(history, symbol);
    
    res.json({
      success: true,
      data: indicators,
    });
  } catch (error) {
    console.error('Indicators error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
});

router.get('/market-status', async (req: Request, res: Response) => {
  try {
    const { market } = req.query;
    
    if (market) {
      const status = getMarketStatus(market as string);
      return res.json({
        success: true,
        data: status,
      });
    }
    
    const statuses = getAllMarketStatuses();
    res.json({
      success: true,
      data: statuses,
    });
  } catch (error) {
    console.error('Market status error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
});

router.get('/quote/:symbol', async (req: Request, res: Response) => {
  try {
    const { symbol } = req.params;
    const days = parseInt(req.query.days as string) || 30;
    
    const [quote, history] = await Promise.all([
      getAggregatedQuote(symbol),
      getAggregatedHistory(symbol, days),
    ]);
    
    if (!quote) {
      return res.status(404).json({
        success: false,
        error: 'Symbol not found',
      });
    }
    
    const indicators = history && history.length >= 20 
      ? calculateAllIndicators(history, symbol)
      : null;
    
    res.json({
      success: true,
      data: {
        quote,
        indicators,
        marketStatus: getMarketStatus(quote.market),
      },
    });
  } catch (error) {
    console.error('Quote error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
});

export default router;