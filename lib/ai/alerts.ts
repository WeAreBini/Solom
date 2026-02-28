/**
 * Smart Alerts Module
 * 
 * AI-powered alert system that generates intelligent alerts based on
 * market data, patterns, and user preferences.
 */

import type {
  SmartAlert,
  AlertType,
  AlertPriority,
  AlertPreferences,
  EnrichedAlert,
} from '@/lib/types/ai';

/**
 * Generate a unique ID for alerts
 */
function generateAlertId(): string {
  return `alert_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Default alert preferences
 */
export const DEFAULT_ALERT_PREFERENCES: AlertPreferences = {
  dailyLimit: 20,
  minConfidence: 0.6,
  enabledTypes: [
    'breakout',
    'breakdown',
    'volume_spike',
    'earnings_near',
    'unusual_activity',
    'sentiment_shift',
  ],
  symbols: [],
};

/**
 * Smart Alerts Engine
 */
export class SmartAlertsEngine {
  private preferences: AlertPreferences;

  constructor(preferences: Partial<AlertPreferences> = {}) {
    this.preferences = { ...DEFAULT_ALERT_PREFERENCES, ...preferences };
  }

  /**
   * Generate alerts for given symbols and market data
   */
  async generateAlerts(
    symbols: string[],
    marketData: Map<string, MarketDataPoint>
  ): Promise<SmartAlert[]> {
    const alerts: SmartAlert[] = [];

    for (const symbol of symbols) {
      const data = marketData.get(symbol);
      if (!data) continue;

      // Check various alert conditions
      const breakouts = this.detectBreakouts(symbol, data);
      const breakdowns = this.detectBreakdowns(symbol, data);
      const volumeSpikes = this.detectVolumeSpikes(symbol, data);
      const unusualActivity = this.detectUnusualActivity(symbol, data);

      alerts.push(...breakouts, ...breakdowns, ...volumeSpikes, ...unusualActivity);
    }

    // Filter by preferences
    const filteredAlerts = alerts
      .filter(a => this.preferences.enabledTypes.includes(a.type))
      .filter(a => a.confidence >= this.preferences.minConfidence)
      .slice(0, this.preferences.dailyLimit);

    // Sort by priority and confidence
    return filteredAlerts.sort((a, b) => {
      const priorityOrder = { urgent: 0, high: 1, medium: 2, low: 3 };
      if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
        return priorityOrder[a.priority] - priorityOrder[b.priority];
      }
      return b.confidence - a.confidence;
    });
  }

  /**
   * Detect breakout patterns
   */
  private detectBreakouts(symbol: string, data: MarketDataPoint): SmartAlert[] {
    const alerts: SmartAlert[] = [];

    // Simple breakout detection: price > recent high with volume
    if (data.price > data.high52w * 0.98 && data.volume > data.avgVolume * 1.5) {
      alerts.push({
        id: generateAlertId(),
        symbol,
        type: 'breakout',
        confidence: 0.75,
        reasoning: `Price (${data.price.toFixed(2)}) approaching 52-week high (${data.high52w.toFixed(2)}) with elevated volume (${((data.volume / data.avgVolume) * 100).toFixed(0)}% of average)`,
        suggestedAction: 'Consider monitoring for confirmation or setting a breakout alert above $' + data.high52w.toFixed(2),
        data: {
          price: data.price,
          high52w: data.high52w,
          volumeRatio: data.volume / data.avgVolume,
        },
        createdAt: new Date(),
        acknowledged: false,
        priority: 'high',
      });
    }

    return alerts;
  }

  /**
   * Detect breakdown patterns
   */
  private detectBreakdowns(symbol: string, data: MarketDataPoint): SmartAlert[] {
    const alerts: SmartAlert[] = [];

    // Simple breakdown detection: price < recent low with volume
    if (data.price < data.low52w * 1.02 && data.volume > data.avgVolume * 1.5) {
      alerts.push({
        id: generateAlertId(),
        symbol,
        type: 'breakdown',
        confidence: 0.72,
        reasoning: `Price (${data.price.toFixed(2)}) approaching 52-week low (${data.low52w.toFixed(2)}) with elevated volume (${((data.volume / data.avgVolume) * 100).toFixed(0)}% of average)`,
        suggestedAction: 'Consider risk management or wait for support confirmation at $' + data.low52w.toFixed(2),
        data: {
          price: data.price,
          low52w: data.low52w,
          volumeRatio: data.volume / data.avgVolume,
        },
        createdAt: new Date(),
        acknowledged: false,
        priority: 'high',
      });
    }

    return alerts;
  }

  /**
   * Detect volume spikes
   */
  private detectVolumeSpikes(symbol: string, data: MarketDataPoint): SmartAlert[] {
    const alerts: SmartAlert[] = [];

    const volumeRatio = data.volume / data.avgVolume;
    
    if (volumeRatio > 3) {
      alerts.push({
        id: generateAlertId(),
        symbol,
        type: 'volume_spike',
        confidence: 0.65,
        reasoning: `Unusually high volume: ${((volumeRatio) * 100).toFixed(0)}% of average. This often precedes significant price movements.`,
        suggestedAction: 'Investigate news or earnings. Consider waiting for price confirmation before acting.',
        data: {
          volume: data.volume,
          avgVolume: data.avgVolume,
          volumeRatio,
        },
        createdAt: new Date(),
        acknowledged: false,
        priority: volumeRatio > 5 ? 'urgent' : 'high',
      });
    } else if (volumeRatio > 2) {
      alerts.push({
        id: generateAlertId(),
        symbol,
        type: 'volume_spike',
        confidence: 0.55,
        reasoning: `Elevated volume: ${((volumeRatio) * 100).toFixed(0)}% of average`,
        suggestedAction: 'Monitor for price action confirmation',
        data: {
          volume: data.volume,
          avgVolume: data.avgVolume,
          volumeRatio,
        },
        createdAt: new Date(),
        acknowledged: false,
        priority: 'medium',
      });
    }

    return alerts;
  }

  /**
   * Detect unusual activity patterns
   */
  private detectUnusualActivity(symbol: string, data: MarketDataPoint): SmartAlert[] {
    const alerts: SmartAlert[] = [];

    // Large price movement with no obvious catalyst
    const priceChange = Math.abs(data.changePercent);
    const volumeRatio = data.volume / data.avgVolume;

    if (priceChange > 5 && volumeRatio < 1) {
      alerts.push({
        id: generateAlertId(),
        symbol,
        type: 'unusual_activity',
        confidence: 0.60,
        reasoning: `Large price movement (${data.changePercent.toFixed(2)}%) on below-average volume. This could indicate low liquidity or pre-news positioning.`,
        suggestedAction: 'Check for news. Be cautious of potential reversal.',
        data: {
          priceChange: data.changePercent,
          volumeRatio,
        },
        createdAt: new Date(),
        acknowledged: false,
        priority: 'medium',
      });
    }

    return alerts;
  }

  /**
   * Enrich an alert with additional context
   */
  enrichAlert(alert: SmartAlert, currentPrice: number): EnrichedAlert {
    const priceMovement = currentPrice - (alert.data?.price as number || currentPrice);
    
    return {
      ...alert,
      priceAtAlert: alert.data?.price as number || currentPrice,
      priceMovement,
      outcome: 'pending',
    };
  }

  /**
   * Update preferences
   */
  updatePreferences(preferences: Partial<AlertPreferences>): void {
    this.preferences = { ...this.preferences, ...preferences };
  }

  /**
   * Get current preferences
   */
  getPreferences(): AlertPreferences {
    return { ...this.preferences };
  }
}

/**
 * Market data point interface
 */
export interface MarketDataPoint {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  avgVolume: number;
  high52w: number;
  low52w: number;
  timestamp: Date;
}

/**
 * Create a smart alerts engine instance
 */
export function createSmartAlertsEngine(
  preferences?: Partial<AlertPreferences>
): SmartAlertsEngine {
  return new SmartAlertsEngine(preferences);
}

/**
 * Quick helper to generate alerts for symbols
 */
export async function generateSmartAlerts(
  symbols: string[],
  marketData: Map<string, MarketDataPoint>,
  preferences?: Partial<AlertPreferences>
): Promise<SmartAlert[]> {
  const engine = new SmartAlertsEngine(preferences);
  return engine.generateAlerts(symbols, marketData);
}