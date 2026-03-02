import { SMA, EMA, RSI } from 'technicalindicators';

/**
 * Calculates the Sharpe Ratio of a portfolio.
 * @param returns Array of periodic returns.
 * @param riskFreeRate The risk-free rate for the same period.
 * @returns The expected Sharpe Ratio.
 */
export function calculateSharpeRatio(returns: number[], riskFreeRate: number = 0.0): number {
  if (returns.length === 0) return 0;
  
  const expectedReturn = returns.reduce((sum, r) => sum + r, 0) / returns.length;
  const excessReturns = returns.map(r => r - riskFreeRate);
  
  const variance = excessReturns.reduce((sum, er) => sum + Math.pow(er - (expectedReturn - riskFreeRate), 2), 0) / returns.length;
  const standardDeviation = Math.sqrt(variance);

  // Handle floating point precision issues for zero variance
  if (standardDeviation < 1e-8) return 0;

  return (expectedReturn - riskFreeRate) / standardDeviation;
}

/**
 * Calculates the Maximum Drawdown of a portfolio.
 * @param portfolioValues Array of historical portfolio values.
 * @returns The maximum drawdown as a decimal (e.g., 0.15 for 15%).
 */
export function calculateMaxDrawdown(portfolioValues: number[]): number {
  if (portfolioValues.length === 0) return 0;
  
  let maxDrawdown = 0;
  let peak = portfolioValues[0];
  
  for (const value of portfolioValues) {
    if (value > peak) {
      peak = value;
    }
    const drawdown = (peak - value) / peak;
    if (drawdown > maxDrawdown) {
      maxDrawdown = drawdown;
    }
  }
  
  return maxDrawdown;
}

/**
 * Calculates the Beta of an asset relative to the market.
 * @param assetReturns Array of asset returns.
 * @param marketReturns Array of market returns.
 * @returns The calculated Beta.
 */
export function calculateBeta(assetReturns: number[], marketReturns: number[]): number {
  if (assetReturns.length !== marketReturns.length || assetReturns.length === 0) {
    throw new Error("Returns arrays must be of the same length and not empty.");
  }
  
  const meanAsset = assetReturns.reduce((sum, r) => sum + r, 0) / assetReturns.length;
  const meanMarket = marketReturns.reduce((sum, r) => sum + r, 0) / marketReturns.length;
  
  let covariance = 0;
  let marketVariance = 0;
  
  for (let i = 0; i < assetReturns.length; i++) {
    const assetDiff = assetReturns[i] - meanAsset;
    const marketDiff = marketReturns[i] - meanMarket;
    covariance += assetDiff * marketDiff;
    marketVariance += marketDiff * marketDiff;
  }
  
  // Handle floating point precision issues for zero variance
  if (marketVariance < 1e-8) return 0;

  return covariance / marketVariance;
}

export type IndicatorType = 'SMA' | 'EMA' | 'RSI';

/**
 * Calculates a technical indicator for a given series of prices.
 * @param prices Array of prices.
 * @param type The type of indicator ('SMA', 'EMA', 'RSI').
 * @param period The period for the indicator calculation.
 * @returns Array of calculated indicator values.
 */
export function calculateIndicator(prices: number[], type: IndicatorType, period: number): number[] {
  switch (type) {
    case 'SMA':
      return SMA.calculate({ period, values: prices });
    case 'EMA':
      return EMA.calculate({ period, values: prices });
    case 'RSI':
      return RSI.calculate({ period, values: prices });
    default:
      throw new Error(`Unsupported indicator type: ${type}`);
  }
}
