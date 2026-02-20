"use server";

/**
 * @ai-context Server Actions for fetching data from Financial Modeling Prep (FMP) API.
 * @ai-security Uses server-side environment variables to keep API keys secure.
 */

const FMP_API_KEY = process.env.FMP_API_KEY;
const BASE_URL = "https://financialmodelingprep.com/api/v3";

if (!FMP_API_KEY) {
  console.warn("FMP_API_KEY is not set in environment variables.");
}

/**
 * Fetches real-time quote data for a given symbol.
 */
export async function getQuote(symbol: string) {
  if (!FMP_API_KEY) throw new Error("FMP API key is missing");
  
  const res = await fetch(`${BASE_URL}/quote/${symbol}?apikey=${FMP_API_KEY}`, {
    next: { revalidate: 60 }, // Cache for 60 seconds
  });
  
  if (!res.ok) {
    throw new Error(`Failed to fetch quote for ${symbol}`);
  }
  
  const data = await res.json();
  if (!Array.isArray(data)) {
    throw new Error(`Invalid response from FMP API: ${JSON.stringify(data)}`);
  }
  return data[0] || null;
}

/**
 * Fetches real-time quote data for multiple symbols.
 */
export async function getQuotes(symbols: string[]) {
  if (!FMP_API_KEY) throw new Error("FMP API key is missing");
  if (!symbols.length) return [];
  
  const symbolString = symbols.join(',');
  const res = await fetch(`${BASE_URL}/quote/${symbolString}?apikey=${FMP_API_KEY}`, {
    next: { revalidate: 60 }, // Cache for 60 seconds
  });
  
  if (!res.ok) {
    throw new Error(`Failed to fetch quotes for ${symbolString}`);
  }
  
  const data = await res.json();
  if (!Array.isArray(data)) {
    throw new Error(`Invalid response from FMP API: ${JSON.stringify(data)}`);
  }
  return data;
}

/**
 * Fetches the most active stocks in the market.
 */
export async function getMarketActives() {
  if (!FMP_API_KEY) throw new Error("FMP API key is missing");
  
  const res = await fetch(`${BASE_URL}/stock_market/actives?apikey=${FMP_API_KEY}`, {
    next: { revalidate: 300 }, // Cache for 5 minutes
  });
  
  if (!res.ok) {
    throw new Error("Failed to fetch market actives");
  }
  
  const data = await res.json();
  if (!Array.isArray(data)) {
    throw new Error(`Invalid response from FMP API: ${JSON.stringify(data)}`);
  }
  return data;
}

/**
 * Fetches the top market gainers.
 */
export async function getMarketGainers() {
  if (!FMP_API_KEY) throw new Error("FMP API key is missing");
  
  const res = await fetch(`${BASE_URL}/stock_market/gainers?apikey=${FMP_API_KEY}`, {
    next: { revalidate: 300 }, // Cache for 5 minutes
  });
  
  if (!res.ok) {
    throw new Error("Failed to fetch market gainers");
  }
  
  const data = await res.json();
  if (!Array.isArray(data)) {
    throw new Error(`Invalid response from FMP API: ${JSON.stringify(data)}`);
  }
  return data;
}

/**
 * Fetches the top market losers.
 */
export async function getMarketLosers() {
  if (!FMP_API_KEY) throw new Error("FMP API key is missing");
  
  const res = await fetch(`${BASE_URL}/stock_market/losers?apikey=${FMP_API_KEY}`, {
    next: { revalidate: 300 }, // Cache for 5 minutes
  });
  
  if (!res.ok) {
    throw new Error("Failed to fetch market losers");
  }
  
  const data = await res.json();
  if (!Array.isArray(data)) {
    throw new Error(`Invalid response from FMP API: ${JSON.stringify(data)}`);
  }
  return data;
}

/**
 * Fetches economic indicators.
 * @param name The name of the economic indicator (e.g., GDP, CPI, unemploymentRate)
 */
export async function getEconomicIndicator(name: string) {
  if (!FMP_API_KEY) throw new Error("FMP API key is missing");
  
  const res = await fetch(`https://financialmodelingprep.com/api/v4/economic?name=${name}&apikey=${FMP_API_KEY}`, {
    next: { revalidate: 86400 }, // Cache for 24 hours since economic data updates infrequently
  });
  
  if (!res.ok) {
    throw new Error(`Failed to fetch economic indicator: ${name}`);
  }
  
  const data = await res.json();
  if (!Array.isArray(data)) {
    throw new Error(`Invalid response from FMP API: ${JSON.stringify(data)}`);
  }
  return data;
}

