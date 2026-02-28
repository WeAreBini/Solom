"use client";

import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Wifi, WifiOff, RefreshCw, AlertCircle } from "lucide-react";
import { ConnectionStatus } from "@/lib/types/websocket";

export interface ConnectionStatusIndicatorProps {
  status: ConnectionStatus;
  showLabel?: boolean;
  lastConnected?: Date | null;
  error?: Error | null;
  className?: string;
  size?: "sm" | "md" | "lg";
}

const STATUS_CONFIG: Record<ConnectionStatus, {
  icon: typeof Wifi;
  label: string;
  color: string;
  animate?: boolean;
  description: string;
}> = {
  connected: {
    icon: Wifi,
    label: "Connected",
    color: "text-emerald-500",
    description: "Real-time updates active",
  },
  connecting: {
    icon: RefreshCw,
    label: "Connecting",
    color: "text-blue-500",
    animate: true,
    description: "Establishing connection...",
  },
  disconnected: {
    icon: WifiOff,
    label: "Disconnected",
    color: "text-muted-foreground",
    description: "Using polling fallback",
  },
  reconnecting: {
    icon: RefreshCw,
    label: "Reconnecting",
    color: "text-orange-500",
    animate: true,
    description: "Attempting to reconnect...",
  },
  error: {
    icon: AlertCircle,
    label: "Error",
    color: "text-red-500",
    description: "Connection error occurred",
  },
};

const SIZE_CONFIG: Record<string, { icon: string; badge: string }> = {
  sm: { icon: "h-3 w-3", badge: "text-xs px-2 py-0.5" },
  md: { icon: "h-4 w-4", badge: "text-sm px-2.5 py-0.5" },
  lg: { icon: "h-5 w-5", badge: "text-base px-3 py-1" },
};

export function ConnectionStatusIndicator({
  status,
  showLabel = true,
  lastConnected,
  error,
  className = "",
  size = "md",
}: ConnectionStatusIndicatorProps) {
  const config = STATUS_CONFIG[status];
  const sizeConfig = SIZE_CONFIG[size];
  const Icon = config.icon;

  const formatLastConnected = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSecs = Math.floor(diffMs / 1000);
    const diffMins = Math.floor(diffSecs / 60);
    const diffHours = Math.floor(diffMins / 60);

    if (diffSecs < 60) return "just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return date.toLocaleTimeString();
  };

  const tooltipContent = (
    <div className="space-y-1.5">
      <p className="font-medium">{config.label}</p>
      <p className="text-xs text-muted-foreground">{config.description}</p>
      {lastConnected && (status === "connected" || status === "disconnected") && (
        <p className="text-xs text-muted-foreground">
          Last connected: {formatLastConnected(lastConnected)}
        </p>
      )}
      {error && (
        <p className="text-xs text-red-500">{error.message}</p>
      )}
    </div>
  );

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge
            variant={status === "connected" ? "success" : status === "error" ? "destructive" : "secondary"}
            className={`${sizeConfig.badge} inline-flex items-center gap-1.5 cursor-default ${className}`}
          >
            <Icon
              className={`${sizeConfig.icon} ${config.color} ${config.animate ? "animate-spin" : ""}`}
            />
            {showLabel && <span>{config.label}</span>}
          </Badge>
        </TooltipTrigger>
        <TooltipContent>
          {tooltipContent}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

// Compact version for inline use
export function ConnectionStatusBadge({ status }: { status: ConnectionStatus }) {
  const config = STATUS_CONFIG[status];
  const Icon = config.icon;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <span className={`inline-flex items-center gap-1 ${config.color}`}>
            <Icon className={`h-3.5 w-3.5 ${config.animate ? "animate-spin" : ""}`} />
          </span>
        </TooltipTrigger>
        <TooltipContent>
          <p className="font-medium">{config.label}</p>
          <p className="text-xs text-muted-foreground">{config.description}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

// Connection status hook for use in components
export { useConnectionStatus } from "@/lib/context/WebSocketContext";