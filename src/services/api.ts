import axios from 'axios';
import { Quote, OrderBook, OHLCV, ApiResponse } from '../types';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api/v1';

const client = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export async function getQuotes(symbols?: string[], market?: string, assetClass?: string): Promise<Quote[]> {
  const params: Record<string, string> = {};
  if (symbols && symbols.length > 0) {
    params.symbols = symbols.join(',');
  }
  if (market) {
    params.market = market;
  }
  if (assetClass) {
    params.assetClass = assetClass;
  }

  const response = await client.get<ApiResponse<Quote[]>>('/quotes', { params });
  return response.data.data || [];
}

export async function getQuote(symbol: string): Promise<Quote | null> {
  const response = await client.get<ApiResponse<Quote>>(`/quotes/${symbol}`);
  return response.data.data || null;
}

export async function getOrderBook(symbol: string, levels: number = 10): Promise<OrderBook | null> {
  const response = await client.get<ApiResponse<OrderBook>>(`/orderbook/${symbol}`, {
    params: { levels },
  });
  return response.data.data || null;
}

export async function getHistoricalData(symbol: string, days: number = 30, interval: string = '1d'): Promise<OHLCV[] | null> {
  const response = await client.get<ApiResponse<{ symbol: string; interval: string; data: OHLCV[] }>>(
    `/history/${symbol}`,
    {
      params: { days, interval },
    }
  );
  return response.data.data?.data || null;
}

export async function searchSymbols(query: string): Promise<{ symbol: string; name: string; market: string; assetClass: string }[]> {
  const response = await client.get<ApiResponse<{ symbol: string; name: string; market: string; assetClass: string }[]>>(
    '/search',
    {
      params: { query },
    }
  );
  return response.data.data || [];
}