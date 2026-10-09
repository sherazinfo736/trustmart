import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, MessageSquare, ShieldCheck } from "lucide-react";
import { PublicLayout } from "@/app/layouts/PublicLayout";
import { Button } from "@/components/ui/button";
import { ErrorBlock, LoadingBlock } from "@/components/shell/StateBlock";
import { StatusBadge } from "@/components/shell/StatusBadge";
import { ConfirmDialog } from "@/components/shell/ConfirmDialog";
import { OrderSummaryRow } from "@/components/orders/OrderSummaryRow";
import { EscrowStateTimeline } from "@/components/trust/EscrowStateTimeline";
import { escrowStateTone } from "@/lib/status";
import { formatPKR } from "@/lib/currency";
import { useBuyerOrder } from "@/lib/api/queries";
import { api } from "@/lib/api/client";
import { orderKeys } from "@/lib/api/queries";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export const Route = createFileRoute("/orders/$orderId")({
  head: () => ({
    meta: [
      { title: "Order tracking — TrustMart" },
      {
        name: "description",
        content: "Track escrow state, delivery and payment release for your TrustMart order.",
      },
      { property: "og:title", content: "Order tracking — TrustMart" },
      {
        property: "og:description",
        content: "Track escrow state, delivery and payment release for your TrustMart order.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Page,
});

function Page() {
  const { orderId } = Route.useParams();
  const query = useBuyerOrder(orderId);
  const queryClient = useQueryClient();

  const confirm = useMutation({
    mutationFn: () => api.confirmReceipt(orderId),
    onSuccess: () => {
      toast.success("Receipt confirmed — payment released to the seller.");
      void queryClient.invalidateQueries({ queryKey: orderKeys.detail(orderId) });
      void queryClient.invalidateQueries({ queryKey: orderKeys.list });
    },
  });

  const data = query.data;

  return (
    <PublicLayout>
      <div className="mx-auto max-w-4xl px-4 py-10 lg:px-8">
        <Button variant="ghost" size="sm" className="mb-4 -ml-2" asChild>
          <Link to="/orders">
            <ArrowLeft className="size-4" aria-hidden /> All orders
          </Link>
        </Button>

        {query.isLoading ? (
          <LoadingBlock rows={4} label="Loading order" />
        ) : query.isError || !data ? (
          <ErrorBlock
            title="Order not found"
            description="This order isn't available. Your escrow balance is unaffected."
            onRetry={() => void query.refetch()}
          />
        ) : (
          <div className="space-y-6">
            <OrderSummaryRow order={data.order} autoReleased={data.autoReleased} asHeader />

            <section className="tm-card p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h2 className="text-lg font-semibold">Escrow status</h2>
                {data.escrow ? (
                  <StatusBadge
                    value={data.escrow.state}
                    tone={escrowStateTone[data.escrow.state]}
                  />
                ) : null}
              </div>
              <EscrowStateTimeline
                className="mt-5"
                status={data.order.status}
                blocked={!!data.releaseBlock}
              />

              {data.escrow ? (
                <dl className="mt-5 grid gap-3 border-t border-border pt-4 text-sm sm:grid-cols-3">
                  <div>
                    <dt className="text-muted-foreground">Held in escrow</dt>
                    <dd className="font-semibold tabular-nums">
                      {formatPKR(data.escrow.heldAmountPKR)}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">TrustMart fees</dt>
                    <dd className="font-semibold tabular-nums">
                      {formatPKR(data.escrow.feeAmountPKR)}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">Auto-release</dt>
                    <dd className="font-semibold">
                      {data.autoReleased
                        ? "Released automatically after the 5-day window"
                        : data.order.autoReleaseAt
                          ? new Date(data.order.autoReleaseAt).toLocaleDateString("en-PK", {
                              day: "numeric",
                              month: "short",
                            })
                          : "—"}
                    </dd>
                  </div>
                </dl>
              ) : null}
            </section>

            {data.releaseBlock ? (
              <section className="rounded-lg border border-info/25 bg-info/10 p-5">
                <div className="grid grid-cols-[auto_minmax(0,1fr)] gap-3">
                  <ShieldCheck className="mt-0.5 size-5 shrink-0 text-info" aria-hidden />
                  <div className="min-w-0">
                    <h2 className="font-semibold">
                      Release is paused while we review {data.releaseBlock.sellerName}
                    </h2>
                    <p className="mt-1 text-sm text-foreground/80">{data.releaseBlock.reason}</p>
                  </div>
                </div>
              </section>
            ) : null}

            {data.order.status === "DISPUTED" && data.dispute ? (
              <section className="tm-card p-5">
                <h2 className="text-lg font-semibold">This order is in dispute</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Dispute {data.dispute.id.toUpperCase()} is open on {data.order.orderNumber}. Escrow
                  stays held until the safety team decides.
                </p>
                <Button className="mt-4" asChild>
                  <Link to="/disputes/$disputeId" params={{ disputeId: data.dispute.id }}>
                    Open dispute view
                  </Link>
                </Button>
              </section>
            ) : null}

            <section className="tm-card p-5">
              <h2 className="text-lg font-semibold">Actions</h2>
              <div className="mt-4 flex flex-wrap gap-2">
                {data.order.status === "DELIVERED" && !data.releaseBlock && !data.autoReleased ? (
                  <ConfirmDialog
                    trigger={<Button disabled={confirm.isPending}>Confirm receipt</Button>}
                    title="Confirm you received this item?"
                    description="Only confirm after checking the item matches the verified details."
                    impact={[
                      "This releases payment to the seller immediately.",
                      `${formatPKR(data.escrow?.heldAmountPKR ?? data.order.totalAmountPKR)} leaves escrow and cannot be recalled.`,
                      "You will no longer be able to open a dispute on this order.",
                    ]}
                    confirmLabel="Release payment"
                    onConfirm={() => confirm.mutate()}
                  />
                ) : null}
                {data.thread ? (
                  <Button variant="outline" asChild>
                    <Link to="/chat" search={{ thread: data.thread.id }}>
                      <MessageSquare className="size-4" aria-hidden /> Open chat with seller
                    </Link>
                  </Button>
                ) : null}
                {data.order.status !== "DISPUTED" && data.order.status !== "CANCELLED" ? (
                  <Button variant="outline" asChild>
                    <Link to="/report-scam" search={{ subject: data.order.orderNumber }}>
                      Report a problem
                    </Link>
                  </Button>
                ) : null}
                {data.listing ? (
                  <Button variant="ghost" asChild>
                    <Link to="/listing/$listingId" params={{ listingId: data.listing.id }}>
                      View listing
                    </Link>
                  </Button>
                ) : null}
              </div>
            </section>
          </div>
        )}
      </div>
    </PublicLayout>
  );
}