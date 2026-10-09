import { Link } from "@tanstack/react-router";
import { StatusBadge } from "@/components/shell/StatusBadge";
import { orderStatusTone } from "@/lib/status";
import { formatPKR } from "@/lib/currency";
import type { Order } from "@/types";

const dateLabel = (iso: string) =>
  new Date(iso).toLocaleDateString("en-PK", { day: "numeric", month: "short", year: "numeric" });

/**
 * Single source of truth for how an order is summarised — used by the My Orders
 * list and by the Order Detail header so both can never drift.
 */
export function OrderSummaryRow({
  order,
  autoReleased,
  asHeader,
}: {
  order: Order;
  autoReleased?: boolean;
  asHeader?: boolean;
}) {
  const body = (
    <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
      <div className="min-w-0">
        <p className="text-xs font-medium text-muted-foreground">{order.orderNumber}</p>
        <p className="truncate font-semibold">{order.listingTitle}</p>
        <p className="mt-0.5 text-xs text-muted-foreground">
          {order.sellerName} · Ordered {dateLabel(order.createdAt)}
        </p>
      </div>
      <div className="flex flex-wrap items-center gap-2 sm:justify-end">
        <span className="text-sm font-semibold tabular-nums">
          {formatPKR(order.totalAmountPKR)}
        </span>
        {autoReleased ? (
          <StatusBadge value="AUTO_RELEASED" tone="success" />
        ) : (
          <StatusBadge value={order.status} tone={orderStatusTone[order.status]} />
        )}
      </div>
    </div>
  );

  if (asHeader) return <div className="tm-card p-4">{body}</div>;

  return (
    <Link
      to="/orders/$orderId"
      params={{ orderId: order.id }}
      className="tm-card block p-4 transition-colors hover:border-primary/40 hover:bg-muted/40"
    >
      {body}
    </Link>
  );
}