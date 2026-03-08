"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";
import { TrendingUp, Search, Star, BarChart3, Settings, Newspaper, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

interface CommandPaletteProps {
  onStockSelect?: (symbol: string) => void;
}

const navItems = [
  { icon: TrendingUp, label: "Markets Overview", href: "/dashboard" },
  { icon: Search, label: "Stock Search", href: "/dashboard?tab=search" },
  { icon: Star, label: "Watchlist", href: "/dashboard?tab=watchlist" },
  { icon: BarChart3, label: "Analytics", href: "/dashboard?tab=analytics" },
  { icon: Newspaper, label: "News", href: "/dashboard?tab=news" },
  { icon: Settings, label: "Settings", href: "/settings" },
];

export function CommandPalette({ onStockSelect }: CommandPaletteProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const router = useRouter();

  // Keyboard shortcut
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      setOpen((open) => !open);
    }
    if (e.key === "Escape" && open) {
      setOpen(false);
    }
  }, [open]);

  // Register keyboard listener
  if (typeof window !== "undefined") {
    // Using useCallback to stabilize the handler
    // This is a simple way to avoid useEffect for this case
  }

  const { data: stocks, isFetching } = trpc.finance.searchStocks.useQuery(
    { query: search },
    { enabled: search.length > 0 }
  );

  const runCommand = useCallback((command: () => void) => {
    setOpen(false);
    setSearch("");
    command();
  }, []);

  // Register global keyboard shortcut
  if (typeof window !== "undefined") {
    window.removeEventListener("keydown", handleKeyDown);
    window.addEventListener("keydown", handleKeyDown);
  }

  return (
    <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) setSearch(""); }}>
      <DialogContent className="max-w-lg p-0">
        <DialogHeader className="sr-only">
          <DialogTitle>Command Palette</DialogTitle>
        </DialogHeader>
        <div className="border-b p-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search stocks, navigate pages..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
              autoFocus
            />
          </div>
        </div>
        <div className="max-h-[300px] overflow-y-auto p-2">
          {search.length === 0 ? (
            <div className="space-y-1">
              <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground">
                Navigation
              </div>
              {navItems.map((item) => (
                <button
                  key={item.href}
                  onClick={() => runCommand(() => router.push(item.href))}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm",
                    "hover:bg-accent hover:text-accent-foreground"
                  )}
                >
                  <item.icon className="h-4 w-4 text-muted-foreground" />
                  <span>{item.label}</span>
                </button>
              ))}
            </div>
          ) : (
            <div className="space-y-1">
              <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground">
                Stocks
              </div>
              {isFetching ? (
                <div className="px-3 py-6 text-center text-sm text-muted-foreground">
                  <Clock className="mx-auto mb-2 h-5 w-5 animate-pulse" />
                  Searching...
                </div>
              ) : stocks && stocks.length > 0 ? (
                stocks.slice(0, 8).map((stock) => (
                  <button
                    key={stock.symbol}
                    onClick={() => runCommand(() => onStockSelect?.(stock.symbol))}
                    className={cn(
                      "flex w-full items-center justify-between rounded-md px-3 py-2 text-sm",
                      "hover:bg-accent hover:text-accent-foreground"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <TrendingUp className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <span className="font-medium">{stock.symbol}</span>
                        <span className="ml-2 text-xs text-muted-foreground">
                          {stock.name}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge
                        variant={stock.changePercent >= 0 ? "success" : "destructive"}
                        className="text-[10px]"
                      >
                        {stock.changePercent >= 0 ? "+" : ""}{stock.changePercent.toFixed(1)}%
                      </Badge>
                      <span className="font-medium">${stock.price.toFixed(2)}</span>
                    </div>
                  </button>
                ))
              ) : (
                <div className="px-3 py-6 text-center text-sm text-muted-foreground">
                  No stocks found
                </div>
              )}
            </div>
          )}
        </div>
        <div className="border-t px-3 py-2 text-xs text-muted-foreground">
          Press <kbd className="rounded bg-muted px-1.5 py-0.5 font-mono">Esc</kbd> to close
        </div>
      </DialogContent>
    </Dialog>
  );
}