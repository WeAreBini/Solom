'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Activity, 
  TrendingUp, 
  BarChart2, 
  Settings,
  ChevronDown,
  ChevronUp,
  Plus,
  Minus,
  CircleDot
} from 'lucide-react';

// Types
export type IndicatorType = 'sma' | 'ema' | 'rsi' | 'macd' | 'bollingerBands';

export interface IndicatorSettings {
  sma: { enabled: boolean; period: number; color: string };
  ema: { enabled: boolean; period: number; color: string };
  rsi: { enabled: boolean; period: number; overbought: number; oversold: number };
  macd: { enabled: boolean; fastPeriod: number; slowPeriod: number; signalPeriod: number };
  bollingerBands: { enabled: boolean; period: number; stdDev: number };
}

export interface IndicatorControlsProps {
  settings: IndicatorSettings;
  onChange: (settings: IndicatorSettings) => void;
}

// Default colors
const DEFAULT_COLORS = {
  sma: '#3b82f6',
  ema: '#8b5cf6',
  rsi: '#f59e0b',
  macd: '#22c55e',
  bollingerBands: '#06b6d4',
};

// Indicator info for display
const INDICATOR_INFO = {
  sma: {
    name: 'Simple Moving Average',
    shortName: 'SMA',
    description: 'Average closing price over N periods',
    icon: TrendingUp,
  },
  ema: {
    name: 'Exponential Moving Average',
    shortName: 'EMA',
    description: 'Weighted average giving more importance to recent prices',
    icon: TrendingUp,
  },
  rsi: {
    name: 'Relative Strength Index',
    shortName: 'RSI',
    description: 'Momentum oscillator measuring speed and change of price movements',
    icon: Activity,
  },
  macd: {
    name: 'MACD',
    shortName: 'MACD',
    description: 'Momentum indicator showing relationship between two EMAs',
    icon: BarChart2,
  },
  bollingerBands: {
    name: 'Bollinger Bands',
    shortName: 'BB',
    description: 'Volatility indicator showing upper and lower price bands',
    icon: CircleDot,
  },
};

interface IndicatorControlProps {
  type: IndicatorType;
  enabled: boolean;
  settings: IndicatorSettings[IndicatorType];
  onChange: (enabled: boolean, settings: IndicatorSettings[IndicatorType]) => void;
  onToggle: () => void;
}

