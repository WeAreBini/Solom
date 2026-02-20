import { z } from 'zod';
import { UserSchema, StockSchema, PortfolioItemSchema, WatchlistItemSchema } from './schemas';

/**
 * @ai-context Inferred TypeScript types from Zod schemas
 * @ai-related src/schemas.ts
 */
export type User = z.infer<typeof UserSchema>;
export type Stock = z.infer<typeof StockSchema>;
export type PortfolioItem = z.infer<typeof PortfolioItemSchema>;
export type WatchlistItem = z.infer<typeof WatchlistItemSchema>;
