import { prisma } from '@/lib/db';
import yahooFinance from 'yahoo-finance2';
// @ts-ignore
import { SMA, EMA, RSI } from 'technicalindicators';

/**
 * Exponential backoff retry utility
 */
async function withRetry<T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  baseDelayMs: number = 1000
): Promise<T> {
  let attempt = 0;
  while (attempt < maxRetries) {
    try {
      return await operation();
    } catch (error: any) {
      attempt++;
      if (attempt >= maxRetries) {
        throw error;
      }
      
      // Check if it's a rate limit error (429) or other retryable error
      const status = error?.status || error?.response?.status;
      if (status && status !== 429 && status < 500) {
        throw error; // Don't retry client errors other than 429
      }

      const delay = baseDelayMs * Math.pow(2, attempt - 1) + Math.random() * 500;
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  throw new Error('Unreachable');
}

/**
 * Validates a symbol
 */
function isValidSymbol(symbol: string): boolean {
  if (!symbol || typeof symbol !== 'string') return false;
  return /^[A-Z0-9.\-%]+$/i.test(symbol.trim());
}

/**
 * Ingests and upserts an asset profile and fundamentals
 */
export async function ingestAssetProfile(symbol: string) {
  symbol = symbol.toUpperCase().trim();
  if (!isValidSymbol(symbol)) {
    throw new Error(`Invalid symbol format: ${symbol}`);
  }

  try {
    const result = await withRetry(() =>
  yahooFinance.quoteSummary(symbol, {
    modules: ['summaryProfile', 'defaultKeyStatistics', 'summaryDetail', 'price'] as ['summaryProfile', 'defaultKeyStatistics', 'summaryDetail', 'price'],
  })
);
    if (!result || !(result as any).price) {
      throw new Error(`Could not fetch profile for ${symbol}`);
    }

    const { price, summaryProfile, summaryDetail, defaultKeyStatistics } = result as any;

    // Upsert Asset
    const asset = await (prisma as any).asset.upsert({
      where: { symbol },
      update: {
        name: price.longName || price.shortName || symbol,
        type: price.quoteType || 'EQUITY',
        exchange: price.exchangeName || 'UNKNOWN',
        currency: price.currency || 'USD',
        active: true,
      },
      create: {
        symbol,
        name: price.longName || price.shortName || symbol,
        type: price.quoteType || 'EQUITY',
        exchange: price.exchangeName || 'UNKNOWN',
        currency: price.currency || 'USD',
        active: true,
      },
    });

    // Extract fundamentals safely
    const sector = summaryProfile?.sector;
    const industry = summaryProfile?.industry;
    const description = summaryProfile?.longBusinessSummary;
    
    // Yahoo Finance numbers can sometimes be objects if they are formatted, so we safely extract numbers
    const getNumber = (val: any) => typeof val === 'number' ? val : (val?.raw ?? null);
    
    let marketCap = getNumber(summaryDetail?.marketCap) || getNumber(price?.marketCap) || null;
    let peRatio = getNumber(summaryDetail?.trailingPE) || getNumber(defaultKeyStatistics?.trailingPE) || null;
    let dividendYield = getNumber(summaryDetail?.dividendYield) || null; // usually decimal
    if (dividendYield && dividendYield < 1) {
      dividendYield = dividendYield * 100; // convert to percentage representation if needed, but standard is decimal. Actually, keep as is.
    }
    
    const eps = getNumber(defaultKeyStatistics?.trailingEps) || getNumber(price?.epsTrailingTwelveMonths) || null;
    const beta = getNumber(defaultKeyStatistics?.beta) || getNumber(summaryProfile?.beta) || null;
    const fiftyTwoWeekHigh = getNumber(summaryDetail?.fiftyTwoWeekHigh) || null;
    const fiftyTwoWeekLow = getNumber(summaryDetail?.fiftyTwoWeekLow) || null;

    // Upsert Fundamentals
    await (prisma as any).companyFundamental.upsert({
      where: { assetId: asset.id },
      update: {
        sector,
        industry,
        marketCap: marketCap ? BigInt(Math.floor(marketCap)) : null,
        peRatio,
        dividendYield: getNumber(summaryDetail?.dividendYield) || null,
        eps,
        beta,
        fiftyTwoWeekHigh,
        fiftyTwoWeekLow,
        description,
      },
      create: {
        assetId: asset.id,
        sector,
        industry,
        marketCap: marketCap ? BigInt(Math.floor(marketCap)) : null,
        peRatio,
        dividendYield: getNumber(summaryDetail?.dividendYield) || null,
        eps,
        beta,
        fiftyTwoWeekHigh,
        fiftyTwoWeekLow,
        description,
      },
    });

    return { success: true, asset };
  } catch (error: any) {
    console.error(`Error ingesting profile for ${symbol}:`, error);
    throw error;
  }
}

/**
 * Functions to fetch and bulk insert historical data
 */
export async function ingestHistoricalData(
  symbol: string,
  period1: string | Date,
  period2: string | Date = new Date(),
  interval: '1d' | '1h' | '15m' = '1d'
) {
  symbol = symbol.toUpperCase().trim();
  if (!isValidSymbol(symbol)) {
    throw new Error(`Invalid symbol format: ${symbol}`);
  }

  try {
    // Ensure asset exists first
    let asset = await (prisma as any).asset.findUnique({ where: { symbol } });
    
    if (!asset) {
      // Create a basic asset if it doesn't exist
      asset = await (prisma as any).asset.create({
        data: {
          symbol,
          name: symbol,
          type: 'EQUITY',
          exchange: 'UNKNOWN',
          active: true,
        },
      });
    }

    // Map yf intervals
    const queryOptions: any = {
      period1,
      period2,
      interval: interval as any,
    };

    const historicalData: any[] = await withRetry(() => yahooFinance.historical(symbol, queryOptions)) as any;

    if (!historicalData || historicalData.length === 0) {
      return { success: true, count: 0, message: 'No data found for period' };
    }

    // Prepare data, filtering out any missing dates/prices
    const validData = historicalData.filter(
      (d: any) => 
        d.date && 
        d.open !== null && typeof d.open !== 'undefined' &&
        d.high !== null && typeof d.high !== 'undefined' &&
        d.low !== null && typeof d.low !== 'undefined' &&
        d.close !== null && typeof d.close !== 'undefined'
    );

    const records = validData.map((d: any) => ({
      assetId: asset.id,
      time: d.date,
      interval,
      open: d.open,
      high: d.high,
      low: d.low,
      close: d.close,
      volume: BigInt(d.volume || 0),
    }));

    if (records.length === 0) {
      return { success: true, count: 0, message: 'No valid data points after filtering' };
    }

    // Bulk insert with skipDuplicates
    const result = await (prisma as any).historicalPrice.createMany({
      data: records,
      skipDuplicates: true,
    });

    return { success: true, count: result.count, totalFetched: records.length };
  } catch (error: any) {
    console.error(`Error ingesting historical data for ${symbol}:`, error);
    throw error;
  }
}
