// Hooks index

export {
  useHistoricalData,
  useRealTimeStockPrice,
  useRealTimeMarketIndices,
} from "./use-real-time-data";

export type { StockPriceUpdate, MarketIndexUpdate } from "./use-real-time-data";

// Chart data hook for TradingView Lightweight Charts
export { useChartData } from "./useChartData";
export type { UseChartDataOptions, UseChartDataReturn } from "./useChartData";