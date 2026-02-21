import React from "react";
import { StakingPools } from "@/components/earn/StakingPools";

/**
 * @ai-context Earn page — hosts the StakingPools component for yield farming and rewards.
 * @ai-related components/earn/StakingPools.tsx
 */

export const metadata = { title: "Earn" };

export default function EarnPage() {
  return (
    <div className="flex flex-col gap-6 p-4 md:p-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Earn</h1>
        <p className="text-muted-foreground">
          Stake your assets, participate in yield farming, and earn rewards.
        </p>
      </div>

      <div className="flex flex-col gap-6">
        <StakingPools />
      </div>
    </div>
  );
}
