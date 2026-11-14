"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import { Navbar } from "@/components/navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  ShieldCheck,
  ArrowLeft,
  Loader2,
  AlertTriangle,
  Sparkles,
  Bot,
  Scale,
  ShieldAlert,
  FileText,
  MessageSquare,
  XCircle,
  CheckCircle2,
  ChevronRight,
} from "lucide-react";
import { toast } from "sonner";
import { formatRupees } from "@/lib/format";
import { getStoredDeal, updateStoredDeal } from "@/lib/storage";
import { useAuth } from "@/lib/auth-context";
import type { Deal, TimelineEvent, AiVerdict } from "@/lib/types";
import { cn } from "@/lib/utils";

interface DisputePageContentProps {
  deal: Deal;
}

function DisputePageContent({ deal }: DisputePageContentProps) {
  const router = useRouter();
  const { user } = useAuth();
  const userName = user?.name || "Demo Buyer";

  const [disputeReason, setDisputeReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [aiReviewing, setAiReviewing] = useState(false);
  const [aiVerdict, setAiVerdict] = useState<AiVerdict | null>(null);
  const [showVerdict, setShowVerdict] = useState(false);

  const isBuyer = deal.buyerName === userName;
  const canRaiseDispute = deal.status === "DELIVERED" && isBuyer;

  const generateMockVerdict = (reason: string): AiVerdict => {
    // Generate a realistic verdict based on the dispute
    const splitRatios = [0.3, 0.4, 0.5, 0.6, 0.7];
    const sellerRatio = splitRatios[Math.floor(Math.random() * splitRatios.length)];
    const sellerAmt = Math.round(deal.amount * sellerRatio);
    const buyerAmt = deal.amount - sellerAmt;

    const verdictTypes: AiVerdict["verdict"][] = ["SPLIT", "SPLIT", "SPLIT", "RELEASE", "REFUND"];
    const verdict = verdictTypes[Math.floor(Math.random() * verdictTypes.length)];

    let finalSellerAmt = sellerAmt;
    let finalBuyerAmt = buyerAmt;
    let reasoning = "";

    if (verdict === "RELEASE") {
      finalSellerAmt = deal.amount;
      finalBuyerAmt = 0;
      reasoning = `Panchayat AI evaluated the agreed specifications against the submitted deliverables and client claim: "${reason}". The deliverables appear to substantially meet the contracted scope. Recommending full release of ₹${deal.amount.toLocaleString("en-IN")} to the freelancer.`;
    } else if (verdict === "REFUND") {
      finalSellerAmt = 0;
      finalBuyerAmt = deal.amount;
      reasoning = `Panchayat AI evaluated the agreed specifications against the submitted deliverables and client claim: "${reason}". The deliverables show significant deviation from the agreed scope with missing critical components. Recommending full refund of ₹${deal.amount.toLocaleString("en-IN")} to the client.`;
    } else {
      reasoning = `Panchayat AI evaluated the agreed specifications against the submitted deliverables and client claim: "${reason}". The seller demonstrated partial milestone completion (estimated at ${Math.round(sellerRatio * 100)}%). Recommending an equitable pro-rata settlement: ₹${finalSellerAmt.toLocaleString("en-IN")} released to freelancer for work delivered, and ₹${finalBuyerAmt.toLocaleString("en-IN")} refunded to client.`;
    }

    return {
      verdict,
      sellerAmount: finalSellerAmt,
      buyerAmount: finalBuyerAmt,
      reasoning,
    };
  };

  const handleSubmitDispute = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!disputeReason.trim()) {
      toast.error("Please explain the specific contract violation");
      return;
    }

    setIsSubmitting(true);
    setAiReviewing(true);

    try {
      // Simulate Panchayat AI analysis delay
      await new Promise((resolve) => setTimeout(resolve, 3000));

      const verdict = generateMockVerdict(disputeReason.trim());

      const now = new Date().toISOString();
      const disputeEvent: TimelineEvent = {
        id: `t-${Date.now()}`,
        message: `Dispute opened by client: "${disputeReason.trim()}"`,
        actor: userName,
        timestamp: now,
        icon: "alert-triangle",
      };
      const aiEvent: TimelineEvent = {
        id: `t-${Date.now() + 1}`,
        message: `Panchayat AI analyzed evidence — recommends ${verdict.verdict}${verdict.verdict === "SPLIT" ? ` (${Math.round((verdict.sellerAmount / deal.amount) * 100)}/${Math.round((verdict.buyerAmount / deal.amount) * 100)})` : ""}`,
        actor: "Panchayat AI",
        timestamp: new Date(Date.now() + 500).toISOString(),
        icon: "bot",
      };

      const updated: Deal = {
        ...deal,
        status: "DISPUTED",
        disputeReason: disputeReason.trim(),
        aiVerdict: verdict,
        updatedAt: now,
        timeline: [...deal.timeline, disputeEvent, aiEvent],
      };

      updateStoredDeal(updated);
      setAiVerdict(verdict);
      setShowVerdict(true);
      setIsSubmitting(false);
      setAiReviewing(false);

      toast.error("Dispute registered. Case forwarded to Arbitrator with Panchayat AI evaluation.");
    } catch (error) {
      setIsSubmitting(false);
      setAiReviewing(false);
      toast.error("Failed to submit dispute. Please try again.");
    }
  };

  const handleAcceptVerdict = () => {
    if (!aiVerdict) return;
    router.push(`/deal/${deal.id}`);
    router.refresh();
  };

  const handleCancel = () => {
    router.push(`/deal/${deal.id}`);
  };

  if (!canRaiseDispute) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Navbar />
        <main className="flex-1 flex items-center justify-center px-4 py-12">
          <Card className="max-w-md w-full border-amber-200 bg-amber-50/50 dark:border-amber-900/40 dark:bg-amber-950/20">
            <CardContent className="pt-8 pb-10 px-6 text-center space-y-4">
              <div className="size-16 rounded-full bg-amber-100 dark:bg-amber-900/50 text-amber-600 mx-auto flex items-center justify-center">
                <ShieldAlert className="size-8" />
              </div>
              <h2 className="text-xl font-bold text-amber-900 dark:text-amber-200">
                Cannot Raise Dispute
              </h2>
              <p className="text-sm text-amber-700 dark:text-amber-300">
                {deal.status !== "DELIVERED"
                  ? "Disputes can only be raised after deliverables have been submitted."
                  : !isBuyer
                  ? "Only the buyer who funded this deal can raise a dispute."
                  : "This deal is not in a state where disputes can be raised."}
              </p>
              <Button variant="outline" onClick={handleCancel} className="text-xs">
                <ArrowLeft className="mr-1.5 size-3.5" />
                Back to Deal
              </Button>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />

      <main className="flex-1 container mx-auto px-4 py-8 max-w-3xl space-y-6">
        {/* Back Link */}
        <Link
          href={`/deal/${deal.id}`}
          className="inline-flex items-center text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="mr-1.5 size-3.5" />
          Back to Deal
        </Link>

        {/* Header */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Badge className={cn(
              "text-[0.7rem] font-semibold",
              deal.status === "DISPUTED" ? "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300" : "bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300"
            )}>
              {deal.status === "DISPUTED" ? "Disputed" : "Delivered"}
            </Badge>
            <span className="text-xs text-muted-foreground font-mono">DEAL: {deal.id}</span>
          </div>

          <h1 className="font-heading text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
            Raise Dispute with Panchayat AI
          </h1>

          <p className="text-sm text-muted-foreground max-w-2xl">
            Dealing with <strong>{deal.title}</strong> ({formatRupees(deal.amount)}) — Seller: <strong>{deal.sellerName}</strong>
          </p>
        </div>

        {/* Demo Notice */}
        <div className="rounded-xl bg-amber-50/80 dark:bg-amber-950/40 border border-amber-200/80 dark:border-amber-800/40 p-4 flex items-start gap-3 ring-1 ring-amber-300/40">
          <AlertTriangle className="size-5 shrink-0 text-amber-600 dark:text-amber-400 mt-0.5" />
          <div className="flex-1 space-y-1">
            <p className="font-semibold text-amber-900 dark:text-amber-200 text-sm">
              DEMO DISPUTE — SIMULATED AI ARBITRATION
            </p>
            <p className="text-xs text-amber-800 dark:text-amber-300">
              Panchayat AI will generate a mock recommendation based on your dispute reason.
              In production, this connects to the real arbitration engine.
            </p>
          </div>
        </div>

        {/* Deal Context Card */}
        <Card className="border-border shadow-sm">
          <CardHeader className="pb-3 border-b">
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <FileText className="size-4 text-muted-foreground" />
              Contract Scope (Reference)
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="rounded-xl bg-muted/40 p-4 text-xs leading-relaxed whitespace-pre-wrap max-h-40 overflow-y-auto">
              {deal.description}
            </div>
            <Separator className="my-3" />
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-muted-foreground">Seller Delivered:</span>
                <div className="font-medium text-foreground mt-0.5 truncate">
                  {deal.deliveryProof || "No proof submitted"}
                </div>
              </div>
              <div>
                <span className="text-muted-foreground">Escrow Amount:</span>
                <div className="font-bold text-primary mt-0.5">{formatRupees(deal.amount)}</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Dispute Form or AI Review */}
        {!showVerdict ? (
          <>
            {/* Dispute Form */}
            <Card className="border-border shadow-sm">
              <CardHeader className="pb-3 border-b">
                <CardTitle className="text-sm font-bold flex items-center gap-2 text-red-600">
                  <AlertTriangle className="size-4" />
                  Describe the Contract Violation
                </CardTitle>
                <CardDescription className="text-xs">
                  Clearly specify how the submitted deliverable diverges from the agreed contract terms.
                  Be specific about missing formats, incomplete components, or scope deviations.
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-4 space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="dispute-reason" className="text-xs font-semibold">
                    Grievance Description *
                  </Label>
                  <Textarea
                    id="dispute-reason"
                    rows={5}
                    placeholder="Detail the discrepancy: missing formats (e.g., SVG not delivered), incomplete components (e.g., only 2 of 3 concepts), scope deviation (e.g., CMS not integrated), quality issues..."
                    value={disputeReason}
                    onChange={(e) => setDisputeReason(e.target.value)}
                    disabled={isSubmitting || aiReviewing}
                    className="text-xs leading-relaxed"
                    required
                  />
                  <p className="text-[0.7rem] text-muted-foreground">
                    {disputeReason.length}/2000 characters
                  </p>
                </div>

                <div className="rounded-xl bg-muted/60 p-3 flex items-start gap-2 border border-border/40">
                  <Sparkles className="size-4 text-amber-500 shrink-0 mt-0.5" />
                  <div className="text-xs text-muted-foreground space-y-1">
                    <p className="font-medium text-foreground">Panchayat AI Arbitration</p>
                    <p>
                      Our neural arbitration model will review both sides — the original contract specifications,
                      the seller's submitted proof, and your grievance — to recommend a fair settlement
                      (Release, Refund, or Pro-Rata Split) to our compliance desk.
                    </p>
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleCancel}
                    disabled={isSubmitting || aiReviewing}
                    className="flex-1 text-xs"
                  >
                    <ChevronRight className="mr-1.5 size-3.5" />
                    Cancel
                  </Button>
                  <Button
                    type="button"
                    onClick={() => handleSubmitDispute({ preventDefault: () => {} } as React.FormEvent)}
                    disabled={isSubmitting || aiReviewing || !disputeReason.trim()}
                    className="flex-1 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold"
                  >
                    {aiReviewing ? (
                      <>
                        <Loader2 className="mr-2 size-4 animate-spin" />
                        Panchayat AI Analyzing…
                      </>
                    ) : isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 size-4 animate-spin" />
                        Submitting…
                      </>
                    ) : (
                      <>
                        <Bot className="mr-2 size-4" />
                        Submit for AI Arbitration
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* What Happens Next */}
            <Card className="border-border/80 bg-muted/30 shadow-sm">
              <CardContent className="pt-4 pb-6 px-6">
                <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-4 flex items-center gap-2">
                  <MessageSquare className="size-3.5" />
                  What Happens After Submission
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                  <div className="space-y-1.5 p-3 rounded-xl bg-background border">
                    <div className="flex items-center gap-2">
                      <div className="size-8 rounded-lg bg-blue-100 dark:bg-blue-950/40 text-blue-600 flex items-center justify-center">
                        <Bot className="size-4" />
                      </div>
                      <span className="font-semibold">1. AI Analysis</span>
                    </div>
                    <p className="text-muted-foreground text-[0.72rem] leading-relaxed">
                      Panchayat AI compares contract scope vs. deliverables vs. grievance using NLP and semantic matching.
                    </p>
                  </div>
                  <div className="space-y-1.5 p-3 rounded-xl bg-background border">
                    <div className="flex items-center gap-2">
                      <div className="size-8 rounded-lg bg-amber-100 dark:bg-amber-950/40 text-amber-600 flex items-center justify-center">
                        <Scale className="size-4" />
                      </div>
                      <span className="font-semibold">2. Recommendation</span>
                    </div>
                    <p className="text-muted-foreground text-[0.72rem] leading-relaxed">
                      AI recommends Release / Refund / Split with percentage allocation and detailed reasoning.
                    </p>
                  </div>
                  <div className="space-y-1.5 p-3 rounded-xl bg-background border">
                    <div className="flex items-center gap-2">
                      <div className="size-8 rounded-lg bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600 flex items-center justify-center">
                        <ShieldCheck className="size-4" />
                      </div>
                      <span className="font-semibold">3. Arbitrator Review</span>
                    </div>
                    <p className="text-muted-foreground text-[0.72rem] leading-relaxed">
                      Compliance officer reviews AI recommendation and issues binding resolution.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </>
        ) : (
          // AI Verdict Display
          <Card className="border-amber-300/80 bg-gradient-to-br from-amber-50/30 via-card to-card shadow-sm ring-1 ring-amber-400/20 animate-in zoom-in-95 fade-in duration-300">
            <CardContent className="p-6 flex flex-col gap-5">
              {/* Header */}
              <div className="flex items-start justify-between gap-2 border-b pb-4">
                <div className="flex items-center gap-2">
                  <div className="size-10 rounded-xl bg-amber-100 dark:bg-amber-950/60 text-amber-700 flex items-center justify-center shrink-0 ring-1 ring-amber-300">
                    <Bot className="size-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold tracking-tight flex items-center gap-1.5">
                      Panchayat AI™ Advisory
                      <Sparkles className="size-3.5 text-amber-500" />
                    </h3>
                    <p className="text-[0.68rem] text-muted-foreground">Neural Contract Verification Complete</p>
                  </div>
                </div>

                <Badge className={cn(
                  "text-[0.68rem] font-bold border",
                  aiVerdict?.verdict === "RELEASE" && "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border-emerald-300",
                  aiVerdict?.verdict === "REFUND" && "bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300 border-red-300",
                  aiVerdict?.verdict === "SPLIT" && "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border-amber-300"
                )}>
                  {aiVerdict?.verdict === "RELEASE" && "Full Release to Freelancer"}
                  {aiVerdict?.verdict === "REFUND" && "Full Refund to Client"}
                  {aiVerdict?.verdict === "SPLIT" && "Pro-Rata Settlement Split"}
                </Badge>
              </div>

              {/* Visual Split Bar */}
              {aiVerdict && (
                <div className="space-y-2 rounded-xl bg-background/80 p-4 border border-border/60">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-emerald-700 flex items-center gap-1">
                      Freelancer: {formatRupees(aiVerdict.sellerAmount)} ({Math.round((aiVerdict.sellerAmount / deal.amount) * 100)}%)
                    </span>
                    <span className="text-blue-700 flex items-center gap-1">
                      Client: {formatRupees(aiVerdict.buyerAmount)} ({Math.round((aiVerdict.buyerAmount / deal.amount) * 100)}%)
                    </span>
                  </div>

                  <div className="flex h-3 w-full overflow-hidden rounded-full bg-muted">
                    <div
                      className="rounded-l-full bg-emerald-500 transition-all duration-500"
                      style={{ width: `${Math.round((aiVerdict.sellerAmount / deal.amount) * 100)}%` }}
                    />
                    <div
                      className="rounded-r-full bg-blue-500 transition-all duration-500"
                      style={{ width: `${Math.round((aiVerdict.buyerAmount / deal.amount) * 100)}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Reasoning */}
              <div className="space-y-1">
                <p className="text-[0.7rem] uppercase tracking-wider font-semibold text-muted-foreground">
                  Arbitration Rationale
                </p>
                <div className="rounded-lg bg-muted/40 p-4 text-xs leading-relaxed text-foreground border border-border/40">
                  {aiVerdict?.reasoning}
                </div>
              </div>

              {/* Legal Disclaimer */}
              <p className="text-[0.68rem] italic text-muted-foreground/80 leading-tight border-t pt-3">
                ⚖️ AI suggestions are non-binding recommendations. The platform arbitrator holds final discretion to ratify or modify this ruling.
              </p>

              {/* Actions */}
              <div className="flex gap-3 pt-2">
                <Button
                  variant="outline"
                  onClick={handleCancel}
                  className="flex-1 text-xs"
                >
                  <ArrowLeft className="mr-1.5 size-3.5" />
                  Back to Deal
                </Button>
                <Button
                  onClick={handleAcceptVerdict}
                  className="flex-1 gap-2 text-xs font-semibold h-10 shadow-sm bg-amber-600 hover:bg-amber-700 text-white"
                >
                  <ShieldCheck className="size-4" />
                  View Deal & Continue
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Footer Note */}
        <p className="text-center text-[0.65rem] text-muted-foreground/60 max-w-sm mx-auto">
          Disputes are resolved through Panchayat AI arbitration with human arbitrator oversight.
          All decisions are binding and enforceable under the escrow agreement.
        </p>
      </main>
    </div>
  );
}

function DisputePageLoader() {
  const params = useParams();
  const dealId = (params?.id as string) || "";
  const [deal, setDeal] = useState<Deal | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    const loadDeal = () => {
      const found = getStoredDeal(dealId);
      if (found) {
        setDeal(found);
        setNotFound(false);
      } else {
        setNotFound(true);
      }
      setLoading(false);
    };
    loadDeal();
  }, [dealId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="container mx-auto px-4 py-12 max-w-3xl">
          <div className="animate-pulse space-y-6">
            <div className="h-4 w-48 bg-muted rounded" />
            <div className="h-12 w-full bg-muted rounded-xl" />
            <div className="h-60 bg-muted rounded-xl" />
          </div>
        </main>
      </div>
    );
  }

  if (notFound || !deal) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Navbar />
        <main className="flex-1 flex items-center justify-center px-4 py-12">
          <Card className="max-w-md w-full">
            <CardContent className="pt-8 pb-10 px-6 text-center space-y-4">
              <div className="size-16 rounded-2xl bg-muted flex items-center justify-center text-3xl mx-auto">🔍</div>
              <h2 className="text-xl font-bold">Deal Not Found</h2>
              <p className="text-xs text-muted-foreground">The requested deal does not exist.</p>
              <Button onClick={() => window.history.back()} className="text-xs">Go Back</Button>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  return (
    <Suspense fallback={
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="container mx-auto px-4 py-12 max-w-3xl">
          <div className="animate-pulse space-y-6">
            <div className="h-4 w-48 bg-muted rounded" />
            <div className="h-12 w-full bg-muted rounded-xl" />
            <div className="h-60 bg-muted rounded-xl" />
          </div>
        </main>
      </div>
    }>
      <DisputePageContent deal={deal} />
    </Suspense>
  );
}

export default DisputePageLoader;