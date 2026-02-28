'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Activity, 
  TrendingUp, 
  BarChart2 
} from 'lucide-react';

// ============================================
// Types
// ============================================

export type IndicatorType = 'sma' | 'ema' | 'rsi' | 'macd' | 'bollingerBands';

export interface IndicatorSettings {
  sma: {
    enabled: boolean;
    period: number;
  };
  ema: {
    enabled: boolean;
    period: number;
  };
  rsi: {
    enabled: boolean;
    period: number;
  };
  macd: {
    enabled: boolean;
    fastPeriod: number;
    slowPeriod: number;
    signalPeriod: number;
  };
  bollingerBands: {
    enabled: boolean;
    period: number;
    stdDev: number;
  };
}

export interface IndicatorControlsProps {
  settings: IndicatorSettings;
  onChange: (settings: IndicatorSettings) => void;
  className?: string;
}

// Default settings
export const DEFAULT_INDICATOR_SETTINGS: IndicatorSettings = {
  sma: {
    enabled: false,
    period: 20,
  },
  ema: {
    enabled: false,
    period: 20,
  },
  rsi: {
    enabled: false,
    period: 14,
  },
  macd: {
    enabled: false,
    fastPeriod: 12,
    slowPeriod: 26,
    signalPeriod: 9,
  },
  bollingerBands: {
    enabled: false,
    period: 20,
    stdDev: 2,
  },
};

// ============================================
// Helper Components
// ============================================

interface IndicatorToggleProps {
  id: string;
  label: string;
  description: string;
  enabled: boolean;
  onToggle: () => void;
  badge?: {
    text: string;
    colorClass: string;
  };
  children?: React.ReactNode;
}

function IndicatorToggle({
  id,
  label,
  description,
  enabled,
  onToggle,
  badge,
  children,
}: IndicatorToggleProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id={id}
            checked={enabled}
            onChange={onToggle}
            className="h-4 w-4 rounded border-gray-300"
          />
          <label htmlFor={id} className="text-sm font-medium cursor-pointer">
            {label}
          </label>
          {badge && (
            <Badge variant="secondary" className={badge.colorClass}>
              {badge.text}
            </Badge>
          )}
        </div>
      </div>
      <p className="text-xs text-muted-foreground pl-6">{description}</p>
      {enabled && children}
    </div>
  );
}

interface NumberInputProps {
  id: string;
  label: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
}

function NumberInput({ id, label, value, onChange, min = 1, max = 500, step = 1 }: NumberInputProps) {
  return (
    <div className="flex items-center gap-2">
      <label htmlFor={id} className="text-xs text-muted-foreground w-20">
        {label}
      </label>
      <Input
        id={id}
        type="number"
        value={value}
        onChange={(e) => onChange(parseInt(e.target.value, 10) || min)}
        min={min}
        max={max}
        step={step}
        className="h-8 w-20 text-xs"
      />
    </div>
  );
}

// ============================================
// Main Component
// ============================================

