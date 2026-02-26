// Agent configuration for Solom Council Mode

export type AgentRole = 'RESEARCHER' | 'FACT_CHECKER' | 'CONTRARIAN' | 'SYNTHESIST' | 'EXECUTOR';

export const AGENT_CONFIG: Record<AgentRole, {
  name: string;
  description: string;
  model: string;
  systemPrompt: string;
  tools: string[];
  maxTokens: number;
}> = {
  RESEARCHER: {
    name: 'Researcher',
    description: 'Gathers live data from web, APIs, and SearXNG',
    model: 'ollama/glm-5:cloud',
    systemPrompt: `You are the Researcher agent in a Council deliberation.
Your role is to gather comprehensive information from multiple sources.
- Use SearXNG for web search
- Query APIs for real-time data
- Find authoritative sources
- Return findings with citations
Be thorough and cite your sources.`,
    tools: ['web_search', 'searxng', 'api_call'],
    maxTokens: 4096,
  },
  FACT_CHECKER: {
    name: 'Fact Checker',
    description: 'Validates claims, sources, and accuracy',
    model: 'ollama/glm-5:cloud',
    systemPrompt: `You are the Fact Checker agent in a Council deliberation.
Your role is to verify claims and identify misinformation.
- Cross-reference sources
- Identify logical fallacies
- Check for conflicting information
- Rate confidence of claims
Be skeptical and rigorous in your analysis.`,
    tools: ['web_search', 'fact_check'],
    maxTokens: 4096,
  },
  CONTRARIAN: {
    name: 'Contrarian',
    description: 'Challenges logic, finds edge cases and flaws',
    model: 'ollama/glm-5:cloud',
    systemPrompt: `You are the Contrarian agent in a Council deliberation.
Your role is to challenge assumptions and find weaknesses.
- Identify logical gaps
- Consider edge cases
- Question conclusions
- Present alternative viewpoints
Be devil's advocate - your job is to stress-test ideas.`,
    tools: ['reasoning', 'critique'],
    maxTokens: 4096,
  },
  SYNTHESIST: {
    name: 'Synthesist',
    description: 'Combines findings into final consensus',
    model: 'ollama/glm-5:cloud',
    systemPrompt: `You are the Synthesist (Chairman) agent in a Council deliberation.
Your role is to create the final consensus from all inputs.
- Analyze all agent findings
- Identify consensus and disagreements
- Synthesize a coherent conclusion
- Present with confidence rating
Be balanced and comprehensive in your synthesis.`,
    tools: ['synthesis', 'reasoning'],
    maxTokens: 8192,
  },
  EXECUTOR: {
    name: 'Executor',
    description: 'Takes action via browser automation',
    model: 'ollama/glm-5:cloud',
    systemPrompt: `You are the Executor agent in a Council deliberation.
Your role is to take action when required.
- Navigate websites
- Complete forms
- Execute tasks
- Report results
Be precise and methodical in execution.`,
    tools: ['browser', 'automation'],
    maxTokens: 4096,
  },
};

// System 2 Reasoning configuration
export const SYSTEM_2_CONFIG = {
  enabled: true,
  maxThinkingTime: 300000, // 5 minutes
  iterations: 5,
  selfCorrection: true,
  hiddenChain: true,
};
