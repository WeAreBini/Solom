# Stock Chart Libraries Comparison

> **Issue:** #18 - Research: Stock Chart Libraries Comparison
> **Category:** Research / UI Components
> **Created:** 2026-02-28
> **Status:** Ready for Implementation Decision

---

## Executive Summary

For a finance platform like Solom, **TradingView Lightweight Charts** is the recommended choice for stock/financial charting. It's purpose-built for financial data, has the smallest bundle size (~44KB gzipped), excellent performance with real-time updates, and is trusted by 40,000+ companies worldwide. For general-purpose charts (portfolios, analytics dashboards), **Recharts** is recommended due to its React-native API and TypeScript support.

---

## Quick Decision Matrix

| Library | Best For | Bundle Size | React Support | Financial Charts |
|---------|----------|-------------|---------------|------------------|
| **Lightweight Charts** | Stock/financial charts | ~44KB | Community wrappers | ⭐⭐⭐⭐⭐ |
| **Recharts** | General dashboards | ~85KB | Native | ⭐⭐ |
| **ECharts** | Large datasets, complex viz | ~300KB+ | echarts-for-react | ⭐⭐⭐⭐ |
| **Highcharts** | Enterprise, stock charts | ~100KB+ | react-highcharts | ⭐⭐⭐⭐⭐ |
| **Chart.js** | Simple charts | ~11KB | react-chartjs-2 | ⭐⭐ |
| **D3.js** | Custom visualizations | ~93KB | Recharts, Visx | ⭐⭐⭐ |

---

## Detailed Library Analysis

### 1. TradingView Lightweight Charts ⭐ **RECOMMENDED FOR STOCK CHARTS**

**Official Site:** https://www.tradingview.com/lightweight-charts/
**GitHub:** https://github.com/tradingview/lightweight-charts
**License:** Apache 2.0 (requires attribution)

#### Overview
TradingView Lightweight Charts is a standalone library specifically designed for financial charting. Built with HTML5 Canvas, it's optimized for performance and bundle size without sacrificing features.

#### Key Features
- **Financial chart types:** Line, Area, Baseline, Histogram, Candlestick, Heikin-Ashi, Renko, Kagi, Point & Figure
- **Real-time updates:** Optimized for streaming data with minimal re-renders
- **Time scales:** Multiple timeframes (seconds to years), business days handling
- **Price scales:** Linear, logarithmic, percentage, indexed to 100
- **Technical indicators:** Via plugin system
- **Mobile-optimized:** Touch gestures, pinch-to-zoom
- **Dark/Light themes:** Built-in theme support
- **Localization:** Right-to-left support, date formatting

#### Performance Characteristics
| Metric | Value |
|--------|-------|
| Bundle size (production, gzipped) | ~44KB |
| Rendering | HTML5 Canvas |
| Max data points | Millions (tested) |
| Real-time updates | Optimized for streaming |

#### React Integration
```typescript
// Using lightweight-charts-react-wrapper or direct integration
import { createChart, CandlestickSeries } from 'lightweight-charts';
import { useEffect, useRef } from 'react';

function StockChart({ data }) {
  const chartRef = useRef(null);
  
  useEffect(() => {
    const chart = createChart(chartRef.current, {
      width: chartRef.current.clientWidth,
      height: 400,
      layout: { background: { color: '#1a1a1a' }, textColor: '#d1d4dc' }
    });
    
    const candlestickSeries = chart.addSeries(CandlestickSeries, {
      upColor: '#26a69a',
      downColor: '#ef5350',
    });
    
    candlestickSeries.setData(data);
    
    return () => chart.remove();
  }, [data]);
  
  return <div ref={chartRef} />;
}
```

#### Pros
- ✅ Purpose-built for financial data
- ✅ Smallest bundle for financial charts
- ✅ Excellent performance with large datasets
- ✅ Real-time streaming optimized
- ✅ All essential financial chart types
- ✅ Active development by TradingView
- ✅ Free and open source (Apache 2.0)
- ✅ Mobile-first design
- ✅ Plugin system for extensibility

