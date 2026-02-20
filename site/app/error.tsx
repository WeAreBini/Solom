'use client';

import { useEffect } from 'react';
import { AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('App Error:', error);
  }, [error]);

  return (
    <div className="flex h-[60vh] w-full flex-col items-center justify-center gap-6 text-center px-4">
      <div className="rounded-full bg-destructive/10 p-5 text-destructive">
        <AlertTriangle className="h-10 w-10" />
      </div>
      <div className="space-y-2 max-w-md">
        <h2 className="text-2xl font-bold tracking-tight">Something went wrong</h2>
        <p className="text-muted-foreground text-sm">
          We ran into an unexpected error loading this page. This might be a temporary issue.
        </p>
        {error.digest && (
          <p className="text-xs text-muted-foreground font-mono">Error ID: {error.digest}</p>
        )}
      </div>
      <Button onClick={() => reset()} variant="outline" size="lg">
        Try again
      </Button>
    </div>
  );
}
