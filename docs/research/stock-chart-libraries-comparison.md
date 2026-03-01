# Stock Chart Libraries Comparison

> **Issue:** #72 - Research: Stock Chart Libraries Comparison  
> **Category:** Research / UI Components  
> **Created:** 2026-03-01  
> **Status:** Ready for Implementation Decision

---

## Executive Summary

For a finance platform like Solom, **TradingView Lightweight Charts** is the **strongly recommended choice** for stock/financial charting. It's purpose-built for financial data, has the smallest bundle size (~44KB gzipped), excellent performance with real-time updates, and is trusted by 40,000+ companies and 100+ million traders worldwide. Version 5 (released March 2025) brings ES2020 syntax, enhanced color support, and data conflation for better performance.

For general-purpose charts (portfolios, analytics dashboards), **Recharts** is recommended due to its React-native API and excellent TypeScript support.

---

## Quick Decision Matrix

| Library | Best For | Bundle Size | React Support | Financial Charts | License |
|---------|----------|-------------|---------------|------------------|---------|
| **Lightweight Charts** | Stock/financial charts | ~44KB | Community wrappers | ⭐⭐⭐⭐⭐ | Apache 2.0 |
| **Recharts** | General dashboards | ~85KB | Native | ⭐⭐ | MIT |
| **Highcharts Stock** | Enterprise finance | ~100KB+ | react-highcharts | ⭐⭐⭐⭐⭐ | Commercial |
| **ECharts** | Large datasets, complex viz | ~100-300KB | echarts-for-react | ⭐⭐⭐⭐ | Apache 2.0 |
| **ApexCharts** | Modern charts | ~80KB | react-apexcharts | ⭐⭐⭐ | MIT |
| **Chart.js** | Simple charts | ~11KB | react-chartjs-2 | ⭐⭐ | MIT |
| **DXcharts** | White-label trading | Varies | Native SDKs | ⭐⭐⭐⭐⭐ | Commercial |
| **LightningChart JS** | High-performance | Varies | Native | ⭐⭐⭐⭐⭐ | Commercial |

---

## Detailed Library Analysis

### 1. TradingView Lightweight Charts ⭐ **STRONGLY RECOMMENDED FOR STOCK CHARTS**

**Official Site:** https://www.tradingview.com/lightweight-charts/  
**GitHub:** https://github.com/tradingview/lightweight-charts  
**License:** Apache 2.0 (requires attribution)

#### Overview
TradingView Lightweight Charts is a standalone library specifically designed for financial charting. Built with HTML5 Canvas, it's optimized for performance and bundle size without sacrificing features. Version 5 (March 2025) brings modern ES2020 syntax and data conflation for handling large datasets.

#### Key Features
- **Financial chart types:** Line, Area, Baseline, Histogram, Candlestick, Heikin-Ashi, Renko, Kagi, Point & Figure
- **Real-time updates:** Optimized for streaming data with minimal re-renders
- **Time scales:** Multiple timeframes (seconds to years), business days handling
- **Price scales:** Linear, logarithmic, percentage, indexed to 100
- **Technical indicators:** Extensible plugin system
- **Mobile-optimized:** Touch gestures, pinch-to-zoom, responsive
- **Dark/Light themes:** Built-in theme support
- **Localization:** Right-to-left support, date formatting
- **Data conflation:** V5 feature for handling very large datasets efficiently

#### Performance Characteristics

| Metric | Value |
|--------|-------|
| Bundle size (production, gzipped) | ~44KB |
| Rendering | HTML5 Canvas |
| Max data points | Millions (tested) |
| Real-time updates | Optimized for streaming |
| Attribution | Required (logo link) |

#### Version 5 Updates (March 2025)
- Migration to ES2020 syntax for better performance
- Enhanced color support with expanded capabilities
- Data conflation for massive dataset handling
- Improved TypeScript definitions

