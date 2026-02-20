import { openai } from '@ai-sdk/openai';
import { streamText } from 'ai';

export const maxDuration = 30;

export async function POST(req: Request) {
  const { messages } = await req.json();

  const result = await streamText({
    model: openai('gpt-4o'),
    system:
      'You are SolomGPT, an expert AI financial assistant built into the Solom finance app. Provide concise, accurate, and professional financial insights. When asked about stocks, market trends, or economic data, give thoughtful analysis. Always clarify that nothing you say is financial advice.',
    messages,
  });

  return result.toTextStreamResponse();
}