/**
 * Fetches recent insider trading transactions (Form 4 filings).
 * Covers both P-Purchase and S-Sale transaction types.
 * @returns Array of insider trade objects
 */
export async function getInsiderTrades() {
  if (!FMP_API_KEY) throw new Error("FMP API key is missing");

  const res = await fetch(
    `https://financialmodelingprep.com/api/v4/insider-trading?transactionType=P-Purchase,S-Sale&limit=100&apikey=${FMP_API_KEY}`,
    { next: { revalidate: 900 } } // Cache 15 min
  );

  if (!res.ok) throw new Error("Failed to fetch insider trades");

  const data = await res.json();
  if (!Array.isArray(data)) throw new Error(`Unexpected insider-trades response: ${JSON.stringify(data)}`);
  return data as {
    symbol: string;
    filingDate: string;
    transactionDate: string;
    reportingName: string;
    typeOfOwner: string;
    transactionType: string;
    securitiesTransacted: number;
    price: number;
    securitiesOwned: number;
    companyCik: string;
    reportingCik: string;
  }[];
}

/**
 * Fetches recent Senate STOCK Act trading disclosures.
 * @returns Array of senate trade objects
 */
export async function getSenateTrades() {
  if (!FMP_API_KEY) throw new Error("FMP API key is missing");

  const res = await fetch(
    `https://financialmodelingprep.com/api/v4/senate-trading?limit=100&apikey=${FMP_API_KEY}`,
    { next: { revalidate: 3600 } } // Cache 1 hr
  );

  if (!res.ok) throw new Error("Failed to fetch senate trades");

  const data = await res.json();
  if (!Array.isArray(data)) throw new Error(`Unexpected senate-trades response: ${JSON.stringify(data)}`);
  return data as {
    dateRecieved: string;
    transactionDate: string;
    owner: string;
    ticker: string;
    assetDescription: string;
    type: string;
    amount: string;
    senator: string;
    district: string;
    comment: string;
    link: string;
  }[];
}

/**
 * Fetches institutional holders for a given stock symbol.
 * @param symbol Stock ticker (e.g. "AAPL")
 */
export async function getInstitutionalHoldings(symbol: string) {
  if (!FMP_API_KEY) throw new Error("FMP API key is missing");

  const res = await fetch(
    `${BASE_URL}/institutional-holder/${symbol}?apikey=${FMP_API_KEY}`,
    { next: { revalidate: 86400 } }
  );

  if (!res.ok) throw new Error(`Failed to fetch institutional holdings for ${symbol}`);

  const data = await res.json();
  if (!Array.isArray(data)) throw new Error(`Unexpected institutional-holdings response: ${JSON.stringify(data)}`);
  return data as {
    holder: string;
    shares: number;
    dateReported: string;
    change: number;
    weightPercent: number;
  }[];
}

/**
 * Fetches 13F institutional portfolio holdings for a given CIK.
 * @param cik SEC CIK number (default: "0001067983" = Berkshire Hathaway)
 */
export async function getForm13F(cik: string = "0001067983") {
  if (!FMP_API_KEY) throw new Error("FMP API key is missing");

  const res = await fetch(
    `${BASE_URL}/form-thirteen/${cik}?apikey=${FMP_API_KEY}`,
    { next: { revalidate: 86400 } }
  );

  if (!res.ok) throw new Error(`Failed to fetch 13F data for CIK ${cik}`);

  const data = await res.json();
  if (!Array.isArray(data)) throw new Error(`Unexpected 13F response: ${JSON.stringify(data)}`);
  return data as {
    date: string;
    fillingDate: string;
    acceptedDate: string;
    cik: string;
    cusip: string;
    tickercusip: string;
    nameOfIssuer: string;
    shares: number;
    titleOfClass: string;
    value: number;
    link: string;
    finalLink: string;
  }[];
}

/**
 * Fetches the list of top institutional holders tracked by FMP.
 */
export async function getTopInstitutions() {
  if (!FMP_API_KEY) throw new Error("FMP API key is missing");

  const res = await fetch(
    `${BASE_URL}/institutional-holders-lists?apikey=${FMP_API_KEY}`,
    { next: { revalidate: 86400 } }
  );

  if (!res.ok) throw new Error("Failed to fetch top institutions list");

  const data = await res.json();
  if (!Array.isArray(data)) throw new Error(`Unexpected top-institutions response: ${JSON.stringify(data)}`);
  return data as { cik: string; name: string }[];
}

/**
 * Fetches House of Representatives STOCK Act trading disclosures.
 * @returns Array of house trade disclosure objects
 */
