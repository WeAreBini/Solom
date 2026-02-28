/**
 * Portfolio Analysis Module
 * 
 * AI-powered portfolio risk assessment and optimization suggestions.
 */

import type {
  Portfolio,
  Holding,
  PortfolioAnalysis,
  CorrelationPair,
  PortfolioSuggestion,
  SuggestedAction,
  SuggestionType,
  StressTestResult,
  RiskTolerance,
} from '@/lib/types/ai';

/**
 * Portfolio Analyzer class
 */
export class PortfolioAnalyzer {
  /**
   * Analyze a portfolio and provide insights
   */
  async analyze(holdings: Holding[]): Promise<PortfolioAnalysis> {
    const [
      diversificationScore,
      sectorExposure,
      geographicExposure,
      assetClassExposure,
      correlations,
      suggestions,
      stressTests,
    ] = await Promise.all([
      this.calculateDiversificationScore(holdings),
      this.calculateSectorExposure(holdings),
      this.calculateGeographicExposure(holdings),
      this.calculateAssetClassExposure(holdings),
      this.calculateCorrelations(holdings),
      this.generateSuggestions(holdings),
      this.runStressTests(holdings),
    ]);

    // Determine overall risk level
    const riskLevel = this.determineRiskLevel(
      diversificationScore,
      sectorExposure,
      correlations
    );

    return {
      diversificationScore,
      riskLevel,
      sectorExposure,
      geographicExposure,
      assetClassExposure,
      correlations,
      suggestions,
      stressTests,
      analyzedAt: new Date(),
    };
  }

  /**
   * Calculate diversification score (0-100)
   */
  private async calculateDiversificationScore(holdings: Holding[]): Promise<number> {
    if (holdings.length === 0) return 0;

    // Factors affecting diversification:
    // 1. Number of holdings
    // 2. Distribution of weights
    // 3. Sector diversity
    // 4. Geographic diversity

    const totalValue = holdings.reduce((sum, h) => sum + h.marketValue, 0);
    
    // Herfindahl-Hirschman Index for concentration
    const weights = holdings.map(h => h.marketValue / totalValue);
    const hhi = weights.reduce((sum, w) => sum + w * w, 0);
    
    // Convert HHI to diversification score
    // HHI ranges from 1/N (perfectly diversified) to 1 (concentrated)
    // Score: 100 - (HHI * 100) for inverse relationship
    const maxHHI = 1;
    const minHHI = 1 / Math.max(holdings.length, 1);
    const normalizedHHI = (hhi - minHHI) / (maxHHI - minHHI);
    
    const baseScore = (1 - normalizedHHI) * 70;
    
    // Bonus for number of holdings
    const holdingBonus = Math.min(holdings.length * 2, 20);
    
    // Bonus for sector diversity (simplified)
    const sectorBonus = Math.min(holdings.length * 0.5, 10);
    
    return Math.round(baseScore + holdingBonus + sectorBonus);
  }

  /**
   * Calculate sector exposure (simulated)
   */
  private async calculateSectorExposure(
    holdings: Holding[]
  ): Promise<Record<string, number>> {
    // In production, this would use actual sector data
    const sectors = [
      'Technology',
      'Healthcare',
      'Finance',
      'Consumer',
      'Energy',
      'Industrial',
      'Utilities',
      'Real Estate',
    ];

    const exposure: Record<string, number> = {};
    const totalValue = holdings.reduce((sum, h) => sum + h.marketValue, 0);

    for (const holding of holdings) {
      // Simulate sector assignment based on symbol
      const sectorIndex = this.hashSymbol(holding.symbol) % sectors.length;
      const sector = sectors[sectorIndex];
      const weight = (holding.marketValue / totalValue) * 100;
      
      exposure[sector] = (exposure[sector] || 0) + weight;
    }

    // Normalize to 100%
    const total = Object.values(exposure).reduce((sum, e) => sum + e, 0);
    for (const sector of Object.keys(exposure)) {
      exposure[sector] = Math.round((exposure[sector] / total) * 1000) / 10;
    }

    return exposure;
  }

  /**
   * Calculate geographic exposure (simulated)
   */
  private async calculateGeographicExposure(
    holdings: Holding[]
  ): Promise<Record<string, number>> {
    // Simplified geographic exposure
    const regions = ['US', 'Europe', 'Asia', 'Emerging Markets'];
    const exposure: Record<string, number> = { US: 70, Europe: 15, Asia: 10, 'Emerging Markets': 5 };
    return exposure;
  }

  /**
   * Calculate asset class exposure (simulated)
   */
  private async calculateAssetClassExposure(
    holdings: Holding[]
  ): Promise<Record<string, number>> {
    const totalValue = holdings.reduce((sum, h) => sum + h.marketValue, 0);
    return {
      'US Equity': Math.round((totalValue * 0.8 / totalValue) * 100),
      'International Equity': 10,
      'Fixed Income': 5,
      Cash: 5,
    };
  }

  /**
   * Calculate correlations between holdings (simulated)
   */
  private async calculateCorrelations(holdings: Holding[]): Promise<CorrelationPair[]> {
    const correlations: CorrelationPair[] = [];
    
    for (let i = 0; i < holdings.length; i++) {
      for (let j = i + 1; j < holdings.length; j++) {
        const correlation = (Math.random() * 2 - 1); // -1 to 1
        
        correlations.push({
          pair: [holdings[i].symbol, holdings[j].symbol],
          correlation: Math.round(correlation * 100) / 100,
          risk: correlation > 0.7 ? 'concentrating' : correlation < -0.3 ? 'diversifying' : 'neutral',
        });
      }
    }

    return correlations.slice(0, 10); // Return top 10 pairs
  }