#### Cons
- ⚠️ Requires attribution link to TradingView
- ⚠️ Not React-native (needs wrapper or useEffect)
- ⚠️ Limited to financial chart types
- ⚠️ Advanced features require plugins

#### When to Choose
- **Primary use case is stock/financial charts**
- **Need real-time streaming data**
- **Bundle size is critical**
- **Want industry-standard financial visualization**

---

### 2. Recharts ⭐ **RECOMMENDED FOR GENERAL CHARTS**

**Official Site:** https://recharts.org/
**GitHub:** https://github.com/recharts/recharts
**License:** MIT

#### Overview
Recharts is a React charting library built on D3.js. It follows React's component philosophy, making it intuitive for React developers. Perfect for dashboards, analytics, and general-purpose charts.

#### Key Features
- **Chart types:** Line, Area, Bar, Pie, Scatter, Radar, Radial, Treemap
- **Composable:** Build charts with nested React components
- **Responsive:** Container component handles resizing
- **Animations:** Smooth transitions via React-spring
- **SVG-based:** Scalable, styleable with CSS
- **TypeScript:** First-class TypeScript support

#### Bundle Size
| Component | Size (gzipped) |
|-----------|---------------|
| Core | ~45KB |
| With all chart types | ~85KB |

#### React Integration
```typescript
// Native React component API
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

function PortfolioChart({ data }) {
  return (
    <ResponsiveContainer width="100%" height={400}>
      <LineChart data={data}>
        <XAxis dataKey="date" />
        <YAxis />
        <CartesianGrid strokeDasharray="3 3" />
        <Tooltip />
        <Line type="monotone" dataKey="value" stroke="#8884d8" />
      </LineChart>
    </ResponsiveContainer>
  );
}
```

#### Pros
- ✅ Native React API (no useEffect bridges)
- ✅ Excellent TypeScript support
- ✅ Composable architecture
- ✅ Great for dashboards and analytics
- ✅ Active community and ecosystem
- ✅ MIT license (no attribution required)
- ✅ SVG-based (CSS styling, animations)
- ✅ Responsive by default

#### Cons
- ⚠️ Not optimized for financial candlestick/OHLC
- ⚠️ Performance degrades with very large datasets (>10K points)
- ⚠️ Limited real-time streaming optimization
- ⚠️ No built-in financial indicators

#### When to Choose
- **General-purpose charts (portfolio, analytics)**
- **React-first approach is important**
- **Team prefers component composition**
- **Need responsive, styled charts**

---

### 3. ECharts (Apache)

**Official Site:** https://echarts.apache.org/
**GitHub:** https://github.com/apache/echarts
**License:** Apache 2.0

#### Overview
ECharts is a powerful, feature-rich charting library originally developed by Baidu, now an Apache project. It excels at handling massive datasets and offers the widest variety of chart types.

#### Key Features
- **Chart types:** 20+ including candlestick, heatmaps, treemaps, sunburst, graphs
- **Rendering:** Canvas, SVG, VML (auto-detects)
- **Large datasets:** Optimized for millions of data points
- **Server-side rendering:** Node.js support
- **Accessibility:** Built-in screen reader support
- **Themes:** Extensive theming system
- **Geographic maps:** GeoJSON support

#### Bundle Size
| Configuration | Size (gzipped) |
|--------------|---------------|
| Minimal | ~100KB |
| Full | ~300KB+ |
| Tree-shakeable | Depends on imports |

#### React Integration
```typescript
import ReactECharts from 'echarts-for-react';

function CandlestickChart({ data }) {
  const option = {
    xAxis: { type: 'category', data: data.dates },
    yAxis: { type: 'value' },
    series: [{
      type: 'candlestick',
      data: data.values
    }]
  };
  
  return <ReactECharts option={option} style={{ height: 400 }} />;
}
```

