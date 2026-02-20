import { z } from 'zod';

/**
 * @ai-context User schema definition
 * @ai-related src/types.ts
 */
export const UserSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  displayName: z.string().optional(),
  subscriptionStatus: z.enum(['active', 'inactive', 'past_due', 'canceled', 'unpaid']),
  subscriptionType: z.enum(['free', 'premium', 'pro'])
});

/**
 * @ai-context Stock schema definition
 * @ai-related src/types.ts
 */
export const StockSchema = z.object({
  symbol: z.string(),
  name: z.string(),
  price: z.number(),
  change: z.number(),
  marketCap: z.number().optional()
});

/**
 * @ai-context Portfolio item schema definition
 * @ai-related src/types.ts
 */
export const PortfolioItemSchema = z.object({
  id: z.string(),
  userId: z.string(),
  stock: StockSchema,
  pricePurchased: z.number(),
  amountOfShares: z.number(),
  purchasedDate: z.date()
});

/**
 * @ai-context Watchlist item schema definition
 * @ai-related src/types.ts
 */
export const WatchlistItemSchema = z.object({
  id: z.string(),
  userId: z.string(),
  ticker: z.string(),
  isWatching: z.boolean()
});
