import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { CheckCircle2, Clock, Paperclip, Trash2, Upload } from "lucide-react";
import { PublicLayout } from "@/app/layouts/PublicLayout";
import { PageHeader } from "@/components/shell/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { fixtures } from "@/mocks/adapter";
import { api } from "@/lib/api/client";
import type { DisputeEvidence } from "@/types";

type Search = { subject?: string };

export const Route = createFileRoute("/report-scam")({
  validateSearch: (search: Record<string, unknown>): Search => ({
    ...(typeof search["subject"] === "string" ? { subject: search["subject"] } : {}),
  }),
  head: () => ({
    meta: [
      { title: "Report a scam — TrustMart" },
      { name: "description", content: "Report a listing, seller or message to the safety team." },
      { property: "og:title", content: "Report a scam — TrustMart" },
      { property: "og:description", content: "Report a listing, seller or message to the safety team." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Page,
});

type Attachment = { id: string; name: string; type: DisputeEvidence["evidenceType"] };

const evidenceTypes: { value: DisputeEvidence["evidenceType"]; label: string }[] = [
  { value: "PHOTO", label: "Photo" },
  { value: "VIDEO", label: "Video" },
  { value: "RECEIPT", label: "Receipt" },
  { value: "CHAT_SCREENSHOT", label: "Chat screenshot" },
];

function Page() {
  const search = Route.useSearch();
  const queryClient = useQueryClient();
  const [subject, setSubject] = useState(
    search.subject ?? fixtures.scamReportSubjects[0]?.value ?? "",
  );
  const [reason, setReason] = useState<string>(fixtures.scamReportReasons[0].value);
  const [details, setDetails] = useState("");
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [evidenceType, setEvidenceType] =
    useState<DisputeEvidence["evidenceType"]>("CHAT_SCREENSHOT");
  const [evidenceName, setEvidenceName] = useState("");
  const [result, setResult] = useState<"submitted" | "duplicate" | null>(null);

  const submit = useMutation({
    mutationFn: () =>
      api.submitScamReport({
        subject,
        reason,
        details,
        evidenceCount: attachments.length,
      }),
    onSuccess: (response) => {
      setResult(response.duplicate ? "duplicate" : "submitted");
      void queryClient.invalidateQueries({ queryKey: ["buyer"] });
    },
  });

  return (
    <PublicLayout>
      <div className="mx-auto max-w-3xl px-4 py-10 lg:px-8">
        <PageHeader
          title="Report a scam"
          description="Report a listing, seller or message to the safety team. Escrow stays held while we review."
        />

        {result === "duplicate" ? (
          <div className="rounded-lg border border-warning/30 bg-warning/15 p-5">
            <div className="grid grid-cols-[auto_minmax(0,1fr)] gap-3">
              <Clock className="mt-0.5 size-5 shrink-0 text-warning" aria-hidden />
              <div className="min-w-0">
                <h2 className="font-semibold">You already reported this in the last 24 hours</h2>
                <p className="mt-1 text-sm text-foreground/80">
                  Your earlier report is already with the safety team, so we didn't create a duplicate.
                  You can add more evidence once an analyst contacts you.
                </p>
                <Button variant="outline" className="mt-4" onClick={() => setResult(null)}>
                  Report something else
                </Button>
              </div>
            </div>
          </div>
        ) : result === "submitted" ? (
          <div className="rounded-lg border border-success/25 bg-success/10 p-5">
            <div className="grid grid-cols-[auto_minmax(0,1fr)] gap-3">
              <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-success" aria-hidden />
              <div className="min-w-0">
                <h2 className="font-semibold">Report received</h2>
                <p className="mt-1 text-sm text-foreground/80">
                  Our fraud analysts review reports within 24 hours. We'll message you in TrustMart —
                  we never ask for an OTP or a payment outside escrow.
                </p>
                <Button variant="outline" className="mt-4" onClick={() => setResult(null)}>
                  Submit another report
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <form
            className="space-y-5"
            onSubmit={(event) => {
              event.preventDefault();
              submit.mutate();
            }}
          >
            <section className="tm-card space-y-4 p-5">
              <div>
                <Label htmlFor="subject">What are you reporting?</Label>
                <Select value={subject} onValueChange={setSubject}>
                  <SelectTrigger id="subject" className="mt-1.5">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {fixtures.scamReportSubjects.map((item) => (
                      <SelectItem key={item.value} value={item.value}>
                        {item.label}
                      </SelectItem>
                    ))}
                    {search.subject &&
                    !fixtures.scamReportSubjects.some((i) => i.value === search.subject) ? (
                      <SelectItem value={search.subject}>{search.subject}</SelectItem>
                    ) : null}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="reason">Reason</Label>
                <Select value={reason} onValueChange={setReason}>
                  <SelectTrigger id="reason" className="mt-1.5">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {fixtures.scamReportReasons.map((item) => (
                      <SelectItem key={item.value} value={item.value}>
                        {item.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="details">What happened?</Label>
                <Textarea
                  id="details"
                  className="mt-1.5"
                  rows={4}
                  value={details}
                  onChange={(event) => setDetails(event.target.value)}
                  placeholder="Describe what was asked of you, including amounts and payment methods."
                />
              </div>
            </section>

            <section className="tm-card space-y-4 p-5">
              <div>
                <h2 className="font-semibold">Evidence</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Attach photos, videos, receipts or chat screenshots. Uploads are simulated in this
                  demo.
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-[180px_minmax(0,1fr)_auto] sm:items-end">
                <div>
                  <Label htmlFor="evidence-type">Type</Label>
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
                      {evidenceTypes.map((item) => (
                        <SelectItem key={item.value} value={item.value}>
                          {item.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="evidence-name">File name or description</Label>
                  <Input
                    id="evidence-name"
                    className="mt-1.5"
                    value={evidenceName}
                    onChange={(event) => setEvidenceName(event.target.value)}
                    placeholder="e.g. whatsapp-otp-request.png"
                  />
                </div>
                <Button
                  type="button"
                  variant="outline"
                  disabled={!evidenceName.trim()}
                  onClick={() => {
                    setAttachments((prev) => [
                      ...prev,
                      { id: `att_${Date.now()}`, name: evidenceName.trim(), type: evidenceType },
                    ]);
                    setEvidenceName("");
                  }}
                >
                  <Upload className="size-4" aria-hidden /> Attach
                </Button>
              </div>

              {attachments.length > 0 ? (
                <ul className="space-y-2">
                  {attachments.map((item) => (
                    <li
                      key={item.id}
                      className="flex items-center gap-3 rounded-lg border border-border p-3"
                    >
                      <Paperclip className="size-4 shrink-0 text-muted-foreground" aria-hidden />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">{item.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {item.type.replace("_", " ").toLowerCase()}
                        </p>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        aria-label={`Remove ${item.name}`}
                        onClick={() =>
                          setAttachments((prev) => prev.filter((a) => a.id !== item.id))
                        }
                      >
                        <Trash2 className="size-4" aria-hidden />
                      </Button>
                    </li>
                  ))}
                </ul>
              ) : null}
            </section>

            <Button type="submit" disabled={submit.isPending || !details.trim()}>
              Submit report
            </Button>
          </form>
        )}
      </div>
    </PublicLayout>
  );
}
