import { ReactNode } from "react";
import { Sidebar } from "./Sidebar";
import { TopBar } from "./TopBar";
import { RightPanel } from "./RightPanel";
import { MobileNav } from "./MobileNav";
import { CommandPalette } from "./CommandPalette";

/**
 * @ai-context Global layout shell. Collapsible sidebar + sticky TopBar + RightPanel + mobile bottom nav.
 * Renders the CommandPalette globally so ⌘K works from any page.
 * @ai-related app/layout.tsx, lib/stores/sidebar-store.ts
 */
interface AppShellProps {
  children: ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  return (
    <div className="flex min-h-screen bg-background text-foreground selection:bg-primary/20">
      <Sidebar />
      <div className="flex flex-col flex-1 w-full min-w-0">
        <TopBar />
        <main
          id="main-content"
          className="flex-1 w-full mx-auto overflow-x-hidden p-4 pb-[calc(theme(spacing.24)+env(safe-area-inset-bottom))] animate-fade-in md:p-6 md:pb-6"
        >
          {children}
        </main>
        <MobileNav />
      </div>
      <RightPanel />
      <CommandPalette />
    </div>
  );
}
