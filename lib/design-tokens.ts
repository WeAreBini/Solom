/**
 * Design Tokens for Solom Finance Dashboard
 * Based on docs/finance-dashboard-ui-design-2026.md
 * 
 * These tokens ensure consistency across all UI components
 * and provide a single source of truth for design decisions.
 */

// ============================================
// COLOR TOKENS
// ============================================

/**
 * Semantic colors for financial data
 * Used for indicating gains, losses, and neutral states
 */
export const semanticColors = {
  /** Positive values: profits, gains, increases */
  positive: {
    light: '#34d399',  // emerald-400
    DEFAULT: '#10b981', // emerald-500
    dark: '#059669',   // emerald-600
  },
  /** Negative values: losses, decreases */
  negative: {
    light: '#f87171',  // red-400
    DEFAULT: '#ef4444', // red-500
    dark: '#dc2626',   // red-600
  },
  /** Warning/Caution states */
  warning: {
    light: '#fbbf24',  // amber-400
    DEFAULT: '#f59e0b', // amber-500
    dark: '#d97706',   // amber-600
  },
  /** Informational states */
  info: {
    light: '#60a5fa',  // blue-400
    DEFAULT: '#3b82f6', // blue-500
    dark: '#2563eb',   // blue-600
  },
  /** Neutral/secondary text */
  neutral: {
    light: '#94a3b8',  // slate-400
    DEFAULT: '#64748b', // slate-500
    dark: '#475569',   // slate-600
  },
} as const;

/**
 * Chart-specific color palette
 * Used consistently across all data visualization components
 */
export const chartColors = {
  primary: '#2563eb',    // blue-600
  secondary: '#10b981',  // emerald-500
  tertiary: '#f59e0b',  // amber-500
  quaternary: '#ef4444', // red-500
  quinary: '#8b5cf6',   // violet-500
  neutral: '#64748b',   // slate-500
} as const;

/**
 * Background colors for light/dark modes
 */
export const backgroundColors = {
  light: {
    DEFAULT: '#f8fafc', // slate-50
    secondary: '#f1f5f9', // slate-100
    tertiary: '#e2e8f0', // slate-200
  },
  dark: {
    DEFAULT: '#0f172a', // slate-900
    secondary: '#1e293b', // slate-800
    tertiary: '#334155', // slate-700
  },
} as const;

// ============================================
// TYPOGRAPHY TOKENS
// ============================================

/**
 * Typography scale following design doc specifications
 * Display sizes for large financial figures
 */
export const typography = {
  display: {
    fontSize: '3rem',    // 48px
    fontWeight: 700,
    lineHeight: 1.1,
    letterSpacing: '-0.02em',
  },
  h1: {
    fontSize: '2rem',     // 32px
    fontWeight: 600,
    lineHeight: 1.2,
    letterSpacing: '-0.01em',
  },
  h2: {
    fontSize: '1.5rem',   // 24px
    fontWeight: 600,
    lineHeight: 1.3,
  },
  h3: {
    fontSize: '1.25rem', // 20px
    fontWeight: 600,
    lineHeight: 1.4,
  },
  body: {
    fontSize: '1rem',    // 16px
    fontWeight: 400,
    lineHeight: 1.5,
  },
  caption: {
    fontSize: '0.875rem', // 14px
    fontWeight: 400,
    lineHeight: 1.5,
  },
  micro: {
    fontSize: '0.75rem',  // 12px
    fontWeight: 400,
    lineHeight: 1.5,
  },
} as const;

/**
 * Financial number formatting for consistency
 */
export const numberFormatting = {
  currency: {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  },
  percentage: {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  },
  compact: {
    notation: 'compact' as const,
    maximumFractionDigits: 1,
  },
} as const;

// ============================================
// SPACING TOKENS
// ============================================

/**
 * Spacing scale for consistent layout
 * Follows 4px base unit system
 */