export async function getHouseTrades() {
  if (!FMP_API_KEY) throw new Error("FMP API key is missing");

  const res = await fetch(
    `https://financialmodelingprep.com/api/v4/house-disclosure?limit=100&apikey=${FMP_API_KEY}`,
    { next: { revalidate: 3600 } } // Cache 1 hr
  );

  if (!res.ok) throw new Error("Failed to fetch house trades");

  const data = await res.json();
  if (!Array.isArray(data)) throw new Error(`Unexpected house-trades response: ${JSON.stringify(data)}`);
  return data as {
    disclosureYear: string;
    disclosureDate: string;
    transactionDate: string;
    owner: string;
    ticker: string;
    assetDescription: string;
    type: string;
    amount: string;
    representative: string;
    district: string;
    link: string;
    capitalGainsOver200USD: boolean;
  }[];
}

/**
 * Fetches the earnings calendar for the next 30 days.
 * @returns Array of upcoming earnings events
 */
export async function getEarningsCalendar() {
  if (!FMP_API_KEY) throw new Error("FMP API key is missing");

  const from = new Date();
  const to = new Date();
  to.setDate(to.getDate() + 30);

  const fmt = (d: Date) => d.toISOString().split("T")[0];

  const res = await fetch(
    `${BASE_URL}/earning_calendar?from=${fmt(from)}&to=${fmt(to)}&apikey=${FMP_API_KEY}`,
    { next: { revalidate: 3600 } } // Cache 1 hr
  );

  if (!res.ok) throw new Error("Failed to fetch earnings calendar");

  const data = await res.json();
  if (!Array.isArray(data)) throw new Error(`Unexpected earnings-calendar response: ${JSON.stringify(data)}`);
  return data as {
    date: string;
    symbol: string;
    eps: number | null;
    epsEstimated: number | null;
    time: string;
    revenue: number | null;
    revenueEstimated: number | null;
    fiscalDateEnding: string;
    updatedFromDate: string;
  }[];
}

/**
 * Fetches the latest financial market news.
 * @param limit Number of articles to return (default 10)
 * @returns Array of news articles
 */
export async function getMarketNews(limit: number = 10) {
  if (!FMP_API_KEY) throw new Error("FMP API key is missing");

  const res = await fetch(
    `${BASE_URL}/stock_news?limit=${limit}&apikey=${FMP_API_KEY}`,
    { next: { revalidate: 900 } } // Cache 15 min
  );

  if (!res.ok) throw new Error("Failed to fetch market news");

  const data = await res.json();
  if (!Array.isArray(data)) throw new Error(`Unexpected market-news response: ${JSON.stringify(data)}`);
  return data as {
    symbol: string;
    publishedDate: string;
    title: string;
    image: string;
    site: string;
    text: string;
    url: string;
  }[];
}

/**
 * Fetches the company profile for a given symbol.
 * @ai-context Returns logo URL (image), description, CEO, sector, industry, HQ, employees, website.
 * @param symbol Stock ticker (e.g. "AAPL")
 */
export async function getCompanyProfile(symbol: string): Promise<{
  description: string;
  ceo: string;
  sector: string;
  industry: string;
  website: string;
  image: string;
  fullTimeEmployees: string;
  country: string;
  city: string;
  state: string;
} | null> {
  if (!FMP_API_KEY) throw new Error("FMP API key is missing");

  const res = await fetch(`${BASE_URL}/profile/${symbol}?apikey=${FMP_API_KEY}`, {
    next: { revalidate: 86400 },
  });

  if (!res.ok) throw new Error(`Failed to fetch profile for ${symbol}`);

  const data = await res.json();
  if (!Array.isArray(data) || !data[0]) return null;
  const p = data[0];
  return {
    description: p.description || "",
    ceo: p.ceo || "",
    sector: p.sector || "",
    industry: p.industry || "",
    website: p.website || "",
    image: p.image || "",
    fullTimeEmployees: p.fullTimeEmployees || "",
    country: p.country || "",
    city: p.city || "",
    state: p.state || "",
  };
}

/**
 * Fetches recent news articles for a given symbol.
 * @ai-context Uses /v3/stock_news. Returns up to `limit` articles.
 * @param symbol Stock ticker
 * @param limit Max number of articles to return (default 8)
 */
export async function getTickerNews(
  symbol: string,
  limit = 8
): Promise<
  {
    title: string;
    url: string;
    publishedDate: string;
    site: string;
    image: string;
    text: string;
  }[]
