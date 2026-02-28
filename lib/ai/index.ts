/**
 * AI Module - Public API
 * 
 * This module provides AI-powered features for Solom including:
 * - Financial Assistant (conversational AI)
 * - Sentiment Analysis
 * - Smart Alerts
 * - Portfolio Analysis
 * - Price Predictions
 * 
 * @module lib/ai
 */

// Assistant
export {
  FinancialAssistant,
  createFinancialAssistant,
  askFinancialAssistant,
} from './assistant';

// Sentiment
export {
  SentimentAnalyzer,
  createSentimentAnalyzer,
  analyzeSentiment,
  type SentimentSource,
} from './sentiment';

// Alerts
export {
  SmartAlertsEngine,
  createSmartAlertsEngine,
  generateSmartAlerts,
  DEFAULT_ALERT_PREFERENCES,
  type MarketDataPoint,
} from './alerts';

// Portfolio
export {
  PortfolioAnalyzer,
  createPortfolioAnalyzer,
  analyzePortfolio,
} from './portfolio';

// Predictions
export {
  PricePredictor,
  createPricePredictor,
  predictPriceMovement,
} from './predictions';

// Re-export types
export type {
  // Core
  AIContext,
  RiskTolerance,
  InvestmentGoal,
  Portfolio,
  Holding,
  // Assistant
  AssistantRequest,
  AssistantResponse,
  AssistantMessage,
  Source,
  AssistantStructuredData,
  StockRecommendation,
  PriceAnalysis,
  TechnicalIndicator,
  CompanyOverview,
  NewsItem,
  ComparisonData,
  ScreenResults,
  ScreenResult,
  CouncilAgent,
  // Sentiment
  SentimentScore,
  SentimentTrend,
  MarketSentiment,
  SentimentAlertConfig,
  // Alerts
  AlertType,
  SmartAlert,
  AlertPriority,
  EnrichedAlert,
  AlertPreferences,
  // Portfolio Analysis
  PortfolioAnalysis,
  CorrelationPair,
  PortfolioSuggestion,
  SuggestionType,
  SuggestedAction,
  StressTestResult,
  // Predictions
  PricePrediction,
  PredictionTimeframe,
  PredictionFactor,
  PredictionModel,
  // Config
  AIConfig,
  AIResponse,
  AIError,
  AsyncResult,
} from '@/lib/types/ai';

export { DEFAULT_AI_CONFIG } from '@/lib/types/ai';