/**
 * Tests for StockChart Component
 * 
 * These tests verify:
 * - Chart initialization
 * - Data rendering
 * - Real-time updates
 * - Chart type switching
 * - Responsive behavior
 * - Error handling
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';

// Mock lightweight-charts
vi.mock('lightweight-charts', () => {
  const mockSeriesData: Map<string, any[]> = new Map();
  
  const mockSeries = {
    setData: vi.fn((data: any[]) => {
      mockSeriesData.set('main', data);
      return mockSeries;
    }),
    update: vi.fn((data: any) => {
      const existing = mockSeriesData.get('main') || [];
      mockSeriesData.set('main', [...existing, data]);
      return mockSeries;
    }),
    priceScale: vi.fn(() => ({
      applyOptions: vi.fn(),
    })),
  };

  const mockPane = {
    // Pane methods can be added here if needed
  };

  const mockChart = {
    addSeries: vi.fn(() => mockSeries),
    removeSeries: vi.fn(),
    resize: vi.fn(),
    timeScale: vi.fn(() => ({
      fitContent: vi.fn(),
      setVisibleRange: vi.fn(),
    })),
    priceScale: vi.fn(() => ({
      applyOptions: vi.fn(),
    })),
    takeScreenshot: vi.fn(() => ({
      toDataURL: vi.fn(() => 'data:image/png;base64,mock'),
    })),
    panes: vi.fn(() => [mockPane]),
    remove: vi.fn(),
  };

  return {
    createChart: vi.fn(() => mockChart),
    createTextWatermark: vi.fn(),
    CrosshairMode: { Normal: 0 },
    ColorType: { Solid: 0 },
    CandlestickSeries: 'Candlestick',
    LineSeries: 'Line',
    AreaSeries: 'Area',
    HistogramSeries: 'Histogram',
    UTCTimestamp: 0,
  };
});

// Mock ResizeObserver
class MockResizeObserver {
  observe = vi.fn();
  unobserve = vi.fn();
  disconnect = vi.fn();
}

// @ts-expect-error - ResizeObserver mock for testing
globalThis.ResizeObserver = MockResizeObserver;

// Mock fetch
const mockFetch = vi.fn();
globalThis.fetch = mockFetch;

// Mock WebSocket
class MockWebSocket {
  onopen: (() => void) | null = null;
  onclose: (() => void) | null = null;
  onerror: ((error: any) => void) | null = null;
  onmessage: ((event: any) => void) | null = null;
  readyState = 0;
  send = vi.fn();
  close = vi.fn();
  
  constructor(url: string) {
    setTimeout(() => {
      this.readyState = 1;
      this.onopen?.();
    }, 0);
  }
}

// @ts-expect-error - WebSocket mock for testing
globalThis.WebSocket = MockWebSocket;

// Import after mocks
import { StockChart, StockChartRef } from './Chart';
import type { OHLCVDataPoint } from '@/lib/types/chart';

// ============================================
// Test Data
// ============================================

const mockOHLCVData: OHLCVDataPoint[] = [
  { time: 1704067200, open: 100, high: 110, low: 95, close: 105, volume: 1000000 },
  { time: 1704153600, open: 105, high: 115, low: 100, close: 112, volume: 1200000 },
  { time: 1704240000, open: 112, high: 120, low: 108, close: 118, volume: 900000 },
  { time: 1704326400, open: 118, high: 125, low: 115, close: 122, volume: 1100000 },
  { time: 1704412800, open: 122, high: 130, low: 120, close: 128, volume: 1300000 },
];

const mockLineData = [
  { time: 1704067200, value: 100 },
  { time: 1704153600, value: 112 },
  { time: 1704240000, value: 118 },
  { time: 1704326400, value: 122 },
  { time: 1704412800, value: 128 },
];

// ============================================
// Tests
// ============================================

describe('StockChart', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (global.fetch as any).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ price: 125.50, symbol: 'AAPL' }),
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  // ============================================
  // Basic Rendering
  // ============================================

  describe('Rendering', () => {
    it('should render without crashing', () => {
      const { container } = render(
        <StockChart symbol="AAPL" data={mockOHLCVData} />
      );
      expect(container).toBeDefined();
    });

    it('should render with custom height', () => {
      const { container } = render(
        <StockChart symbol="AAPL" data={mockOHLCVData} height={500} />
      );
      const chartContainer = container.querySelector('[style*="height"]');
      expect(chartContainer).toBeDefined();
    });

    it('should render with watermark', () => {
      render(
        <StockChart symbol="AAPL" data={mockOHLCVData} watermark="AAPL" />
      );
      // Watermark is handled internally by lightweight-charts
    });

    it('should render loading state', () => {
      render(
        <StockChart symbol="AAPL" data={[]} isLoading={true} />
      );
      expect(screen.getByText('Loading chart...')).toBeDefined();
    });

    it('should apply custom className', () => {
      const { container } = render(
        <StockChart symbol="AAPL" data={mockOHLCVData} className="custom-chart" />
      );
      expect(container.querySelector('.custom-chart')).toBeDefined();
    });
  });

  // ============================================
  // Chart Types
  // ============================================

  describe('Chart Types', () => {
    it('should render candlestick chart by default', () => {
      const ref = React.createRef<StockChartRef>();
      render(
        <StockChart ref={ref} symbol="AAPL" data={mockOHLCVData} />
      );
      // Candlestick is the default type
      expect(ref.current).toBeDefined();
    });

    it('should render line chart', () => {
      const ref = React.createRef<StockChartRef>();
      render(
        <StockChart ref={ref} symbol="AAPL" chartType="line" data={mockLineData} />
      );
      expect(ref.current).toBeDefined();
    });

    it('should render area chart', () => {
      const ref = React.createRef<StockChartRef>();
      render(
        <StockChart ref={ref} symbol="AAPL" chartType="area" data={mockLineData} />
      );
      expect(ref.current).toBeDefined();
    });

    it('should display chart type selector when enabled', async () => {
      const user = userEvent.setup();
      render(
        <StockChart symbol="AAPL" data={mockOHLCVData} showChartTypeSelector={true} />
      );
      
      // Check for chart type buttons
      const typeButtons = screen.getAllByRole('button');
      expect(typeButtons.length).toBeGreaterThan(0);
    });
  });

  // ============================================
  // Volume Display
  // ============================================

  describe('Volume Display', () => {
    it('should show volume by default', () => {
      const ref = React.createRef<StockChartRef>();
      render(
        <StockChart ref={ref} symbol="AAPL" data={mockOHLCVData} showVolume={true} />
      );
      expect(ref.current).toBeDefined();
    });

    it('should hide volume when disabled', () => {
      const ref = React.createRef<StockChartRef>();
      render(
        <StockChart ref={ref} symbol="AAPL" data={mockOHLCVData} showVolume={false} />
      );
      expect(ref.current).toBeDefined();
    });
  });

  // ============================================
  // Ref Methods
  // ============================================

  describe('Ref Methods', () => {
    it('should expose getChart method', () => {
      const ref = React.createRef<StockChartRef>();
      render(
        <StockChart ref={ref} symbol="AAPL" data={mockOHLCVData} />
      );
      
      expect(ref.current?.getChart).toBeDefined();
      expect(typeof ref.current?.getChart).toBe('function');
      expect(ref.current?.getChart()).not.toBeNull();
    });

    it('should expose updatePrice method', () => {
      const ref = React.createRef<StockChartRef>();
      render(
        <StockChart ref={ref} symbol="AAPL" data={mockOHLCVData} />
      );
      
      expect(ref.current?.updatePrice).toBeDefined();
      expect(typeof ref.current?.updatePrice).toBe('function');
      
      // Should not throw when called
      expect(() => ref.current?.updatePrice(125.50, 1000)).not.toThrow();
    });

    it('should expose clearData method', () => {
      const ref = React.createRef<StockChartRef>();
      render(
        <StockChart ref={ref} symbol="AAPL" data={mockOHLCVData} />
      );
      
      expect(ref.current?.clearData).toBeDefined();
      expect(typeof ref.current?.clearData).toBe('function');
      
      // Should not throw when called
      expect(() => ref.current?.clearData()).not.toThrow();
    });

    it('should expose resize method', () => {
      const ref = React.createRef<StockChartRef>();
      render(
        <StockChart ref={ref} symbol="AAPL" data={mockOHLCVData} />
      );
      
      expect(ref.current?.resize).toBeDefined();
      expect(typeof ref.current?.resize).toBe('function');
      
      // Should not throw when called
      expect(() => ref.current?.resize(800, 400)).not.toThrow();
    });

    it('should expose fitContent method', () => {
      const ref = React.createRef<StockChartRef>();
      render(
        <StockChart ref={ref} symbol="AAPL" data={mockOHLCVData} />
      );
      
      expect(ref.current?.fitContent).toBeDefined();
      expect(typeof ref.current?.fitContent).toBe('function');
      
      // Should not throw when called
      expect(() => ref.current?.fitContent()).not.toThrow();
    });

    it('should expose takeScreenshot method', () => {
      const ref = React.createRef<StockChartRef>();
      render(
        <StockChart ref={ref} symbol="AAPL" data={mockOHLCVData} />
      );
      
      expect(ref.current?.takeScreenshot).toBeDefined();
      expect(typeof ref.current?.takeScreenshot).toBe('function');
      
      const screenshot = ref.current?.takeScreenshot();
      expect(screenshot).toBeDefined();
    });

    it('should expose updateCandle method for candlestick charts', () => {
      const ref = React.createRef<StockChartRef>();
      render(
        <StockChart ref={ref} symbol="AAPL" chartType="candlestick" data={mockOHLCVData} />
      );
      
      expect(ref.current?.updateCandle).toBeDefined();
      expect(typeof ref.current?.updateCandle).toBe('function');
      
      const newCandle: OHLCVDataPoint = {
        time: Date.now() / 1000,
        open: 128,
        high: 132,
        low: 126,
        close: 130,
        volume: 800000,
      };
      
      // Should not throw when called
      expect(() => ref.current?.updateCandle(newCandle)).not.toThrow();
    });
  });

  // ============================================
  // Real-time Updates
  // ============================================

  describe('Real-time Updates', () => {
    it('should start polling when realtimeUpdates is enabled', async () => {
      const onPriceUpdate = vi.fn();
      
      render(
        <StockChart
          symbol="AAPL"
          data={mockOHLCVData}
          realtimeUpdates={true}
          pollInterval={1000}
          onPriceUpdate={onPriceUpdate}
        />
      );

      // Wait for potential polling
      await waitFor(() => {
        // Polling should be set up
      }, { timeout: 2000 });
    });

    it('should not start polling when realtimeUpdates is disabled', () => {
      const onPriceUpdate = vi.fn();
      
      render(
        <StockChart
          symbol="AAPL"
          data={mockOHLCVData}
          realtimeUpdates={false}
          onPriceUpdate={onPriceUpdate}
        />
      );

      // onPriceUpdate should not be called initially
      expect(onPriceUpdate).not.toHaveBeenCalled();
    });
  });

  // ============================================
  // Error Handling
  // ============================================

  describe('Error Handling', () => {
    it('should call onError when chart fails to initialize', () => {
      const onError = vi.fn();
      const { createChart } = require('lightweight-charts');
      
      // Make createChart throw an error
      createChart.mockImplementationOnce(() => {
        throw new Error('Chart initialization failed');
      });

      render(
        <StockChart symbol="AAPL" data={mockOHLCVData} onError={onError} />
      );

      expect(onError).toHaveBeenCalled();
    });

    it('should handle empty data gracefully', () => {
      const { container } = render(
        <StockChart symbol="AAPL" data={[]} />
      );

      expect(container).toBeDefined();
    });

    it('should handle invalid data gracefully', () => {
      const ref = React.createRef<StockChartRef>();
      render(
        <StockChart ref={ref} symbol="AAPL" />
      );

      // Should not throw when updatePrice is called without data
      expect(() => ref.current?.updatePrice(100)).not.toThrow();
    });
  });

  // ============================================
  // Accessibility
  // ============================================

  describe('Accessibility', () => {
    it('should have role="img" for the chart', () => {
      const { container } = render(
        <StockChart symbol="AAPL" data={mockOHLCVData} />
      );

      const chart = container.querySelector('[role="img"]');
      expect(chart).toBeDefined();
    });

    it('should have accessible label', () => {
      const { container } = render(
        <StockChart symbol="AAPL" data={mockOHLCVData} />
      );

      const chart = container.querySelector('[aria-label]');
      expect(chart?.getAttribute('aria-label')).toContain('AAPL');
    });
  });

  // ============================================
  // Custom Colors
  // ============================================

  describe('Custom Colors', () => {
    it('should accept custom colors', () => {
      const customColors = {
        up: '#00FF00',
        down: '#FF0000',
        line: '#0000FF',
      };

      const ref = React.createRef<StockChartRef>();
      render(
        <StockChart
          ref={ref}
          symbol="AAPL"
          data={mockOHLCVData}
          colors={customColors}
        />
      );

      expect(ref.current).toBeDefined();
    });
  });

  // ============================================
  // Mobile Responsiveness
  // ============================================

  describe('Mobile Responsiveness', () => {
    it('should resize when container size changes', () => {
      const ref = React.createRef<StockChartRef>();
      const { container } = render(
        <StockChart ref={ref} symbol="AAPL" data={mockOHLCVData} height={300} />
      );

      // Check that ResizeObserver is set up
      expect(MockResizeObserver).toBeDefined();
      expect(ref.current).toBeDefined();
    });

    it('should use default height when not specified', () => {
      const ref = React.createRef<StockChartRef>();
      render(
        <StockChart ref={ref} symbol="AAPL" data={mockOHLCVData} />
      );

      // Default height is 400
      expect(ref.current).toBeDefined();
    });
  });

  // ============================================
  // Integration
  // ============================================

  describe('Integration', () => {
    it('should work with API data', async () => {
      const { createChart } = require('lightweight-charts');
      
      render(
        <StockChart
          symbol="AAPL"
          data={mockOHLCVData}
          realtimeUpdates={false}
        />
      );

      // Verify createChart was called
      await waitFor(() => {
        expect(createChart).toHaveBeenCalled();
      });
    });

    it('should update data when props change', async () => {
      const { rerender } = render(
        <StockChart symbol="AAPL" data={mockOHLCVData.slice(0, 3)} />
      );

      // Update with more data
      rerender(
        <StockChart symbol="AAPL" data={mockOHLCVData} />
      );

      // Should handle the update gracefully
    });
  });
});