#### React Integration
```typescript
// Using lightweight-charts directly with useEffect
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
- ✅ Smallest bundle for financial charts (44KB)
- ✅ Excellent performance with large datasets
- ✅ Real-time streaming optimized
- ✅ All essential financial chart types
- ✅ Active development by TradingView
- ✅ Free and open source (Apache 2.0)
- ✅ Mobile-first design
- ✅ Plugin system for extensibility
- ✅ React tutorials available

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
|-----------|----------------|
| Core | ~45KB |
| With all chart types | ~85KB |

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

### 3. Highcharts Stock (Commercial)

**Official Site:** https://www.highcharts.com/products/stock/  
**License:** Commercial (free for personal/non-commercial)

#### Overview
Highcharts Stock is a mature, enterprise-grade charting solution specifically designed for financial/time-series data. It's widely used in financial institutions and includes 40+ built-in technical indicators.

#### Key Features
- **Highcharts Stock:** Specialized for financial/time-series data
- **40+ Technical indicators:** SMA, MACD, Bollinger Bands, RSI, CCI, Stochastic, PSAR, Ichimoku, and more
- **Morningstar Data Integration:** Pre-built data connector
- **Export:** PNG, JPG, SVG, PDF
- **Accessibility:** Screen reader support, sonification
- **Touch-optimized:** Mobile-friendly with gesture support
- **Annotations:** Draw shapes and text anywhere on canvas
- **Big-Data Ready:** WebGL-powered boost module for thousands/millions of points

#### Pricing (2026)

| License | Price |
|---------|-------|
| Developer | $535/seat |
| Team (5) | $2,675 |
| OEM | Custom |

#### Pros
- ✅ Industry-leading stock charts (Highcharts Stock)
- ✅ 40+ built-in technical indicators
- ✅ Professional appearance out-of-box
- ✅ Excellent documentation and support
- ✅ Strong accessibility features
- ✅ Export capabilities (PNG, JPG, PDF, SVG)
- ✅ WebGL boost for large datasets

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

### 4. Apache ECharts

**Official Site:** https://echarts.apache.org/  
**GitHub:** https://github.com/apache/echarts  
**License:** Apache 2.0

#### Overview
ECharts is a powerful, feature-rich charting library originally developed by Baidu, now an Apache project. It excels at handling massive datasets and offers comprehensive financial chart support including candlestick, OHLC, and more.

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
|---------------|----------------|
| Minimal | ~100KB |
| Full | ~300KB+ |
| Tree-shakeable | Depends on imports |

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

### 5. ApexCharts

**Official Site:** https://apexcharts.com/  
**GitHub:** https://github.com/apexcharts/apexcharts.js  
**License:** MIT

#### Overview
ApexCharts is a modern JavaScript charting library with excellent candlestick support. It provides beautiful, interactive charts with a simple API and good React integration.

#### Key Features
- **Candlestick Charts:** Native support for OHLC data
- **Interactive:** Zoom, pan, tooltips, annotations
- **Responsive:** Auto-resizes to container
- **Animations:** Smooth transitions
- **SVG-based:** Sharp at any resolution
- **TypeScript:** Type definitions available

#### Pros
- ✅ Native candlestick support
- ✅ Beautiful defaults
- ✅ Good React integration (react-apexcharts)
- ✅ MIT license
- ✅ Active development
- ✅ Modern API

#### Cons
- ⚠️ Bundle size (~80KB gzipped)
- ⚠️ Limited technical indicators
- ⚠️ SVG rendering (performance vs canvas)

---

### 6. Chart.js + Financial Plugin

**Official Site:** https://www.chartjs.org/  
**Financial Plugin:** https://www.chartjs.org/chartjs-chart-financial/  
**License:** MIT

#### Overview
Chart.js is the most popular JavaScript charting library by npm downloads. While not designed for financial charts natively, the financial plugin adds candlestick and OHLC support.

#### Key Features
- **Chart types:** Line, Bar, Radar, Doughnut, Pie, Polar, Bubble, Scatter
- **Financial plugin:** Candlestick, OHLC (separate package)
- **Responsive:** Auto-resizes to container
- **Animations:** Smooth transitions
- **Canvas rendering:** Good performance

#### Bundle Size

| Configuration | Size (gzipped) |
|---------------|----------------|
| Core only | ~11KB |
| With financial plugin | ~20-30KB |

#### Pros
- ✅ Smallest bundle size (core)
- ✅ Simple API, quick to learn
- ✅ Beautiful defaults
- ✅ Active community
- ✅ MIT license

#### Cons
- ⚠️ Candlestick requires separate plugin
- ⚠️ Limited financial functionality
- ⚠️ Not optimized for real-time streaming
- ⚠️ Canvas-only (no SVG option)

#### When to Choose
- **Simple line/bar charts only**
- **Bundle size is critical**
- **No advanced financial features needed**
- **Quick prototyping**

---

### 7. DXcharts (Commercial)

**Official Site:** https://devexperts.com/dxcharts/  
**License:** Commercial (free for MVP development)

#### Overview
DXcharts is a modern white-label charting library from Devexperts, designed specifically for trading platforms and brokers. It offers native mobile SDKs in addition to web.

#### Key Features
- **Full customization:** Logos, colors, fonts, UI elements
- **Market data:** dxFeed integration or custom data feeds
- **Order management:** Place orders directly from charts
- **100+ indicators:** Built-in, plus dxScript for custom studies
- **42 drawing tools:** Trend lines, support/resistance, shapes, annotations
- **Native mobile SDKs:** iOS and Android (not just wrappers)
- **Modern stack:** JavaScript/TypeScript, HTML Canvas, React
- **AI Assistant:** Devexa AI on documentation

#### Pros
- ✅ Professional trading platform features
- ✅ Native mobile SDKs
- ✅ 100+ built-in indicators
- ✅ White-label customization
- ✅ Free for MVP development
- ✅ Direct support from build team

#### Cons
- ❌ Commercial license required for production
- ⚠️ Higher cost for full features
- ⚠️ May be overkill for simple needs

#### When to Choose
- **Building a trading platform**
- **Need native mobile apps**
- **Require order management integration**
- **White-label solution needed**

---

### 8. LightningChart JS Trader

**Official Site:** https://lightningchart.com/js-charts/trader/  
**License:** Commercial

#### Overview
LightningChart JS Trader is a high-performance financial charting library built with WebGL. It specializes in rendering massive datasets in real-time.

#### Key Features
- **WebGL rendering:** GPU-accelerated for performance
- **Chart types:** Candlestick, Bar, Line, Mountain, Kagi, Renko, Point & Figure, Heikin-Ashi
- **Performance:** 10 million data points/second real-time
- **Technical analysis:** Built-in indicators
- **Modern architecture:** JavaScript/TypeScript

#### Performance

| Metric | Value |
|--------|-------|
| Max static data points | 1.2 billion (heatmaps) |
| Real-time data rate | 10M points/second |
| Rendering | WebGL (GPU) |

#### Pros
- ✅ Highest performance (WebGL)
- ✅ Handles billions of data points
- ✅ Real-time streaming optimized
- ✅ Built-in chart types for trading

#### Cons
- ❌ Commercial license required
- ⚠️ WebGL requirement (no fallback)
- ⚠️ Smaller community

#### When to Choose
- **Maximum performance is critical**
- **Need to visualize billions of points**
- **Real-time high-frequency data**
- **WebGL is acceptable requirement**

---

### 9. AnyChart (Anystock)

**Official Site:** https://www.anychart.com/products/anystock/overview/  
**License:** Commercial (free for non-commercial)

#### Overview
AnyStock is a JavaScript stock charting library from AnyChart, available since 2003. It offers comprehensive financial charting with accessibility support (Section 508).

#### Key Features
- **68+ chart types:** Candlestick, OHLC, and many more
- **Technical indicators:** Built-in analysis tools
- **Drawing tools:** Annotations and shapes
- **Real-time streaming:** Live data updates
- **Accessibility:** Section 508 compliant
- **Big data:** Analytics and large dataset support

#### Pros
- ✅ Long-standing reputation (since 2003)
- ✅ 68+ chart types
- ✅ Accessibility compliant (Section 508)
- ✅ Drawing tools and annotations
- ✅ Real-time streaming

#### Cons
- ⚠️ Commercial license for production
- ⚠️ Less modern API compared to newer libraries

---

## Comparison Summary Tables

### Feature Comparison

| Feature | Lightweight Charts | Recharts | ECharts | Highcharts Stock | ApexCharts | Chart.js |
|---------|-------------------|----------|---------|------------------|------------|----------|
| **Candlestick** | ✅ Native | ❌ | ✅ | ✅ Native | ✅ Native | ⚠️ Plugin |
| **OHLC** | ✅ Native | ❌ | ✅ | ✅ Native | ✅ | ❌ |
| **Real-time streaming** | ✅ Optimized | ⚠️ Basic | ✅ Good | ✅ Good | ✅ | ⚠️ Basic |
| **Technical indicators** | ⚠️ Plugins | ❌ | ✅ Many | ✅ 40+ | ⚠️ Limited | ❌ |
| **Time scale** | ✅ Native | ⚠️ Basic | ✅ Native | ✅ Native | ✅ | ⚠️ Basic |
| **Zoom/Pan** | ✅ Built-in | ⚠️ Limited | ✅ Built-in | ✅ Built-in | ✅ | ⚠️ Plugin |
| **Mobile touch** | ✅ Optimized | ✅ Good | ✅ Good | ✅ Good | ✅ | ✅ Good |
| **Dark mode** | ✅ Built-in | ✅ CSS | ✅ Themes | ✅ Themes | ✅ | ✅ CSS |
| **TypeScript** | ✅ Native | ✅ Native | ✅ Types | ✅ Types | ✅ Types | ✅ Types |

### Performance Comparison

| Library | Rendering | Dataset Size | Real-time | Memory |
|---------|-----------|--------------|-----------|--------|
| **Lightweight Charts** | Canvas | Millions | Excellent | Low |
| **Recharts** | SVG | ~10K | Good | Medium |
| **ECharts** | Canvas/SVG | Millions | Excellent | Medium-High |
| **Highcharts Stock** | SVG/Canvas | ~100K+ | Good | Medium |
| **ApexCharts** | SVG | ~100K | Good | Medium |
| **Chart.js** | Canvas | ~10K | Good | Low |
| **LightningChart** | WebGL | Billions | Excellent | Varies |

### Cost & Licensing

| Library | License | Cost | Attribution |
|---------|---------|------|-------------|
| **Lightweight Charts** | Apache 2.0 | Free | Required |
| **Recharts** | MIT | Free | None |
| **ECharts** | Apache 2.0 | Free | Optional |
| **Highcharts Stock** | Commercial | $535+/seat | Required (free tier) |
| **ApexCharts** | MIT | Free | None |
| **Chart.js** | MIT | Free | None |
| **DXcharts** | Commercial | Contact | Varied |
| **LightningChart JS** | Commercial | Contact | Varied |

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
6. Active development by TradingView (v5 released March 2025)
7. Free and open source (Apache 2.0)
8. Trusted by 40,000+ companies and 100M+ traders

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
1. Native React API (compatible with React 19)
2. Excellent TypeScript support
3. Composable component architecture
4. Good fit for existing Radix UI + Tailwind stack
5. Perfect for non-financial charts

**Use Cases:**
- Portfolio performance over time
- Asset allocation pie charts
- Sector breakdown
- Comparison charts
- Analytics dashboards

### Alternative: Highcharts Stock (If Budget Allows)

If the project has budget for commercial licenses, Highcharts Stock is worth considering for:
- Built-in technical indicators (saves development time)
- Enterprise-level support
- Professional appearance out-of-box
- Strong accessibility compliance

---

## Implementation Guidance

### Phase 1: Core Financial Charts
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

### Phase 2: Dashboard Charts
```
components/
├── charts/
│   ├── portfolio-chart.tsx      # Recharts line chart
│   ├── allocation-chart.tsx     # Recharts pie/donut
│   ├── sector-chart.tsx         # Recharts radar/bar
│   └── comparison-chart.tsx     # Recharts composed
```

### Lightweight Charts v5 Quick Start

```typescript
// Install
npm install lightweight-charts