#### Pros
- ✅ Comprehensive candlestick/financial charts
- ✅ Handles millions of data points
- ✅ Full-featured (indicators, zoom, pan)
- ✅ Active Apache community
- ✅ Canvas rendering for performance
- ✅ Server-side rendering support
- ✅ Excellent accessibility features

#### Cons
- ⚠️ Large bundle size (even tree-shaken)
- ⚠️ Steeper learning curve
- ⚠️ Configuration-heavy (options object)
- ⚠️ Less React-idiomatic

#### When to Choose
- **Need advanced financial indicators built-in**
- **Handling very large datasets**
- **Want comprehensive chart variety**
- **Accessibility is a priority**

---

### 4. Highcharts (Commercial)

**Official Site:** https://www.highcharts.com/
**License:** Commercial (free for personal/non-commercial)

#### Overview
Highcharts is a mature, enterprise-grade charting solution with a strong focus on accessibility and professional appearance. It includes a dedicated stock chart module (Highcharts Stock).

#### Key Features
- **Highcharts Stock:** Specialized for financial/time-series data
- **Pre-built indicators:** RSI, MACD, Bollinger Bands, etc.
- **Export:** PNG, JPG, SVG, PDF
- **Accessibility:** Screen reader support, sonification
- **Touch-optimized:** Mobile-friendly
- **Cross-browser:** IE6+ support (if needed)

#### Pricing (2026)
| License | Price |
|---------|-------|
| Developer | $535/seat |
| Team (5) | $2,675 |
| OEM | Custom |

#### React Integration
```typescript
import Highcharts from 'highcharts/highstock';
import HighchartsReact from 'highcharts-react-official';

function StockChart({ data }) {
  const options = {
    series: [{
      type: 'candlestick',
      data: data
    }],
    rangeSelector: { selected: 1 }
  };
  
  return <HighchartsReact highcharts={Highcharts} constructorType="stockChart" options={options} />;
}
```

#### Pros
- ✅ Industry-leading stock charts (Highcharts Stock)
- ✅ Built-in technical indicators
- ✅ Professional appearance out-of-box
- ✅ Excellent documentation and support
- ✅ Strong accessibility features
- ✅ Export capabilities

#### Cons
- ❌ Commercial license required for business use
- ⚠️ Relatively large bundle size
- ⚠️ Not React-native approach
- ⚠️ Updates can lag behind trends

#### When to Choose
- **Budget allows for commercial license**
- **Need enterprise-level support**
- **Require built-in technical indicators**
- **Accessibility compliance is mandatory**

---

### 5. Chart.js

**Official Site:** https://www.chartjs.org/
**GitHub:** https://github.com/chartjs/Chart.js
**License:** MIT

#### Overview
Chart.js is the most popular JavaScript charting library by npm downloads. Simple, lightweight, and good-looking charts with minimal configuration.

#### Key Features
- **Chart types:** Line, Bar, Radar, Doughnut, Pie, Polar, Bubble, Scatter
- **Responsive:** Auto-resizes to container
- **Animations:** Smooth transitions
- **Canvas rendering:** Good performance
- **Plugin ecosystem:** Many extensions available

#### Bundle Size
| Configuration | Size (gzipped) |
|--------------|---------------|
| Core only | ~11KB |
| With chart types | ~20-30KB |

#### Pros
- ✅ Smallest bundle size
- ✅ Simple API, quick to learn
- ✅ Beautiful defaults
- ✅ Active community
- ✅ MIT license

#### Cons
- ⚠️ No built-in candlestick/OHLC (requires plugin)
- ⚠️ Limited financial functionality
- ⚠️ Not optimized for real-time streaming
- ⚠️ Canvas-only (no SVG option)

#### When to Choose
- **Simple line/bar charts only**
- **Bundle size is critical**
- **No financial candlestick needs**
- **Quick prototyping**

---

### 6. D3.js

**Official Site:** https://d3js.org/
**GitHub:** https://github.com/d3/d3
**License:** ISC (MIT-compatible)