function IndicatorControl({ 
  type, 
  enabled, 
  settings, 
  onChange, 
  onToggle 
}: IndicatorControlProps) {
  const [expanded, setExpanded] = useState(false);
  const info = INDICATOR_INFO[type];
  const Icon = info.icon;

  const renderSettings = () => {
    switch (type) {
      case 'sma':
      case 'ema':
        return (
          <div className="mt-2 space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm text-muted-foreground">Period</label>
              <div className="flex items-center gap-1">
                <Button
                  variant="outline"
                  size="icon"
                  className="h-6 w-6"
                  onClick={() => {
                    const newPeriod = Math.max(2, (settings as { period: number }).period - 1);
                    onChange(enabled, { ...settings, period: newPeriod });
                  }}
                >
                  <Minus className="h-3 w-3" />
                </Button>
                <Input
                  type="number"
                  className="h-6 w-14 text-center text-sm"
                  value={(settings as { period: number }).period}
                  onChange={(e) => {
                    const newPeriod = parseInt(e.target.value, 10);
                    if (!isNaN(newPeriod) && newPeriod >= 2 && newPeriod <= 500) {
                      onChange(enabled, { ...settings, period: newPeriod });
                    }
                  }}
                  min={2}
                  max={500}
                />
                <Button
                  variant="outline"
                  size="icon"
                  className="h-6 w-6"
                  onClick={() => {
                    const newPeriod = Math.min(500, (settings as { period: number }).period + 1);
                    onChange(enabled, { ...settings, period: newPeriod });
                  }}
                >
                  <Plus className="h-3 w-3" />
                </Button>
              </div>
            </div>
          </div>
        );

      case 'rsi':
        return (
          <div className="mt-2 space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm text-muted-foreground">Period</label>
              <div className="flex items-center gap-1">
                <Button
                  variant="outline"
                  size="icon"
                  className="h-6 w-6"
                  onClick={() => {
                    const newPeriod = Math.max(2, (settings as { period: number }).period - 1);
                    onChange(enabled, { ...settings, period: newPeriod });
                  }}
                >
                  <Minus className="h-3 w-3" />
                </Button>
                <Input
                  type="number"
                  className="h-6 w-14 text-center text-sm"
                  value={(settings as { period: number }).period}
                  onChange={(e) => {
                    const newPeriod = parseInt(e.target.value, 10);
                    if (!isNaN(newPeriod) && newPeriod >= 2 && newPeriod <= 500) {
                      onChange(enabled, { ...settings, period: newPeriod });
                    }
                  }}
                  min={2}
                  max={500}
                />
                <Button
                  variant="outline"
                  size="icon"
                  className="h-6 w-6"
                  onClick={() => {
                    const newPeriod = Math.min(500, (settings as { period: number }).period + 1);
                    onChange(enabled, { ...settings, period: newPeriod });
                  }}
                >
                  <Plus className="h-3 w-3" />
                </Button>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <label className="text-sm text-muted-foreground">Overbought</label>
              <Input
                type="number"
                className="h-6 w-16 text-center text-sm"
                value={(settings as { overbought: number }).overbought}
                onChange={(e) => {
                  const value = parseInt(e.target.value, 10);
                  if (!isNaN(value) && value >= 50 && value <= 100) {
                    onChange(enabled, { ...settings, overbought: value });
                  }
                }}
                min={50}
                max={100}
              />
            </div>
            <div className="flex items-center justify-between">
              <label className="text-sm text-muted-foreground">Oversold</label>
              <Input
                type="number"
                className="h-6 w-16 text-center text-sm"
                value={(settings as { oversold: number }).oversold}
                onChange={(e) => {
                  const value = parseInt(e.target.value, 10);
                  if (!isNaN(value) && value >= 0 && value <= 50) {
                    onChange(enabled, { ...settings, oversold: value });
                  }
                }}
                min={0}
                max={50}
              />
            </div>
          </div>
        );

      case 'macd':
        return (
          <div className="mt-2 space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm text-muted-foreground">Fast Period</label>
              <input
                type="number"
                className="h-6 w-16 rounded border px-2 text-center text-sm"
                value={(settings as { fastPeriod: number }).fastPeriod}
                onChange={(e) => {
                  const value = parseInt(e.target.value, 10);
                  if (!isNaN(value) && value >= 2 && value < (settings as { slowPeriod: number }).slowPeriod) {
                    onChange(enabled, { ...settings, fastPeriod: value });
                  }
                }}
                min={2}
                max={(settings as { slowPeriod: number }).slowPeriod - 1}
              />
            </div>
            <div className="flex items-center justify-between">
              <label className="text-sm text-muted-foreground">Slow Period</label>
              <input
                type="number"
                className="h-6 w-16 rounded border px-2 text-center text-sm"
                value={(settings as { slowPeriod: number }).slowPeriod}
                onChange={(e) => {
                  const value = parseInt(e.target.value, 10);
                  if (!isNaN(value) && value > (settings as { fastPeriod: number }).fastPeriod && value <= 500) {
                    onChange(enabled, { ...settings, slowPeriod: value });
                  }
                }}
                min={(settings as { fastPeriod: number }).fastPeriod + 1}
                max={500}
              />
            </div>
            <div className="flex items-center justify-between">
              <label className="text-sm text-muted-foreground">Signal Period</label>
              <input
                type="number"
                className="h-6 w-16 rounded border px-2 text-center text-sm"
                value={(settings as { signalPeriod: number }).signalPeriod}
                onChange={(e) => {
                  const value = parseInt(e.target.value, 10);
                  if (!isNaN(value) && value >= 2 && value <= 500) {
                    onChange(enabled, { ...settings, signalPeriod: value });
                  }
                }}
                min={2}
                max={500}
              />
            </div>
          </div>
        );

      case 'bollingerBands':
        return (
          <div className="mt-2 space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm text-muted-foreground">Period</label>
              <div className="flex items-center gap-1">
                <Button
                  variant="outline"
                  size="icon"
                  className="h-6 w-6"
                  onClick={() => {
                    const newPeriod = Math.max(2, (settings as { period: number }).period - 1);
                    onChange(enabled, { ...settings, period: newPeriod });
                  }}
                >
                  <Minus className="h-3 w-3" />
                </Button>
                <Input
                  type="number"
                  className="h-6 w-14 text-center text-sm"
                  value={(settings as { period: number }).period}
                  onChange={(e) => {
                    const newPeriod = parseInt(e.target.value, 10);
                    if (!isNaN(newPeriod) && newPeriod >= 2 && newPeriod <= 500) {
                      onChange(enabled, { ...settings, period: newPeriod });
                    }
                  }}
                  min={2}
                  max={500}
                />
                <Button
                  variant="outline"
                  size="icon"
                  className="h-6 w-6"
                  onClick={() => {
                    const newPeriod = Math.min(500, (settings as { period: number }).period + 1);
                    onChange(enabled, { ...settings, period: newPeriod });
                  }}
                >
                  <Plus className="h-3 w-3" />
                </Button>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <label className="text-sm text-muted-foreground">Std Dev Multiplier</label>
              <div className="flex items-center gap-1">
                <Button
                  variant="outline"
                  size="icon"
                  className="h-6 w-6"
                  onClick={() => {
                    const newStdDev = Math.max(0.5, (settings as { stdDev: number }).stdDev - 0.5);
                    onChange(enabled, { ...settings, stdDev: newStdDev });
                  }}
                >
                  <Minus className="h-3 w-3" />
                </Button>
                <Input
                  type="number"
                  className="h-6 w-14 text-center text-sm"
                  value={(settings as { stdDev: number }).stdDev}
                  onChange={(e) => {
                    const newStdDev = parseFloat(e.target.value);
                    if (!isNaN(newStdDev) && newStdDev >= 0.5 && newStdDev <= 5) {
                      onChange(enabled, { ...settings, stdDev: newStdDev });
                    }
                  }}
                  min={0.5}
                  max={5}
                  step={0.5}
                />
                <Button
                  variant="outline"
                  size="icon"
                  className="h-6 w-6"
                  onClick={() => {
                    const newStdDev = Math.min(5, (settings as { stdDev: number }).stdDev + 0.5);
                    onChange(enabled, { ...settings, stdDev: newStdDev });
                  }}
                >
                  <Plus className="h-3 w-3" />
                </Button>
              </div>
            </div>
          </div>
        );
    }
  };

  const getPeriodLabel = () => {
    switch (type) {
      case 'macd':
        return `${(settings as { fastPeriod: number }).fastPeriod}/${(settings as { slowPeriod: number }).slowPeriod}/${(settings as { signalPeriod: number }).signalPeriod}`;
      case 'bollingerBands':
        return `${(settings as { period: number }).period},${(settings as { stdDev: number }).stdDev}`;
      default:
        return (settings as { period: number }).period;
    }
  };

  return (
    <div className={`rounded-lg border p-3 transition-colors ${enabled ? 'border-primary/50 bg-primary/5' : 'border-border bg-background'}`}>
      <div className="flex items-center justify-between">
        <button
          className="flex flex-1 items-center gap-2 text-left"
          onClick={onToggle}
        >
          <div className={`flex h-8 w-8 items-center justify-center rounded-full ${enabled ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
            <Icon className="h-4 w-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-medium">{info.name}</span>
              {enabled && (
                <Badge variant="secondary" className="text-xs">
                  {getPeriodLabel()}
                </Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground">{info.description}</p>
          </div>
        </button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setExpanded(!expanded)}
          disabled={!enabled}
        >
          <Settings className="h-4 w-4" />
          {expanded ? <ChevronUp className="ml-1 h-3 w-3" /> : <ChevronDown className="ml-1 h-3 w-3" />}
        </Button>
      </div>
      {expanded && enabled && renderSettings()}
    </div>
  );
}

// Default settings
export const DEFAULT_INDICATOR_SETTINGS: IndicatorSettings = {
  sma: { enabled: false, period: 20, color: DEFAULT_COLORS.sma },
  ema: { enabled: false, period: 20, color: DEFAULT_COLORS.ema },
  rsi: { enabled: false, period: 14, overbought: 70, oversold: 30 },
  macd: { enabled: false, fastPeriod: 12, slowPeriod: 26, signalPeriod: 9 },
  bollingerBands: { enabled: false, period: 20, stdDev: 2 },
};

export function IndicatorControls({ 
  settings, 
  onChange 
}: IndicatorControlsProps) {
  const handleChange = (
    type: IndicatorType,
    enabled: boolean,
    newSettings: IndicatorSettings[IndicatorType]
  ) => {
    onChange({
      ...settings,
      [type]: { ...newSettings, enabled },
    });
  };

  const handleToggle = (type: IndicatorType) => {
    onChange({
      ...settings,
      [type]: {
        ...settings[type],
        enabled: !settings[type].enabled,
      },
    });
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5" />
          Technical Indicators
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {(['sma', 'ema', 'bollingerBands', 'rsi', 'macd'] as const).map((type) => (
          <IndicatorControl
            key={type}
            type={type}
            enabled={settings[type].enabled}
            settings={settings[type]}
            onChange={(enabled, newSettings) => handleChange(type, enabled, newSettings)}
            onToggle={() => handleToggle(type)}
          />
        ))}
      </CardContent>
    </Card>
  );
}

export default IndicatorControls;