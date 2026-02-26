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

// App router
export const appRouter = router({
  council: councilRouter,
  system2: system2Router,
});

export type AppRouter = typeof appRouter;