#### Overview
D3.js is a low-level visualization library providing maximum flexibility. Build anything from simple charts to complex interactive visualizations. It's the foundation for many higher-level libraries (Recharts, Nivo).

#### Key Features
- **Complete control:** Every visual element customizable
- **Data binding:** Powerful data-DOM binding
- **Transitions:** Smooth animations
- **Geographic:** Map projections
- **SVG/Canvas:** Both supported
- **Ecosystem:** Many modules for specific needs

#### Bundle Size
| Configuration | Size (gzipped) |
|--------------|---------------|
| Full D3 | ~93KB |
| Modular (tree-shaken) | Varies by needs |

#### Pros
- ✅ Unlimited customization
- ✅ Any visualization possible
- ✅ Excellent performance with proper optimization
- ✅ Industry standard for custom viz
- ✅ Large ecosystem and community

#### Cons
- ⚠️ Steep learning curve
- ⚠️ Requires more code for basic charts
- ⚠️ Not React-idiomatic (needs integration)
- ⚠️ Development time higher
- ⚠️ Financial charts need custom implementation

#### When to Choose
- **Highly custom visualizations**
- **Team has D3 expertise**
- **Unique chart requirements**
- **Need complete control**

---

## Comparison Summary Tables

### Feature Comparison

| Feature | Lightweight Charts | Recharts | ECharts | Highcharts | Chart.js | D3.js |
|---------|-------------------|----------|---------|------------|----------|-------|
| **Candlestick** | ✅ Native | ❌ | ✅ | ✅ Native | ⚠️ Plugin | ⚠️ Custom |
| **OHLC** | ✅ Native | ❌ | ✅ | ✅ Native | ❌ | ⚠️ Custom |
| **Real-time streaming** | ✅ Optimized | ⚠️ Basic | ✅ Good | ✅ Good | ⚠️ Basic | ⚠️ Manual |
| **Technical indicators** | ⚠️ Plugins | ❌ | ✅ Many | ✅ Many | ❌ | ⚠️ Custom |
| **Time scale** | ✅ Native | ⚠️ Basic | ✅ Native | ✅ Native | ⚠️ Basic | ⚠️ Custom |
| **Zoom/Pan** | ✅ Built-in | ⚠️ Limited | ✅ Built-in | ✅ Built-in | ⚠️ Plugin | ⚠️ Custom |
| **Mobile touch** | ✅ Optimized | ✅ Good | ✅ Good | ✅ Good | ✅ Good | ⚠️ Manual |
| **Dark mode** | ✅ Built-in | ✅ CSS | ✅ Themes | ✅ Themes | ✅ CSS | ✅ CSS |
| **TypeScript** | ✅ Native | ✅ Native | ✅ Types | ✅ Types | ✅ Types | ✅ Types |

### Performance Comparison

| Library | Rendering | Dataset Size | Real-time Updates | Memory Usage |
|---------|-----------|--------------|-------------------|--------------|
| **Lightweight Charts** | Canvas | Millions | Excellent | Low |
| **Recharts** | SVG | ~10K | Good | Medium |
| **ECharts** | Canvas/SVG | Millions | Excellent | Medium-High |
| **Highcharts** | SVG/Canvas | ~100K | Good | Medium |
| **Chart.js** | Canvas | ~10K | Good | Low |
| **D3.js** | SVG/Canvas | Varies | Manual | Varies |

### Cost & Licensing

| Library | License | Cost | Attribution |
|---------|---------|------|-------------|
| **Lightweight Charts** | Apache 2.0 | Free | Required |
| **Recharts** | MIT | Free | None |
| **ECharts** | Apache 2.0 | Free | Optional |
| **Highcharts** | Commercial | $535+/seat | Required (free) |
| **Chart.js** | MIT | Free | None |
| **D3.js** | ISC | Free | None |

---

## Recommendation for Solom

### Primary Recommendation: **Hybrid Approach**

#### Stock/Financial Charts: TradingView Lightweight Charts
```bash
npm install lightweight-charts
```

