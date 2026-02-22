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
          className="flex-1 p-4 md:p-6 pb-20 md:pb-6 overflow-x-hidden animate-fade-in w-full mx-auto"
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
