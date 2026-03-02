import { describe, it, expect } from 'vitest';
import {
  calculateSharpeRatio,
  calculateMaxDrawdown,
  calculateBeta,
  calculateIndicator,
} from './quant';

describe('calculateSharpeRatio', () => {
  it('should return 0 for an empty array', () => {
    expect(calculateSharpeRatio([])).toBe(0);
  });

  it('should return 0 when standard deviation is 0', () => {
    expect(calculateSharpeRatio([0.05, 0.05, 0.05], 0.01)).toBe(0);
  });

  it('should calculate the correct Sharpe Ratio', () => {
    // ExpectedReturn: 0.1 / 4 = 0.025
    // RiskFreeRate: 0.01
    // numerator: 0.015
    // variance: ((0.04-0.025)^2 + (0.02-0.025)^2 + (0.05-0.025)^2 + (-0.01-0.025)^2)/4
    // 0.000225 + 0.000025 + 0.000625 + 0.001225 = 0.0021 / 4 = 0.000525
    // stdDev = sqrt(0.000525) ~ 0.0229128784747792
    // sharpe = 0.015 / 0.0229128784747792 ~ 0.6546536707
    const returns = [0.04, 0.02, 0.05, -0.01];
    const sharpe = calculateSharpeRatio(returns, 0.01);
    expect(sharpe).toBeCloseTo(0.6546536707, 7);
  });

  it('should default riskFreeRate to 0.0 if not provided', () => {
    // returns = [0.0, 0.05, -0.05] -> exp = 0
    // var = (0 + 0.0025 + 0.0025)/3 = 0.005/3 = 0.001666...
    // std = 0.0408248
    // sharpe = 0
    expect(calculateSharpeRatio([0.0, 0.05, -0.05])).toBe(0);
    
    // Non-zero example: returns [0.01, 0.02] 
    // expectedReturn = 0.015
    // var = ((0.01-0.015)^2 + (0.02-0.015)^2)/2 = (0.000025+0.000025)/2 = 0.000025
    // std = 0.005
    // sr = 0.015 / 0.005 = 3
    expect(calculateSharpeRatio([0.01, 0.02])).toBeCloseTo(3, 5);
  });
});

describe('calculateMaxDrawdown', () => {
  it('should return 0 for an empty array', () => {
    expect(calculateMaxDrawdown([])).toBe(0);
  });

  it('should return 0 when the portfolio values always increase', () => {
    expect(calculateMaxDrawdown([100, 110, 120, 130])).toBe(0);
  });

  it('should calculate the correct maximum drawdown', () => {
    const portfolioValues = [100, 90, 80, 120, 110, 100, 130];
    // drawdowns from 100: to 90 (10%), to 80 (20%)
    // peak rises to 120, drawdowns: to 110 (8.33%), to 100 (16.66%)
    // peak rises to 130
    // overall max drawdown should be 0.2 (20% from 100 to 80)
    expect(calculateMaxDrawdown(portfolioValues)).toBe(0.2);
  });

  it('should return the correct maximum drawdown when occurs later', () => {
    const portfolioValues = [100, 95, 120, 84];
    // 100 to 95 is 5%
    // peak 120, drop to 84 -> (120-84)/120 = 36/120 = 0.3
    expect(calculateMaxDrawdown(portfolioValues)).toBe(0.3);
  });
});

describe('calculateBeta', () => {
  it('should throw an error for empty arrays', () => {
    expect(() => calculateBeta([], [])).toThrow();
  });

  it('should throw an error if array lengths do not match', () => {
    expect(() => calculateBeta([0.01], [0.01, 0.02])).toThrow();
  });

  it('should return 0 if market variance is 0', () => {
    // If market returns are constant, variance is 0
    expect(calculateBeta([0.01, 0.02], [0.05, 0.05])).toBe(0);
  });

  it('should calculate the correct Beta', () => {
    // Asset moves 50% relative to market
    // Asset: [0.01, 0.04, -0.02], Mean: 0.01
    // Market: [0.02, 0.08, -0.04], Mean: 0.02
    // Asset diffs: [0, 0.03, -0.03]
    // Market diffs: [0, 0.06, -0.06]
    // Covariance sum: 0*0 + 0.03*0.06 + -0.03*-0.06 = 0 + 0.0018 + 0.0018 = 0.0036
    // Market var sum: 0*0 + 0.06*0.06 + -0.06*-0.06 = 0 + 0.0036 + 0.0036 = 0.0072
    // Beta = 0.0036 / 0.0072 = 0.5
    expect(calculateBeta([0.01, 0.04, -0.02], [0.02, 0.08, -0.04])).toBeCloseTo(0.5, 5);
  });
  
  it('should calculate the correct Beta for an inverse asset', () => {
    // Asset moves inversely
    // Asset: [-0.02, -0.08, 0.04], Mean: -0.02
    // Market: [0.01, 0.04, -0.02], Mean: 0.01
    // market_diffs = [0, 0.03, -0.03]
    // asset_diffs = [0, -0.06, 0.06]
    // cov = (0*0) + (-0.06 * +0.03) + (0.06 * -0.03) = -0.0018 - 0.0018 = -0.0036
    // var_m_sum = 0 + 0.0009 + 0.0009 = 0.0018
    // Beta = -0.0036 / 0.0018 = -2
    expect(calculateBeta([-0.02, -0.08, 0.04], [0.01, 0.04, -0.02])).toBeCloseTo(-2, 5);
  });
});

describe('calculateIndicator', () => {
  it('should compute the Simple Moving Average (SMA)', () => {
    const prices = [10, 20, 30, 40, 50, 60];
    const sma = calculateIndicator(prices, 'SMA', 3);
    // (10+20+30)/3 = 20
    // (20+30+40)/3 = 30
    // (30+40+50)/3 = 40
    // (40+50+60)/3 = 50
    expect(sma).toEqual([20, 30, 40, 50]);
  });

  it('should compute the Exponential Moving Average (EMA) with reasonable length limit', () => {
    const prices = [10, 20, 30, 40];
    const ema = calculateIndicator(prices, 'EMA', 2);
    expect(ema.length).toBeGreaterThan(0);
  });

  it('should compute the Relative Strength Index (RSI)', () => {
    const prices = [44.34, 44.09, 44.15, 43.61, 44.33, 44.83, 45.10, 45.42, 45.84, 46.08, 45.89, 46.03, 45.61, 46.28, 46.28];
    const rsi = calculateIndicator(prices, 'RSI', 14);
    // The RSI array should have values and length prices.length - period
    expect(rsi.length).toBe(prices.length - 14);
    expect(rsi[0]).toBeGreaterThan(0);
  });

  it('should throw an error for unsupported indicator type', () => {
    expect(() => calculateIndicator([1, 2, 3], 'MACD' as any, 2)).toThrow(/Unsupported indicator type/);
  });
});
