import { prisma } from '@/lib/db';
import yahooFinance from 'yahoo-finance2';

/**
 * Ingests an asset profile and fundamentals into the Prisma database
 */
export async function ingestAssetProfile(symbol: string) {
  symbol = symbol.toUpperCase().trim();
  const quote = await yahooFinance.quote(symbol);
  if (!quote) throw new Error(`Could not fetch quote for ${symbol}`);
  
  // Upsert Asset
  const asset = await (prisma as any).asset.upsert({
    where: { symbol },
    create: {
      symbol,
      name: quote.shortName || quote.longName || symbol,
      type: quote.quoteType || 'EQUITY',
      exchange: (quote as any).fullExchangeName || quote.exchange || 'UNKNOWN',
      currency: quote.currency || 'USD',
      active: true,
    },
    update: {
      name: quote.shortName || quote.longName || symbol,
      type: quote.quoteType || 'EQUITY',
      exchange: (quote as any).fullExchangeName || quote.exchange || 'UNKNOWN',
      currency: quote.currency || 'USD',
    }
  });

  const quoteSummary = await yahooFinance.quoteSummary(symbol, {
    modules: ['summaryDetail', 'summaryProfile', 'defaultKeyStatistics']
  }).catch(() => null);

  const marketCap = quote.marketCap ? BigInt(quote.marketCap) : null;
  
  const sector = quoteSummary?.summaryProfile?.sector || null;
  const industry = quoteSummary?.summaryProfile?.industry || null;
  const peRatio = quoteSummary?.summaryDetail?.trailingPE || quote.trailingPE || null;
  const dividendYield = quoteSummary?.summaryDetail?.dividendYield || null;
  const eps = quote.epsTrailingTwelveMonths || null;
  const beta = quoteSummary?.summaryDetail?.beta || quoteSummary?.defaultKeyStatistics?.beta || null;
  const fiftyTwoWeekHigh = quote.fiftyTwoWeekHigh || null;
  const fiftyTwoWeekLow = quote.fiftyTwoWeekLow || null;
  const description = quoteSummary?.summaryProfile?.longBusinessSummary || null;

  await (prisma as any).companyFundamental.upsert({
    where: { assetId: asset.id },
    create: {
      assetId: asset.id,
      sector,
      industry,
      marketCap,
      peRatio,
      dividendYield,
      eps,
      beta,
      fiftyTwoWeekHigh,
      fiftyTwoWeekLow,
      description,
    },
    update: {
      sector,
      industry,
      marketCap,
      peRatio,
      dividendYield,
      eps,
      beta,
      fiftyTwoWeekHigh,
      fiftyTwoWeekLow,
      description,
    }
  });

  return asset;
}

/**
 * Ingests historical data into the Prisma database
 */
export async function ingestHistoricalData(symbol: string, period1: string | Date | number) {
  symbol = symbol.toUpperCase().trim();
  // Ensure asset exists first
  const asset = await (prisma as any).asset.findUnique({ where: { symbol } });
  if (!asset) {
    throw new Error(`Asset ${symbol} not found. Ingest profile first.`);
  }

  const queryOptions = {
    period1: new Date(period1),
    interval: '1d' as const,
  };

  const results = await yahooFinance.historical(symbol, queryOptions);
  
  const data = results.map(row => ({
    assetId: asset.id,
    time: row.date,
    interval: '1d',
    open: Number(row.open) || 0,
    high: Number(row.high) || 0,
    low: Number(row.low) || 0,
    close: Number(row.close) || 0,
    volume: row.volume != null ? BigInt(Math.max(0, Number(row.volume))) : BigInt(0),
  }));

  const insertResult = await (prisma as any).historicalPrice.createMany({
    data,
    skipDuplicates: true,
  });

  return insertResult;
}