**Rationale:**
1. Purpose-built for financial data
2. Best-in-class candlestick/OHLC support
3. Smallest bundle for financial charts (44KB)
4. Real-time streaming optimized
5. Mobile-first design
6. Active development by TradingView
7. Free and open source

**Use Cases:**
- Stock price charts (candlestick, line, area)
- Real-time price updates
- Technical analysis views
- Historical price data

#### General/Dashboard Charts: Recharts
```bash
npm install recharts
```

**Rationale:**
1. Native React API (already using React 19)
2. Excellent TypeScript support (already using TypeScript)
3. Composable component architecture
4. Good fit for existing Radix UI + Tailwind stack
5. Perfect for non-financial charts

**Use Cases:**
- Portfolio performance over time
- Asset allocation pie charts
- Sector breakdown
- Comparison charts
- Analytics dashboards

### Implementation Plan

#### Phase 1: Core Financial Charts (Week 1-2)
```
components/
├── charts/
│   ├── stock-chart.tsx          # Lightweight Charts wrapper
│   ├── candlestick-chart.tsx    # Candlestick-specific
│   ├── price-line-chart.tsx     # Line chart for prices
│   ├── volume-chart.tsx         # Volume histogram
│   └── hooks/
│       ├── use-chart.ts         # Chart lifecycle
│       ├── use-realtime.ts      # Real-time data streaming
│       └── use-indicators.ts    # Technical indicators
```

#### Phase 2: Dashboard Charts (Week 2-3)
```
components/
├── charts/
│   ├── portfolio-chart.tsx      # Recharts line chart
│   ├── allocation-chart.tsx     # Recharts pie/donut
│   ├── sector-chart.tsx         # Recharts radar/bar
│   └── comparison-chart.tsx     # Recharts composed
```

#### Phase 3: Integration (Week 3-4)
- Connect to existing TRPC API
- Add real-time WebSocket updates
- Implement chart controls (timeframe, indicators)
- Dark mode integration with existing theme

### Code Example: Lightweight Charts Component

```typescript
// components/charts/stock-chart.tsx
'use client';

import { createChart, IChartApi, CandlestickSeries } from 'lightweight-charts';
import { useEffect, useRef, useCallback } from 'react';

interface StockChartProps {
  data: Array<{
    time: string;
    open: number;
    high: number;
    low: number;
    close: number;
    volume?: number;
  }>;
  symbol: string;
  onCrosshairMove?: (data: { time: string; price: number } | null) => void;
}

export function StockChart({ data, symbol, onCrosshairMove }: StockChartProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);

  useEffect(() => {
    if (!chartContainerRef.current) return;

    const chart = createChart(chartContainerRef.current, {
      width: chartContainerRef.current.clientWidth,
      height: 400,
      layout: {
        background: { color: 'transparent' },
        textColor: '#9ca3af',
      },
      grid: {
        vertLines: { color: 'rgba(75, 85, 99, 0.3)' },
        horzLines: { color: 'rgba(75, 85, 99, 0.3)' },
      },
      crosshair: {
        mode: 1, // Normal crosshair
      },
      rightPriceScale: {
        borderColor: 'rgba(75, 85, 99, 0.3)',
      },
      timeScale: {
        borderColor: 'rgba(75, 85, 99, 0.3)',
        timeVisible: true,
        secondsVisible: false,
      },
    });

    const candlestickSeries = chart.addSeries(CandlestickSeries, {
      upColor: '#22c55e',
      downColor: '#ef4444',
      borderDownColor: '#ef4444',
      borderUpColor: '#22c55e',
      wickDownColor: '#ef4444',
      wickUpColor: '#22c55e',
    });

    candlestickSeries.setData(data);

    if (onCrosshairMove) {
      chart.subscribeCrosshairMove((param) => {
        if (!param.time || !param.seriesData.size) {
          onCrosshairMove(null);
          return;
        }
        const seriesData = param.seriesData.get(candlestickSeries);
        if (seriesData) {
          onCrosshairMove({
            time: param.time as string,
            price: (seriesData as { close: number }).close,
          });
        }
      });
    }

    chartRef.current = chart;

    // Handle resize
    const handleResize = () => {
      if (chartContainerRef.current) {
        chart.applyOptions({ width: chartContainerRef.current.clientWidth });
      }
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      chart.remove();
    };
  }, [data, onCrosshairMove]);

  return (
    <div className="w-full h-full">
      <div ref={chartContainerRef} className="w-full h-[400px]" />
    </div>
  );
}
```