export const spacing = {
  xs: '0.25rem',   // 4px
  sm: '0.5rem',    // 8px
  md: '1rem',      // 16px
  lg: '1.5rem',    // 24px
  xl: '2rem',      // 32px
  '2xl': '2.5rem', // 40px
  '3xl': '3rem',   // 48px
  '4xl': '4rem',   // 64px
} as const;

/**
 * Grid spacing for dashboard layout
 */
export const gridSpacing = {
  gap: '1rem',     // 16px between grid items
  gapSm: '0.5rem', // 8px for tight layouts
  gapLg: '1.5rem', // 24px for spacious layouts
} as const;

// ============================================
// COMPONENT-SPECIFIC TOKENS
// ============================================

/**
 * KPI Card tokens
 */
export const kpiCardTokens = {
  valueSize: {
    sm: '1.5rem',   // 24px
    md: '2rem',     // 32px
    lg: '2.5rem',   // 40px
    xl: '3rem',     // 48px (display size)
  },
  padding: {
    sm: '1rem',     // 16px
    md: '1.5rem',   // 24px
    lg: '2rem',     // 32px
  },
  minHeight: '100px',
} as const;

/**
 * Chart size tokens
 */
export const chartTokens = {
  sparkline: {
    height: 40,
    width: 'auto',
  },
  miniChart: {
    height: 60,
    width: 'auto',
  },
  standard: {
    height: 300,
    width: '100%',
  },
  large: {
    height: 400,
    width: '100%',
  },
} as const;

/**
 * Animation timing for financial data updates
 */
export const animation = {
  fadeIn: '150ms ease-out',
  slideUp: '200ms ease-out',
  pulse: '300ms ease-in-out',
  numberChange: '300ms ease-out',
} as const;

// ============================================
// RESPONSIVE BREAKPOINTS
// ============================================

/**
 * Breakpoint definitions matching Tailwind defaults
 */
export const breakpoints = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
} as const;

// ============================================
// ACCESSIBILITY TOKENS
// ============================================

/**
 * Accessibility constants
 */
export const a11y = {
  /** Minimum touch target size (WCAG 2.2) */
  minTouchTarget: '44px',
  /** Minimum color contrast ratio */
  minContrastRatio: 4.5,
  /** Focus ring style */
  focusRing: '0 0 0 2px hsl(var(--ring))',
} as const;

// ============================================
// TYPE DEFINITIONS
// ============================================

/**
 * Trend direction for financial data
 */
export type TrendDirection = 'up' | 'down' | 'neutral';

/**
 * Size variants for components
 */
export type SizeVariant = 'sm' | 'md' | 'lg' | 'xl';

// ============================================
// UTILITY FUNCTIONS
// ============================================

/**
 * Get semantic color based on value change
 */
export function getChangeColor(change: number): string {
  if (change > 0) return semanticColors.positive.DEFAULT;
  if (change < 0) return semanticColors.negative.DEFAULT;
  return semanticColors.neutral.DEFAULT;
}

/**
 * Format currency value consistently
 */
export function formatCurrency(
  value: number,
  currency: string = 'USD',
  options?: Partial<typeof numberFormatting.currency>
): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    ...numberFormatting.currency,
    ...options,
  }).format(value);
}

/**
 * Format percentage value consistently
 */
export function formatPercentage(
  value: number,
  options?: Partial<typeof numberFormatting.percentage>
): string {
  const sign = value > 0 ? '+' : '';
  return `${sign}${new Intl.NumberFormat('en-US', {
    style: 'percent',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
    ...options,
  }).format(value / 100)}`;
}

/**
 * Format large numbers in compact form
 */
export function formatCompact(value: number): string {
  return new Intl.NumberFormat('en-US', numberFormatting.compact).format(value);
}

/**
 * Determine trend from data array
 */
export function determineTrend(data: number[]): TrendDirection {
  if (!data || data.length < 2) return 'neutral';
  const first = data[0];
  const last = data[data.length - 1];
  if (last > first) return 'up';
  if (last < first) return 'down';
  return 'neutral';
}