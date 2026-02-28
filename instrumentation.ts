/**
 * Next.js 15+ Instrumentation Hook
 * 
 * This file runs when the Next.js server starts and provides lifecycle hooks for:
 * - Server initialization
 * - Error tracking with request context
 * - Performance monitoring
 * - Graceful shutdown handling
 * 
 * @see https://nextjs.org/docs/app/building-your-application/optimizing/instrumentation
 */

export async function register() {
  // Only run on the server, not during build
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    console.log('[Instrumentation] Starting Solom server...');
    
    // Initialize server-side services
    await initializeServices();
  }
}

/**
 * Initialize server-side services
 * This runs once when the server starts
 */
async function initializeServices() {
  // Log server startup
  const startupTime = new Date().toISOString();
  console.log(`[Instrumentation] Server initialized at ${startupTime}`);
  
  // Check for required environment variables
  const requiredEnvVars: string[] = [];
  const missing = requiredEnvVars.filter(v => !process.env[v]);
  
  if (missing.length > 0) {
    console.warn(`[Instrumentation] Warning: Missing environment variables: ${missing.join(', ')}`);
  }
  
  // In production, you might want to:
  // - Connect to databases
  // - Initialize monitoring clients (Sentry, DataDog, etc.)
}

/**
 * Global error handler for server errors
 * This captures errors with full context
 */
export async function onRequestError(
  error: unknown,
  request: {
    path: string;
    method: string;
  },
  context: {
    routerKind: 'App Router' | 'Pages Router';
    serverComponent?: boolean;
    [key: string]: unknown;
  }
): Promise<void> {
  // Extract error details
  const errorMessage = error instanceof Error ? error.message : String(error);
  const errorStack = error instanceof Error ? error.stack : undefined;
  
  // Log the error with context
  console.error('[Instrumentation] Request error:', {
    message: errorMessage,
    path: request.path,
    method: request.method,
    routerKind: context.routerKind,
    serverComponent: context.serverComponent,
    timestamp: new Date().toISOString(),
    stack: errorStack,
  });
  
  // In production, send to error tracking service:
  // await captureException(error, {
  //   tags: { routerKind: context.routerKind },
  //   extra: { path: request.path, method: request.method },
  // });
}