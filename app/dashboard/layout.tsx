/**
 * @ai-context Shared App Router layout for all dashboard routes.
 * Keeps the dashboard shell mounted across route transitions so navigation state persists.
 * @ai-related components/dashboard/DashboardShell.tsx
 */

import type { ReactNode } from "react";
import { DashboardShell } from "@/components/dashboard/DashboardShell";

interface DashboardLayoutProps {
  children: ReactNode;
}

export default function DashboardLayout({
  children,
}: Readonly<DashboardLayoutProps>) {
  return <DashboardShell>{children}</DashboardShell>;
}