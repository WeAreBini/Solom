/**
 * Next.js 15 Instrumentation Hook
 * 
 * This file provides server lifecycle observability for monitoring,
 * logging, and initialization tasks.
 * 
 * @see https://nextjs.org/docs/app/building-your-application/optimizing/instrumentation
 */

export async function register() {
  // Only run on the server side
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    // Initialize observability SDK or monitoring services
    // Example: Sentry, Datadog, OpenTelemetry
    
    console.log('[Instrumentation] Server starting up...');
    
    // You can add initialization logic here:
    // - Connect to external services
    // - Set up monitoring
    // - Warm up caches
    // - Initialize database connection pools
    
    if (process.env.NODE_ENV === 'development') {
      console.log('[Instrumentation] Development mode - verbose logging enabled');
    }
  }
}

/**
 * Error tracking hook for server-side errors
 * 
 * This hook captures errors that occur during request processing
 * and provides context about where the error occurred.
 * 
 * @param error - The error that occurred
 * @param request - Information about the request
 * @param context - Context about where the error occurred
 */
export function onRequestError(
  error: unknown,
  request: {
    path: string;
    method?: string;
  },
  context: {
    routerKind: 'AppRouter' | 'PagesRouter';
    renderComponent?: string;
    routeModule?: string;
  }
) {
  // Extract error details
  const errorMessage = error instanceof Error ? error.message : 'Unknown error';
  const errorStack = error instanceof Error ? error.stack : undefined;
  
  // Log the error with full context
  console.error('[Instrumentation] Request error:', {
    message: errorMessage,
    path: request.path,
    method: request.method,
    routerKind: context.routerKind,
    component: context.renderComponent,
    routeModule: context.routeModule,
    stack: errorStack,
    timestamp: new Date().toISOString(),
  });
  
  // You can integrate with external error tracking services:
  // - Sentry.captureException(error, { extra: { request, context } });
  // - Datadog.logError(errorMessage, { request, context, stack: errorStack });
  // - OpenTelemetry.recordException(error);
  
  // For financial applications, you may want to:
  // - Alert if critical endpoints fail (e.g., /api/stocks/*)
  // - Track error rates for market data endpoints
  // - Monitor for suspicious activity patterns
  
  if (request.path.startsWith('/api/')) {
    // API endpoint error - could be stock data, market data, etc.
    console.error('[Instrumentation] API error:', request.path);
    
    // Example: Alert on failures for critical financial endpoints
    if (request.path.includes('/stocks/') || request.path.includes('/market/')) {
      console.error('[Instrumentation] Critical market data endpoint failed');
    }
  }
}