### Code Example: Recharts Component

```typescript
// components/charts/portfolio-chart.tsx
'use client';

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { formatCurrency } from '@/lib/format';

interface PortfolioChartProps {
  data: Array<{
    date: string;
    value: number;
    benchmark?: number;
  }>;
  currency?: string;
}

export function PortfolioChart({ data, currency = 'USD' }: PortfolioChartProps) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(75, 85, 99, 0.3)" />
        <XAxis
          dataKey="date"
          stroke="#9ca3af"
          tick={{ fill: '#9ca3af', fontSize: 12 }}
        />
        <YAxis
          stroke="#9ca3af"
          tick={{ fill: '#9ca3af', fontSize: 12 }}
          tickFormatter={(value) => formatCurrency(value, currency, true)}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: '#1f2937',
            border: '1px solid rgba(75, 85, 99, 0.3)',
            borderRadius: '0.5rem',
          }}
          labelStyle={{ color: '#f3f4f6' }}
          formatter={(value: number) => [formatCurrency(value, currency), 'Value']}
        />
        <Legend />
        <Line
          type="monotone"
          dataKey="value"
          stroke="#3b82f6"
          strokeWidth={2}
          dot={false}
          name="Portfolio"
        />
        <Line
          type="monotone"
          dataKey="benchmark"
          stroke="#9ca3af"
          strokeWidth={2}
          dot={false}
          strokeDasharray="5 5"
          name="S&P 500"
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
```

---

## Alternative Scenarios

### If Budget Allows: Highcharts Stock
- Consider Highcharts if you need enterprise support
- Built-in technical indicators save development time
- Professional appearance out-of-box
- Strong accessibility compliance

### If Performance is Critical: ECharts
- Use ECharts for very large datasets (>1M points)
- Better performance for complex multi-series charts
- More chart types available

### If Maximum Flexibility Needed: D3.js + Lightweight Charts Hybrid
- Use D3 for custom visualizations
- Use Lightweight Charts for standard financial charts
- Maximum control but higher development cost

---

## References

1. [TradingView Lightweight Charts Documentation](https://tradingview.github.io/lightweight-charts/)
2. [TradingView Lightweight Charts GitHub](https://github.com/tradingview/lightweight-charts)
3. [Strapi: Top 5 Chart Libraries](https://strapi.io/blog/chart-libraries)
4. [Metabase: Comparing Open Source Charting Libraries](https://www.metabase.com/blog/best-open-source-chart-library)
5. [Recharts Documentation](https://recharts.org/)
6. [Apache ECharts Documentation](https://echarts.apache.org/en/index.html)
7. [Highcharts Documentation](https://www.highcharts.com/)
8. [Chart.js Documentation](https://www.chartjs.org/)
9. [D3.js Documentation](https://d3js.org/)

---

## Appendix: Bundle Size Comparison

| Library | Minified | Gzipped | Tree-shakeable |
|---------|----------|---------|----------------|
| Lightweight Charts | ~200KB | ~44KB | Partial |
| Recharts (full) | ~300KB | ~85KB | Yes |
| ECharts (minimal) | ~500KB | ~100KB | Yes |
| Highcharts Stock | ~400KB | ~100KB | Partial |
| Chart.js (core) | ~40KB | ~11KB | Yes |
| D3.js (full) | ~300KB | ~93KB | Yes |

Note: Actual bundle sizes vary based on imported modules. Always test with your bundler.

---

*Document created by Solom Developer Agent based on Issue #18 research.*
*Next steps: Implement chart components following the phased approach above.*