> {
  if (!FMP_API_KEY) throw new Error("FMP API key is missing");

  const res = await fetch(
    `${BASE_URL}/stock_news?tickers=${symbol}&limit=${limit}&apikey=${FMP_API_KEY}`,
    { next: { revalidate: 900 } }
  );

  if (!res.ok) throw new Error(`Failed to fetch news for ${symbol}`);

  const data = await res.json();
  if (!Array.isArray(data)) return [];
  return data.map((n: Record<string, unknown>) => ({
    title: (n.title as string) || "",
    url: (n.url as string) || "",
    publishedDate: (n.publishedDate as string) || "",
    site: (n.site as string) || "",
    image: (n.image as string) || "",
    text: (n.text as string) || "",
  }));
}

/**
 * Fetches analyst consensus (buy/sell/hold breakdown) for a given symbol.
 * @ai-context Uses /v3/analyst-stock-recommendations. Returns most recent entry.
 * @param symbol Stock ticker
 */
export async function getAnalystRatings(symbol: string): Promise<{
  strongBuy: number;
  buy: number;
  hold: number;
  sell: number;
  strongSell: number;
  date: string;
} | null> {
  if (!FMP_API_KEY) throw new Error("FMP API key is missing");

  const res = await fetch(
    `${BASE_URL}/analyst-stock-recommendations/${symbol}?apikey=${FMP_API_KEY}`,
    { next: { revalidate: 86400 } }
  );

  if (!res.ok) throw new Error(`Failed to fetch analyst ratings for ${symbol}`);

  const data = await res.json();
  if (!Array.isArray(data) || !data[0]) return null;
  const r = data[0];
  return {
    strongBuy: r.analystRatingsStrongBuy ?? r.strongBuy ?? 0,
    buy: r.analystRatingsbuy ?? r.buy ?? 0,
    hold: r.analystRatingsHold ?? r.hold ?? 0,
    sell: r.analystRatingsSell ?? r.sell ?? 0,
    strongSell: r.analystRatingsStrongSell ?? r.strongSell ?? 0,
    date: r.date || "",
  };
}

/**
 * Fetches the analyst price target consensus for a given symbol.
 * @ai-context Uses /v4/price-target-summary endpoint.
 * @param symbol Stock ticker
 */
export async function getPriceTarget(symbol: string): Promise<{
  targetConsensus: number;
  targetHigh: number;
  targetLow: number;
  targetMedian: number;
  lastDate: string;
} | null> {
  if (!FMP_API_KEY) throw new Error("FMP API key is missing");

  const res = await fetch(
    `https://financialmodelingprep.com/api/v4/price-target-summary?symbol=${symbol}&apikey=${FMP_API_KEY}`,
    { next: { revalidate: 86400 } }
  );

  if (!res.ok) throw new Error(`Failed to fetch price target for ${symbol}`);

  const data = await res.json();
  // FMP returns an array or single object depending on endpoint version
  const entry = Array.isArray(data) ? data[0] : data;
  if (!entry) return null;
  return {
    targetConsensus: entry.targetConsensus ?? entry.priceTargetAverage ?? 0,
    targetHigh: entry.targetHigh ?? entry.priceTargetHigh ?? 0,
    targetLow: entry.targetLow ?? entry.priceTargetLow ?? 0,
    targetMedian: entry.targetMedian ?? entry.priceTargetMedian ?? 0,
    lastDate: entry.lastDate ?? entry.lastUpdated ?? "",
  };
}

/**
 * Fetches historical daily prices for a given symbol.
 */
export async function getHistoricalPrices(symbol: string) {
  if (!FMP_API_KEY) throw new Error("FMP API key is missing");
  
  const res = await fetch(`${BASE_URL}/historical-price-full/${symbol}?apikey=${FMP_API_KEY}`, {
    next: { revalidate: 3600 }, // Cache for 1 hour
  });
  
  if (!res.ok) {
    throw new Error(`Failed to fetch historical prices for ${symbol}`);
  }
  
  const data = await res.json();
  if (data && data["Error Message"]) {
    throw new Error(`Invalid response from FMP API: ${data["Error Message"]}`);
  }
  return data.historical || [];
}

/** Search for stocks/ETFs/funds by query string. Returns top matches. */
export async function searchSymbols(query: string) {
  if (!FMP_API_KEY) throw new Error("FMP API key is missing");
  if (!query.trim()) return [];
  const res = await fetch(
    `${BASE_URL}/search?query=${encodeURIComponent(query)}&limit=10&apikey=${FMP_API_KEY}`,
    { next: { revalidate: 0 } }
  );
  if (!res.ok) throw new Error("Failed to search symbols");
  const data = await res.json();
  return Array.isArray(data) ? data as { symbol: string; name: string; stockExchange: string; exchangeShortName: string }[] : [];
}
