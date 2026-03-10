# Solom Data Service

Self-contained market data service using Yahoo Finance (yfinance).

## Why This Exists

FMP (Financial Modeling Prep) required an API key that we don't want to depend on.
This service fetches market data directly from Yahoo Finance - **no API key required**.

## Endpoints

| Endpoint | Description |
|----------|-------------|
| `GET /health` | Health check |
| `GET /api/market/indices` | Major market indices |
| `GET /api/market/movers` | Top gainers and losers |
| `GET /api/stocks/{symbol}/quote` | Stock quote |
| `GET /api/stocks/{symbol}/profile` | Company profile |
| `GET /api/stocks/search?q=xxx` | Search stocks |

## Running Locally

```bash
# Install dependencies
pip install -r requirements.txt

# Run
uvicorn main:app --reload --port 8080
```

## Deploying to Railway

```bash
railway login
railway new  # Create new service
railway up   # Deploy
```

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `8080` | Server port |

## Data Sources

- **Yahoo Finance (yfinance)**: Free, no API key required
- Market indices: ^DJI, ^GSPC, ^IXIC, ^RUT, ^VIX, etc.
- Stock quotes: All NYSE/NASDAQ stocks
- Market movers: Top 20 popular stocks

## Limitations

1. Yahoo Finance rate limits: 2000 requests/hour per IP
2. No real-time data (15-20 min delay)
3. Search requires local database implementation

## Future Improvements

- Add Redis caching for frequently requested data
- Implement local database for stock search
- Add WebSocket for real-time updates
- Implement edgar/SEC data for fundamentals