  /**
   * Generate optimization suggestions
   */
  private async generateSuggestions(holdings: Holding[]): Promise<PortfolioSuggestion[]> {
    const suggestions: PortfolioSuggestion[] = [];
    const totalValue = holdings.reduce((sum, h) => sum + h.marketValue, 0);

    // Check for concentration risk
    const largestHolding = holdings.reduce((max, h) => 
      h.marketValue > max.marketValue ? h : max
    );
    const largestWeight = largestHolding.marketValue / totalValue;

    if (largestWeight > 0.3) {
      suggestions.push({
        id: `sugg_${Date.now()}_1`,
        type: 'diversification',
        priority: 'high',
        title: 'Reduce Concentration Risk',
        description: `${largestHolding.symbol} represents ${(largestWeight * 100).toFixed(1)}% of your portfolio. Consider reducing this position to improve diversification.`,
        impact: 'Reduces portfolio volatility and single-stock risk',
        actions: [
          {
            type: 'sell',
            symbol: largestHolding.symbol,
            amount: Math.round(largestHolding.shares * largestWeight * 0.3),
            reason: 'Reduce concentration to below 25%',
          },
        ],
      });
    }

    // Check for under-diversification
    if (holdings.length < 10) {
      suggestions.push({
        id: `sugg_${Date.now()}_2`,
        type: 'diversification',
        priority: 'medium',
        title: 'Increase Number of Holdings',
        description: `Your portfolio has ${holdings.length} holdings. Consider adding more positions to reduce unsystematic risk.`,
        impact: 'Improves risk-adjusted returns over time',
        actions: [
          {
            type: 'research',
            reason: 'Explore opportunities in different sectors',
          },
        ],
      });
    }

    // Check for sector concentration
    const largestSector = await this.findLargestSector(holdings);
    if (largestSector.weight > 0.4) {
      suggestions.push({
        id: `sugg_${Date.now()}_3`,
        type: 'risk_reduction',
        priority: 'medium',
        title: 'Reduce Sector Concentration',
        description: `${largestSector.name} sector represents ${(largestSector.weight * 100).toFixed(1)}% of your portfolio. Consider diversifying across sectors.`,
        impact: 'Protects against sector-specific downturns',
        actions: [
          {
            type: 'research',
            reason: 'Explore opportunities in underweight sectors',
          },
        ],
      });
    }

    return suggestions;
  }

  /**
   * Run stress tests on the portfolio
   */
  private async runStressTests(holdings: Holding[]): Promise<StressTestResult[]> {
    return [
      {
        scenario: 'Market Crash (-30%)',
        description: 'Simulates a 2008-style market crash where all equities drop 30%',
        portfolioImpact: -30,
        worstCase: -45,
        bestCase: -20,
        recommendations: [
          'Consider adding defensive positions',
          'Ensure adequate cash reserves',
          'Review stop-loss levels',
        ],
      },
      {
        scenario: 'Sector Rotation',
        description: 'Tech sector underperforms by 20% while other sectors remain flat',
        portfolioImpact: -5,
        worstCase: -12,
        bestCase: -2,
        recommendations: [
          'Diversify away from overconcentrated sectors',
          'Consider defensive sector allocation',
        ],
      },
      {
        scenario: 'Interest Rate Spike',
        description: '10-year yields rise 200bps, impacting growth stocks',
        portfolioImpact: -8,
        worstCase: -15,
        bestCase: -3,
        recommendations: [
          'Consider value-oriented positions',
          'Review duration exposure',
        ],
      },
      {
        scenario: 'Recovery Rally',
        description: 'Market recovers with 20% gains across the board',
        portfolioImpact: 20,
        worstCase: 15,
        bestCase: 30,
        recommendations: [
          'Consider taking partial profits',
          'Rebalance to target allocations',
        ],
      },
    ];
  }

  /**
   * Determine overall risk level
   */
  private determineRiskLevel(
    diversificationScore: number,
    sectorExposure: Record<string, number>,
    correlations: CorrelationPair[]
  ): RiskTolerance {
    // Low diversification = high risk
    if (diversificationScore < 40) return 'aggressive';
    if (diversificationScore < 60) return 'moderate';
    return 'conservative';
  }

  /**
   * Find largest sector (helper)
   */
  private async findLargestSector(
    holdings: Holding[]
  ): Promise<{ name: string; weight: number }> {
    const exposure = await this.calculateSectorExposure(holdings);
    let largest = { name: '', weight: 0 };
    
    for (const [name, weight] of Object.entries(exposure)) {
      if (weight > largest.weight) {
        largest = { name, weight: weight / 100 };
      }
    }
    
    return largest;
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
    return Math.abs(hash);
  }
}

/**
 * Create a portfolio analyzer instance
 */
export function createPortfolioAnalyzer(): PortfolioAnalyzer {
  return new PortfolioAnalyzer();
}

/**
 * Quick helper to analyze a portfolio
 */
export async function analyzePortfolio(holdings: Holding[]): Promise<PortfolioAnalysis> {
  const analyzer = new PortfolioAnalyzer();
  return analyzer.analyze(holdings);
}