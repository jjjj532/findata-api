import { createClient, RedisClientType } from 'redis';
import { Quote, OrderBook, OHLCV } from '../types';

const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';

let client: RedisClientType | null = null;

export async function initCache(): Promise<void> {
  client = createClient({ 
    url: REDIS_URL,
    socket: {
      reconnectStrategy: (retries) => {
        if (retries > 3) return new Error('Max retries exceeded');
        return Math.min(retries * 50, 200);
      }
    }
  });
  
  client.on('error', (err) => {
    console.log('Redis error (will continue without cache):', err.message);
  });

  try {
    await client.connect();
    console.log('Redis connected successfully');
  } catch (error) {
    client = null;
    console.log('Redis connection failed, running without cache');
  }
}

export async function getCachedQuotes(): Promise<Quote[] | null> {
  if (!client) return null;
  try {
    const data = await client.get('quotes');
    return data ? JSON.parse(data) : null;
  } catch {
    return null;
  }
}

export async function setCachedQuotes(quotes: Quote[]): Promise<void> {
  if (!client) return;
  try {
    await client.set('quotes', JSON.stringify(quotes), { EX: 30 });
  } catch {
    console.log('Redis cache not available, skipping');
  }
}

export async function getCachedOrderBook(symbol: string): Promise<OrderBook | null> {
  if (!client) return null;
  try {
    const data = await client.get(`orderbook:${symbol}`);
    return data ? JSON.parse(data) : null;
  } catch {
    return null;
  }
}

export async function setCachedOrderBook(symbol: string, orderBook: OrderBook): Promise<void> {
  if (!client) return;
  try {
    await client.set(`orderbook:${symbol}`, JSON.stringify(orderBook), { EX: 10 });
  } catch {
    console.log('Redis cache not available, skipping');
  }
}

export async function getCachedHistory(symbol: string): Promise<OHLCV[] | null> {
  if (!client) return null;
  try {
    const data = await client.get(`history:${symbol}`);
    return data ? JSON.parse(data) : null;
  } catch {
    return null;
  }
}

export async function setCachedHistory(symbol: string, data: OHLCV[]): Promise<void> {
  if (!client) return;
  try {
    await client.set(`history:${symbol}`, JSON.stringify(data), { EX: 3600 });
  } catch {
    console.log('Redis cache not available, skipping');
  }
}

export async function getRateLimit(key: string): Promise<{ remaining: number; resetTime: number }> {
  if (!client) {
    return { remaining: 100, resetTime: Date.now() + 60000 };
  }
  try {
    const remaining = await client.get(`ratelimit:${key}:remaining`);
    const resetTime = await client.get(`ratelimit:${key}:reset`);
    
    return {
      remaining: remaining ? parseInt(remaining) : 100,
      resetTime: resetTime ? parseInt(resetTime) : Date.now() + 60000,
    };
  } catch {
    return { remaining: 100, resetTime: Date.now() + 60000 };
  }
}

export async function updateRateLimit(key: string, limit: number): Promise<boolean> {
  if (!client) return true;
  try {
    const now = Date.now();
    const resetTime = Math.floor(now / 60000) * 60000 + 60000;
    
    const remaining = await client.get(`ratelimit:${key}:remaining`);
    const storedReset = await client.get(`ratelimit:${key}:reset`);
    
    if (!storedReset || parseInt(storedReset) !== resetTime) {
      await client.set(`ratelimit:${key}:remaining`, limit.toString());
      await client.set(`ratelimit:${key}:reset`, resetTime.toString());
      return true;
    }
    
    const currentRemaining = parseInt(remaining || limit.toString());
    if (currentRemaining <= 0) {
      return false;
    }
    
    await client.decr(`ratelimit:${key}:remaining`);
    return true;
  } catch {
    return true;
  }
}