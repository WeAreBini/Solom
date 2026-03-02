# In-House Market Data Infrastructure

Solom has transitioned to an entirely self-hosted, in-house market data layer. We have replaced external API providers with a system that pulls into Supabase/PostgreSQL using `yahoo-finance2` and custom quant math. This document serves as a master guide for the new architecture, database structure, ingestion scripts, and quantitative utilities.

## 1. Architecture Overview

### Infrastructure & Data Source
- The ingestion pipeline operates on a dedicated Railway Node.js Worker (avoiding Vercel Serverless/Edge limits) to ensure robust retry logic for scraping operations without strict timeout limits.
- Data is extracted from `yahoo-finance2`, utilizing concurrency controls, queues, and exponential backoff to handle rate limits gracefully.

### API Abstraction & Caching
- Next.js Route Handlers (`/api/market/historical`, `/api/stocks/[symbol]/quote/route.ts`, etc.) securely bridge the self-hosted Postgres data directly into the frontend.
- Caching is used based on time intervals to minimize database load.
- Responses strictly follow the JSON envelope convention: `{ success: boolean, data?: any, error?: string }` and enforce regex-based symbol parameter validations (`^[A-Z0-9.\-^]+$`).
- **Quote Endpoint (`/quote/route.ts`)**: Provides an immediate real-time or latest available snapshot alongside cached fundamental metrics for dashboard and search previews.
- **Historical Endpoint (`/historical/route.ts`)**: Provides TradingView Chart integration via time-series endpoints, securely wrapping native Postgres interval querying.
- **Fundamentals Endpoint (`/fundamentals/route.ts`)**: Exposes comprehensive qualitative metric tracking (market caps, P/E ratios, dividends, descriptions) that is too bloated for the lightweight quote structure.

## 2. Database Structure

Standard PostgreSQL (via Railway Supabase) handles millions of price rows scaling effectively with strategic indexing and data type choices.

### Key Models
The `prisma/schema.prisma` file includes:
- `Asset`: Stores basic metadata (Symbol, Name, Type, Exchange, Currency). Includes an `active` boolean flag to instruct scrapers which items to ignore safely.
- `CompanyFundamental`: Stores qualitative metrics and fundamentals (P/E, Market Cap, etc.).
- `HistoricalPrice`: Stores time-series data with interval support (`1d`, `1h`, `15m`).
- `ScrapeJob`: Job tracking for scraper workers.

### Optimizations
1. **Indexes:** A composite index `@@index([assetId, interval, time(sort: Desc)])` on `HistoricalPrice` supports fast reads of the most recent data points. `ScrapeJob` uses `@@index([status, startedAt(sort: Desc)])`.
2. **Float vs Decimal:** `Float` (`double precision` in Postgres) is used instead of `Decimal` for OHLC (`open`, `high`, `low`, `close`) columns to maximize Node.js serialization speed and reduce storage/bandwidth costs, as it easily fits within 15 significant digits.
3. **Normalization:** Standard conventions like `@@map("xyz")`, `created_at` are used.

## 3. Ingestion Pipeline

The ingestion library at `lib/ingestion/market-data.ts` relies on `yahoo-finance2` and Prisma's `skipDuplicates: true` and array batched multi-insert `createMany()` logic to batch array inserts safely without conflicts. It features `withRetry` logic with exponential backoff for handling `429 Too-Many-Requests`.

### Running Ingestion Scripts Manually
You can trigger ingestion directly without the worker process using the admin API route.

**Endpoint:** `POST /api/admin/ingest`
**Body:**
```json
{
  "action": "both", // "profile", "historical", or "both"
  "symbol": "AAPL",
  "period1": "2025-01-01", // Optional: Defaults to 1 year ago
  "interval": "1d"         // Optional: '1d', '1h', '15m'
}
```

**Workflow Instructions for Use:**
1. Execute a POST request via Postman, Insomnia, or a direct `curl`.
2. Example cURL:
```sh
curl -X POST http://localhost:3000/api/admin/ingest \
  -H "Content-Type: application/json" \
  -d '{"action": "both", "symbol": "NVDA"}'
```
3. The server will ingest external pricing/fundamentals efficiently directly into your Prisma tables. Success will output a JSON envelope wrapping a `data` map indicating validation and records successfully read.

## 4. Quantitative Utilities

A quantitative library (`lib/quant.ts`) powered by the `technicalindicators` package computes standard metrics. All functions have 100% test coverage (`lib/quant.test.ts`).

### Portfolio Risk/Return Metrics
- **`calculateSharpeRatio(returns: number[], riskFreeRate: number = 0.0): number`**: Calculates expected risk-adjusted performance.
- **`calculateMaxDrawdown(portfolioValues: number[]): number`**: Evaluates the maximum observed percentage loss from a peak to a trough.
- **`calculateBeta(assetReturns: number[], marketReturns: number[]): number`**: Measures the volatility/systematic risk of an asset relative to the benchmark market returns.

### Technical Indicators
- **`calculateIndicator(prices: number[], type: IndicatorType, period: number): number[]`**: Computes standard metrics like Simple Moving Average (`'SMA'`), Exponential Moving Average (`'EMA'`), and Relative Strength Index (`'RSI'`).

**Example Usage:**
```typescript
import {
  calculateSharpeRatio,
  calculateBeta,
  calculateIndicator,
  calculateMaxDrawdown
} from '@/lib/quant';

// Portfolio Analysis
const assetReturns = [0.02, 0.03, -0.01, 0.05, 0.02];
const expectedSharpe = calculateSharpeRatio(assetReturns, 0.01);
console.log(`Portfolio Sharpe Ratio: ${expectedSharpe.toFixed(2)}`);

const marketReturns = [0.01, 0.02, -0.02, 0.03, 0.01];
const beta = calculateBeta(assetReturns, marketReturns);
console.log(`Asset Beta relative to Market: ${beta.toFixed(2)}`);

const portfolioHistory = [10000, 10500, 10200, 11000, 10800, 12000];
const maxDrawdown = calculateMaxDrawdown(portfolioHistory);
console.log(`Maximum Drawdown: ${(maxDrawdown * 100).toFixed(2)}%`);

// Technical Indicators
const historicalPrices = [120, 122, 121, 125, 124, 126, 128, 127, 130];
const rsiPeriod = 5;

const rsiValues = calculateIndicator(historicalPrices, 'RSI', rsiPeriod);
console.log('RSI Series:', rsiValues);

const smaValues = calculateIndicator(historicalPrices, 'SMA', 5);
console.log('SMA Series:', smaValues);
```
