# Stock Chart Libraries Comparison for Solom

> **Research Date:** March 1, 2026  
> **Issue:** #72  
> **Status:** Research Complete

## Executive Summary

This document provides a comprehensive comparison of stock chart libraries suitable for React/Next.js financial applications. Based on our analysis, **TradingView's Lightweight Charts** (currently implemented) remains the best choice for Solom's real-time stock charting needs, with **Recharts** serving as a complement for simpler charting requirements.

---

## Current Implementation

Solom currently uses two chart libraries:

| Library | Version | Purpose |
|---------|---------|---------|
| `lightweight-charts` | v5.1.0 | Primary stock charts (candlestick, OHLC) |
| `recharts` | v3.7.0 | Line charts, area charts, simple visualizations |

### Key Components

- `StockChart.tsx` - Candlestick charts with indicators (SMA, EMA, RSI, MACD, Bollinger Bands)
- `CandlestickChart.tsx` - Recharts-based candlestick implementation
- `LineChart.tsx` - Price line charts with volume

### Migration Note

⚠️ The StockChart component currently has `@ts-nocheck` due to lightweight-charts v3/v4 to v5 API migration. The v5 version uses `addSeries()` pattern instead of the old `add*CandlestickSeries()` methods.

---

## Library Comparison

### 1. TradingView Lightweight Charts ⭐ (Current Choice)

