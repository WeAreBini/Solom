"""
Solom Data Service - Self-contained market data without FMP dependency.
Uses Yahoo Finance (yfinance) for free, reliable market data.
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import yfinance as yf
from typing import Optional
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="Solom Data Service",
    description="Market data service using Yahoo Finance",
    version="1.0.0"
)

# Enable CORS for frontend access
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, restrict to solom.life
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Market indices symbols
INDEX_SYMBOLS = {
    "^DJI": "Dow Jones Industrial Average",
    "^GSPC": "S&P 500",
    "^IXIC": "NASDAQ Composite",
    "^RUT": "Russell 2000",
    "^VIX": "CBOE Volatility Index",
    "^FTSE": "FTSE 100",
    "^GDAXI": "DAX",
    "^N225": "Nikkei 225",
    "^HSI": "Hang Seng",
}

# Popular stocks for market movers
POPULAR_STOCKS = [
    "AAPL", "MSFT", "GOOGL", "AMZN", "NVDA", "TSLA", "META", "JPM", "V", "JNJ",
    "WMT", "PG", "MA", "UNH", "HD", "DIS", "BAC", "ADBE", "CRM", "NFLX"
]


@app.get("/health")
async def health():
    """Health check endpoint."""
    return {"status": "healthy", "service": "solom-data-service"}


@app.get("/api/market/indices")
async def get_market_indices():
    """Get major market indices."""
    try:
        results = []
        
        for symbol, name in INDEX_SYMBOLS.items():
            try:
                ticker = yf.Ticker(symbol)
                info = ticker.info
                
                results.append({
                    "symbol": symbol,
                    "name": name,
                    "price": info.get("regularMarketPrice", 0) or info.get("previousClose", 0),
                    "change": info.get("regularMarketChange", 0),
                    "changesPercentage": info.get("regularMarketChangePercent", 0),
                })
            except Exception as e:
                logger.warning(f"Error fetching {symbol}: {e}")
                # Add placeholder for failed symbols
                results.append({
                    "symbol": symbol,
                    "name": name,
                    "price": 0,
                    "change": 0,
                    "changesPercentage": 0,
                })
        
        return {
            "success": True,
            "data": results,
            "count": len(results),
            "source": "yfinance"
        }
    except Exception as e:
        logger.error(f"Error fetching market indices: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/market/movers")
async def get_market_movers():
    """Get market gainers and losers."""
    try:
        gainers = []
        losers = []
        
        for symbol in POPULAR_STOCKS[:10]:
            try:
                ticker = yf.Ticker(symbol)
                info = ticker.info
                
                change_pct = info.get("regularMarketChangePercent", 0) or 0
                
                stock_data = {
                    "symbol": symbol,
                    "name": info.get("shortName", symbol),
                    "price": info.get("regularMarketPrice", 0) or info.get("previousClose", 0),
                    "change": info.get("regularMarketChange", 0),
                    "changesPercentage": change_pct,
                    "volume": info.get("regularMarketVolume", 0),
                    "marketCap": info.get("marketCap", 0),
                }
                
                if change_pct > 0:
                    gainers.append(stock_data)
                elif change_pct < 0:
                    losers.append(stock_data)
                    
            except Exception as e:
                logger.warning(f"Error fetching {symbol}: {e}")
                continue
        
        # Sort by absolute change percentage
        gainers.sort(key=lambda x: abs(x["changesPercentage"]), reverse=True)
        losers.sort(key=lambda x: abs(x["changesPercentage"]), reverse=True)
        
        return {
            "success": True,
            "data": {
                "gainers": gainers[:5],
                "losers": losers[:5],
            },
            "source": "yfinance"
        }
    except Exception as e:
        logger.error(f"Error fetching market movers: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/stocks/{symbol}/quote")
async def get_stock_quote(symbol: str):
    """Get quote for a specific stock."""
    try:
        ticker = yf.Ticker(symbol.upper())
        info = ticker.info
        
        return {
            "success": True,
            "data": {
                "symbol": symbol.upper(),
                "name": info.get("shortName", symbol),
                "price": info.get("regularMarketPrice", 0) or info.get("previousClose", 0),
                "change": info.get("regularMarketChange", 0),
                "changesPercentage": info.get("regularMarketChangePercent", 0),
                "volume": info.get("regularMarketVolume", 0),
                "marketCap": info.get("marketCap", 0),
                "pe": info.get("trailingPE", 0),
                "high52Week": info.get("fiftyTwoWeekHigh", 0),
                "low52Week": info.get("fiftyTwoWeekLow", 0),
                "open": info.get("regularMarketOpen", 0),
                "previousClose": info.get("previousClose", 0),
            },
            "source": "yfinance"
        }
    except Exception as e:
        logger.error(f"Error fetching quote for {symbol}: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/stocks/{symbol}/profile")
async def get_stock_profile(symbol: str):
    """Get profile for a specific stock."""
    try:
        ticker = yf.Ticker(symbol.upper())
        info = ticker.info
        
        return {
            "success": True,
            "data": {
                "symbol": symbol.upper(),
                "name": info.get("shortName", symbol),
                "description": info.get("longBusinessSummary", ""),
                "sector": info.get("sector", ""),
                "industry": info.get("industry", ""),
                "website": info.get("website", ""),
                "country": info.get("country", ""),
                "employees": info.get("fullTimeEmployees", 0),
                "marketCap": info.get("marketCap", 0),
            },
            "source": "yfinance"
        }
    except Exception as e:
        logger.error(f"Error fetching profile for {symbol}: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/stocks/search")
async def search_stocks(q: str, limit: int = 10):
    """Search for stocks by symbol or name."""
    try:
        # Note: yfinance doesn't have a search endpoint
        # This would need to be implemented with a local database
        # or another search source
        
        return {
            "success": True,
            "data": [],  # Placeholder - implement with local DB
            "message": "Stock search requires local database implementation",
            "source": "yfinance"
        }
    except Exception as e:
        logger.error(f"Error searching stocks: {e}")
        raise HTTPException(status_code=500, detail=str(e))


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8080)