import { useState } from "react";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { ScamPatternType } from "@/types";

const explanations: Record<ScamPatternType, string> = {
  ADVANCE_PAYMENT:
    "This message asks you to send money outside TrustMart. Advance payments are the most common scam on marketplaces — money sent directly cannot be recovered.",
  OTP_REQUEST:
    "This message asks for a one-time code (OTP). No real seller, courier, or TrustMart staff member ever needs your OTP. Sharing it can empty your wallet.",
  PHISHING_LINK:
    "This message contains a link that may imitate a payment page. Only pay through the TrustMart checkout.",
  FAKE_COURIER:
    "This message references a courier or delivery fee outside TrustMart. Escrow already covers delivery confirmation.",
};

export function ScamWarningBanner({ pattern }: { pattern: ScamPatternType }) {
  const [acknowledged, setAcknowledged] = useState(false);

  return (
    <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-4">
      <div className="grid grid-cols-[auto_minmax(0,1fr)] gap-3">
        <AlertTriangle className="mt-0.5 size-5 shrink-0 text-destructive" aria-hidden />
        <div className="min-w-0">
          <p className="text-sm font-semibold text-destructive">
            Scam pattern detected in this conversation
          </p>
          <p className="mt-1 text-sm text-foreground/80">{explanations[pattern]}</p>
          {acknowledged ? (
            <p className="mt-3 text-xs text-muted-foreground">
              Warning acknowledged. Chat stays monitored for scam patterns.
            </p>
          ) : (
            <div className="mt-3 flex flex-wrap gap-2">
              <Button size="sm" variant="destructive" onClick={() => setAcknowledged(true)}>
                I understand
              </Button>
              <Button size="sm" variant="outline">
                Report this message
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}