export interface MarketStatus {
  market: 'SSE' | 'SZSE' | 'HKEX' | 'NYSE' | 'NASDAQ';
  isOpen: boolean;
  tradingDay: string;
  session: 'pre_market' | 'regular' | 'after_hours' | 'closed';
  openTime: Date;
  closeTime: Date;
  nextOpen: Date;
  lastUpdate: number;
}

const MARKET_HOURS: Record<string, { open: string; close: string; timezone: string }> = {
  'SSE': { open: '09:30', close: '15:00', timezone: 'Asia/Shanghai' },
  'SZSE': { open: '09:30', close: '15:00', timezone: 'Asia/Shanghai' },
  'HKEX': { open: '09:30', close: '16:00', timezone: 'Asia/Hong_Kong' },
  'NYSE': { open: '09:30', close: '16:00', timezone: 'America/New_York' },
  'NASDAQ': { open: '09:30', close: '16:00', timezone: 'America/New_York' },
};

export function getMarketStatus(market: string): MarketStatus {
  const now = new Date();
  const tradingDay = formatTradingDay(now, market);
  
  const hours = MARKET_HOURS[market] || MARKET_HOURS['NYSE'];
  const { open, close, timezone } = hours;
  
  const [openHour, openMin] = open.split(':').map(Number);
  const [closeHour, closeMin] = close.split(':').map(Number);
  
  const todayOpen = new Date(now);
  todayOpen.setHours(openHour, openMin, 0, 0);
  
  const todayClose = new Date(now);
  todayClose.setHours(closeHour, closeMin, 0, 0);
  
  let session: MarketStatus['session'] = 'closed';
  let isOpen = false;
  
  const currentTime = now.getTime();
  
  if (market === 'NYSE' || market === 'NASDAQ') {
    const preMarketStart = new Date(now);
    preMarketStart.setHours(4, 0, 0, 0);
    const afterHoursEnd = new Date(now);
    afterHoursEnd.setHours(20, 0, 0, 0);
    
    if (currentTime >= todayOpen.getTime() && currentTime <= todayClose.getTime()) {
      isOpen = true;
      session = 'regular';
    } else if (currentTime >= preMarketStart.getTime() && currentTime < todayOpen.getTime()) {
      session = 'pre_market';
    } else if (currentTime > todayClose.getTime() && currentTime <= afterHoursEnd.getTime()) {
      session = 'after_hours';
    }
  } else {
    if (currentTime >= todayOpen.getTime() && currentTime <= todayClose.getTime()) {
      isOpen = true;
      session = 'regular';
    }
  }
  
  let nextOpen = new Date(todayOpen);
  if (currentTime > todayClose.getTime()) {
    nextOpen.setDate(nextOpen.getDate() + 1);
  }
  
  if (market === 'SSE' || market === 'SZSE') {
    while (nextOpen.getDay() === 0 || nextOpen.getDay() === 6) {
      nextOpen.setDate(nextOpen.getDate() + 1);
    }
  }
  
  return {
    market: market as MarketStatus['market'],
    isOpen,
    tradingDay,
    session,
    openTime: todayOpen,
    closeTime: todayClose,
    nextOpen,
    lastUpdate: Date.now(),
  };
}

function formatTradingDay(date: Date, market: string): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  
  if (market === 'SSE' || market === 'SZSE') {
    return `${year}-${month}-${day}`;
  }
  
  return `${year}-${month}-${day}`;
}

export function getAllMarketStatuses(): MarketStatus[] {
  const markets = ['SSE', 'SZSE', 'HKEX', 'NYSE', 'NASDAQ'];
  return markets.map(market => getMarketStatus(market));
}

export function isMarketOpen(symbol: string): boolean {
  let market = 'NYSE';
  
  if (symbol.startsWith('sh') || symbol.startsWith('sz')) {
    market = symbol.startsWith('sh') ? 'SSE' : 'SZSE';
  }
  
  const status = getMarketStatus(market);
  return status.isOpen;
}

export function getTimeUntilMarketOpen(): { market: string; ms: number; formatted: string }[] {
  const markets = ['SSE', 'SZSE', 'HKEX', 'NYSE', 'NASDAQ'];
  const results: { market: string; ms: number; formatted: string }[] = [];
  
  for (const market of markets) {
    const status = getMarketStatus(market);
    if (!status.isOpen) {
      const ms = status.nextOpen.getTime() - Date.now();
      const hours = Math.floor(ms / (1000 * 60 * 60));
      const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
      
      results.push({
        market,
        ms: Math.max(0, ms),
        formatted: `${hours}h ${minutes}m`,
      });
    }
  }
  
  return results.sort((a, b) => a.ms - b.ms);
}

export function getTradingDaysInRange(startDate: Date, endDate: Date): string[] {
  const days: string[] = [];
  const current = new Date(startDate);
  
  while (current <= endDate) {
    const dayOfWeek = current.getDay();
    if (dayOfWeek !== 0 && dayOfWeek !== 6) {
      days.push(formatTradingDay(current, 'SSE'));
    }
    current.setDate(current.getDate() + 1);
  }
  
  return days;
}