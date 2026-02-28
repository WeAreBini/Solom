/**
 * Technical Indicators Library for Financial Charts
 * 
 * This module provides functions to calculate common technical indicators
 * used in financial analysis: SMA, EMA, RSI, and MACD.
 */

import type { HistoricalDataPoint, IndicatorValue, MACDValue } from './types/stock';

// ============================================
// Types
// ============================================

export interface IndicatorValidation {
  valid: boolean;
  error?: string;
}

export interface SMAParams {
  period: number;
}

export interface EMAParams {
  period: number;
}

export interface RSIParams {
  period: number;
}

export interface MACDParams {
  fastPeriod: number;
  slowPeriod: number;
  signalPeriod: number;
}

// ============================================
// Validation
// ============================================

const VALIDATION_RULES = {
  sma: { minPeriod: 2, maxPeriod: 500 },
  ema: { minPeriod: 2, maxPeriod: 500 },
  rsi: { minPeriod: 2, maxPeriod: 500 },
  macd: { 
    minFastPeriod: 2, 
    maxFastPeriod: 200,
    minSlowPeriod: 2, 
    maxSlowPeriod: 200,
    minSignalPeriod: 2, 
    maxSignalPeriod: 200,
  },
};

/**
 * Validate indicator parameters
 */
export function validateIndicatorParams(
  type: string,
  params: Record<string, number>
): IndicatorValidation {
  switch (type) {
    case 'sma': {
      const period = params.period;
      if (!Number.isFinite(period) || period < VALIDATION_RULES.sma.minPeriod) {
        return { valid: false, error: `SMA period must be at least ${VALIDATION_RULES.sma.minPeriod}` };
      }
      if (period > VALIDATION_RULES.sma.maxPeriod) {
        return { valid: false, error: `SMA period cannot exceed ${VALIDATION_RULES.sma.maxPeriod}` };
      }
      return { valid: true };
    }

    case 'ema': {
      const period = params.period;
      if (!Number.isFinite(period) || period < VALIDATION_RULES.ema.minPeriod) {
        return { valid: false, error: `EMA period must be at least ${VALIDATION_RULES.ema.minPeriod}` };
      }
      if (period > VALIDATION_RULES.ema.maxPeriod) {
        return { valid: false, error: `EMA period cannot exceed ${VALIDATION_RULES.ema.maxPeriod}` };
      }
      return { valid: true };
    }

    case 'rsi': {
      const period = params.period;
      if (!Number.isFinite(period) || period < VALIDATION_RULES.rsi.minPeriod) {
        return { valid: false, error: `RSI period must be at least ${VALIDATION_RULES.rsi.minPeriod}` };
      }
      if (period > VALIDATION_RULES.rsi.maxPeriod) {
        return { valid: false, error: `RSI period cannot exceed ${VALIDATION_RULES.rsi.maxPeriod}` };
      }
      return { valid: true };
    }

    case 'macd': {
      const { fastPeriod, slowPeriod, signalPeriod } = params;
      
      if (!Number.isFinite(fastPeriod) || fastPeriod < VALIDATION_RULES.macd.minFastPeriod) {
        return { valid: false, error: `MACD fast period must be at least ${VALIDATION_RULES.macd.minFastPeriod}` };
      }
      if (fastPeriod > VALIDATION_RULES.macd.maxFastPeriod) {
        return { valid: false, error: `MACD fast period cannot exceed ${VALIDATION_RULES.macd.maxFastPeriod}` };
      }
      if (!Number.isFinite(slowPeriod) || slowPeriod < VALIDATION_RULES.macd.minSlowPeriod) {
        return { valid: false, error: `MACD slow period must be at least ${VALIDATION_RULES.macd.minSlowPeriod}` };
      }
      if (slowPeriod > VALIDATION_RULES.macd.maxSlowPeriod) {
        return { valid: false, error: `MACD slow period cannot exceed ${VALIDATION_RULES.macd.maxSlowPeriod}` };
      }
      if (!Number.isFinite(signalPeriod) || signalPeriod < VALIDATION_RULES.macd.minSignalPeriod) {
        return { valid: false, error: `MACD signal period must be at least ${VALIDATION_RULES.macd.minSignalPeriod}` };
      }
      if (signalPeriod > VALIDATION_RULES.macd.maxSignalPeriod) {
        return { valid: false, error: `MACD signal period cannot exceed ${VALIDATION_RULES.macd.maxSignalPeriod}` };
      }
      if (fastPeriod >= slowPeriod) {
        return { valid: false, error: 'MACD fast period must be less than slow period' };
      }
      return { valid: true };
    }

    default:
      return { valid: false, error: `Unknown indicator type: ${type}` };
  }
}

