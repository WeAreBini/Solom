import { initTRPC } from '@trpc/server';
import { z } from 'zod';
import superjson from 'superjson';
import { prisma } from '@/lib/db';

export const createContext = () => ({ prisma });

type Context = Awaited<ReturnType<typeof createContext>>;

export const t = initTRPC.context<Context>().create({
  transformer: superjson,
});

export const router = t.router;
export const publicProcedure = t.procedure;

// Council router
export const councilRouter = router({
  create: publicProcedure
    .input(z.object({ query: z.string().min(1) }))
    .mutation(async ({ input }) => {
      // TODO: Create council with members
      return {
        id: crypto.randomUUID(),
        query: input.query,
        status: 'PENDING',
        members: [
          { agentName: 'RESEARCHER', status: 'IDLE' },
          { agentName: 'FACT_CHECKER', status: 'IDLE' },
          { agentName: 'CONTRARIAN', status: 'IDLE' },
          { agentName: 'SYNTHESIST', status: 'IDLE' },
        ],
      };
    }),

  getStatus: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {
      // TODO: Fetch from database
      return {
        id: input.id,
        status: 'RUNNING',
        members: [],
      };
    }),

  getResults: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {
      // TODO: Fetch completed council
      return {
        id: input.id,
        consensus: null,
        reasoningChain: [],
      };
    }),
});

import { runSystem2Reasoning } from '@/lib/system2';

// System 2 Reasoning router
const system2Router = router({
  solve: publicProcedure
    .input(z.object({ problem: z.string().min(1), depth: z.number().min(1).max(10).optional() }))
    .mutation(async ({ input }) => {
      const result = await runSystem2Reasoning(input.problem, input.depth);
      return result;
    }),

  getStatus: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {
      // TODO: Fetch from database
      return { id: input.id, status: 'RUNNING' };
    }),
});

// Finance router for stock market dashboard
import {
  getMarketIndices,
  getTopGainers,
  getTopLosers,
  searchStocks,
  getStockQuote,
} from '@/lib/finance';

const financeRouter = router({
  // Get market indices (S&P 500, NASDAQ, DOW)
  getMarketIndices: publicProcedure
    .query(async () => {
      return getMarketIndices();
    }),

  // Get top gainers
  getTopGainers: publicProcedure
    .query(async () => {
      return getTopGainers();
    }),

  // Get top losers
  getTopLosers: publicProcedure
    .query(async () => {
      return getTopLosers();
    }),

  // Search for stocks
  searchStocks: publicProcedure
    .input(z.object({ query: z.string() }))
    .query(async ({ input }) => {
      return searchStocks(input.query);
    }),

  // Get a single stock quote
  getStockQuote: publicProcedure
    .input(z.object({ symbol: z.string() }))
    .query(async ({ input }) => {
      return getStockQuote(input.symbol);
    }),

  // Get market movers (both gainers and losers)
  getMarketMovers: publicProcedure
    .query(async () => {
      return {
        gainers: getTopGainers(),
        losers: getTopLosers(),
      };
    }),
});

// App router
export const appRouter = router({
  council: councilRouter,
  system2: system2Router,
  finance: financeRouter,
});

export type AppRouter = typeof appRouter;
