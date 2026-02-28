/**
 * Technical Indicators Calculation Utilities
 * 
 * Implements SMA, EMA, RSI, and MACD calculations for stock charts.
 * All indicators are calculated from OHLCV historical data.
 */

import type { HistoricalDataPoint, IndicatorValue, MACDValue } from './types/stock';

/**
 * Calculate Simple Moving Average (SMA)
 * SMA = (Sum of closing prices over N periods) / N
 */
export function calculateSMA(
  data: HistoricalDataPoint[],
  period: number
): IndicatorValue[] {
  if (data.length < period) return [];

  const result: IndicatorValue[] = [];

  for (let i = period - 1; i < data.length; i++) {
    let sum = 0;
    for (let j = 0; j < period; j++) {
      sum += data[i - j].close;
    }
    result.push({
      time: data[i].date,
      value: sum / period,
    });
  }

  return result;
}

/**
 * Calculate Exponential Moving Average (EMA)
 * EMA uses a weighting multiplier (alpha) that gives more weight to recent prices
 * EMA = Price × alpha + Previous EMA × (1 - alpha)
 * alpha = 2 / (period + 1)
 */
export function calculateEMA(
  data: HistoricalDataPoint[],
  period: number
): IndicatorValue[] {
  if (data.length < period) return [];

  const result: IndicatorValue[] = [];
  const alpha = 2 / (period + 1);

  // First EMA is the SMA of the first 'period' data points
  let ema = 0;
  for (let i = 0; i < period; i++) {
    ema += data[i].close;
  }
  ema /= period;

  result.push({
    time: data[period - 1].date,
    value: ema,
  });

  // Calculate EMA for subsequent data points
  for (let i = period; i < data.length; i++) {
    ema = data[i].close * alpha + ema * (1 - alpha);
    result.push({
      time: data[i].date,
      value: ema,
    });
  }

  return result;
}

/**
 * Calculate Relative Strength Index (RSI)
 * RSI = 100 - (100 / (1 + RS))
 * RS = Average Gain / Average Loss
 * Uses Wilder's Smoothing method
 */
export function calculateRSI(
  data: HistoricalDataPoint[],
  period: number = 14
): IndicatorValue[] {
  if (data.length < period + 1) return [];

  const result: IndicatorValue[] = [];
  const gains: number[] = [];
  const losses: number[] = [];

  // Calculate price changes
  for (let i = 1; i < data.length; i++) {
    const change = data[i].close - data[i - 1].close;
    gains.push(change > 0 ? change : 0);
    losses.push(change < 0 ? Math.abs(change) : 0);
  }

  // First RSI value uses simple average
  let avgGain = gains.slice(0, period).reduce((a, b) => a + b, 0) / period;
  let avgLoss = losses.slice(0, period).reduce((a, b) => a + b, 0) / period;

  // Calculate RSI for the first period
  if (avgLoss === 0) {
    result.push({
      time: data[period].date,
      value: 100,
    });
  } else {
    const rs = avgGain / avgLoss;
    result.push({
      time: data[period].date,
      value: 100 - 100 / (1 + rs),
    });
  }

  // Calculate RSI for subsequent periods using Wilder's smoothing
  for (let i = period; i < gains.length; i++) {
    avgGain = (avgGain * (period - 1) + gains[i]) / period;
    avgLoss = (avgLoss * (period - 1) + losses[i]) / period;

    if (avgLoss === 0) {
      result.push({
        time: data[i + 1].date,
        value: 100,
      });
    } else {
      const rs = avgGain / avgLoss;
      result.push({
        time: data[i + 1].date,
        value: 100 - 100 / (1 + rs),
      });
    }
  }

  return result;
}

/**
 * Calculate Moving Average Convergence Divergence (MACD)
 * MACD = EMA(12) - EMA(26)
 * Signal = EMA(9) of MACD
 * Histogram = MACD - Signal
 */
export function calculateMACD(
  data: HistoricalDataPoint[],
  fastPeriod: number = 12,
  slowPeriod: number = 26,
  signalPeriod: number = 9
): MACDValue[] {
  if (data.length < slowPeriod + signalPeriod) return [];

  const fastEMA = calculateEMA(data, fastPeriod);
  const slowEMA = calculateEMA(data, slowPeriod);

  if (fastEMA.length === 0 || slowEMA.length === 0) return [];

  // Align the EMAs (fastEMA starts earlier due to shorter period)
  const fastOffset = slowPeriod - fastPeriod;
  const alignedLength = Math.min(fastEMA.length - fastOffset, slowEMA.length);

  // Calculate MACD line
  const macdLine: { time: string; value: number }[] = [];
  for (let i = 0; i < alignedLength; i++) {
    const fastIdx = i + fastOffset;
    if (fastIdx < fastEMA.length && i < slowEMA.length) {
      macdLine.push({
        time: slowEMA[i].time,
        value: fastEMA[fastIdx].value - slowEMA[i].value,
      });
    }
  }

  if (macdLine.length < signalPeriod) return [];

  // Calculate signal line (EMA of MACD)
  const signalEMA: { time: string; value: number }[] = [];
  const alpha = 2 / (signalPeriod + 1);

  // First signal is SMA of MACD
  let signal = 0;
  for (let i = 0; i < signalPeriod; i++) {
    signal += macdLine[i].value;
  }
  signal /= signalPeriod;

  signalEMA.push({
    time: macdLine[signalPeriod - 1].time,
    value: signal,
  });

  // Calculate remaining signal values
  for (let i = signalPeriod; i < macdLine.length; i++) {
    signal = macdLine[i].value * alpha + signal * (1 - alpha);
    signalEMA.push({
      time: macdLine[i].time,
      value: signal,
    });
  }

  // Create MACD result with histogram
  const result: MACDValue[] = [];
  for (let i = 0; i < signalEMA.length; i++) {
    const macdIdx = i + signalPeriod - 1;
    if (macdIdx < macdLine.length) {
      result.push({
        time: signalEMA[i].time,
        macd: macdLine[macdIdx].value,
        signal: signalEMA[i].value,
        histogram: macdLine[macdIdx].value - signalEMA[i].value,
      });
    }
  }

  return result;
}