// ============================================
// Simple Moving Average (SMA)
// ============================================

/**
 * Calculate Simple Moving Average
 * 
 * SMA = (Sum of prices over N periods) / N
 */
export function calculateSMA(
  data: HistoricalDataPoint[],
  period: number = 20
): IndicatorValue[] {
  if (data.length < period) {
    return [];
  }

  const result: IndicatorValue[] = [];

  for (let i = period - 1; i < data.length; i++) {
    let sum = 0;
    for (let j = i - period + 1; j <= i; j++) {
      sum += data[j].close;
    }
    const sma = sum / period;
    result.push({
      time: data[i].date,
      value: sma,
    });
  }

  return result;
}

// ============================================
// Exponential Moving Average (EMA)
// ============================================

/**
 * Calculate Exponential Moving Average
 * 
 * EMA = Price(t) × k + EMA(y) × (1 − k)
 * where k = 2 / (N + 1)
 */
export function calculateEMA(
  data: HistoricalDataPoint[],
  period: number = 20
): IndicatorValue[] {
  if (data.length < period) {
    return [];
  }

  const result: IndicatorValue[] = [];
  const k = 2 / (period + 1);

  // Start with SMA for the first EMA value
  let sum = 0;
  for (let i = 0; i < period; i++) {
    sum += data[i].close;
  }
  let ema = sum / period;

  result.push({
    time: data[period - 1].date,
    value: ema,
  });

  // Calculate EMA for remaining data points
  for (let i = period; i < data.length; i++) {
    ema = data[i].close * k + ema * (1 - k);
    result.push({
      time: data[i].date,
      value: ema,
    });
  }

  return result;
}

// ============================================
// Relative Strength Index (RSI)
// ============================================

/**
 * Calculate Relative Strength Index
 * 
 * RSI = 100 - (100 / (1 + RS))
 * where RS = Average Gain / Average Loss
 * 
 * Uses Wilder's Smoothing for averages
 */
export function calculateRSI(
  data: HistoricalDataPoint[],
  period: number = 14
): IndicatorValue[] {
  if (data.length < period + 1) {
    return [];
  }

  const result: IndicatorValue[] = [];
  const gains: number[] = [];
  const losses: number[] = [];

  // Calculate initial gains and losses
  for (let i = 1; i <= period; i++) {
    const change = data[i].close - data[i - 1].close;
    gains.push(change > 0 ? change : 0);
    losses.push(change < 0 ? Math.abs(change) : 0);
  }

  // Calculate initial average gain and loss
  let avgGain = gains.reduce((a, b) => a + b, 0) / period;
  let avgLoss = losses.reduce((a, b) => a + b, 0) / period;

  // Calculate first RSI
  const rs = avgLoss === 0 ? 0 : avgGain / avgLoss;
  const rsi = avgLoss === 0 ? 100 : 100 - 100 / (1 + rs);

  result.push({
    time: data[period].date,
    value: rsi,
  });

  // Calculate RSI for remaining data points using Wilder's smoothing
  for (let i = period + 1; i < data.length; i++) {
    const change = data[i].close - data[i - 1].close;
    const gain = change > 0 ? change : 0;
    const loss = change < 0 ? Math.abs(change) : 0;

    // Wilder's smoothing: ((previous avg × (period-1)) + current) / period
    avgGain = (avgGain * (period - 1) + gain) / period;
    avgLoss = (avgLoss * (period - 1) + loss) / period;

    const currentRS = avgLoss === 0 ? 0 : avgGain / avgLoss;
    const currentRSI = avgLoss === 0 ? 100 : 100 - 100 / (1 + currentRS);

    result.push({
      time: data[i].date,
      value: currentRSI,
    });
  }

  return result;
}

// ============================================
// Moving Average Convergence Divergence (MACD)
// ============================================

/**
 * Calculate MACD
 * 
 * MACD = EMA(fast) - EMA(slow)
 * Signal = EMA(MACD, signal_period)
 * Histogram = MACD - Signal
 */
