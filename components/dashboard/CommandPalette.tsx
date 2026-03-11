"use client";

/**
 * @ai-context Dashboard command palette for stock lookup and route switching.
 * Keeps quick navigation aligned with the current dashboard IA instead of stale tab routes.
 * @ai-related components/dashboard/navigation.ts, app/dashboard/page.tsx
 */

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useStockSearch } from "@/lib/solom-api";
import { Search, Home, Loader2, TrendingUp } from "lucide-react";
import { dashboardNavItems } from "@/components/dashboard/navigation";

interface CommandPaletteProps {
  onStockSelect?: (symbol: string) => void;
}

const navItems = [
  { icon: Home, label: "Home", href: "/" },
  ...dashboardNavItems.map((item) => ({
    icon: item.icon,
    label: item.title,
    href: item.href,
  })),
];

export function CommandPalette({ onStockSelect }: CommandPaletteProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const router = useRouter();

  // Keyboard shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
      if (e.key === "Escape" && open) {
        setOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open]);

  // Stock search
  const { data: searchResults, isLoading } = useStockSearch(search, search.length >= 1);

  const handleSelect = (item: { type: string; value: string }) => {
    if (item.type === "stock") {
      if (onStockSelect) {
        onStockSelect(item.value);
      } else {
        router.push(`/dashboard/stocks?symbol=${encodeURIComponent(item.value)}`);
      }
    } else {
      router.push(item.value);
    }
    setOpen(false);
    setSearch("");
  };

  // Filter nav items based on search
  const filteredNavItems = search
    ? navItems.filter((item) =>
        item.label.toLowerCase().includes(search.toLowerCase())
      )
    : navItems;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-lg p-0">
        <DialogHeader className="sr-only">
          <DialogTitle>Command Palette</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col">
          {/* Search Input */}
          <div className="border-b p-4">
            <label htmlFor="dashboard-command-palette-search" className="sr-only">
              Search stocks or dashboard destinations
            </label>
            <div className="flex items-center gap-2">
              <Search className="h-5 w-5 text-muted-foreground" />
              <Input
                id="dashboard-command-palette-search"
                placeholder="Search stocks or navigate..."
                aria-label="Search stocks or dashboard destinations"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                autoFocus
              />
              <kbd className="pointer-events-none hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex">
                ESC
              </kbd>
            </div>
          </div>

          {/* Results */}
          <div className="max-h-[400px] overflow-y-auto p-2">
            {/* Stock Results */}
            {search.length >= 1 && (
              <div className="mb-2">
                <div className="px-2 py-1 text-xs font-medium text-muted-foreground">
                  Stocks
                </div>
                {isLoading ? (
                  <div className="flex items-center justify-center py-4">
                    <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                  </div>
                ) : searchResults && searchResults.length > 0 ? (
                  searchResults.slice(0, 5).map((stock) => (
                    <button
                      key={stock.symbol}
                      className="flex w-full items-center gap-3 rounded-md px-2 py-2 text-left hover:bg-accent"
                      onClick={() =>
                        handleSelect({ type: "stock", value: stock.symbol })
                      }
                    >
                      <TrendingUp className="h-4 w-4 text-muted-foreground" />
                      <div className="flex-1">
                        <div className="font-medium">{stock.symbol}</div>
                        <div className="text-xs text-muted-foreground">
                          {stock.name}
                        </div>
                      </div>
                      <Badge variant="secondary" className="text-xs">
                        Stock
                      </Badge>
                    </button>
                  ))
                ) : (
                  <div className="px-2 py-4 text-center text-sm text-muted-foreground">
                    No stocks found
                  </div>
                )}
              </div>
            )}

            {/* Navigation Items */}
            <div>
              <div className="px-2 py-1 text-xs font-medium text-muted-foreground">
                Navigation
              </div>
              {filteredNavItems.map((item) => (
                <button
                  key={item.label}
                  className="flex w-full items-center gap-3 rounded-md px-2 py-2 text-left hover:bg-accent"
                  onClick={() =>
                    handleSelect({ type: "nav", value: item.href })
                  }
                >
                  <item.icon className="h-4 w-4 text-muted-foreground" />
                  <span>{item.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Footer */}
          <div className="border-t px-4 py-2 text-xs text-muted-foreground">
            <div className="flex items-center justify-between">
              <span>
                <kbd className="rounded border bg-muted px-1 font-mono text-[10px]">
                  ⌘
                </kbd>{" "}
                +{" "}
                <kbd className="rounded border bg-muted px-1 font-mono text-[10px]">
                  K
                </kbd>{" "}
                to toggle
              </span>
              <span>
                <kbd className="rounded border bg-muted px-1 font-mono text-[10px]">
                  ESC
                </kbd>{" "}
                to close
              </span>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}