export function IndicatorControls({ 
  settings, 
  onChange,
  className = '' 
}: IndicatorControlsProps) {
  const updateSMA = (updates: Partial<IndicatorSettings['sma']>) => {
    onChange({
      ...settings,
      sma: { ...settings.sma, ...updates },
    });
  };

  const updateEMA = (updates: Partial<IndicatorSettings['ema']>) => {
    onChange({
      ...settings,
      ema: { ...settings.ema, ...updates },
    });
  };

  const updateRSI = (updates: Partial<IndicatorSettings['rsi']>) => {
    onChange({
      ...settings,
      rsi: { ...settings.rsi, ...updates },
    });
  };

  const updateMACD = (updates: Partial<IndicatorSettings['macd']>) => {
    onChange({
      ...settings,
      macd: { ...settings.macd, ...updates },
    });
  };

  const updateBollingerBands = (updates: Partial<IndicatorSettings['bollingerBands']>) => {
    onChange({
      ...settings,
      bollingerBands: { ...settings.bollingerBands, ...updates },
    });
  };

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <BarChart2 className="h-4 w-4" />
          Technical Indicators
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* SMA */}
        <IndicatorToggle
          id="sma-toggle"
          label="SMA"
          description="Simple Moving Average. Average closing price over N periods."
          enabled={settings.sma.enabled}
          onToggle={() => updateSMA({ enabled: !settings.sma.enabled })}
          badge={{ text: 'Trend', colorClass: 'bg-blue-100 text-blue-800' }}
        >
          <div className="pl-6 pt-2 space-y-2">
            <NumberInput
              id="sma-period"
              label="Period"
              value={settings.sma.period}
              onChange={(period) => updateSMA({ period })}
              min={2}
              max={200}
            />
          </div>
        </IndicatorToggle>

        {/* EMA */}
        <IndicatorToggle
          id="ema-toggle"
          label="EMA"
          description="Exponential Moving Average. Weighted average emphasizing recent prices."
          enabled={settings.ema.enabled}
          onToggle={() => updateEMA({ enabled: !settings.ema.enabled })}
          badge={{ text: 'Trend', colorClass: 'bg-purple-100 text-purple-800' }}
        >
          <div className="pl-6 pt-2 space-y-2">
            <NumberInput
              id="ema-period"
              label="Period"
              value={settings.ema.period}
              onChange={(period) => updateEMA({ period })}
              min={2}
              max={200}
            />
          </div>
        </IndicatorToggle>

        {/* Bollinger Bands */}
        <IndicatorToggle
          id="bb-toggle"
          label="Bollinger Bands"
          description="Volatility bands showing upper and lower boundaries."
          enabled={settings.bollingerBands.enabled}
          onToggle={() => updateBollingerBands({ enabled: !settings.bollingerBands.enabled })}
          badge={{ text: 'Volatility', colorClass: 'bg-cyan-100 text-cyan-800' }}
        >
          <div className="pl-6 pt-2 space-y-2">
            <div className="flex items-center gap-4">
              <NumberInput
                id="bb-period"
                label="Period"
                value={settings.bollingerBands.period}
                onChange={(period) => updateBollingerBands({ period })}
                min={2}
                max={200}
              />
              <NumberInput
                id="bb-stddev"
                label="Std Dev"
                value={settings.bollingerBands.stdDev}
                onChange={(stdDev) => updateBollingerBands({ stdDev })}
                min={0.5}
                max={4}
                step={0.5}
              />
            </div>
          </div>
        </IndicatorToggle>

        {/* RSI */}
        <IndicatorToggle
          id="rsi-toggle"
          label="RSI"
          description="Relative Strength Index. Momentum oscillator identifying overbought/oversold conditions."
          enabled={settings.rsi.enabled}
          onToggle={() => updateRSI({ enabled: !settings.rsi.enabled })}
          badge={{ text: 'Momentum', colorClass: 'bg-amber-100 text-amber-800' }}
        >
          <div className="pl-6 pt-2 space-y-2">
            <NumberInput
              id="rsi-period"
              label="Period"
              value={settings.rsi.period}
              onChange={(period) => updateRSI({ period })}
              min={2}
              max={100}
            />
            <p className="text-xs text-muted-foreground">
              RSI above 70 = Overbought, below 30 = Oversold
            </p>
          </div>
        </IndicatorToggle>

        {/* MACD */}
        <IndicatorToggle
          id="macd-toggle"
          label="MACD"
          description="Moving Average Convergence Divergence. Trend-following momentum indicator."
          enabled={settings.macd.enabled}
          onToggle={() => updateMACD({ enabled: !settings.macd.enabled })}
          badge={{ text: 'Trend', colorClass: 'bg-green-100 text-green-800' }}
        >
          <div className="pl-6 pt-2 space-y-2">
            <div className="flex items-center gap-4 flex-wrap">
              <NumberInput
                id="macd-fast"
                label="Fast"
                value={settings.macd.fastPeriod}
                onChange={(fastPeriod) => updateMACD({ fastPeriod })}
                min={2}
                max={100}
              />
              <NumberInput
                id="macd-slow"
                label="Slow"
                value={settings.macd.slowPeriod}
                onChange={(slowPeriod) => updateMACD({ slowPeriod })}
                min={2}
                max={200}
              />
              <NumberInput
                id="macd-signal"
                label="Signal"
                value={settings.macd.signalPeriod}
                onChange={(signalPeriod) => updateMACD({ signalPeriod })}
                min={2}
                max={100}
              />
            </div>
            <p className="text-xs text-muted-foreground">
              MACD crossover used for buy/sell signals
            </p>
          </div>
        </IndicatorToggle>

        {/* Quick presets */}
        <div className="pt-4 border-t">
          <p className="text-xs text-muted-foreground mb-2">Quick Presets</p>
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              className="h-7 text-xs"
              onClick={() => onChange({
                ...DEFAULT_INDICATOR_SETTINGS,
                sma: { enabled: true, period: 20 },
                ema: { enabled: true, period: 50 },
              })}
            >
              SMA + EMA
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="h-7 text-xs"
              onClick={() => onChange({
                ...DEFAULT_INDICATOR_SETTINGS,
                bollingerBands: { enabled: true, period: 20, stdDev: 2 },
              })}
            >
              Bollinger Bands
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="h-7 text-xs"
              onClick={() => onChange({
                ...DEFAULT_INDICATOR_SETTINGS,
                rsi: { enabled: true, period: 14 },
                macd: { enabled: true, fastPeriod: 12, slowPeriod: 26, signalPeriod: 9 },
              })}
            >
              RSI + MACD
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="h-7 text-xs"
              onClick={() => onChange(DEFAULT_INDICATOR_SETTINGS)}
            >
              Clear All
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default IndicatorControls;