export function calculateMACD(
  data: HistoricalDataPoint[],
  fastPeriod: number = 12,
  slowPeriod: number = 26,
  signalPeriod: number = 9
): MACDValue[] {
  if (data.length < slowPeriod + signalPeriod) {
    return [];
  }

  const emaFast = calculateEMA(data, fastPeriod);
  const emaSlow = calculateEMA(data, slowPeriod);

  if (emaFast.length === 0 || emaSlow.length === 0) {
    return [];
  }

  // Calculate MACD line (fast EMA - slow EMA)
  // Find where both EMA series align by time
  const macdData: { time: string; macd: number }[] = [];
  
  // Slow EMA starts later, so we need to align from slowPeriod index
  const slowStartIndex = slowPeriod - fastPeriod;
  
  for (let i = 0; i < emaSlow.length; i++) {
    const fastIndex = i + slowStartIndex;
    if (fastIndex < emaFast.length && fastIndex >= 0) {
      macdData.push({
        time: emaSlow[i].time,
        macd: emaFast[fastIndex].value - emaSlow[i].value,
      });
    }
  }

  if (macdData.length < signalPeriod) {
    return [];
  }

  // Calculate Signal line (EMA of MACD)
  const k = 2 / (signalPeriod + 1);
  
  // Start with SMA of MACD for first signal value
  let sum = 0;
  for (let i = 0; i < signalPeriod; i++) {
    sum += macdData[i].macd;
  }
  let signal = sum / signalPeriod;

  const result: MACDValue[] = [];

  // First MACD data point
  result.push({
    time: macdData[signalPeriod - 1].time,
    macd: macdData[signalPeriod - 1].macd,
    signal: signal,
    histogram: macdData[signalPeriod - 1].macd - signal,
  });

  // Calculate remaining signal values using EMA
  for (let i = signalPeriod; i < macdData.length; i++) {
    signal = macdData[i].macd * k + signal * (1 - k);
    result.push({
      time: macdData[i].time,
      macd: macdData[i].macd,
      signal: signal,
      histogram: macdData[i].macd - signal,
    });
  }

  return result;
}

// ============================================
// Simulated Historical Data Generator
// ============================================

/**
 * Generate simulated historical data for development/testing
 * 
 * This creates realistic-looking OHLCV data with:
 * - Realistic price movements
 * - Daily volatility
 * - Volume patterns
 */
export function generateSimulatedHistoricalData(
  symbol: string,
  days: number
): HistoricalDataPoint[] {
  const result: HistoricalDataPoint[] = [];
  
  // Seed based on symbol for consistency
  let seed = 0;
  for (let i = 0; i < symbol.length; i++) {
    seed += symbol.charCodeAt(i);
  }
  
  const random = () => {
    seed = (seed * 9301 + 49297) % 233280;
    return seed / 233280 - 0.5; // -0.5 to 0.5
  };

  // Starting price varies by symbol
  const basePrice = 50 + (seed % 200);
  let currentPrice = basePrice;
  
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  // Volatility and trend vary by symbol
  const volatility = 0.02 + Math.abs(random()) * 0.03;
  const trendBias = random() * 0.0005; // Slight trend component
  const avgVolume = 1000000 + Math.floor(Math.abs(random()) * 10000000);

  for (let i = 0; i < days; i++) {
    const date = new Date(startDate);
    date.setDate(date.getDate() + i);
    
    // Skip weekends
    if (date.getDay() === 0 || date.getDay() === 6) {
      continue;
    }

    // Calculate daily movement
    const dailyReturn = random() * volatility * 2 + trendBias;
    const priceChange = currentPrice * dailyReturn;
    
    // OHLC values
    const open = currentPrice;
    const close = Math.max(0.01, currentPrice + priceChange);
    const high = Math.max(open, close) * (1 + Math.abs(random()) * 0.01);
    const low = Math.min(open, close) * (1 - Math.abs(random()) * 0.01);
    
    // Volume varies with volatility
    const volumeMultiplier = 1 + Math.abs(dailyReturn) * 10;
    const baseVolume = avgVolume * volumeMultiplier;
    const volume = Math.floor(baseVolume * (0.8 + Math.abs(random()) * 0.4));

    result.push({
      date: date.toISOString().split('T')[0],
      open: Math.round(open * 100) / 100,
      high: Math.round(high * 100) / 100,
      low: Math.round(low * 100) / 100,
      close: Math.round(close * 100) / 100,
      volume: volume,
    });

    currentPrice = close;
  }

  return result;
}

// ============================================
// Export All
// ============================================

export default {
  validateIndicatorParams,
  calculateSMA,
  calculateEMA,
  calculateRSI,
  calculateMACD,
  generateSimulatedHistoricalData,
};