'use client';

import { AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body style={{ margin: 0, fontFamily: 'sans-serif', background: '#09090b', color: '#fafafa' }}>
        <div
          style={{
            display: 'flex',
            minHeight: '100vh',
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'column',
            gap: '1.5rem',
            padding: '2rem',
            textAlign: 'center',
          }}
        >
          <div style={{ fontSize: '3rem' }}>⚠️</div>
          <div>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 700, marginBottom: '0.5rem' }}>
              Critical Error
            </h1>
            <p style={{ color: '#a1a1aa', maxWidth: '30rem', margin: '0 auto' }}>
              A critical error occurred. Please try refreshing the page. If the problem persists, contact support.
            </p>
            {error.digest && (
              <p style={{ fontSize: '0.75rem', color: '#52525b', marginTop: '0.5rem', fontFamily: 'monospace' }}>
                Error ID: {error.digest}
              </p>
            )}
          </div>
          <button
            onClick={() => reset()}
            style={{
              padding: '0.75rem 2rem',
              borderRadius: '0.5rem',
              background: '#165BA2',
              color: '#fff',
              border: 'none',
              cursor: 'pointer',
              fontSize: '1rem',
              fontWeight: 600,
            }}
          >
            Refresh Page
          </button>
        </div>
      </body>
    </html>
  );
}
