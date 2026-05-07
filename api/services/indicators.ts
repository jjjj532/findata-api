import { OHLCV } from '../types';

export interface TechnicalIndicators {
  symbol: string;
  timestamp: number;
  sma: {
    [key: string]: number;
  };
  ema: {
    [key: string]: number;
  };
  rsi: number;
  macd: {
    macd: number;
    signal: number;
    histogram: number;
  };
  bollingerBands: {
    upper: number;
    middle: number;
    lower: number;
  };
  volume: {
    current: number;
    sma20: number;
    ratio: number;
  };
  atr: number;
}

export function calculateSMA(data: OHLCV[], period: number): number[] {
  const result: number[] = [];
  
  for (let i = 0; i < data.length; i++) {
    if (i < period - 1) {
      result.push(NaN);
      continue;
    }
    
    let sum = 0;
    for (let j = 0; j < period; j++) {
      sum += data[i - j].close;
    }
    result.push(sum / period);
  }
  
  return result;
}

export function calculateEMA(data: OHLCV[], period: number): number[] {
  const result: number[] = [];
  const multiplier = 2 / (period + 1);
  
  let sma = 0;
  for (let i = 0; i < period && i < data.length; i++) {
    sma += data[i].close;
  }
  sma /= period;
  
  for (let i = 0; i < data.length; i++) {
    if (i < period - 1) {
      result.push(NaN);
      continue;
    }
    
    if (i === period - 1) {
      result.push(sma);
    } else {
      const ema = (data[i].close - result[i - 1]) * multiplier + result[i - 1];
      result.push(ema);
    }
  }
  
  return result;
}

export function calculateRSI(data: OHLCV[], period: number = 14): number[] {
  const result: number[] = [];
  const gains: number[] = [];
  const losses: number[] = [];
  
  for (let i = 1; i < data.length; i++) {
    const change = data[i].close - data[i - 1].close;
    gains.push(change > 0 ? change : 0);
    losses.push(change < 0 ? Math.abs(change) : 0);
  }
  
  for (let i = 0; i < data.length; i++) {
    if (i < period) {
      result.push(NaN);
      continue;
    }
    
    let avgGain = 0;
    let avgLoss = 0;
    
    for (let j = 0; j < period; j++) {
      avgGain += gains[i - 1 - j] || 0;
      avgLoss += losses[i - 1 - j] || 0;
    }
    
    avgGain /= period;
    avgLoss /= period;
    
    if (avgLoss === 0) {
      result.push(100);
    } else {
      const rs = avgGain / avgLoss;
      result.push(100 - (100 / (1 + rs)));
    }
  }
  
  return result;
}

export function calculateMACD(
  data: OHLCV[],
  fastPeriod: number = 12,
  slowPeriod: number = 26,
  signalPeriod: number = 9
): { macd: number[]; signal: number[]; histogram: number[] } {
  const emaFast = calculateEMA(data, fastPeriod);
  const emaSlow = calculateEMA(data, slowPeriod);
  
  const macd: number[] = [];
  for (let i = 0; i < data.length; i++) {
    if (isNaN(emaFast[i]) || isNaN(emaSlow[i])) {
      macd.push(NaN);
    } else {
      macd.push(emaFast[i] - emaSlow[i]);
    }
  }
  
  const macdData: OHLCV[] = macd.map((value, index) => ({
    timestamp: data[index].timestamp,
    open: value,
    high: value,
    low: value,
    close: value,
    volume: 0,
  }));
  
  const signal = calculateEMA(macdData, signalPeriod);
  
  const histogram: number[] = [];
  for (let i = 0; i < data.length; i++) {
    if (isNaN(macd[i]) || isNaN(signal[i])) {
      histogram.push(NaN);
    } else {
      histogram.push(macd[i] - signal[i]);
    }
  }
  
  return { macd, signal, histogram };
}

export function calculateBollingerBands(
  data: OHLCV[],
  period: number = 20,
  stdDev: number = 2
): { upper: number[]; middle: number[]; lower: number[] } {
  const sma = calculateSMA(data, period);
  
  const upper: number[] = [];
  const lower: number[] = [];
  
  for (let i = 0; i < data.length; i++) {
    if (isNaN(sma[i])) {
      upper.push(NaN);
      lower.push(NaN);
      continue;
    }
    
    let sumSquares = 0;
    for (let j = 0; j < period; j++) {
      const diff = data[i - j].close - sma[i];
      sumSquares += diff * diff;
    }
    
    const standardDeviation = Math.sqrt(sumSquares / period);
    
    upper.push(sma[i] + stdDev * standardDeviation);
    lower.push(sma[i] - stdDev * standardDeviation);
  }
  
  return { upper, middle: sma, lower };
}

export function calculateATR(data: OHLCV[], period: number = 14): number[] {
  const trueRange: number[] = [];
  
  for (let i = 0; i < data.length; i++) {
    if (i === 0) {
      trueRange.push(data[i].high - data[i].low);
      continue;
    }
    
    const high = data[i].high;
    const low = data[i].low;
    const prevClose = data[i - 1].close;
    
    const tr = Math.max(
      high - low,
      Math.abs(high - prevClose),
      Math.abs(low - prevClose)
    );
    
    trueRange.push(tr);
  }
  
  return calculateEMA(
    trueRange.map((tr, i) => ({
      timestamp: data[i].timestamp,
      open: tr,
      high: tr,
      low: tr,
      close: tr,
      volume: 0,
    })),
    period
  );
}

export function calculateAllIndicators(data: OHLCV[], symbol: string): TechnicalIndicators {
  const sma5 = calculateSMA(data, 5);
  const sma10 = calculateSMA(data, 10);
  const sma20 = calculateSMA(data, 20);
  const sma60 = calculateSMA(data, 60);
  
  const ema12 = calculateEMA(data, 12);
  const ema26 = calculateEMA(data, 26);
  
  const rsi = calculateRSI(data, 14);
  const macd = calculateMACD(data);
  const bollinger = calculateBollingerBands(data);
  const atr = calculateATR(data);
  
  const volumeSMA = calculateSMA(data, 20);
  
  const latestIndex = data.length - 1;
  
  return {
    symbol,
    timestamp: Date.now(),
    sma: {
      'SMA5': sma5[latestIndex] || 0,
      'SMA10': sma10[latestIndex] || 0,
      'SMA20': sma20[latestIndex] || 0,
      'SMA60': sma60[latestIndex] || 0,
    },
    ema: {
      'EMA12': ema12[latestIndex] || 0,
      'EMA26': ema26[latestIndex] || 0,
    },
    rsi: rsi[latestIndex] || 50,
    macd: {
      macd: macd.macd[latestIndex] || 0,
      signal: macd.signal[latestIndex] || 0,
      histogram: macd.histogram[latestIndex] || 0,
    },
    bollingerBands: {
      upper: bollinger.upper[latestIndex] || 0,
      middle: bollinger.middle[latestIndex] || 0,
      lower: bollinger.lower[latestIndex] || 0,
    },
    volume: {
      current: data[latestIndex]?.volume || 0,
      sma20: volumeSMA[latestIndex] || 0,
      ratio: volumeSMA[latestIndex] 
        ? data[latestIndex]?.volume / volumeSMA[latestIndex] 
        : 0,
    },
    atr: atr[latestIndex] || 0,
  };
}