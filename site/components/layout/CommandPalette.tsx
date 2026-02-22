"use client";

/**
 * @ai-context Command palette (⌘K / Ctrl+K) for quick navigation and stock search.
 * Uses `cmdk` for the filtered command list and Radix Dialog for the overlay.
 * Stock search calls the `searchSymbols` server action from fmp.ts.
 * @ai-related lib/stores/command-store.ts, app/actions/fmp.ts
 * @ai-mutates useCommandStore (open/close)
 */
import { useCallback, useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Command } from "cmdk";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import {
  LayoutDashboard,
  LineChart,
  Star,
  CalendarDays,
  Briefcase,
  Building2,
  Globe,
  MessageSquare,
  Trophy,
  User,
  Search,
  TrendingUp,
} from "lucide-react";
import { useCommandStore } from "@/lib/stores/command-store";
import { searchSymbols } from "@/app/actions/fmp";

/* ── Quick‑nav pages ─────────────────────────────────────── */
const pages = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Market", href: "/market", icon: LineChart },
  { name: "Watchlist", href: "/watchlist", icon: Star },
  { name: "Earnings", href: "/earnings", icon: CalendarDays },
  { name: "13F Holdings", href: "/13f", icon: Briefcase },
  { name: "Insider/Congress", href: "/insider-senate", icon: Building2 },
  { name: "Economic", href: "/economic", icon: Globe },
  { name: "AI Chat", href: "/chat", icon: MessageSquare },
  { name: "Rankings", href: "/ranks", icon: Trophy },
  { name: "Profile", href: "/profile", icon: User },
];

/* ── Search result type ──────────────────────────────────── */
interface SymbolResult {
  symbol: string;
  name: string;
  stockExchange: string;
  exchangeShortName: string;
}

export function CommandPalette() {
  const { open, setOpen } = useCommandStore();
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SymbolResult[]>([]);
  const [isPending, startTransition] = useTransition();
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  /* ── Keyboard shortcut: ⌘K / Ctrl+K ────────────────────── */
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen(!open);
      }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open, setOpen]);

  /* ── Search stocks with debounce ────────────────────────── */
  const handleSearch = useCallback(
    (value: string) => {
      setQuery(value);

      if (debounceRef.current) clearTimeout(debounceRef.current);

      if (value.trim().length < 1) {
        setResults([]);
        return;
      }

      debounceRef.current = setTimeout(() => {
        startTransition(async () => {
          try {
            const data = await searchSymbols(value.trim());
            setResults(data);
          } catch {
            setResults([]);
          }
        });
      }, 300);
    },
    []
  );

  /* ── Navigate & close ───────────────────────────────────── */
  const navigateTo = useCallback(
    (href: string) => {
      setOpen(false);
      setQuery("");
      setResults([]);
      router.push(href);
    },
    [router, setOpen]
  );

  /* ── Reset state on close ───────────────────────────────── */
  const handleOpenChange = useCallback(
    (next: boolean) => {
      setOpen(next);
      if (!next) {
        setQuery("");
        setResults([]);
      }
    },
    [setOpen]
  );

  return (
    <DialogPrimitive.Root open={open} onOpenChange={handleOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <DialogPrimitive.Content
          className="fixed left-[50%] top-[20%] z-50 w-full max-w-lg translate-x-[-50%] rounded-xl border bg-popover shadow-2xl data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=open]:slide-in-from-left-1/2"
          aria-describedby={undefined}
        >
          <DialogPrimitive.Title className="sr-only">
            Command Palette
          </DialogPrimitive.Title>
          <Command
            className="flex h-full w-full flex-col overflow-hidden rounded-xl"
            shouldFilter={false}
          >
            {/* ── Input ───────────────────────────────────── */}
            <div className="flex items-center gap-2 border-b px-3">
              <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
              <Command.Input
                value={query}
                onValueChange={handleSearch}
                placeholder="Search stocks, pages..."
                className="flex h-12 w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
              />
              {isPending && (
                <div className="h-4 w-4 shrink-0 animate-spin rounded-full border-2 border-muted-foreground border-t-transparent" />
              )}
            </div>

            {/* ── Results list ─────────────────────────────── */}
            <Command.List className="max-h-[360px] overflow-y-auto p-2 custom-scrollbar">
              <Command.Empty className="py-6 text-center text-sm text-muted-foreground">
                No results found.
              </Command.Empty>

              {/* Quick Navigation */}
              {query.length === 0 || pages.some((p) =>
                p.name.toLowerCase().includes(query.toLowerCase())
              ) ? (
                <Command.Group
                  heading={
                    <span className="px-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Quick Navigation
                    </span>
                  }
                >
                  {pages
                    .filter(
                      (p) =>
                        query.length === 0 ||
                        p.name.toLowerCase().includes(query.toLowerCase())
                    )
                    .map((page) => (
                      <Command.Item
                        key={page.href}
                        value={page.name}
                        onSelect={() => navigateTo(page.href)}
                        className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm cursor-pointer aria-selected:bg-accent aria-selected:text-accent-foreground"
                      >
                        <page.icon className="h-4 w-4 shrink-0 text-muted-foreground" />
                        {page.name}
                      </Command.Item>
                    ))}
                </Command.Group>
              ) : null}

              {/* Stock search results */}
              {results.length > 0 && (
                <Command.Group
                  heading={
                    <span className="px-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Search Stocks
                    </span>
                  }
                >
                  {results.map((r) => (
                    <Command.Item
                      key={r.symbol}
                      value={`${r.symbol} ${r.name}`}
                      onSelect={() => navigateTo(`/ticker/${r.symbol}`)}
                      className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm cursor-pointer aria-selected:bg-accent aria-selected:text-accent-foreground"
                    >
                      <TrendingUp className="h-4 w-4 shrink-0 text-muted-foreground" />
                      <div className="flex flex-col min-w-0">
                        <span className="font-semibold font-mono">
                          {r.symbol}
                        </span>
                        <span className="text-xs text-muted-foreground truncate">
                          {r.name}
                        </span>
                      </div>
                      <span className="ml-auto text-xs text-muted-foreground shrink-0">
                        {r.exchangeShortName}
                      </span>
                    </Command.Item>
                  ))}
                </Command.Group>
              )}
            </Command.List>

            {/* ── Footer hint ─────────────────────────────── */}
            <div className="flex items-center justify-between border-t px-3 py-2 text-[11px] text-muted-foreground">
              <span>
                <kbd className="rounded border bg-muted px-1 py-0.5 font-mono text-[10px]">
                  ↑↓
                </kbd>{" "}
                navigate
              </span>
              <span>
                <kbd className="rounded border bg-muted px-1 py-0.5 font-mono text-[10px]">
                  ↵
                </kbd>{" "}
                select
              </span>
              <span>
                <kbd className="rounded border bg-muted px-1 py-0.5 font-mono text-[10px]">
                  esc
                </kbd>{" "}
                close
              </span>
            </div>
          </Command>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
