/**
 * Sentiment Analysis Module
 * 
 * Analyzes sentiment from news, social media, and analyst data
 * to provide comprehensive sentiment scores for stocks.
 */

import type {
  SentimentScore,
  SentimentTrend,
  MarketSentiment,
  NewsItem,
} from '@/lib/types/ai';

/**
 * Sentiment sources
 */
export type SentimentSource = 'news' | 'social' | 'analyst' | 'all';

/**
 * Sentiment Analyzer class
 */
export class SentimentAnalyzer {
  /**
   * Analyze sentiment for a single symbol
   */
  async analyzeSymbol(
    symbol: string,
    sources: SentimentSource[] = ['all']
  ): Promise<SentimentScore> {
    // In production, this would fetch real data from news APIs, social media, etc.
    // For now, we return simulated sentiment data
    
    const includeNews = sources.includes('all') || sources.includes('news');
    const includeSocial = sources.includes('all') || sources.includes('social');
    const includeAnalyst = sources.includes('all') || sources.includes('analyst');

    const [news, social, analyst] = await Promise.all([
      includeNews ? this.getNewsSentiment(symbol) : 0,
      includeSocial ? this.getSocialSentiment(symbol) : 0,
      includeAnalyst ? this.getAnalystSentiment(symbol) : 0,
    ]);

    // Calculate overall sentiment as weighted average
    const weights = {
      news: 0.4,
      social: 0.3,
      analyst: 0.3,
    };

    let overall = 0;
    let totalWeight = 0;

    if (includeNews) {
      overall += news * weights.news;
      totalWeight += weights.news;
    }
    if (includeSocial) {
      overall += social * weights.social;
      totalWeight += weights.social;
    }
    if (includeAnalyst) {
      overall += analyst * weights.analyst;
      totalWeight += weights.analyst;
    }

    overall = totalWeight > 0 ? overall / totalWeight : 0;

    // Determine trend
    const trend = this.determineTrend(overall, { news, social, analyst });

    // Extract key topics (simulated)
    const keyTopics = await this.extractKeyTopics(symbol);

    return {
      symbol,
      overall: Math.round(overall * 100) / 100,
      news: Math.round(news * 100) / 100,
      social: Math.round(social * 100) / 100,
      analyst: Math.round(analyst * 100) / 100,
      trend,
      keyTopics,
      analyzedAt: new Date(),
      dataPoints: Math.floor(Math.random() * 500) + 100,
    };
  }

  /**
   * Analyze sentiment for multiple symbols
   */
  async analyzeSymbols(
    symbols: string[],
    sources: SentimentSource[] = ['all']
  ): Promise<SentimentScore[]> {
    return Promise.all(symbols.map(s => this.analyzeSymbol(s, sources)));
  }

  /**
   * Get overall market sentiment
   */
  async getMarketSentiment(symbols: string[]): Promise<MarketSentiment> {
    const scores = await this.analyzeSymbols(symbols);

    const overall = scores.reduce((sum, s) => sum + s.overall, 0) / scores.length;

    // Group by sector (simulated)
    const bySector: Record<string, number> = {};
    const sectors = ['Technology', 'Healthcare', 'Finance', 'Energy', 'Consumer'];
    for (const sector of sectors) {
      bySector[sector] = Math.random() * 2 - 1;
    }

    // Sort by sentiment to find gainers and losers
    const sorted = [...scores].sort((a, b) => b.overall - a.overall);
    const topGainers = sorted.slice(0, 5);
    const topLosers = sorted.slice(-5).reverse();

    return {
      overall: Math.round(overall * 100) / 100,
      bySector,
      topGainers,
      topLosers,
      timestamp: new Date(),
    };
  }

  /**
   * Get sentiment from news sources (simulated)
   */
  private async getNewsSentiment(symbol: string): Promise<number> {
    // In production, this would call actual news APIs and run NLP
    // Simulated sentiment based on symbol hash for consistency
    const hash = this.hashSymbol(symbol);
    return (Math.sin(hash) + 1) / 2 * 2 - 1; // Range: -1 to 1
  }

  /**
   * Get sentiment from social media (simulated)
   */
  private async getSocialSentiment(symbol: string): Promise<number> {
    // In production, this would analyze Twitter, Reddit, etc.
    const hash = this.hashSymbol(symbol);
    return (Math.cos(hash * 2) + 1) / 2 * 2 - 1;
  }

  /**
   * Get sentiment from analyst ratings (simulated)
   */
  private async getAnalystSentiment(symbol: string): Promise<number> {
    // In production, this would fetch analyst ratings
    const hash = this.hashSymbol(symbol);
    return (Math.sin(hash * 0.5) + 1) / 2 * 2 - 1;
  }

  /**
   * Determine sentiment trend based on scores
   */
  private determineTrend(
    overall: number,
    components: { news: number; social: number; analyst: number }
  ): SentimentTrend {
    const values = Object.values(components);
    const range = Math.max(...values) - Math.min(...values);

    if (range > 0.5) return 'volatile';
    if (overall > 0.3) return 'improving';
    if (overall < -0.3) return 'declining';
    return 'stable';
  }

  /**
   * Extract key topics from news (simulated)
   */
  private async extractKeyTopics(symbol: string): Promise<string[]> {
    // In production, this would use NLP to extract topics
    const topics = [
      'earnings',
      'revenue growth',
      'market share',
      'product launch',
      'competition',
      'regulation',
      'innovation',
      'guidance',
    ];
    
    const hash = this.hashSymbol(symbol);
    const count = (hash % 3) + 2;
    return topics.slice(0, count);
  }

  /**
   * Simple hash function for consistent simulation
   */
  private hashSymbol(symbol: string): number {
    let hash = 0;
    for (let i = 0; i < symbol.length; i++) {
      hash = ((hash << 5) - hash) + symbol.charCodeAt(i);
      hash = hash & hash;
    }
    return Math.abs(hash) / 1000;
  }

  /**
   * Get recent news for a symbol (simulated)
   */
  async getRecentNews(symbol: string, limit: number = 5): Promise<NewsItem[]> {
    // In production, this would fetch from news APIs
    const sources = ['Bloomberg', 'Reuters', 'CNBC', 'WSJ', 'MarketWatch'];
    const headlines = [
      `${symbol} Reports Strong Quarterly Earnings`,
      `Analysts Upgrade ${symbol} Stock Rating`,
      `${symbol} Announces New Product Line`,
      `Investors Eye ${symbol} Ahead of Earnings`,
      `${symbol} CEO Discusses Growth Strategy`,
    ];

    return Array.from({ length: Math.min(limit, 5) }, (_, i) => ({
      title: headlines[i % headlines.length],
      source: sources[i % sources.length],
      timestamp: new Date(Date.now() - i * 3600000),
      sentiment: Math.random() * 2 - 1,
    }));
  }
}

/**
 * Create a sentiment analyzer instance
 */
export function createSentimentAnalyzer(): SentimentAnalyzer {
  return new SentimentAnalyzer();
}

/**
 * Quick helper to analyze sentiment for a symbol
 */
export async function analyzeSentiment(
  symbol: string,
  sources: SentimentSource[] = ['all']
): Promise<SentimentScore> {
  const analyzer = new SentimentAnalyzer();
  return analyzer.analyzeSymbol(symbol, sources);
}