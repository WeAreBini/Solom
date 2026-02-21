'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Sparkles, AlertCircle } from 'lucide-react';

export function AIInsightsWidget() {
  const [insights, setInsights] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchInsights() {
      try {
        const response = await fetch('/api/chat/insights');
        if (!response.ok) {
          throw new Error('Failed to fetch insights');
        }
        const data = await response.json();
        setInsights(data.insights || []);
      } catch (err) {
        console.error(err);
        setError('Unable to load AI insights at this time.');
      } finally {
        setLoading(false);
      }
    }

    fetchInsights();
  }, []);

  return (
    <Card className="glass-card overflow-hidden relative">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary/50 via-primary to-primary/50" />
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Sparkles className="h-5 w-5 text-primary" />
          AI Portfolio Insights
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-3">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-[90%]" />
            <Skeleton className="h-4 w-[95%]" />
          </div>
        ) : error ? (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <AlertCircle className="h-4 w-4 text-destructive" />
            {error}
          </div>
        ) : insights.length > 0 ? (
          <ul className="space-y-3">
            {insights.map((insight, index) => (
              <li key={index} className="flex items-start gap-2 text-sm">
                <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                <span className="text-muted-foreground leading-relaxed">{insight}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-muted-foreground">No insights available at this time.</p>
        )}
      </CardContent>
    </Card>
  );
}
