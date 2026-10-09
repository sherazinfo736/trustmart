import { Check, Lock } from "lucide-react";
import { cn } from "@/lib/utils";
import type { OrderStatus } from "@/types";

const steps = [
  { key: "payment", label: "Payment into escrow" },
  { key: "shipped", label: "Shipped" },
  { key: "delivered", label: "Delivered" },
  { key: "released", label: "Released to seller" },
] as const;

const reached = (status: OrderStatus) => {
  switch (status) {
    case "PLACED":
    case "PAYMENT_PENDING":
      return 0;
    case "PAYMENT_CONFIRMED":
    case "DISPUTED":
      return 1;
    case "SHIPPED":
      return 2;
    case "DELIVERED":
      return 3;
    case "COMPLETED":
      return 4;
    default:
      return 1;
  }
};

export function EscrowStateTimeline({
  status,
  blocked,
  className,
}: {
  status: OrderStatus;
  blocked?: boolean;
  className?: string;
}) {
  const done = reached(status);

  return (
    <ol
      className={cn(
        "flex flex-col gap-4 sm:flex-row sm:items-start sm:gap-0",
        className,
      )}
    >
      {steps.map((step, index) => {
        const isDone = index < done;
        const isCurrent = index === done;
        const isBlockedStep = blocked && step.key === "released";
        return (
          <li key={step.key} className="flex flex-1 items-start gap-3 sm:flex-col sm:gap-2">
            <div className="flex items-center gap-0 sm:w-full">
              <span
                className={cn(
                  "grid size-8 shrink-0 place-items-center rounded-full border text-xs font-semibold",
                  isBlockedStep
                    ? "border-destructive/30 bg-destructive/10 text-destructive"
                    : isDone
                      ? "border-transparent bg-success text-success-foreground"
                      : isCurrent
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border bg-muted text-muted-foreground",
                )}
              >
                {isBlockedStep ? (
                  <Lock className="size-4" aria-hidden />
                ) : isDone ? (
                  <Check className="size-4" aria-hidden />
                ) : (
                  index + 1
                )}
              </span>
              {index < steps.length - 1 ? (
                <span
                  className={cn(
                    "mx-2 hidden h-px flex-1 sm:block",
                    isDone ? "bg-success" : "bg-border",
                  )}
                />
              ) : null}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium">{step.label}</p>
              <p className="text-xs text-muted-foreground">
                {isBlockedStep
                  ? "Blocked — seller flagged"
                  : isDone
                    ? "Done"
                    : isCurrent
                      ? "In progress"
                      : "Pending"}
              </p>
            </div>
          </li>
        );
      })}
    </ol>
  );
}