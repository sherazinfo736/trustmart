import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { PublicLayout } from "@/app/layouts/PublicLayout";
import { PageHeader } from "@/components/shell/PageHeader";
import { Button } from "@/components/ui/button";
import { EmptyBlock, ErrorBlock, LoadingBlock } from "@/components/shell/StateBlock";
import { OrderSummaryRow } from "@/components/orders/OrderSummaryRow";
import { useBuyerOrders } from "@/lib/api/queries";
import { fixtures } from "@/mocks/adapter";
import type { OrderStatus } from "@/types";

export const Route = createFileRoute("/orders/")({
  head: () => ({
    meta: [
      { title: "My orders — TrustMart" },
      { name: "description", content: "Escrow state, delivery confirmation and certificates." },
      { property: "og:title", content: "My orders — TrustMart" },
      { property: "og:description", content: "Escrow state, delivery confirmation and certificates." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Page,
});

const filters: { value: OrderStatus | "ALL"; label: string }[] = [
  { value: "ALL", label: "All" },
  { value: "PAYMENT_CONFIRMED", label: "Paid into escrow" },
  { value: "SHIPPED", label: "Shipped" },
  { value: "DELIVERED", label: "Delivered" },
  { value: "COMPLETED", label: "Completed" },
  { value: "DISPUTED", label: "Disputed" },
  { value: "CANCELLED", label: "Cancelled" },
];

function Page() {
  const [status, setStatus] = useState<OrderStatus | "ALL">("ALL");
  const query = useBuyerOrders();
  const orders = (query.data ?? []).filter((o) => status === "ALL" || o.status === status);

  return (
    <PublicLayout>
      <div className="mx-auto max-w-6xl px-4 py-10 lg:px-8">
        <PageHeader
          title="My orders"
          description="Escrow state, delivery confirmation and certificates for every order."
          actions={
            <Button variant="outline" asChild>
              <Link to="/browse">Browse listings</Link>
            </Button>
          }
        />

        <div className="mb-5 flex flex-wrap gap-2" role="group" aria-label="Filter orders by status">
          {filters.map((filter) => (
            <Button
              key={filter.value}
              size="sm"
              variant={status === filter.value ? "default" : "outline"}
              aria-pressed={status === filter.value}
              onClick={() => setStatus(filter.value)}
            >
              {filter.label}
            </Button>
          ))}
        </div>

        {query.isLoading ? (
          <LoadingBlock rows={4} label="Loading orders" />
        ) : query.isError ? (
          <ErrorBlock
            title="We couldn't load your orders"
            description="Your escrow balances are unaffected. Try again in a moment."
            onRetry={() => void query.refetch()}
          />
        ) : orders.length === 0 ? (
          <EmptyBlock
            title="No orders with this status"
            description="Change the filter above to see your other escrow-protected orders."
          />
        ) : (
          <div className="space-y-3">
            {orders.map((order) => (
              <OrderSummaryRow
                key={order.id}
                order={order}
                autoReleased={fixtures.isAutoReleased(order)}
              />
            ))}
          </div>
        )}
      </div>
    </PublicLayout>
  );
}
