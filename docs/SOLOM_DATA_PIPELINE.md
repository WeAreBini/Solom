# Solom Self-Contained Data Pipeline (No FMP)

## Overview

Youssef has clarified: **Solom should NOT use FMP anymore**. We need to build our own data fetching solution.

## Current State

- Frontend uses `lib/fmp.ts` to fetch market data from Financial Modeling Prep
- FMP requires API key (currently placeholder)
- External API backend `solom-api-production.up.railway.app` returns 404

## Proposed Solution: YFinance + Python Backend

### Architecture

```
┌─────────────────┐        ┌───────────────────────────┐
│  Solom Frontend │ ────▶  │   Next.js API Routes       │
│  (Next.js)      │        │   (app/api/market/*)       │
└─────────────────┘        └───────────────────────────┘
                                      │
                                      ▼
                           ┌───────────────────────────┐
                           │   Python Data Service      │
                           │   (yfinance + fastapi)    │
                           │   Runs on Railway         │
                           └───────────────────────────┘
                                      │
                                      ▼
                           ┌───────────────────────────┐
                           │   Yahoo Finance API      │
                           │   (Free, no API key)     │
                           └───────────────────────────┘
```

### Why YFinance?

1. **Free**: No API key required
2. **Reliable**: Yahoo Finance is widely used
3. **Comprehensive**: Market indices, stocks, historical data
4. **No Rate Limits**: Can handle reasonable traffic
5. **Python Native**: Easy to integrate with existing backend

### Data Available

| Data Type | YFinance Support |
|-----------|------------------|
| Market Indices (S&P 500, Dow, NASDAQ) | ✅ |
| Stock Quotes | ✅ |
| Historical Data | ✅ |
| Market Movers (Gainers/Losers) | ✅ |
| Company Profiles | ✅ |

## Implementation Plan

### Phase 1: Python Data Service

Create `solom-data-service/`:

```python
# main.py
from fastapi import FastAPI
import yfinance as yf

app = FastAPI()

@app.get("/api/market/indices")
async def get_indices():
    symbols = ["^DJI", "^GSPC", "^IXIC", "^RUT", "^VIX"]
    results = []
    for symbol in symbols:
        ticker = yf.Ticker(symbol)
        info = ticker.info
        results.append({
            "symbol": symbol,
            "name": info.get("shortName", symbol),
            "price": info.get("regularMarketPrice", 0),
            "change": info.get("regularMarketChange", 0),
            "changesPercentage": info.get("regularMarketChangePercent", 0)
        })
    return {"success": True, "data": results}

@app.get("/api/stocks/{symbol}/quote")
async def get_quote(symbol: str):
    ticker = yf.Ticker(symbol.upper())
    info = ticker.info
    return {
        "symbol": symbol.upper(),
        "price": info.get("regularMarketPrice"),
        "change": info.get("regularMarketChange"),
        # ... more fields
    }

@app.get("/api/market/movers")
async def get_movers():
    # Get top gainers and losers
    # This requires additional logic
    pass
```

### Phase 2: Update Frontend API Routes

Update `app/api/market/indices/route.ts`:

```typescript
import { NextResponse } from 'next/server';

const DATA_SERVICE_URL = process.env.SOLOM_DATA_SERVICE_URL || 'http://localhost:8080';

export async function GET() {
  try {
    const response = await fetch(`${DATA_SERVICE_URL}/api/market/indices`);
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    // Fallback to cached/mock data
    return NextResponse.json({
      success: false,
      error: 'Data service unavailable',
      demo: true
    });
  }
}
```

### Phase 3: Deploy to Railway

1. Create new Railway service: `solom-data-service`
2. Set environment: `PORT=8080`
3. Connect to existing Solom frontend via internal networking

## Files to Create

```
solom-data-service/
├── main.py              # FastAPI app
├── requirements.txt    # yfinance, fastapi, uvicorn
├── Dockerfile          # Python container
├── railway.toml        # Railway config
└── README.md           # Setup instructions
```

## Files to Modify

```
app/api/market/indices/route.ts  # Point to data service
app/api/market/movers/route.ts  # Point to data service
lib/fmp.ts                       # Remove or deprecate
.env.example                     # Remove FMP_API_KEY
```

## Timeline Estimate

| Phase | Time | Dependencies |
|-------|------|--------------|
| Phase 1: Python Service | 2 hours | None |
| Phase 2: Frontend Updates | 1 hour | Phase 1 |
| Phase 3: Deploy | 30 min | Phase 1, 2 |

**Total: ~3.5 hours**

## Alternative: Quick Fix (Remove External API)

If Youssef wants a faster solution without new services:

1. Remove `NEXT_PUBLIC_SOLOM_API_URL` from `.env`
2. YFinance can be called from Next.js API routes (using `python-shell` or edge functions)
3. Single deploy, no new services

This is less scalable but faster to implement.

## Recommendation

**Go with YFinance Python Service** (Phase 1-3)

- Self-contained
- No external API key required
- Scales well
- Full control over data

---

## Files Changed

- `/data/workspace/docs/SOLOM_DATA_PIPELINE.md` (this file)