**Repository:** [tradingview/lightweight-charts](https://github.com/tradingview/lightweight-charts)

| Aspect | Rating | Details |
|--------|--------|---------|
| **Performance** | ⭐⭐⭐⭐⭐ | One of the smallest and fastest financial HTML5 canvas charts |
| **Bundle Size** | ⭐⭐⭐⭐⭐ | ~44KB gzip, comparable to static images |
| **Real-time Data** | ⭐⭐⭐⭐⭐ | Built for streaming, WebSocket-friendly architecture |
| **Mobile** | ⭐⭐⭐⭐⭐ | Touch-optimized, responsive design |
| **React Integration** | ⭐⭐⭐⭐ | Framework-agnostic, requires wrapper components |
| **Documentation** | ⭐⭐⭐⭐⭐ | Excellent docs at [tradingview.github.io/lightweight-charts](https://tradingview.github.io/lightweight-charts/) |
| **License** | Apache 2.0 | Requires attribution to TradingView |
| **Cost** | FREE | Open source |

**Pros:**
- ✅ Smallest bundle size for financial charts
- ✅ Excellent real-time streaming performance
- ✅ Built specifically for financial data (candlestick, OHLC, etc.)
- ✅ Touch/mobile-first design
- ✅ Active maintenance by TradingView
- ✅ Plugin architecture for custom indicators
- ✅ Free and open source

**Cons:**
- ❌ Requires React wrapper (currently custom-built)
- ❌ Attribution requirement (must display TradingView logo)
- ❌ Fewer built-in indicators than some commercial options
- ❌ Limited chart types (primarily financial)

**Best For:** Real-time stock charts, trading applications, financial dashboards

**Installation:**
```bash
npm install lightweight-charts
```

**v5 Usage Pattern:**
```typescript
import { createChart, CandlestickSeries, LineSeries } from 'lightweight-charts';

const chart = createChart(container, { width: 400, height: 300 });
const candlestickSeries = chart.addSeries(CandlestickSeries, {
  upColor: '#22c55e',
  downColor: '#ef4444',
});
candlestickSeries.setData(data);
```

---

### 2. Recharts ⭐ (Secondary Choice)

**Repository:** [recharts/recharts](https://github.com/recharts/recharts)

| Aspect | Rating | Details |
|--------|--------|---------|
| **Performance** | ⭐⭐⭐⭐ | Good for moderate datasets |
| **Bundle Size** | ⭐⭐⭐ | ~45KB gzip (with dependencies) |
| **Real-time Data** | ⭐⭐⭐ | Supports updates, but not optimized for high-frequency |
| **Mobile** | ⭐⭐⭐⭐ | Responsive design |
| **React Integration** | ⭐⭐⭐⭐⭐ | Native React components |
| **Documentation** | ⭐⭐⭐⭐⭐ | Comprehensive docs |
| **License** | MIT | Permissive, no attribution |
| **Cost** | FREE | Open source |

**Pros:**
- ✅ Native React components (excellent DX)
- ✅ Declarative API matches React philosophy
- ✅ Great for general-purpose charts
- ✅ Good TypeScript support
- ✅ MIT license (no attribution)
- ✅ Large community and ecosystem

**Cons:**
- ❌ Not specifically designed for financial charts
- ❌ Candlestick support requires custom implementation
- ❌ No built-in technical indicators
- ❌ Performance degrades with large datasets

**Best For:** Line charts, area charts, simple visualizations, dashboards

**Installation:**
```bash
npm install recharts
```

---

### 3. Highcharts React Stock Chart

**Website:** [highcharts.com](https://www.highcharts.com/products/stock/)

| Aspect | Rating | Details |
|--------|--------|---------|
| **Performance** | ⭐⭐⭐⭐⭐ | Mature, highly optimized |
| **Bundle Size** | ⭐⭐⭐ | ~100KB+ for stock module |
| **Real-time Data** | ⭐⭐⭐⭐⭐ | Excellent WebSocket support |
| **Mobile** | ⭐⭐⭐⭐⭐ | Touch-friendly, responsive |
| **React Integration** | ⭐⭐⭐⭐⭐ | Official React wrapper |
| **Documentation** | ⭐⭐⭐⭐⭐ | Comprehensive docs, examples |
| **License** | Commercial | Free for personal/educational |
| **Cost** | $$-$$$ | Free trial, then commercial |

**Pros:**
- ✅ Mature API with predictable behavior
- ✅ OHLC, candlestick, range series built-in
- ✅ Interactive range selector
- ✅ 20+ built-in technical indicators
- ✅ Official React wrapper maintained
- ✅ Excellent real-time streaming support

**Cons:**
- ❌ Commercial license required for commercial use
- ❌ Larger bundle size
- ❌ Attribution watermark in free version

**Best For:** Enterprise financial applications with budget

**Installation:**
```bash
npm install highcharts highcharts-react-official
```

---

### 4. amCharts 5

**Website:** [amcharts.com](https://www.amcharts.com/)

| Aspect | Rating | Details |
|--------|--------|---------|
| **Performance** | ⭐⭐⭐⭐ | Smooth animations, good performance |
| **Bundle Size** | ⭐⭐⭐ | ~80-120KB depending on modules |
| **Real-time Data** | ⭐⭐⭐⭐ | Good streaming support |
| **Mobile** | ⭐⭐⭐⭐ | Touch-friendly design |
| **React Integration** | ⭐⭐⭐⭐ | React wrapper available |
| **Documentation** | ⭐⭐⭐⭐⭐ | Excellent documentation |
| **License** | Commercial | Free with attribution |
| **Cost** | $$-$$$ | Free with branding, commercial licenses |

**Pros:**
- ✅ Beautiful animations and visualizations
- ✅ Candlestick, OHLC, step line, Renko charts
- ✅ Built-in SMA, EMA, MACD indicators
- ✅ Gradient fills, shadows, custom themes
- ✅ Good mobile support

**Cons:**
- ❌ Free version requires attribution
- ❌ Commercial license for production
- ❌ Steep learning curve
- ❌ Larger bundle size

**Best For:** Applications prioritizing visual aesthetics and animations

---

### 5. Syncfusion React Stock Chart

**Website:** [syncfusion.com](https://www.syncfusion.com/react-components/react-stock-chart)

| Aspect | Rating | Details |
|--------|--------|---------|
| **Performance** | ⭐⭐⭐⭐ | Optimized for large datasets |
| **Bundle Size** | ⭐⭐⭐ | Modular but comprehensive |
| **Real-time Data** | ⭐⭐⭐⭐ | WebSocket integration |
| **Mobile** | ⭐⭐⭐⭐⭐ | Touch-enabled, responsive |
| **React Integration** | ⭐⭐⭐⭐⭐ | Native React components |
| **Documentation** | ⭐⭐⭐⭐⭐ | 145+ components, extensive docs |
| **License** | Commercial | Free for community projects |
| **Cost** | $$-$$$ | Community license available |

**Pros:**
- ✅ Multiple financial chart types (candlestick, OHLC, Hilo, etc.)
- ✅ Comprehensive indicator library (SMA, EMA, MACD, RSI, Bollinger, ATR, etc.)
- ✅ Interactive tooling (zoom, pan, crosshair, tooltips)
- ✅ Export to PNG, PDF, SVG, CSV, Excel
- ✅ WCAG accessibility support
- ✅ Free community license for companies <$1M revenue

**Cons:**
- ❌ Commercial license required for larger companies
- ❌ Heavier bundle size
- ❌ Syncfusion branding in free version

**Best For:** Enterprise applications needing full suite of financial tools

**Installation:**
```bash
npm install @syncfusion/ej2-react-charts
```

---

### 6. CanvasJS

**Website:** [canvasjs.com](https://canvasjs.com/)

| Aspect | Rating | Details |
|--------|--------|---------|
| **Performance** | ⭐⭐⭐⭐⭐ | Optimized canvas rendering |
| **Bundle Size** | ⭐⭐⭐⭐ | ~45KB gzip |
| **Real-time Data** | ⭐⭐⭐⭐ | Dynamic updates support |
| **Mobile** | ⭐⭐⭐⭐⭐ | Touch-optimized |
| **React Integration** | ⭐⭐⭐⭐ | React wrapper available |
| **Documentation** | ⭐⭐⭐⭐ | Good documentation |
| **License** | Commercial | Free for personal use |
| **Cost** | $$ | Affordable commercial licenses |

**Pros:**
- ✅ Performance-focused canvas rendering
- ✅ Smooth animations
- ✅ Real-time updates for trading apps
- ✅ Zoom/pan interactions
- ✅ Free version available for personal projects

**Cons:**
- ❌ Commercial license required for production
- ❌ Fewer built-in indicators than competitors

**Best For:** Performance-critical applications with simple charting needs

---

### 7. AnyChart

**Website:** [anychart.com](https://www.anychart.com/)

| Aspect | Rating | Details |
|--------|--------|---------|
| **Performance** | ⭐⭐⭐⭐ | Efficient large dataset handling |
| **Bundle Size** | ⭐⭐⭐ | Modular architecture |
| **Real-time Data** | ⭐⭐⭐⭐ | Good streaming support |
| **Mobile** | ⭐⭐⭐⭐ | Responsive design |
| **React Integration** | ⭐⭐⭐⭐ | React wrapper available |
| **Documentation** | ⭐⭐⭐⭐ | Comprehensive API docs |
| **License** | Commercial | Free for educational |
| **Cost** | $$-$$$ | Enterprise pricing |

**Pros:**
- ✅ Exceptional large dataset support
- ✅ 20+ built-in technical indicators
- ✅ Data grouping and range selection
- ✅ Export to PNG, PDF, Excel, SVG
- ✅ Customizable tooltips and themes

**Cons:**
- ❌ Commercial license required
- ❌ Heavier bundle size
- ❌ Steeper learning curve

**Best For:** Applications handling large historical datasets

---

## Decision Matrix

| Criteria | Lightweight Charts | Recharts | Highcharts | amCharts | Syncfusion | CanvasJS | AnyChart |
|----------|-------------------|----------|------------|----------|------------|----------|----------|
| **Free/Open Source** | ✅ | ✅ | ❌ | ❌ | ⚠️ | ⚠️ | ❌ |
| **Bundle Size** | 44KB | 45KB | 100KB+ | 80-120KB | Modular | 45KB | Modular |
| **Real-time Performance** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| **Native React** | ❌ | ✅ | ⚠️ | ⚠️ | ✅ | ⚠️ | ⚠️ |
| **Financial Chart Types** | ⭐⭐⭐⭐⭐ | ⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| **Built-in Indicators** | ⚠️ Plugin | ❌ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐ | ⭐⭐⭐⭐⭐ |
| **Mobile Support** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| **Documentation** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ |

---

## Recommendations for Solom

### Primary Recommendation: Continue with Lightweight Charts

**Rationale:**

1. **Performance Leadership** - Lightweight Charts is specifically designed for financial data rendering. Its canvas-based architecture delivers the best performance for real-time price updates.

2. **Bundle Efficiency** - At ~44KB gzip, it's the smallest option for financial charts, critical for mobile performance.

3. **Financial-Specific Features** - Built-in support for:
   - Candlestick charts
   - OHLC charts
   - Volume histograms
   - Time scale management
   - Price scale formatting

4. **Current Investment** - Solom already has significant investment in lightweight-charts with:
   - StockChart component with indicators (SMA, EMA, RSI, MACD, Bollinger Bands)
   - WebSocket integration for real-time updates
   - Mobile-responsive implementation

5. **Real-time Architecture** - The library's design matches Solom's real-time data requirements:
   - Efficient streaming updates
   - Minimal repaint cost
   - Touch-optimized interactions

### Secondary Recommendation: Keep Recharts for Non-Financial Charts

**Use Cases:**
- Dashboard line charts
- Simple area charts
- Bar charts for comparative data
- Any non-real-time visualization

### Migration Task: v5 API Update

The StockChart component needs to be updated to use the v5 `addSeries()` pattern:

```typescript
// ❌ Old (v3/v4) - causes @ts-nocheck
const series = chart.addCandlestickSeries({ ... });

// ✅ New (v5) - proper TypeScript support
import { CandlestickSeries } from 'lightweight-charts';
const series = chart.addSeries(CandlestickSeries, { ... });
```

---

## Implementation Guidelines

### When to Use Lightweight Charts

- Real-time price updates (websockets)
- Candlestick/OHLC charts
- Charts with technical indicators
- Performance-critical visualizations
- Mobile-first charting

### When to Use Recharts

- Simple line/area charts
- Dashboard statistics
- Comparative bar charts
- Charts not requiring real-time updates
- When React native DX is prioritized

---

## Future Considerations

### Potential Enhancements

1. **Plugin Development** - Create custom indicator plugins for Lightweight Charts
2. **Caching Strategy** - Implement efficient data caching for historical charts
3. **Virtual Scrolling** - Handle 50,000+ data points efficiently
4. **Web Workers** - Offload indicator calculations to background threads

### Alternative Library Migration Path

If requirements change significantly (e.g., need for 50+ built-in indicators), consider:

1. **Highcharts** - For enterprise applications with budget
2. **Syncfusion** - If comprehensive suite is needed and community license applies

---

## References

- [TradingView Lightweight Charts Documentation](https://tradingview.github.io/lightweight-charts/)
- [TradingView GitHub Repository](https://github.com/tradingview/lightweight-charts)
- [Recharts Documentation](https://recharts.org/)
- [Syncfusion Blog: Top 5 React Stock Charts 2026](https://www.syncfusion.com/blogs/post/top-5-react-stock-charts-in-2026)
- [npm trends: Chart Libraries](https://npmtrends.com/)

---

## Changelog

| Date | Author | Change |
|------|--------|--------|
| 2026-03-01 | Solom Developer Agent | Initial research document |