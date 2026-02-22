'use client';

/**
 * @ai-context SolomGPT AI chat interface.
 * @ai-warning Do NOT wrap in AppShell — root layout already provides it.
 */
import { useChat } from '@ai-sdk/react';
import { Send, Bot, User, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useEffect, useRef, useState } from 'react';

const SUGGESTED_PROMPTS = [
  'What are the top performing sectors this quarter?',
  'Explain the P/E ratio and why it matters',
  'Analyze AAPL stock fundamentals',
  'What economic indicators should I watch?',
];

export default function ChatPage() {
  const { messages, sendMessage, status } = useChat();
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const isLoading = status === 'submitted' || status === 'streaming';

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!input.trim()) return;
    sendMessage({ role: 'user', parts: [{ type: 'text', text: input }] });
    setInput('');
  };

  const handleSuggestion = (prompt: string) => {
    sendMessage({ role: 'user', parts: [{ type: 'text', text: prompt }] });
  };

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] max-w-4xl mx-auto w-full">
      {/* Header */}
      <div className="flex items-center gap-3 pb-4 border-b mb-4">
        <div className="rounded-lg bg-primary/10 p-2">
          <Bot className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h1 className="text-xl font-bold">SolomGPT</h1>
          <p className="text-xs text-muted-foreground">Your AI Financial Assistant</p>
        </div>
        {isLoading && (
          <div className="ml-auto flex items-center gap-1 text-xs text-muted-foreground">
            <span className="animate-pulse">Thinking</span>
            <span className="flex gap-0.5">
              <span className="w-1 h-1 rounded-full bg-primary animate-bounce" style={{ animationDelay: '0ms' }} />
              <span className="w-1 h-1 rounded-full bg-primary animate-bounce" style={{ animationDelay: '150ms' }} />
              <span className="w-1 h-1 rounded-full bg-primary animate-bounce" style={{ animationDelay: '300ms' }} />
            </span>
          </div>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-4 pb-4 pr-2 custom-scrollbar">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center gap-6">
            <div className="rounded-full bg-primary/10 p-6">
              <Sparkles className="h-10 w-10 text-primary" />
            </div>
            <div className="text-center space-y-2">
              <h2 className="text-lg font-semibold">How can I help you today?</h2>
              <p className="text-sm text-muted-foreground max-w-md">
                Ask me about stocks, market trends, portfolio strategies, or financial concepts.
              </p>
            </div>
            <div className="grid gap-2 sm:grid-cols-2 max-w-lg w-full">
              {SUGGESTED_PROMPTS.map((prompt) => (
                <button
                  key={prompt}
                  onClick={() => handleSuggestion(prompt)}
                  className="rounded-lg border bg-card p-3 text-left text-sm hover:bg-surface-hover transition-colors press-scale"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        ) : (
          messages.map((m) => (
            <div
              key={m.id}
              className={`flex gap-3 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {m.role !== 'user' && (
                <div className="mt-1 shrink-0 rounded-lg bg-primary/10 p-1.5 h-fit">
                  <Bot className="h-4 w-4 text-primary" />
                </div>
              )}
              <div
                className={`max-w-[80%] rounded-xl px-4 py-3 text-sm leading-relaxed ${
                  m.role === 'user'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-card border'
                }`}
              >
                <div className="whitespace-pre-wrap">
                  {m.parts?.map((p) => (p.type === 'text' ? p.text : '')).join('')}
                </div>
              </div>
              {m.role === 'user' && (
                <div className="mt-1 shrink-0 rounded-lg bg-muted p-1.5 h-fit">
                  <User className="h-4 w-4 text-muted-foreground" />
                </div>
              )}
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="flex-none pt-4 border-t mt-auto">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about stocks, markets, or financial advice..."
            className="flex-1"
            disabled={isLoading}
          />
          <Button type="submit" disabled={isLoading || !input.trim()} className="press-scale">
            <Send className="h-4 w-4" />
            <span className="sr-only">Send</span>
          </Button>
        </form>
        <p className="text-xs text-muted-foreground text-center mt-2">
          SolomGPT may produce inaccurate information. Not financial advice.
        </p>
      </div>
    </div>
  );
}
