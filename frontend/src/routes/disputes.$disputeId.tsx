import { useEffect, useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Check, Clock, FileText, MessageSquare, Paperclip } from "lucide-react";
import { toast } from "sonner";
import { PublicLayout } from "@/app/layouts/PublicLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ErrorBlock, LoadingBlock } from "@/components/shell/StateBlock";
import { StatusBadge } from "@/components/shell/StatusBadge";
import { disputeStatusTone } from "@/lib/status";
import { formatPKR } from "@/lib/currency";
import { api } from "@/lib/api/client";
import { disputeKeys, useDispute } from "@/lib/api/queries";
import { cn } from "@/lib/utils";
import type { DisputeEvidence, DisputeStatus } from "@/types";

export const Route = createFileRoute("/disputes/$disputeId")({
  head: () => ({
    meta: [
      { title: "Dispute view — TrustMart" },
      {
        name: "description",
        content: "Submit evidence and follow the review timeline for your escrow dispute.",
      },
      { property: "og:title", content: "Dispute view — TrustMart" },
      {
        property: "og:description",
        content: "Submit evidence and follow the review timeline for your escrow dispute.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Page,
});

const timelineSteps: { status: DisputeStatus; label: string; blurb: string }[] = [
  { status: "OPENED", label: "Opened", blurb: "Dispute raised, escrow held" },
  { status: "EVIDENCE_COLLECTION", label: "Evidence collection", blurb: "Both sides upload proof" },
  { status: "UNDER_REVIEW", label: "Under review", blurb: "Safety team assessing" },
  { status: "RESOLVED", label: "Resolved", blurb: "Decision applied to escrow" },
];

const stepIndex = (status: DisputeStatus) => {
  if (status === "OPENED") return 0;
  if (status === "EVIDENCE_COLLECTION") return 1;
  if (status === "UNDER_REVIEW" || status === "ESCALATED") return 2;
  return 3;
};

const evidenceIcon = (type: DisputeEvidence["evidenceType"]) =>
  type === "CHAT_SCREENSHOT" ? MessageSquare : type === "RECEIPT" ? FileText : Paperclip;

function useCountdown(iso?: string) {
  const target = iso ? new Date(iso).getTime() : null;
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);
  if (!target) return { expired: false, label: "" };
  const left = target - now;
  if (left <= 0) return { expired: true, label: "Closed" };
  const minutes = Math.floor(left / 60000);
  const seconds = Math.floor((left % 60000) / 1000);
  return { expired: false, label: `${minutes}m ${String(seconds).padStart(2, "0")}s` };
}

function Page() {
  const { disputeId } = Route.useParams();
  const query = useDispute(disputeId);
  const queryClient = useQueryClient();
  const data = query.data;

  const [evidenceType, setEvidenceType] =
    useState<DisputeEvidence["evidenceType"]>("PHOTO");
  const [label, setLabel] = useState("");
  const window = useCountdown(data?.dispute.evidenceWindowClosesAt);

  const add = useMutation({
    mutationFn: (input: {
      evidenceType: DisputeEvidence["evidenceType"];
      label: string;
      sourceThreadId?: string;
      sourceMessageId?: string;
    }) => api.addDisputeEvidence({ disputeId, ...input }),
    onSuccess: () => {
      setLabel("");
      toast.success("Evidence added to the dispute file.");
      void queryClient.invalidateQueries({ queryKey: disputeKeys.detail(disputeId) });
    },
  });

  const current = useMemo(() => (data ? stepIndex(data.dispute.status) : 0), [data]);

  return (
    <PublicLayout>
      <div className="mx-auto max-w-4xl px-4 py-10 lg:px-8">
        <Button variant="ghost" size="sm" className="mb-4 -ml-2" asChild>
          <Link to="/orders">
            <ArrowLeft className="size-4" aria-hidden /> All orders
          </Link>
        </Button>

        {query.isLoading ? (
          <LoadingBlock rows={4} label="Loading dispute" />
        ) : query.isError || !data ? (
          <ErrorBlock
            title="Dispute not found"
            description="This dispute isn't available on your account."
            onRetry={() => void query.refetch()}
          />
        ) : (
          <div className="space-y-6">
            <header className="tm-card p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-xs font-medium text-muted-foreground">
                    Dispute {data.dispute.id.toUpperCase()} · Order {data.dispute.orderNumber}
                  </p>
                  <h1 className="text-xl font-bold tracking-tight">
                    {data.order?.listingTitle ?? "Order under dispute"}
                  </h1>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Buyer {data.buyer.fullName} · Seller {data.order?.sellerName} ·{" "}
                    {formatPKR(data.dispute.amountPKR)} held in escrow
                  </p>
                </div>
                <StatusBadge
                  value={data.dispute.status}
                  tone={disputeStatusTone[data.dispute.status]}
                />
              </div>
              {data.order ? (
                <Button variant="outline" size="sm" className="mt-4" asChild>
                  <Link to="/orders/$orderId" params={{ orderId: data.order.id }}>
                    View order detail
                  </Link>
                </Button>
              ) : null}
            </header>

            <section className="tm-card p-5">
              <h2 className="text-lg font-semibold">Dispute timeline</h2>
              <ol className="mt-5 flex flex-col gap-4 sm:flex-row sm:gap-0">
                {timelineSteps.map((step, index) => (
                  <li key={step.status} className="flex flex-1 items-start gap-3 sm:flex-col sm:gap-2">
                    <div className="flex items-center sm:w-full">
                      <span
                        className={cn(
                          "grid size-8 shrink-0 place-items-center rounded-full border text-xs font-semibold",
                          index < current
                            ? "border-transparent bg-success text-success-foreground"
                            : index === current
                              ? "border-primary bg-primary/10 text-primary"
                              : "border-border bg-muted text-muted-foreground",
                        )}
                      >
                        {index < current ? <Check className="size-4" aria-hidden /> : index + 1}
                      </span>
                      {index < timelineSteps.length - 1 ? (
                        <span
                          className={cn(
                            "mx-2 hidden h-px flex-1 sm:block",
                            index < current ? "bg-success" : "bg-border",
                          )}
                        />
                      ) : null}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium">{step.label}</p>
                      <p className="text-xs text-muted-foreground">{step.blurb}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </section>

            <section className="tm-card p-5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h2 className="text-lg font-semibold">Evidence file</h2>
                <span
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold",
                    window.expired
                      ? "border-border bg-muted text-muted-foreground"
                      : "border-warning/30 bg-warning/15 text-warning",
                  )}
                >
                  <Clock className="size-3.5" aria-hidden />
                  {window.expired
                    ? "72h evidence window closed"
                    : `Evidence window closes in ${window.label}`}
                </span>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                Demo note: the real cooling-off window is 72 hours. It is sped up here so you can see
                the expired state during review.
              </p>

              <ul className="mt-4 space-y-2">
                {data.dispute.evidence.map((item) => {
                  const Icon = evidenceIcon(item.evidenceType);
                  return (
                    <li
                      key={item.id}
                      className="grid grid-cols-[auto_minmax(0,1fr)] gap-3 rounded-lg border border-border p-3"
                    >
                      <Icon className="mt-0.5 size-4 shrink-0 text-muted-foreground" aria-hidden />
                      <div className="min-w-0">
                        <p className="text-sm font-medium">
                          {item.label ?? item.evidenceType.replace("_", " ")}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {item.evidenceType.replace("_", " ").toLowerCase()} ·{" "}
                          {item.submittedBy === data.buyer.id ? "Submitted by you" : "Submitted by seller"}
                        </p>
                        {item.sourceThreadId ? (
                          <Button variant="link" size="sm" className="mt-1 h-auto p-0" asChild>
                            <Link
                              to="/chat"
                              search={{
                                thread: item.sourceThreadId,
                                ...(item.sourceMessageId ? { message: item.sourceMessageId } : {}),
                              }}
                            >
                              Open the flagged chat message
                            </Link>
                          </Button>
                        ) : null}
                      </div>
                    </li>
                  );
                })}
              </ul>

              {window.expired ? (
                <div className="mt-4 rounded-lg border border-border bg-muted/50 p-4 text-sm text-muted-foreground">
                  The evidence window has closed. Everything above has been sent to the safety team —
                  no further uploads are needed from you.
                </div>
              ) : (
                <form
                  className="mt-4 grid gap-3 border-t border-border pt-4 sm:grid-cols-[200px_minmax(0,1fr)_auto] sm:items-end"
                  onSubmit={(event) => {
                    event.preventDefault();
                    if (!label.trim()) return;
                    add.mutate({ evidenceType, label: label.trim() });
                  }}
                >
                  <div>
                    <Label htmlFor="evidence-type">Evidence type</Label>
                    <Select
                      value={evidenceType}
                      onValueChange={(value) =>
                        setEvidenceType(value as DisputeEvidence["evidenceType"])
                      }
                    >
                      <SelectTrigger id="evidence-type" className="mt-1.5">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="PHOTO">Photo</SelectItem>
                        <SelectItem value="VIDEO">Video</SelectItem>
                        <SelectItem value="RECEIPT">Receipt</SelectItem>
                        <SelectItem value="CHAT_SCREENSHOT">Chat screenshot</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="evidence-label">Describe what this shows</Label>
                    <Input
                      id="evidence-label"
                      className="mt-1.5"
                      value={label}
                      onChange={(event) => setLabel(event.target.value)}
                      placeholder="e.g. Photo of the engine number on delivery"
                    />
                  </div>
                  <Button type="submit" disabled={add.isPending || !label.trim()}>
                    Add evidence
                  </Button>
                </form>
              )}
            </section>
          </div>
        )}
      </div>
    </PublicLayout>
  );
}