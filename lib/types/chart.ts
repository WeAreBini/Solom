/**
 * Chart Types for TradingView Lightweight Charts
 * Provides type definitions for financial chart components
 */

// Re-export types from lightweight-charts for convenience
export type {
  IChartApi,
  ISeriesApi,
  Time,
  UTCTimestamp,
  BusinessDay,
  CandlestickData,
  LineData,
  HistogramData,
  AreaData,
  DeepPartial,
  ChartOptions,
  SeriesOptionsCommon,
  CandlestickSeriesOptions,
  LineSeriesOptions,
  AreaSeriesOptions,
  HistogramSeriesOptions,
} from 'lightweight-charts';

// Re-export series constants
export {
  CandlestickSeries,
  LineSeries,
  AreaSeries,
  HistogramSeries,
} from 'lightweight-charts';

// Chart type variants
export type ChartType = 'line' | 'candlestick' | 'area';

// Timeframe options
export type Timeframe = '1m' | '5m' | '15m' | '30m' | '1h' | '4h' | '1d' | '1w' | '1M';

// Base data point for any chart type
export interface BaseDataPoint {
  time: number | string | Date;
}

// OHLCV data for candlestick charts
export interface OHLCVDataPoint extends BaseDataPoint {
  open: number;
  high: number;
  low: number;
  close: number;
  volume?: number;
}

// Line/Area data point
export interface PriceDataPoint extends BaseDataPoint {
  value: number;
}

// Histogram data (for volume)
export interface VolumeDataPoint extends BaseDataPoint {
  value: number;
  color?: string;
}

// Real-time price update
export interface RealtimePriceUpdate {
  time: number;
  price: number;
  volume?: number;
}

// Chart configuration
export interface ChartConfig {
  /** Chart type to display */
  type: ChartType;
  /** Current timeframe */
  timeframe?: Timeframe;
  /** Enable real-time updates */
  realtime?: boolean;
  /** Show volume indicator */
  showVolume?: boolean;
  /** Chart height */
  height?: number;
  /** Auto-size to container */
  autoSize?: boolean;
  /** Show crosshair on hover */
  crosshair?: boolean;
  /** Watermark text */
  watermark?: string;
  /** Theme colors */
  colors?: ChartColors;
}

// Color configuration
export interface ChartColors {
  up: string;
  down: string;
  line: string;
  area: string;
  volume: string;
  background: string;
  grid: string;
  text: string;
}

// Default color scheme matching design tokens
export const defaultChartColors: ChartColors = {
  up: '#10b981',      // emerald-500
  down: '#ef4444',    // red-500
  line: '#2563eb',    // blue-600
  area: '#2563eb',    // blue-600
  volume: '#64748b',  // slate-500
  background: 'transparent',
  grid: 'rgba(148, 163, 184, 0.1)',
  text: '#94a3b8',    // slate-400
};

// Timeframe configuration
export interface TimeframeConfig {
  label: string;
  value: Timeframe;
  seconds: number;
}

export const timeframeOptions: TimeframeConfig[] = [
  { label: '1m', value: '1m', seconds: 60 },
  { label: '5m', value: '5m', seconds: 300 },
  { label: '15m', value: '15m', seconds: 900 },
  { label: '30m', value: '30m', seconds: 1800 },
  { label: '1H', value: '1h', seconds: 3600 },
  { label: '4H', value: '4h', seconds: 14400 },
  { label: '1D', value: '1d', seconds: 86400 },
  { label: '1W', value: '1w', seconds: 604800 },
  { label: '1M', value: '1M', seconds: 2592000 },
];

// Chart props for the main component
export interface StockChartProps {
  /** Stock symbol */
  symbol: string;
  /** Chart type to display */
  chartType?: ChartType;
  /** Historical data */
  data?: OHLCVDataPoint[] | PriceDataPoint[];
  /** Chart height */
  height?: number;
  /** Show volume panel */
  showVolume?: boolean;
  /** Enable real-time updates */
  realtimeUpdates?: boolean;
  /** Polling interval for updates (ms) */
  pollInterval?: number;
  /** WebSocket URL for real-time data */
  websocketUrl?: string;
  /** Default timeframe */
  defaultTimeframe?: Timeframe;
  /** Show timeframe selector */
  showTimeframeSelector?: boolean;
  /** Show chart type selector */
  showChartTypeSelector?: boolean;
  /** Custom colors */
  colors?: Partial<ChartColors>;
  /** Watermark text (e.g., stock symbol) */
  watermark?: string;
  /** Error callback */
  onError?: (error: Error) => void;
  /** Price update callback */
  onPriceUpdate?: (price: number) => void;
  /** Custom class name */
  className?: string;
  /** Loading state */
  isLoading?: boolean;
}

// Internal chart state
export interface ChartState {
  chart: import('lightweight-charts').IChartApi | null;
  mainSeries: import('lightweight-charts').ISeriesApi<'Candlestick' | 'Line' | 'Area'> | null;
  volumeSeries: import('lightweight-charts').ISeriesApi<'Histogram'> | null;
  isInitialized: boolean;
}