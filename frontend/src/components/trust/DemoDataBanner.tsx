import { Info } from "lucide-react";
import { config } from "@/lib/api/client";

export function DemoDataBanner() {
  if (!config.useMock) return null;
  return (
    <div className="border-b border-warning/30 bg-warning/10 px-4 py-1.5 text-center text-xs text-warning">
      <span className="inline-flex items-center gap-1.5">
        <Info className="size-3.5" aria-hidden />
        <strong className="font-semibold">Demo data</strong>
        <span className="text-foreground/70">
          — verifications, risk scores, escrow and payouts are simulated for UI review only.
        </span>
      </span>
    </div>
  );
}