/**
 * Calculate Bollinger Bands
 * Middle = SMA(20)
 * Upper = Middle + (2 × Standard Deviation)
 * Lower = Middle - (2 × Standard Deviation)
 */
export function calculateBollingerBands(
  data: HistoricalDataPoint[],
  period: number = 20,
  stdDevMultiplier: number = 2
): { time: string; upper: number; middle: number; lower: number }[] {
  if (data.length < period) return [];

  const result: { time: string; upper: number; middle: number; lower: number }[] = [];

  for (let i = period - 1; i < data.length; i++) {
    const slice = data.slice(i - period + 1, i + 1);
    const closes = slice.map(d => d.close);
    
    // Calculate SMA
    const sum = closes.reduce((a, b) => a + b, 0);
    const sma = sum / period;

    // Calculate standard deviation
    const squaredDiffs = closes.map(c => Math.pow(c - sma, 2));
    const variance = squaredDiffs.reduce((a, b) => a + b, 0) / period;
    const stdDev = Math.sqrt(variance);

    result.push({
      time: data[i].date,
      upper: sma + stdDevMultiplier * stdDev,
      middle: sma,
      lower: sma - stdDevMultiplier * stdDev,
    });
  }

  return result;
}

/**
 * Calculate On-Balance Volume (OBV)
 * Cumulative volume indicator
 */
export function calculateOBV(
  data: HistoricalDataPoint[]
): IndicatorValue[] {
  if (data.length === 0) return [];

  const result: IndicatorValue[] = [{ time: data[0].date, value: data[0].volume }];

  for (let i = 1; i < data.length; i++) {
    let obv = result[i - 1].value;
    
    if (data[i].close > data[i - 1].close) {
      obv += data[i].volume;
    } else if (data[i].close < data[i - 1].close) {
      obv -= data[i].volume;
    }

    result.push({ time: data[i].date, value: obv });
  }

  return result;
}

/**
 * Generate simulated historical data for testing/demo
 * In production, this would come from an API endpoint
 */
export function generateSimulatedHistoricalData(
  symbol: string,
  days: number = 365,
  startPrice: number = 100
): HistoricalDataPoint[] {
  const data: HistoricalDataPoint[] = [];
  let currentDate = new Date();
  let price = startPrice;
  let volume = Math.floor(Math.random() * 10000000) + 1000000;

  for (let i = 0; i < days; i++) {
    const date = new Date(currentDate);
    date.setDate(date.getDate() - i);
    
    // Skip weekends
    if (date.getDay() === 0 || date.getDay() === 6) continue;

    const dailyVolatility = 0.02; // 2% daily volatility
    const change = price * dailyVolatility * (Math.random() - 0.5) * 2;
    
    const open = price;
    const close = price + change;
    const high = Math.max(open, close) * (1 + Math.random() * 0.01);
    const low = Math.min(open, close) * (1 - Math.random() * 0.01);
    const dayVolume = volume + Math.floor(Math.random() * 5000000 - 2500000);

    data.push({
      date: date.toISOString().split('T')[0],
      open: Math.round(open * 100) / 100,
      high: Math.round(high * 100) / 100,
      low: Math.round(low * 100) / 100,
      close: Math.round(close * 100) / 100,
      volume: Math.max(0, dayVolume),
    });

    price = close;
    volume = dayVolume;
  }

  return data.reverse(); // Return in chronological order
}

/**
 * Validate indicator parameters
 */
export function validateIndicatorParams(
  type: string,
  params: Record<string, number>
): { valid: boolean; error?: string } {
  switch (type) {
    case 'sma':
    case 'ema':
      if (!params.period || params.period < 2 || params.period > 500) {
        return { valid: false, error: 'Period must be between 2 and 500' };
      }
      return { valid: true };

    case 'rsi':
      if (!params.period || params.period < 2 || params.period > 500) {
        return { valid: false, error: 'Period must be between 2 and 500' };
      }
      return { valid: true };

    case 'macd':
      if (!params.fastPeriod || !params.slowPeriod || !params.signalPeriod) {
        return { valid: false, error: 'MACD requires fastPeriod, slowPeriod, and signalPeriod' };
      }
      if (params.fastPeriod >= params.slowPeriod) {
        return { valid: false, error: 'fastPeriod must be less than slowPeriod' };
      }
      if (params.fastPeriod < 2 || params.slowPeriod < 2 || params.signalPeriod < 2) {
        return { valid: false, error: 'All periods must be at least 2' };
      }
      return { valid: true };

    default:
      return { valid: false, error: `Unknown indicator type: ${type}` };
  }
}