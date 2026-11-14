"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import { Navbar } from "@/components/navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ShieldCheck,
  ArrowLeft,
  Loader2,
  AlertTriangle,
  Bot,
  Scale,
  ShieldAlert,
  FileText,
  Gavel,
  CheckCircle2,
  XCircle,
  ChevronRight,
  Clock,
  User,
  ExternalLink,
  Sparkles,
  MessageSquare,
  Send,
  Eye,
} from "lucide-react";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { formatRupees, timeAgo } from "@/lib/format";
import { getStoredDeal, updateStoredDeal } from "@/lib/storage";
import { useAuth } from "@/lib/auth-context";
import type { Deal, TimelineEvent } from "@/lib/types";
import { cn } from "@/lib/utils";

interface AdminDisputePageContentProps {
  deal: Deal;
}

function AdminDisputePageContent({ deal }: AdminDisputePageContentProps) {
  const router = useRouter();
  const { user } = useAuth();
  const userName = user?.name || "Panchayat Arbitrator";

  const [activeTab, setActiveTab] = useState<"overview" | "evidence" | "timeline">("overview");
  const [sellerSplitPercent, setSellerSplitPercent] = useState(50);
  const [resolutionReason, setResolutionReason] = useState("");
  const [isResolving, setIsResolving] = useState(false);
  const [showResolutionDialog, setShowResolutionDialog] = useState(false);
  const [resolutionType, setResolutionType] = useState<"RELEASE" | "REFUND" | "SPLIT" | null>(null);

  const isDisputed = deal.status === "DISPUTED";
  const isResolved = deal.status.startsWith("RESOLVED_");
  const canResolve = isDisputed && !isResolving;

  const handleResolve = async (type: "RELEASE" | "REFUND" | "SPLIT", splitPct: number = 50) => {
    if (!canResolve) return;

    if (type === "SPLIT" && !resolutionReason.trim()) {
      toast.error("Please provide a reason for the split resolution");
      return;
    }

    if ((type === "RELEASE" || type === "REFUND") && !resolutionReason.trim()) {
      toast.error("Please provide a reason for this resolution");
      return;
    }

    setIsResolving(true);
    try {
      const now = new Date().toISOString();
      let newStatus: Deal["status"] = "RESOLVED_RELEASED";
      let logMsg = "";

      if (type === "RELEASE") {
        newStatus = "RESOLVED_RELEASED";
        logMsg = `Arbitrator Ruling: Full escrow (${formatRupees(deal.amount)}) released to freelancer — ${resolutionReason}`;
      } else if (type === "REFUND") {
        newStatus = "RESOLVED_REFUNDED";
        logMsg = `Arbitrator Ruling: Full escrow (${formatRupees(deal.amount)}) refunded to client — ${resolutionReason}`;
      } else {
        newStatus = "RESOLVED_SPLIT";
        const sAmt = Math.round((deal.amount * splitPct) / 100);
        const bAmt = deal.amount - sAmt;
        logMsg = `Arbitrator Ruling: Pro-rata split — ${formatRupees(sAmt)} (${splitPct}%) to seller, ${formatRupees(bAmt)} (${100 - splitPct}%) to buyer — ${resolutionReason}`;
      }

      const newEvent: TimelineEvent = {
        id: `t-${Date.now()}`,
        message: logMsg,
        actor: "Compliance Arbitrator",
        timestamp: now,
        icon: "gavel",
      };

      const updated: Deal = {
        ...deal,
        status: newStatus,
        updatedAt: now,
        timeline: [...deal.timeline, newEvent],
      };

      updateStoredDeal(updated);
      setShowResolutionDialog(false);
      setResolutionReason("");
      toast.success(logMsg);
      router.refresh();
    } catch (error) {
      toast.error("Arbitration execution failed");
    } finally {
      setIsResolving(false);
    }
  };

  const handleAcceptAiVerdict = () => {
    if (!deal.aiVerdict) return;
    const v = deal.aiVerdict.verdict;
    const splitPct = Math.round((deal.aiVerdict.sellerAmount / deal.amount) * 100);
    handleResolve(v, splitPct);
  };

  const isUrl = (text: string) => text.startsWith("http://") || text.startsWith("https://");

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />

      <main className="flex-1 container mx-auto px-4 py-6 max-w-7xl space-y-6">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4">
          <Link
            href="/dashboard"
            className="inline-flex items-center text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="mr-1.5 size-3.5" />
            Back to Arbitrator Dashboard
          </Link>

          <div className="flex items-center gap-2">
            <span className="text-[0.68rem] text-muted-foreground font-mono bg-muted px-2 py-0.5 rounded">
              CASE: {deal.id}
            </span>
            <Badge className={cn(
              "text-[0.68rem] font-semibold",
              deal.status === "DISPUTED" && "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300",
              deal.status.startsWith("RESOLVED_") && "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300"
            )}>
              {deal.status === "DISPUTED" ? "PENDING ARBITRATION" : "RESOLVED"}
            </Badge>
          </div>
        </div>

        {/* Case Header */}
        <Card className="border-border shadow-sm">
          <CardContent className="p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-4">
              <div>
                <h1 className="font-heading text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                  {deal.title}
                </h1>
                <p className="text-sm text-muted-foreground mt-1">
                  Escrow Amount: <strong className="text-foreground">{formatRupees(deal.amount)}</strong>
                  {" | "} Seller: <strong className="text-foreground">{deal.sellerName}</strong>
                  {" | "} Buyer: <strong className="text-foreground">{deal.buyerName || "Unknown"}</strong>
                </p>
              </div>
              <div className="text-right sm:text-left">
                <p className="text-3xl font-black text-primary">{formatRupees(deal.amount)}</p>
                <p className="text-xs text-muted-foreground">In Escrow</p>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t">
              <div className="space-y-1">
                <span className="text-[0.7rem] font-medium uppercase tracking-wider text-muted-foreground">Created</span>
                <p className="font-medium text-foreground">{timeAgo(deal.createdAt)}</p>
              </div>
              <div className="space-y-1">
                <span className="text-[0.7rem] font-medium uppercase tracking-wider text-muted-foreground">Disputed</span>
                <p className="font-medium text-foreground">
                  {deal.timeline.find(t => t.icon === "alert-triangle")?.timestamp
                    ? timeAgo(deal.timeline.find(t => t.icon === "alert-triangle")!.timestamp)
                    : "N/A"}
                </p>
              </div>
              <div className="space-y-1">
                <span className="text-[0.7rem] font-medium uppercase tracking-wider text-muted-foreground">AI Verdict</span>
                <p className="font-medium text-foreground">
                  {deal.aiVerdict ? deal.aiVerdict.verdict : "Not Generated"}
                </p>
              </div>
              <div className="space-y-1">
                <span className="text-[0.7rem] font-medium uppercase tracking-wider text-muted-foreground">Status</span>
                <Badge className={cn(
                  "inline-block",
                  deal.status === "DISPUTED" && "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300",
                  deal.status.startsWith("RESOLVED_") && "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300"
                )}>
                  {deal.status === "DISPUTED" ? "Open" : "Resolved"}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabs Navigation */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-3 h-10 text-xs">
            <TabsTrigger value="overview">
              <FileText className="mr-1.5 size-3.5" />
              Case Overview
            </TabsTrigger>
            <TabsTrigger value="evidence">
              <Scale className="mr-1.5 size-3.5" />
              Evidence Review
            </TabsTrigger>
            <TabsTrigger value="timeline">
              <Clock className="mr-1.5 size-3.5" />
              Timeline
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6 pt-4">
            <div className="grid gap-6 lg:grid-cols-2">
              {/* Contract Specifications */}
              <Card className="border-border shadow-sm">
                <CardHeader className="pb-3 border-b">
                  <CardTitle className="text-sm font-bold flex items-center gap-2">
                    <FileText className="size-4 text-primary" />
                    Contract Specifications
                  </CardTitle>
                  <Badge variant="outline" className="text-[0.65rem] font-medium text-muted-foreground">
                    Binding Terms
                  </Badge>
                </CardHeader>
                <CardContent className="pt-4">
                  <div className="rounded-xl bg-muted/40 p-4 text-xs leading-relaxed whitespace-pre-wrap font-sans">
                    {deal.description}
                  </div>
                </CardContent>
              </Card>

              {/* Dispute Reason */}
              {deal.disputeReason && (
                <Card className="border-red-200 bg-red-50/20 dark:bg-red-950/20 shadow-sm">
                  <CardHeader className="pb-2 border-b border-red-200/50">
                    <CardTitle className="text-sm font-bold flex items-center gap-2 text-red-900 dark:text-red-300">
                      <AlertTriangle className="size-4 text-red-600" />
                      Client Dispute Claim
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-4 space-y-2">
                    <div className="rounded-xl bg-background p-4 text-xs text-red-950 dark:text-red-200 border border-red-200">
                      {deal.disputeReason}
                    </div>
                    <p className="text-[0.7rem] text-muted-foreground">
                      Logged with Panchayat AI for automated evaluation and compliance review.
                    </p>
                  </CardContent>
                </Card>
              )}

              {/* Seller Delivery Proof */}
              {deal.deliveryProof && (
                <Card className="border-purple-200/80 bg-purple-50/20 dark:bg-purple-950/20 shadow-sm">
                  <CardHeader className="pb-2 border-b border-purple-200/50">
                    <CardTitle className="text-sm font-bold flex items-center gap-2 text-purple-900 dark:text-purple-300">
                      <CheckCircle2 className="size-4 text-purple-600" />
                      Submitted Deliverables & Artifacts
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-4 space-y-2">
                    <div className="rounded-xl bg-background p-4 text-xs border">
                      {isUrl(deal.deliveryProof) ? (
                        <a
                          href={deal.deliveryProof}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary underline flex items-center gap-2 font-medium break-all"
                        >
                          {deal.deliveryProof}
                          <ExternalLink className="size-3.5 shrink-0" />
                        </a>
                      ) : (
                        <p className="whitespace-pre-wrap">{deal.deliveryProof}</p>
                      )}
                    </div>
                    <p className="text-[0.7rem] text-muted-foreground">
                      Submitted by freelancer as formal fulfillment proof of contract scope.
                    </p>
                  </CardContent>
                </Card>
              )}

              {/* Panchayat AI Verdict */}
              <Card className={cn(
                "border-border shadow-sm",
                deal.aiVerdict && "border-amber-300/80 bg-gradient-to-br from-amber-50/30 via-card to-card shadow-sm ring-1 ring-amber-400/20"
              )}>
                <CardHeader className="pb-3 border-b">
                  <CardTitle className="text-sm font-bold flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <Bot className="size-4 text-amber-600" />
                      Panchayat AI™ Recommendation
                    </span>
                    {deal.aiVerdict && (
                      <Badge className={cn(
                        "text-[0.65rem] font-bold border",
                        deal.aiVerdict.verdict === "RELEASE" && "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border-emerald-300",
                        deal.aiVerdict.verdict === "REFUND" && "bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300 border-red-300",
                        deal.aiVerdict.verdict === "SPLIT" && "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border-amber-300"
                      )}>
                        {deal.aiVerdict.verdict === "RELEASE" && "Full Release to Freelancer"}
                        {deal.aiVerdict.verdict === "REFUND" && "Full Refund to Client"}
                        {deal.aiVerdict.verdict === "SPLIT" && "Pro-Rata Settlement Split"}
                      </Badge>
                    )}
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Non-binding AI advisory. Arbitrator holds final discretion.
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-4">
                  {deal.aiVerdict ? (
                    <>
                      {/* Visual Split Bar */}
                      <div className="space-y-2 rounded-xl bg-background/80 p-4 border border-border/60">
                        <div className="flex justify-between text-xs font-semibold">
                          <span className="text-emerald-700 flex items-center gap-1">
                            Freelancer: {formatRupees(deal.aiVerdict.sellerAmount)} ({Math.round((deal.aiVerdict.sellerAmount / deal.amount) * 100)}%)
                          </span>
                          <span className="text-blue-700 flex items-center gap-1">
                            Client: {formatRupees(deal.aiVerdict.buyerAmount)} ({Math.round((deal.aiVerdict.buyerAmount / deal.amount) * 100)}%)
                          </span>
                        </div>
                        <div className="flex h-3 w-full overflow-hidden rounded-full bg-muted">
                          <div
                            className="rounded-l-full bg-emerald-500 transition-all duration-500"
                            style={{ width: `${Math.round((deal.aiVerdict.sellerAmount / deal.amount) * 100)}%` }}
                          />
                          <div
                            className="rounded-r-full bg-blue-500 transition-all duration-500"
                            style={{ width: `${Math.round((deal.aiVerdict.buyerAmount / deal.amount) * 100)}%` }}
                          />
                        </div>
                      </div>

                      {/* Reasoning */}
                      <div className="space-y-1 mt-4">
                        <p className="text-[0.7rem] uppercase tracking-wider font-semibold text-muted-foreground">
                          Arbitration Rationale
                        </p>
                        <div className="rounded-lg bg-muted/40 p-4 text-xs leading-relaxed text-foreground border border-border/40">
                          {deal.aiVerdict.reasoning}
                        </div>
                      </div>

                      {/* Accept Button */}
                      <Button
                        onClick={handleAcceptAiVerdict}
                        disabled={isResolved || isResolving}
                        className="w-full mt-4 gap-2 text-xs font-semibold h-10 shadow-sm bg-amber-600 hover:bg-amber-700 text-white"
                      >
                        <Gavel className="size-4" />
                        Ratify & Execute Panchayat Ruling
                      </Button>

                      <p className="text-[0.68rem] italic text-muted-foreground/80 leading-tight mt-2 text-center">
                        ⚖️ AI suggestions are non-binding recommendations. The platform arbitrator holds final discretion to ratify or modify this ruling.
                      </p>
                    </>
                  ) : (
                    <div className="flex items-center gap-3 py-6">
                      <AlertTriangle className="size-5 shrink-0 text-muted-foreground" />
                      <div className="space-y-0.5">
                        <p className="text-sm font-semibold text-foreground">AI Evaluation Unavailable</p>
                        <p className="text-xs text-muted-foreground">
                          Please proceed with manual arbitrator evaluation and resolution.
                        </p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Evidence Review Tab */}
          <TabsContent value="evidence" className="space-y-6 pt-4">
            <Card className="border-amber-200 bg-amber-50/20 shadow-sm">
              <CardHeader className="pb-3 border-b border-amber-200/60">
                <CardTitle className="text-sm font-bold flex items-center gap-2 text-amber-900 dark:text-amber-200">
                  <Scale className="size-4 text-amber-600" />
                  Arbitrator Case Dossier
                </CardTitle>
                <CardDescription className="text-xs">
                  Objective comparison of contractual agreement vs. delivered proof vs. dispute claim.
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div className="p-4 rounded-xl bg-background border space-y-3">
                    <p className="font-bold text-foreground flex items-center gap-1.5">
                      <FileText className="size-3.5 text-emerald-600" /> 1. Contract Specifications
                    </p>
                    <p className="text-muted-foreground leading-relaxed text-[0.72rem]">
                      {deal.description}
                    </p>
                    <div className="pt-3 border-t">
                      <p className="font-bold text-foreground">2. Seller Proof</p>
                      <p className="text-muted-foreground leading-relaxed text-[0.72rem] mt-1">
                        {deal.deliveryProof || "No proof attached"}
                      </p>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-background border border-red-200 space-y-3">
                    <p className="font-bold text-red-700 flex items-center gap-1.5">
                      <AlertTriangle className="size-3.5 text-red-600" /> 3. Client Dispute Claim
                    </p>
                    <p className="text-red-900 dark:text-red-200 leading-relaxed text-[0.72rem]">
                      {deal.disputeReason || "No dispute claim recorded"}
                    </p>
                    <div className="pt-3 border-t">
                      <p className="font-bold text-foreground">4. Nodal Escrow Deposit</p>
                      <p className="text-muted-foreground text-[0.72rem] mt-1 font-mono">
                        {formatRupees(deal.amount)} held under Tijori protection escrow.
                      </p>
                    </div>
                  </div>
                </div>

                {deal.aiVerdict && (
                  <div className="mt-6 p-4 rounded-xl bg-amber-50/50 dark:bg-amber-950/30 border border-amber-200/60 space-y-2">
                    <p className="font-bold text-amber-900 dark:text-amber-200 flex items-center gap-1.5">
                      <Bot className="size-3.5 text-amber-600" /> 5. Panchayat AI Analysis
                    </p>
                    <p className="text-amber-900 dark:text-amber-200 leading-relaxed text-[0.72rem]">
                      {deal.aiVerdict.reasoning}
                    </p>
                    <div className="pt-2 border-t flex justify-between text-xs font-semibold">
                      <span className="text-emerald-700">Freelancer: {formatRupees(deal.aiVerdict.sellerAmount)} ({Math.round((deal.aiVerdict.sellerAmount / deal.amount) * 100)}%)</span>
                      <span className="text-blue-700">Client: {formatRupees(deal.aiVerdict.buyerAmount)} ({Math.round((deal.aiVerdict.buyerAmount / deal.amount) * 100)}%)</span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Resolution Actions */}
            {isDisputed && (
              <Card className="border-border shadow-md ring-1 ring-border">
                <CardHeader className="pb-3 border-b">
                  <CardTitle className="text-sm font-bold flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <Gavel className="size-4 text-red-600" />
                      Issue Binding Resolution
                    </span>
                    <Badge variant="outline" className="text-[0.68rem] font-medium text-red-600 border-red-200">
                      Arbitrator Action
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-4 space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <Button
                      size="sm"
                      variant={resolutionType === "RELEASE" ? "default" : "outline"}
                      onClick={() => { setResolutionType("RELEASE"); setShowResolutionDialog(true); }}
                      disabled={isResolving}
                      className="text-emerald-700 border-emerald-200 hover:bg-emerald-50 h-10"
                    >
                      <CheckCircle2 className="mr-1.5 size-3.5" />
                      Release Full to Seller
                    </Button>
                    <Button
                      size="sm"
                      variant={resolutionType === "REFUND" ? "default" : "outline"}
                      onClick={() => { setResolutionType("REFUND"); setShowResolutionDialog(true); }}
                      disabled={isResolving}
                      className="text-red-700 border-red-200 hover:bg-red-50 h-10"
                    >
                      <XCircle className="mr-1.5 size-3.5" />
                      Refund Full to Buyer
                    </Button>
                    <Button
                      size="sm"
                      variant={resolutionType === "SPLIT" ? "default" : "secondary"}
                      onClick={() => { setResolutionType("SPLIT"); setShowResolutionDialog(true); }}
                      disabled={isResolving}
                      className="h-10"
                    >
                      <Scale className="mr-1.5 size-3.5" />
                      Custom Pro-Rata Split
                    </Button>
                  </div>

                  <div className="rounded-xl bg-muted/40 p-3 text-xs text-muted-foreground">
                    <p className="font-semibold text-foreground mb-1">Resolution Guidelines:</p>
                    <ul className="space-y-1 list-disc list-inside">
                      <li><strong>Release:</strong> Seller delivered per contract — buyer's claim unsubstantiated</li>
                      <li><strong>Refund:</strong> Seller failed to deliver — proof insufficient or missing critical scope</li>
                      <li><strong>Split:</strong> Partial delivery — pro-rata based on completed vs. agreed scope</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            )}

            {isResolved && (
              <Card className="border-emerald-200 bg-emerald-50/50 dark:border-emerald-900/40 dark:bg-emerald-950/20 shadow-sm">
                <CardContent className="p-6 text-center space-y-2">
                  <div className="size-12 rounded-full bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 mx-auto flex items-center justify-center">
                    <Gavel className="size-6" />
                  </div>
                  <p className="font-bold text-sm text-foreground">Dispute Resolved by Arbitrator</p>
                  <p className="text-muted-foreground text-[0.72rem]">
                    {deal.status === "RESOLVED_RELEASED" && "Ruling: Funds released to seller"}
                    {deal.status === "RESOLVED_REFUNDED" && "Ruling: Funds refunded to client"}
                    {deal.status === "RESOLVED_SPLIT" && "Ruling: Pro-rata split executed between parties"}
                  </p>
                  <p className="text-[0.65rem] text-muted-foreground/70">
                    Resolution recorded in immutable audit trail.
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Timeline Tab */}
          <TabsContent value="timeline" className="pt-4">
            <Card className="border-border shadow-sm">
              <CardHeader className="pb-3 border-b">
                <CardTitle className="text-sm font-bold flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Clock className="size-4 text-muted-foreground" />
                    Contract Audit Log
                  </span>
                  <span className="text-[0.65rem] text-muted-foreground font-mono">
                    Immutable
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="relative space-y-0">
                  {deal.timeline.map((event, index) => {
                    const isLast = index === deal.timeline.length - 1;
                    const icons: Record<string, React.ReactNode> = {
                      plus: <Send className="size-3" />,
                      wallet: <ShieldCheck className="size-3" />,
                      package: <FileText className="size-3" />,
                      "alert-triangle": <AlertTriangle className="size-3" />,
                      "check-circle": <CheckCircle2 className="size-3" />,
                      bot: <Bot className="size-3" />,
                      gavel: <Gavel className="size-3" />,
                    };
                    const Icon = icons[event.icon || ""] || <MessageSquare className="size-3" />;

                    return (
                      <div key={event.id} className="relative flex gap-4 pb-6 last:pb-0">
                        {!isLast && (
                          <div className="absolute left-[11px] top-6 h-[calc(100%-12px)] w-px bg-border" />
                        )}
                        <div className="relative z-10 flex size-6 shrink-0 items-center justify-center rounded-full bg-muted ring-2 ring-background">
                          {Icon}
                        </div>
                        <div className="flex flex-1 flex-col gap-0.5 pt-0.5">
                          <p className="text-sm leading-snug">{event.message}</p>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <span className="font-medium">{event.actor}</span>
                            <span>·</span>
                            <span>{timeAgo(event.timestamp)}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      {/* Resolution Dialog */}
      <div className={cn("fixed inset-0 z-50 flex items-center justify-center p-4", showResolutionDialog ? "block" : "hidden")}>
        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => { setShowResolutionDialog(false); setResolutionType(null); }} />
        <div className="relative bg-background rounded-2xl shadow-2xl max-w-md w-full border border-border p-6 space-y-4 animate-in zoom-in-95 fade-in duration-200">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-lg">Confirm Resolution</h3>
            <Button variant="ghost" size="icon" onClick={() => { setShowResolutionDialog(false); setResolutionType(null); }}>
              <XCircle className="size-5" />
            </Button>
          </div>

          <div className="space-y-2 text-sm">
            <p className="font-medium">
              {resolutionType === "RELEASE" && "Release full escrow to seller"}
              {resolutionType === "REFUND" && "Refund full escrow to buyer"}
              {resolutionType === "SPLIT" && "Execute custom pro-rata split"}
            </p>
            <p className="text-muted-foreground text-xs">Deal: {deal.title} ({formatRupees(deal.amount)})</p>
          </div>

          {resolutionType === "SPLIT" && (
            <div className="space-y-3 pt-2 border-t">
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-semibold">
                  <span>Seller Settlement:</span>
                  <span className="font-bold text-emerald-600">{sellerSplitPercent}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="5"
                  value={sellerSplitPercent}
                  onChange={(e) => setSellerSplitPercent(Number(e.target.value))}
                  className="w-full cursor-pointer accent-emerald-600"
                />
              </div>
              <div className="rounded-xl bg-muted p-3 grid grid-cols-2 gap-2 text-center text-xs">
                <div className="space-y-0.5">
                  <p className="text-muted-foreground text-[0.7rem]">Seller Receives</p>
                  <p className="font-bold text-base text-emerald-600">
                    {formatRupees(Math.round((deal.amount * sellerSplitPercent) / 100))}
                  </p>
                </div>
                <div className="space-y-0.5">
                  <p className="text-muted-foreground text-[0.7rem]">Buyer Refund</p>
                  <p className="font-bold text-base text-blue-600">
                    {formatRupees(deal.amount - Math.round((deal.amount * sellerSplitPercent) / 100))}
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="resolution-reason" className="text-xs font-semibold block">
              Arbitrator Reason (Required) *
            </Label>
            <textarea
              id="resolution-reason"
              rows={3}
              placeholder="Provide your reasoning for this resolution..."
              value={resolutionReason}
              onChange={(e) => setResolutionReason(e.target.value)}
              className="w-full rounded-lg border border-border bg-background text-xs p-2 resize-none focus:outline-none focus:ring-2 focus:ring-primary"
              required
            />
          </div>

          <div className="flex gap-2 pt-2">
            <Button
              variant="outline"
              onClick={() => { setShowResolutionDialog(false); setResolutionType(null); }}
              disabled={isResolving}
              className="flex-1 text-xs"
            >
              Cancel
            </Button>
            <Button
              onClick={() => resolutionType && handleResolve(resolutionType, sellerSplitPercent)}
              disabled={isResolving || !resolutionReason.trim()}
              className="flex-1 text-xs font-semibold"
            >
              {isResolving ? (
                <>
                  <Loader2 className="mr-1.5 size-3.5 animate-spin" />
                  Finalizing…
                </>
              ) : (
                "Issue Binding Ruling"
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

function AdminDisputePageLoader() {
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
        <main className="container mx-auto px-4 py-12 max-w-7xl">
          <div className="animate-pulse space-y-6">
            <div className="h-4 w-64 bg-muted rounded" />
            <div className="h-20 w-full bg-muted rounded-xl" />
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
              <h2 className="text-xl font-bold">Case Not Found</h2>
              <p className="text-xs text-muted-foreground">The requested dispute case does not exist.</p>
              <Button onClick={() => window.history.back()} className="text-xs">Back to Dashboard</Button>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  return <AdminDisputePageContent deal={deal} />;
}

export default function AdminDisputePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="container mx-auto px-4 py-12 max-w-7xl">
          <div className="animate-pulse space-y-6">
            <div className="h-4 w-64 bg-muted rounded" />
            <div className="h-20 w-full bg-muted rounded-xl" />
            <div className="h-60 bg-muted rounded-xl" />
          </div>
        </main>
      </div>
    }>
      <AdminDisputePageLoader />
    </Suspense>
  );
}