// For bleeding-edge features
npm install https://pkg.pr.new/lightweight-charts@master
```

---

## References

1. **TradingView Lightweight Charts Documentation** - https://tradingview.github.io/lightweight-charts/
2. **TradingView Lightweight Charts GitHub** - https://github.com/tradingview/lightweight-charts
3. **TradingView v5 Announcement** - https://www.tradingview.com/blog/en/tradingview-lightweight-charts-version-5-50837/
4. **Geekflare: Top 12 Financial Charting Libraries** - https://geekflare.com/dev/financial-charting-libraries/
5. **Luzmo: 7 Best JavaScript Chart Libraries 2026** - https://www.luzmo.com/blog/best-javascript-chart-libraries
6. **Embeddable: 6 Best JavaScript Charting Libraries** - https://embeddable.com/blog/javascript-charting-libraries
7. **SearXNG Research Query** - Various sources on stock chart library comparisons
8. **Reddit: Best Charting Library for Candlestick** - Community discussions on library performance
9. **Highcharts Stock Documentation** - https://www.highcharts.com/products/stock/
10. **Apache ECharts Documentation** - https://echarts.apache.org/

---

## Appendix: Bundle Size Comparison

| Library | Minified | Gzipped | Tree-shakeable |
|---------|----------|---------|----------------|
| Lightweight Charts | ~200KB | ~44KB | Partial |
| Recharts (full) | ~300KB | ~85KB | Yes |
| ECharts (minimal) | ~500KB | ~100KB | Yes |
| Highcharts Stock | ~400KB | ~100KB | Partial |
| ApexCharts | ~250KB | ~80KB | Partial |
| Chart.js (core) | ~40KB | ~11KB | Yes |
| D3.js (full) | ~300KB | ~93KB | Yes |

Note: Actual bundle sizes vary based on imported modules. Always test with your bundler.

---

## Appendix: React Wrappers for Lightweight Charts

While Lightweight Charts doesn't have an official React wrapper, several community options exist:

1. **Direct Integration (Recommended)**
   ```typescript
   // Use useEffect with createChart - most flexible
   import { createChart, CandlestickSeries } from 'lightweight-charts';
   ```

2. **Community Wrappers**
   - `@tradingview-tools/lightweight-charts-react` - Basic wrapper
   - `kaktana-react-lightweight-charts` - Simple React wrapper
   - Custom hooks pattern (recommended for complex needs)

---

*Document created by Solom Developer Agent*  
*Issue #72: Research Stock Chart Libraries Comparison*  
*Research conducted: 2026-03-01*  
*Sources: SearXNG search, Official documentation, Community discussions*