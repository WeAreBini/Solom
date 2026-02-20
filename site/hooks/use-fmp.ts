import { useQuery } from "@tanstack/react-query";
import { getQuote, getMarketActives, getMarketGainers, getMarketLosers, getHistoricalPrices } from "@/app/actions/fmp";

/**
 * @ai-context Custom hooks for fetching FMP data using TanStack Query.
 * @ai-related app/actions/fmp.ts
 */

export function useQuote(symbol: string) {
  return useQuery({
    queryKey: ["quote", symbol],
    queryFn: () => getQuote(symbol),
    enabled: !!symbol,
    staleTime: 60 * 1000, // 1 minute
  });
}

export function useMarketActives() {
  return useQuery({
    queryKey: ["marketActives"],
    queryFn: () => getMarketActives(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useMarketGainers() {
  return useQuery({
    queryKey: ["marketGainers"],
    queryFn: () => getMarketGainers(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useMarketLosers() {
  return useQuery({
    queryKey: ["marketLosers"],
    queryFn: () => getMarketLosers(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useHistoricalPrices(symbol: string) {
  return useQuery({
    queryKey: ["historicalPrices", symbol],
    queryFn: () => getHistoricalPrices(symbol),
    enabled: !!symbol,
    staleTime: 60 * 60 * 1000, // 1 hour
  });
}
