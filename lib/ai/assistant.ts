/**
 * Financial Assistant Module
 * 
 * Provides AI-powered conversational assistance for financial queries.
 * Leverages existing Council Mode infrastructure for complex questions.
 */

import type {
  AssistantRequest,
  AssistantResponse,
  AssistantMessage,
  AssistantStructuredData,
  AIContext,
  StockRecommendation,
  PriceAnalysis,
  CompanyOverview,
  ScreenResults,
  ScreenResult,
} from '@/lib/types/ai';

/**
 * Generate a unique ID for messages
 */
function generateId(): string {
  return `msg_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Financial Assistant class for handling user queries
 */
export class FinancialAssistant {
  private context: AIContext;
  private conversationHistory: AssistantMessage[] = [];

  constructor(context: AIContext) {
    this.context = context;
  }

  /**
   * Process a user query and return an AI-generated response
   */
  async ask(query: string): Promise<AssistantResponse> {
    const startTime = Date.now();

    // Add user message to history
    const userMessage: AssistantMessage = {
      id: generateId(),
      role: 'user',
      content: query,
      timestamp: new Date(),
    };
    this.conversationHistory.push(userMessage);

    // Determine query complexity to decide on Council Mode
    const isComplex = this.isComplexQuery(query);

    let response: AssistantMessage;
    let agents: AssistantResponse['agents'];

    if (isComplex && this.context.analysisDepth === 'deep') {
      // Use Council Mode for complex queries
      const result = await this.processWithCouncil(query);
      response = result.message;
      agents = result.agents;
    } else {
      // Direct response for simple queries
      response = await this.generateDirectResponse(query);
    }

    this.conversationHistory.push(response);

    return {
      message: response,
      councilMode: isComplex,
      agents,
      latency: Date.now() - startTime,
      model: 'ollama/glm-5:cloud',
    };
  }

  /**
   * Determine if a query requires Council Mode deliberation
   */
  private isComplexQuery(query: string): boolean {
    const complexIndicators = [
      'should i buy',
      'should i sell',
      'what do you think about',
      'analyze',
      'compare',
      'pros and cons',
      'risk',
      'portfolio',
      'diversif',
      'recommend',
      'advice',
      'opinion',
      'predict',
    ];

    const lowerQuery = query.toLowerCase();
    return complexIndicators.some(indicator => lowerQuery.includes(indicator));
  }

  /**
   * Process query using Council Mode deliberation
   */
  private async processWithCouncil(
    query: string
  ): Promise<{ message: AssistantMessage; agents: AssistantResponse['agents'] }> {
    // In production, this would invoke the actual Council Mode
    // For now, we simulate a deliberation process
    
    const agents: AssistantResponse['agents'] = [
      {
        name: 'Researcher',
        role: 'Data gathering and analysis',
        contribution: 'Gathered relevant market data and historical context',
        confidence: 0.85,
      },
      {
        name: 'Analyst',
        role: 'Financial analysis',
        contribution: 'Analyzed financial metrics and trends',
        confidence: 0.80,
      },
      {
        name: 'Risk Assessor',
        role: 'Risk evaluation',
        contribution: 'Evaluated potential risks and opportunities',
        confidence: 0.78,
      },
    ];

    const synthesizedResponse = await this.synthesizeCouncilResults(query, agents);

    return {
      message: synthesizedResponse,
      agents,
    };
  }

  /**
   * Synthesize Council results into a coherent response
   */
  private async synthesizeCouncilResults(
    query: string,
    agents: NonNullable<AssistantResponse['agents']>
  ): Promise<AssistantMessage> {
    // In production, this would use the Synthesist agent
    const avgConfidence = agents.reduce((sum, a) => sum + a.confidence, 0) / agents.length;

    return {
      id: generateId(),
      role: 'assistant',
      content: `Based on multi-agent analysis of your query "${query}", our team has deliberated and reached a conclusion with ${Math.round(avgConfidence * 100)}% confidence.\n\nKey insights from our agents:\n${agents.map(a => `- **${a.name}**: ${a.contribution}`).join('\n')}`,
      timestamp: new Date(),
      sources: [],
    };
  }

  /**
   * Generate a direct response for simple queries
   */
  private async generateDirectResponse(query: string): Promise<AssistantMessage> {
    // In production, this would call the LLM with appropriate context
    // For now, we return a structured placeholder
    
    const structuredData = await this.extractStructuredData(query);

    return {
      id: generateId(),
      role: 'assistant',
      content: this.formatResponse(query, structuredData),
      timestamp: new Date(),
      data: structuredData,
      sources: [],
    };
  }

  /**
   * Extract structured data from context based on query
   */
  private async extractStructuredData(query: string): Promise<AssistantStructuredData | undefined> {
    const lowerQuery = query.toLowerCase();

    // Check for screening queries
    if (lowerQuery.includes('show me') || lowerQuery.includes('find') || lowerQuery.includes('screen')) {
      return this.generateScreenResults(query);
    }

    // Check for recommendation queries
    if (lowerQuery.includes('recommend') || lowerQuery.includes('should i')) {
      return this.generateRecommendation(query);
    }

    // Check for analysis queries
    if (lowerQuery.includes('analyze') || lowerQuery.includes('analysis')) {
      return this.generateAnalysis(query);
    }

    return undefined;
  }

  /**
   * Generate screen results placeholder
   */
  private generateScreenResults(query: string): ScreenResults {
    // In production, this would run an actual screen
    const results: ScreenResult[] = this.context.watchlist.slice(0, 5).map((symbol, i) => ({
      symbol,
      name: `${symbol} Inc.`,
      price: 100 + Math.random() * 50,
      change: Math.random() * 10 - 5,
      changePercent: Math.random() * 5 - 2.5,
      matchReasons: ['Matches query criteria'],
    }));

    return {
      type: 'screen_results',
      query,
      results,
      totalMatches: results.length,
      executionTime: 50,
    };
  }

  /**
   * Generate recommendation placeholder
   */
  private generateRecommendation(query: string): StockRecommendation {
    const symbol = this.context.watchlist[0] || 'AAPL';
    return {
      type: 'recommendation',
      symbol,
      action: 'hold',
      confidence: 0.75,
      reasoning: [
        'Current market conditions suggest caution',
        'Valuation metrics are within normal range',
        'Historical performance has been stable',
      ],
      riskLevel: 'medium',
    };
  }

  /**
   * Generate analysis placeholder
   */
  private generateAnalysis(query: string): PriceAnalysis {
    const symbol = this.context.watchlist[0] || 'AAPL';
    return {
      type: 'price_analysis',
      symbol,
      currentPrice: 150,
      support: [145, 140, 135],
      resistance: [155, 160, 165],
      trend: 'neutral',
      indicators: [
        { name: 'RSI', value: 50, signal: 'neutral', description: 'RSI indicates neutral momentum' },
        { name: 'MACD', value: 'positive crossover', signal: 'bullish', description: 'MACD shows bullish momentum' },
      ],
    };
  }

  /**
   * Format the response text
   */
  private formatResponse(query: string, data?: AssistantStructuredData): string {
    if (!data) {
      return `I'm analyzing your query about "${query}". Based on your watchlist and risk tolerance, I can help you explore investment opportunities. What specific information would you like?`;
    }

    switch (data.type) {
      case 'screen_results':
        return `Found ${data.results.length} stocks matching your criteria:\n\n${data.results.map(r => `- **${r.symbol}**: $${r.price.toFixed(2)} (${r.changePercent >= 0 ? '+' : ''}${r.changePercent.toFixed(2)}%)`).join('\n')}`;
      
      case 'recommendation':
        return `**Recommendation for ${data.symbol}**: ${data.action.toUpperCase()}\n\nConfidence: ${Math.round(data.confidence * 100)}%\n\n**Reasoning:**\n${data.reasoning.map(r => `- ${r}`).join('\n')}\n\nRisk Level: ${data.riskLevel}`;
      
      case 'price_analysis':
        return `**Analysis for ${data.symbol}**\n\nCurrent Price: $${data.currentPrice.toFixed(2)}\nTrend: ${data.trend}\n\n**Support Levels:** ${data.support.map(s => `$${s}`).join(', ')}\n**Resistance Levels:** ${data.resistance.map(r => `$${r}`).join(', ')}\n\n**Indicators:**\n${data.indicators.map(i => `- ${i.name}: ${i.signal} (${i.description})`).join('\n')}`;
      
      default:
        return `I've analyzed your query. How can I help you further with this information?`;
    }
  }

  /**
   * Get conversation history
   */
  getHistory(): AssistantMessage[] {
    return [...this.conversationHistory];
  }

  /**
   * Clear conversation history
   */
  clearHistory(): void {
    this.conversationHistory = [];
  }
}

/**
 * Create a financial assistant instance
 */
export function createFinancialAssistant(context: AIContext): FinancialAssistant {
  return new FinancialAssistant(context);
}

/**
 * Quick helper for one-off queries
 */
export async function askFinancialAssistant(
  query: string,
  context: AIContext
): Promise<AssistantResponse> {
  const assistant = new FinancialAssistant(context);
  return assistant.ask(query);
}