"use client";

import { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import { Navbar } from "@/components/navbar";
import { StatusBadge } from "@/components/status-badge";
import { EscrowBanner } from "@/components/escrow-banner";
import { Timeline } from "@/components/timeline";
import { UpiModal } from "@/components/upi-modal";
import { AiVerdictCard } from "@/components/ai-verdict-card";
import { DealDetailSkeleton } from "@/components/loading-skeleton";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  ArrowLeft,
  Copy,
  Check,
  ExternalLink,
  ShieldAlert,
  Clock,
  Send,
  CheckCircle2,
  AlertTriangle,
  Bot,
  Loader2,
  FileText,
  User,
  Calendar,
  Sparkles,
  Scale,
  ShieldCheck,
  Share2,
  MessageSquare,
} from "lucide-react";
import { toast } from "sonner";
import { formatRupees, timeAgo } from "@/lib/format";
import { getStoredDeal, updateStoredDeal } from "@/lib/storage";
import { fetchDeal, fundDeal, deliverDeal, acceptDeal, disputeDeal, resolveDeal } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import type { Deal, Role, TimelineEvent, AiVerdict } from "@/lib/types";

function DealDetailContent() {
  const router = useRouter();
  const routeParams = useParams();
  const dealId = (routeParams?.id as string) || "";
  const { user } = useAuth();

  const [mounted, setMounted] = useState(false);
  const [deal, setDeal] = useState<Deal | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  // Copy link feedback
  const [copied, setCopied] = useState(false);

  // UPI payment modal
  const [upiOpen, setUpiOpen] = useState(false);

  // Delivery form state
  const [deliveryInput, setDeliveryInput] = useState("");
  const [isDelivering, setIsDelivering] = useState(false);

  // Accept confirmation dialog
  const [acceptDialogOpen, setAcceptDialogOpen] = useState(false);
  const [isAccepting, setIsAccepting] = useState(false);

  // Dispute dialog state
  const [disputeDialogOpen, setDisputeDialogOpen] = useState(false);
  const [disputeReason, setDisputeReason] = useState("");
  const [isDisputing, setIsDisputing] = useState(false);
  const [aiReviewing, setAiReviewing] = useState(false);

  // Admin split resolution modal
  const [splitDialogOpen, setSplitDialogOpen] = useState(false);
  const [sellerSplitPercent, setSellerSplitPercent] = useState<number>(50);
  const [isResolving, setIsResolving] = useState(false);

  const role = user?.role || "SELLER";
  const userName = user?.name || "Arjun Verma";

  // Load deal
  const loadDeal = async () => {
    setLoading(true);
    try {
      let found: Deal | null = null;
      try {
        found = await fetchDeal(dealId);
      } catch {
        found = getStoredDeal(dealId);
      }

      if (!found) {
        found = getStoredDeal(dealId);
      }

      if (found) {
        setDeal(found);
        setNotFound(false);
      } else {
        setNotFound(true);
      }
    } catch {
      const local = getStoredDeal(dealId);
      if (local) {
        setDeal(local);
        setNotFound(false);
      } else {
        setNotFound(true);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setMounted(true);
    loadDeal();
  }, [dealId]);

  const saveDealUpdate = (updated: Deal) => {
    setDeal(updated);
    updateStoredDeal(updated);
  };

  const handleCopyLink = () => {
    const url = typeof window !== "undefined" ? window.location.href : "";
    navigator.clipboard.writeText(url);
    setCopied(true);
    toast.success("Contract link copied! Send it to your client via WhatsApp or Email.");
    setTimeout(() => setCopied(false), 2500);
  };

  const handleWhatsAppShare = () => {
    const url = typeof window !== "undefined" ? window.location.href : "";
    const msg = encodeURIComponent(
      `Hi, here is our Tijori Escrow agreement for "${deal?.title}": ${url}. Please review scope and deposit funds into escrow.`
    );
    window.open(`https://api.whatsapp.com/send?text=${msg}`, "_blank");
  };

  // 1. BUYER: Fund deal via UPI
  const handleFundSuccess = async () => {
    if (!deal) return;
    try {
      try {
        await fundDeal(deal.id);
      } catch {
        // Mock fallback
      }

      const now = new Date().toISOString();
      const newEvent: TimelineEvent = {
        id: `t-${Date.now()}`,
        message: `Escrow funded — ${formatRupees(deal.amount)} held safely in Tijori Nodal Account`,
        actor: userName,
        timestamp: now,
        icon: "wallet",
      };

      const updated: Deal = {
        ...deal,
        status: "FUNDED",
        buyerName: deal.buyerName || userName,
        updatedAt: now,
        timeline: [...deal.timeline, newEvent],
      };

      saveDealUpdate(updated);
      setUpiOpen(false);
      toast.success(`${formatRupees(deal.amount)} successfully deposited into Tijori Escrow!`);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Payment processing failed");
    }
  };

  // 2. SELLER: Submit delivery proof
  const handleSubmitDelivery = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!deal) return;
    if (!deliveryInput.trim()) {
      toast.error("Please enter deliverable URL or completion details");
      return;
    }

    setIsDelivering(true);
    try {
      try {
        await deliverDeal(deal.id, deliveryInput.trim());
      } catch {
        // Fallback
      }

      const now = new Date().toISOString();
      const newEvent: TimelineEvent = {
        id: `t-${Date.now()}`,
        message: "Deliverables submitted by freelancer for client audit",
        actor: userName,
        timestamp: now,
        icon: "package",
      };

      const updated: Deal = {
        ...deal,
        status: "DELIVERED",
        deliveryProof: deliveryInput.trim(),
        updatedAt: now,
        timeline: [...deal.timeline, newEvent],
      };

      saveDealUpdate(updated);
      setDeliveryInput("");
      toast.success("Deliverables submitted! Client has been notified to review.");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to submit delivery");
    } finally {
      setIsDelivering(false);
    }
  };

  // 3. BUYER: Accept & release payment
  const handleAcceptDeal = async () => {
    if (!deal) return;
    setIsAccepting(true);
    try {
      try {
        await acceptDeal(deal.id);
      } catch {
        // Fallback
      }

      const now = new Date().toISOString();
      const newEvent: TimelineEvent = {
        id: `t-${Date.now()}`,
        message: `Milestone approved — ${formatRupees(deal.amount)} released to ${deal.sellerName}`,
        actor: userName,
        timestamp: now,
        icon: "check-circle",
      };

      const updated: Deal = {
        ...deal,
        status: "COMPLETED",
        updatedAt: now,
        timeline: [...deal.timeline, newEvent],
      };

      saveDealUpdate(updated);
      setAcceptDialogOpen(false);
      toast.success(`Escrow released! ${formatRupees(deal.amount)} disbursed to ${deal.sellerName}.`);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to release escrow");
    } finally {
      setIsAccepting(false);
    }
  };

  // 4. BUYER: Raise dispute + Panchayat AI arbitration
  const handleSubmitDispute = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!deal) return;
    if (!disputeReason.trim()) {
      toast.error("Please explain the specific contract violation");
      return;
    }

    setIsDisputing(true);
    setAiReviewing(true);

    try {
      // Simulate Panchayat AI multi-parameter analysis
      await new Promise((resolve) => setTimeout(resolve, 2600));

      try {
        await disputeDeal(deal.id, disputeReason.trim());
      } catch {
        // Fallback
      }

      const sellerAmt = Math.round(deal.amount * 0.4);
      const buyerAmt = deal.amount - sellerAmt;
      const aiVerdict: AiVerdict = {
        verdict: "SPLIT",
        sellerAmount: sellerAmt,
        buyerAmount: buyerAmt,
        reasoning: `Panchayat AI evaluated the agreed specifications against the submitted deliverables and client claim: "${disputeReason.trim()}". The seller demonstrated partial milestone completion (estimated at 40%). Recommending an equitable pro-rata settlement: ₹${sellerAmt.toLocaleString("en-IN")} released to freelancer for work delivered, and ₹${buyerAmt.toLocaleString("en-IN")} refunded to client.`,
      };

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
        message: "Panchayat AI analyzed evidence — recommends SPLIT (40/60 pro-rata)",
        actor: "Panchayat AI",
        timestamp: new Date(Date.now() + 500).toISOString(),
        icon: "bot",
      };

      const updated: Deal = {
        ...deal,
        status: "DISPUTED",
        disputeReason: disputeReason.trim(),
        aiVerdict,
        updatedAt: now,
        timeline: [...deal.timeline, disputeEvent, aiEvent],
      };

      saveDealUpdate(updated);
      setDisputeDialogOpen(false);
      setDisputeReason("");
      toast.error("Dispute registered. Case forwarded to Arbitrator with Panchayat AI evaluation.");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to submit dispute");
    } finally {
      setIsDisputing(false);
      setAiReviewing(false);
    }
  };

  // 5. ADMIN: Resolve dispute
  const handleResolve = async (
    type: "RELEASE" | "REFUND" | "SPLIT",
    splitPct: number = 50
  ) => {
    if (!deal) return;
    setIsResolving(true);
    try {
      try {
        await resolveDeal(deal.id, type, splitPct);
      } catch {
        // Fallback
      }

      const now = new Date().toISOString();
      let newStatus: Deal["status"] = "RESOLVED_RELEASED";
      let logMsg = "";

      if (type === "RELEASE") {
        newStatus = "RESOLVED_RELEASED";
        logMsg = `Arbitrator Ruling: Full escrow (${formatRupees(deal.amount)}) released to freelancer`;
      } else if (type === "REFUND") {
        newStatus = "RESOLVED_REFUNDED";
        logMsg = `Arbitrator Ruling: Full escrow (${formatRupees(deal.amount)}) refunded to client`;
      } else {
        newStatus = "RESOLVED_SPLIT";
        const sAmt = Math.round((deal.amount * splitPct) / 100);
        const bAmt = deal.amount - sAmt;
        logMsg = `Arbitrator Ruling: Pro-rata split — ${formatRupees(sAmt)} (${splitPct}%) to seller, ${formatRupees(bAmt)} (${100 - splitPct}%) to buyer`;
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

      saveDealUpdate(updated);
      setSplitDialogOpen(false);
      toast.success(logMsg);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Arbitration execution failed");
    } finally {
      setIsResolving(false);
    }
  };

  const handleAcceptAiVerdict = () => {
    if (!deal?.aiVerdict) return;
    const v = deal.aiVerdict.verdict;
    const splitPct = Math.round((deal.aiVerdict.sellerAmount / deal.amount) * 100);
    handleResolve(v, splitPct);
  };

  if (!mounted || loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="container mx-auto px-4 py-8 max-w-5xl">
          <DealDetailSkeleton />
        </main>
      </div>
    );
  }

  if (notFound || !deal) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Navbar />
        <main className="flex-1 container mx-auto px-4 py-16 max-w-md text-center flex flex-col items-center justify-center space-y-4">
          <div className="size-16 rounded-2xl bg-muted flex items-center justify-center text-3xl">
            🔍
          </div>
          <h1 className="text-2xl font-bold">Contract Not Found</h1>
          <p className="text-xs text-muted-foreground leading-relaxed">
            The requested escrow agreement ID does not exist or may have been archived.
          </p>
          <Button onClick={() => router.push("/dashboard")} className="text-xs">
            Return to Dashboard
          </Button>
        </main>
      </div>
    );
  }

  const isSeller = role === "SELLER";
  const isBuyer = role === "BUYER";
  const isAdmin = role === "ADMIN";

  const isUrl = (text: string) => {
    return text.startsWith("http://") || text.startsWith("https://");
  };

  return (
    <div className="min-h-screen bg-background flex flex-col pb-16">
      <Navbar />

      <main className="flex-1 container mx-auto px-4 py-6 max-w-6xl space-y-6">
        {/* Top Header Breadcrumbs & Quick Share Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-4">
          <Link
            href="/dashboard"
            className="inline-flex items-center text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="mr-1.5 size-3.5" />
            Back to Dashboard
          </Link>

          <div className="flex items-center gap-2">
            <span className="text-[0.68rem] text-muted-foreground font-mono bg-muted px-2 py-0.5 rounded">
              CONTRACT: {deal.id}
            </span>

            <Button
              variant="outline"
              size="sm"
              onClick={handleCopyLink}
              className="h-7 text-[0.7rem] gap-1 px-2.5 border-border"
            >
              {copied ? <Check className="size-3 text-emerald-600" /> : <Copy className="size-3" />}
              {copied ? "Copied" : "Copy Link"}
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={handleWhatsAppShare}
              className="h-7 text-[0.7rem] gap-1 px-2.5 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800 hover:bg-emerald-50 dark:hover:bg-emerald-950/40"
            >
              <Share2 className="size-3" />
              WhatsApp
            </Button>
          </div>
        </div>

        {/* 2-Column Responsive Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* ═══════════════════════════════════════════════════════════ */}
          {/* LEFT COLUMN: Contract Details & Evidence (7 cols)         */}
          {/* ═══════════════════════════════════════════════════════════ */}
          <div className="lg:col-span-7 space-y-6">
            {/* Header info */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <StatusBadge status={deal.status} />
                <span className="text-xs text-muted-foreground">
                  Updated {timeAgo(deal.updatedAt)}
                </span>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-2">
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
                  {deal.title}
                </h1>
                <p className="text-2xl sm:text-3xl font-black text-emerald-600 dark:text-emerald-400">
                  {formatRupees(deal.amount)}
                </p>
              </div>
            </div>

            {/* Escrow Status Banner */}
            <EscrowBanner
              status={deal.status}
              amount={deal.amount}
              sellerAmount={deal.aiVerdict?.sellerAmount}
              buyerAmount={deal.aiVerdict?.buyerAmount}
            />

            {/* Contract Specifications */}
            <Card className="border-border shadow-sm">
              <CardHeader className="pb-3 border-b">
                <CardTitle className="text-sm font-bold flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <FileText className="size-4 text-emerald-600" />
                    Agreed Scope of Work
                  </span>
                  <Badge variant="outline" className="text-[0.65rem] font-medium text-muted-foreground">
                    Binding Terms
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4 space-y-4">
                <div className="rounded-xl bg-muted/40 p-4 text-xs sm:text-sm leading-relaxed whitespace-pre-wrap font-sans">
                  {deal.description}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-xs border-t">
                  <div className="space-y-1">
                    <span className="text-muted-foreground flex items-center gap-1 text-[0.7rem]">
                      <User className="size-3" /> Freelancer / Seller
                    </span>
                    <p className="font-semibold text-foreground flex items-center gap-1">
                      {deal.sellerName}
                      <CheckCircle2 className="size-3 text-emerald-600 shrink-0" />
                    </p>
                  </div>

                  <div className="space-y-1">
                    <span className="text-muted-foreground flex items-center gap-1 text-[0.7rem]">
                      <User className="size-3" /> Client / Buyer
                    </span>
                    <p className="font-semibold text-foreground">
                      {deal.buyerName ? (
                        <span className="flex items-center gap-1">
                          {deal.buyerName}
                          <CheckCircle2 className="size-3 text-blue-600 shrink-0" />
                        </span>
                      ) : (
                        <span className="italic text-muted-foreground">Awaiting Client Payment</span>
                      )}
                    </p>
                  </div>

                  <div className="space-y-1">
                    <span className="text-muted-foreground flex items-center gap-1 text-[0.7rem]">
                      <Calendar className="size-3" /> Initiated
                    </span>
                    <p className="font-semibold text-foreground">{timeAgo(deal.createdAt)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Delivery Proof */}
            {deal.deliveryProof && (
              <Card className="border-purple-200/80 bg-purple-50/20 dark:bg-purple-950/20 shadow-sm">
                <CardHeader className="pb-2 border-b border-purple-200/50">
                  <CardTitle className="text-sm font-bold flex items-center gap-2 text-purple-900 dark:text-purple-300">
                    <CheckCircle2 className="size-4 text-purple-600" />
                    Submitted Deliverables &amp; Artifacts
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-4 space-y-2">
                  <div className="rounded-xl bg-background p-3.5 text-xs border">
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

            {/* Dispute Reason */}
            {deal.disputeReason && (
              <Card className="border-red-200 bg-red-50/20 dark:bg-red-950/20 shadow-sm">
                <CardHeader className="pb-2 border-b border-red-200/50">
                  <CardTitle className="text-sm font-bold flex items-center gap-2 text-red-900 dark:text-red-300">
                    <AlertTriangle className="size-4 text-red-600" />
                    Client Contract Grievance
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-4 space-y-2">
                  <div className="rounded-xl bg-background p-3.5 text-xs text-red-950 dark:text-red-200 border border-red-200">
                    {deal.disputeReason}
                  </div>
                  <p className="text-[0.7rem] text-muted-foreground">
                    Logged with Panchayat AI for automated evaluation and compliance review.
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Admin Side-by-Side Arbitrator Audit View */}
            {isAdmin && deal.status === "DISPUTED" && (
              <Card className="border-amber-200 bg-amber-50/20 shadow-sm">
                <CardHeader className="pb-3 border-b border-amber-200/60">
                  <CardTitle className="text-sm font-bold flex items-center gap-2 text-amber-900 dark:text-amber-200">
                    <Scale className="size-4 text-amber-600" />
                    Arbitrator Case Dossier
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Objective comparison of contractual agreement vs. delivered proof.
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                    <div className="p-3.5 rounded-xl bg-background border space-y-2">
                      <p className="font-bold text-foreground flex items-center gap-1.5">
                        <FileText className="size-3.5 text-emerald-600" /> 1. Contract Specifications
                      </p>
                      <p className="text-muted-foreground leading-relaxed text-[0.72rem]">
                        {deal.description}
                      </p>
                      <div className="pt-2 border-t">
                        <p className="font-bold text-foreground">2. Seller Proof</p>
                        <p className="text-muted-foreground leading-relaxed text-[0.72rem] mt-0.5">
                          {deal.deliveryProof || "No proof attached"}
                        </p>
                      </div>
                    </div>

                    <div className="p-3.5 rounded-xl bg-background border border-red-200 space-y-2">
                      <p className="font-bold text-red-700 flex items-center gap-1.5">
                        <AlertTriangle className="size-3.5 text-red-600" /> 3. Client Dispute Claim
                      </p>
                      <p className="text-red-900 dark:text-red-200 leading-relaxed text-[0.72rem]">
                        {deal.disputeReason}
                      </p>
                      <div className="pt-2 border-t">
                        <p className="font-bold text-foreground">4. Nodal Escrow Deposit</p>
                        <p className="text-muted-foreground text-[0.72rem] mt-0.5 font-mono">
                          {formatRupees(deal.amount)} held under Tijori protection escrow.
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* ═══════════════════════════════════════════════════════════ */}
          {/* RIGHT COLUMN: Action Panel & Timeline (5 cols)             */}
          {/* ═══════════════════════════════════════════════════════════ */}
          <div className="lg:col-span-5 space-y-6">
            {/* Action Panel Card */}
            <Card className="border-border shadow-md ring-1 ring-border">
              <CardHeader className="pb-3 border-b">
                <CardTitle className="text-sm font-bold flex items-center justify-between">
                  <span>Contract Actions</span>
                  <Badge variant="outline" className="text-[0.68rem] capitalize font-medium">
                    {role.toLowerCase()} perspective
                  </Badge>
                </CardTitle>
              </CardHeader>

              <CardContent className="pt-4 space-y-4">
                {/* 1. CREATED */}
                {deal.status === "CREATED" && (
                  <>
                    {isSeller && (
                      <div className="space-y-3">
                        <div className="rounded-xl bg-emerald-50 dark:bg-emerald-950/40 p-3.5 text-xs text-emerald-900 dark:text-emerald-200 space-y-1 border border-emerald-200/60">
                          <p className="font-bold flex items-center gap-1.5">
                            <ShieldCheck className="size-4 text-emerald-600" />
                            Agreement Ready for Client
                          </p>
                          <p className="text-[0.72rem]">
                            Share this link with your client. Once they deposit {formatRupees(deal.amount)} into
                            escrow via UPI, you can safely commence work.
                          </p>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          <Button
                            onClick={handleCopyLink}
                            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white gap-2 text-xs h-10 shadow-sm"
                          >
                            {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
                            {copied ? "Link Copied!" : "Copy Contract Link"}
                          </Button>

                          <Button
                            variant="outline"
                            onClick={handleWhatsAppShare}
                            className="w-full text-xs h-10 gap-1.5 border-emerald-200 text-emerald-700 hover:bg-emerald-50"
                          >
                            <MessageSquare className="size-4 text-emerald-600" />
                            Share on WhatsApp
                          </Button>
                        </div>
                      </div>
                    )}

                    {isBuyer && (
                      <div className="space-y-3">
                        <div className="rounded-xl bg-blue-50 dark:bg-blue-950/40 p-3 text-xs text-blue-900 dark:text-blue-200 border border-blue-200/60">
                          <p className="font-semibold">Fund Escrow to Start Project</p>
                          <p className="text-[0.7rem] mt-0.5">
                            Your payment is held in regulated escrow. Funds are only disbursed to
                            the freelancer once you inspect and approve the completed scope.
                          </p>
                        </div>
                        <Button
                          size="lg"
                          onClick={() => setUpiOpen(true)}
                          className="w-full bg-emerald-600 hover:bg-emerald-700 text-white gap-2 font-bold text-sm h-11 shadow-md"
                        >
                          Deposit {formatRupees(deal.amount)} via UPI Escrow
                        </Button>
                      </div>
                    )}

                    {isAdmin && (
                      <p className="text-xs text-muted-foreground italic">
                        Contract initiated. Awaiting client escrow deposit.
                      </p>
                    )}
                  </>
                )}

                {/* 2. FUNDED */}
                {deal.status === "FUNDED" && (
                  <>
                    {isSeller && (
                      <form onSubmit={handleSubmitDelivery} className="space-y-3">
                        <div className="rounded-xl bg-emerald-50 dark:bg-emerald-950/40 p-3 text-xs text-emerald-900 dark:text-emerald-200 border border-emerald-200/60">
                          <p className="font-semibold">Funds Verified in Escrow</p>
                          <p className="text-[0.7rem] mt-0.5">
                            {formatRupees(deal.amount)} is secured. Work with total confidence and submit your completed deliverables below.
                          </p>
                        </div>

                        <div className="space-y-1.5">
                          <Label htmlFor="delivery-proof" className="text-xs font-semibold">
                            Deliverables Link or Work Summary *
                          </Label>
                          <Textarea
                            id="delivery-proof"
                            rows={3}
                            placeholder="e.g. Google Drive link, Figma design link, GitHub PR, or completed deliverables details..."
                            value={deliveryInput}
                            onChange={(e) => setDeliveryInput(e.target.value)}
                            disabled={isDelivering}
                            required
                            className="text-xs"
                          />
                        </div>

                        <Button
                          type="submit"
                          disabled={isDelivering}
                          className="w-full bg-emerald-600 hover:bg-emerald-700 text-white gap-2 text-xs font-semibold h-10 shadow-sm"
                        >
                          {isDelivering ? (
                            <>
                              <Loader2 className="size-4 animate-spin" />
                              Submitting Artifacts…
                            </>
                          ) : (
                            <>
                              <Send className="size-4" />
                              Submit Work for Review
                            </>
                          )}
                        </Button>
                      </form>
                    )}

                    {isBuyer && (
                      <div className="flex items-center gap-3 p-3.5 rounded-xl bg-blue-50/60 dark:bg-blue-950/30 text-blue-950 dark:text-blue-200 border border-blue-200/60">
                        <Clock className="size-5 text-blue-600 shrink-0" />
                        <div className="text-xs">
                          <p className="font-semibold">Freelancer is Working</p>
                          <p className="text-muted-foreground mt-0.5 text-[0.7rem]">
                            Your {formatRupees(deal.amount)} is secured in escrow. You will be prompted to approve the release once deliverables are submitted.
                          </p>
                        </div>
                      </div>
                    )}

                    {isAdmin && (
                      <p className="text-xs text-muted-foreground italic">
                        Funds locked in escrow. Freelancer actively executing agreed scope.
                      </p>
                    )}
                  </>
                )}

                {/* 3. DELIVERED */}
                {deal.status === "DELIVERED" && (
                  <>
                    {isSeller && (
                      <div className="flex items-center gap-3 p-3.5 rounded-xl bg-purple-50/60 dark:bg-purple-950/30 text-purple-950 dark:text-purple-200 border border-purple-200/60">
                        <Clock className="size-5 text-purple-600 shrink-0" />
                        <div className="text-xs">
                          <p className="font-semibold">Deliverables Submitted</p>
                          <p className="text-muted-foreground mt-0.5 text-[0.7rem]">
                            Awaiting client inspection and payout approval.
                          </p>
                        </div>
                      </div>
                    )}

                    {isBuyer && (
                      <div className="space-y-3">
                        <div className="rounded-xl bg-purple-50 dark:bg-purple-950/40 p-3 text-xs text-purple-950 dark:text-purple-200 border border-purple-200/60">
                          <p className="font-semibold">Review Deliverables</p>
                          <p className="text-[0.7rem] mt-0.5">
                            Inspect the submitted artifacts on the left. If everything matches the agreed scope, release the payment.
                          </p>
                        </div>

                        <div className="grid grid-cols-1 gap-2 pt-1">
                          <Button
                            onClick={() => setAcceptDialogOpen(true)}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2 text-xs font-semibold h-10 shadow-sm"
                          >
                            <CheckCircle2 className="size-4" />
                            Approve Deliverables &amp; Release {formatRupees(deal.amount)}
                          </Button>
                          <Button
                            variant="outline"
                            onClick={() => setDisputeDialogOpen(true)}
                            className="text-red-600 border-red-200 hover:bg-red-50 dark:hover:bg-red-950/30 gap-2 text-xs h-10"
                          >
                            <AlertTriangle className="size-4" />
                            Raise Dispute to Panchayat AI
                          </Button>
                        </div>
                      </div>
                    )}

                    {isAdmin && (
                      <p className="text-xs text-muted-foreground italic">
                        Work delivered. Client currently auditing deliverables.
                      </p>
                    )}
                  </>
                )}

                {/* 4. DISPUTED */}
                {deal.status === "DISPUTED" && (
                  <>
                    {(isBuyer || isSeller) && (
                      <div className="flex items-center gap-3 p-4 rounded-xl bg-red-50/60 dark:bg-red-950/30 text-red-950 dark:text-red-200 border border-red-200/80">
                        <ShieldAlert className="size-6 text-red-600 shrink-0" />
                        <div className="text-xs space-y-1">
                          <p className="font-bold">Under Panchayat AI Mediation</p>
                          <p className="text-muted-foreground text-[0.72rem] leading-relaxed">
                            Our arbitration engine is analyzing the contract specifications, delivery proof,
                            and grievance. Compliance officers will issue a binding resolution shortly.
                          </p>
                        </div>
                      </div>
                    )}

                    {isAdmin && (
                      <div className="space-y-4">
                        <AiVerdictCard
                          verdict={deal.aiVerdict}
                          dealAmount={deal.amount}
                          onAccept={handleAcceptAiVerdict}
                        />

                        <div className="space-y-2 pt-2 border-t">
                          <p className="text-xs font-semibold text-muted-foreground">
                            Manual Arbitrator Overrides:
                          </p>
                          <div className="grid grid-cols-2 gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleResolve("RELEASE")}
                              disabled={isResolving}
                              className="text-emerald-700 border-emerald-200 hover:bg-emerald-50 text-xs h-8"
                            >
                              Release Full
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleResolve("REFUND")}
                              disabled={isResolving}
                              className="text-red-700 border-red-200 hover:bg-red-50 text-xs h-8"
                            >
                              Refund Full
                            </Button>
                          </div>
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => setSplitDialogOpen(true)}
                            disabled={isResolving}
                            className="w-full text-xs h-8"
                          >
                            Custom Pro-Rata Split…
                          </Button>
                        </div>
                      </div>
                    )}
                  </>
                )}

                {/* 5. COMPLETED / RESOLVED */}
                {(deal.status === "COMPLETED" || deal.status.startsWith("RESOLVED_")) && (
                  <div className="rounded-xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200/60 p-4 text-xs space-y-2 text-center">
                    <div className="size-10 rounded-full bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 mx-auto flex items-center justify-center">
                      <CheckCircle2 className="size-5" />
                    </div>
                    <p className="font-bold text-sm text-foreground">Escrow Successfully Settled</p>
                    <p className="text-muted-foreground text-[0.72rem]">
                      {deal.status === "COMPLETED" && "Deliverables verified and full payment disbursed to seller."}
                      {deal.status === "RESOLVED_RELEASED" && "Dispute resolved by compliance: Funds released to seller."}
                      {deal.status === "RESOLVED_REFUNDED" && "Dispute resolved by compliance: Funds refunded to client."}
                      {deal.status === "RESOLVED_SPLIT" && "Dispute resolved: Pro-rata split executed between parties."}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Audit Timeline */}
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
                <Timeline events={deal.timeline} />
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      {/* ── Dialog 1: UPI Modal ──────────────────────────────────── */}
      <UpiModal
        open={upiOpen}
        onOpenChange={setUpiOpen}
        amount={deal.amount}
        onSuccess={handleFundSuccess}
      />

      {/* ── Dialog 2: Release Approval ──────────────────────────── */}
      <Dialog open={acceptDialogOpen} onOpenChange={setAcceptDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Approve and Release Escrow</DialogTitle>
            <DialogDescription className="text-xs">
              Confirming release of {formatRupees(deal.amount)} to <strong>{deal.sellerName}</strong>.
              This action is final and executes immediate UPI payout.
            </DialogDescription>
          </DialogHeader>
          <div className="rounded-xl bg-emerald-50 dark:bg-emerald-950/30 p-3.5 text-xs text-emerald-800 dark:text-emerald-200 border border-emerald-200">
            ✓ Deliverables have been inspected and confirmed in accordance with the contract scope.
          </div>
          <DialogFooter className="gap-2 sm:gap-0 pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setAcceptDialogOpen(false)}
              disabled={isAccepting}
              className="text-xs"
            >
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleAcceptDeal}
              disabled={isAccepting}
              className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold"
            >
              {isAccepting ? (
                <>
                  <Loader2 className="mr-1.5 size-3.5 animate-spin" />
                  Executing Payout…
                </>
              ) : (
                `Confirm Release ${formatRupees(deal.amount)}`
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Dialog 3: Panchayat AI Dispute ──────────────────────── */}
      <Dialog open={disputeDialogOpen} onOpenChange={setDisputeDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="size-5" />
              Submit Grievance to Panchayat AI
            </DialogTitle>
            <DialogDescription className="text-xs">
              Clearly specify how the submitted deliverable diverges from the agreed contract terms.
            </DialogDescription>
          </DialogHeader>

          {aiReviewing ? (
            <div className="py-10 flex flex-col items-center justify-center gap-4 text-center">
              <div className="relative">
                <div className="size-16 rounded-2xl bg-amber-100 dark:bg-amber-950/50 flex items-center justify-center">
                  <Bot className="size-8 text-amber-600 animate-bounce" />
                </div>
                <div className="absolute inset-0 rounded-2xl border-2 border-amber-500 border-t-transparent animate-spin" />
              </div>
              <div className="space-y-1">
                <p className="font-bold text-base text-foreground">Panchayat AI is evaluating evidence…</p>
                <p className="text-xs text-muted-foreground max-w-sm">
                  Comparing original contract specifications with submitted files and dispute rationale to formulate a fair recommendation.
                </p>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmitDispute} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="dispute-text" className="text-xs font-semibold">
                  Grievance Description *
                </Label>
                <Textarea
                  id="dispute-text"
                  rows={4}
                  placeholder="Detail the discrepancy: missing formats, incomplete components, or scope deviation..."
                  value={disputeReason}
                  onChange={(e) => setDisputeReason(e.target.value)}
                  disabled={isDisputing}
                  className="text-xs leading-relaxed"
                  required
                />
              </div>

              <div className="rounded-xl bg-muted/60 p-3 text-[0.72rem] text-muted-foreground flex items-start gap-2">
                <Sparkles className="size-4 text-amber-500 shrink-0 mt-0.5" />
                <span>
                  Our neural arbitration model will review both sides and recommend a fair settlement
                  (Release, Refund, or Pro-Rata Split) to our compliance desk.
                </span>
              </div>

              <DialogFooter className="gap-2 sm:gap-0 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setDisputeDialogOpen(false)}
                  disabled={isDisputing}
                  className="text-xs"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  disabled={isDisputing}
                  className="bg-red-600 hover:bg-red-700 text-white text-xs font-semibold"
                >
                  Submit for AI Arbitration
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* ── Dialog 4: Custom Split Arbitration ──────────────────── */}
      <Dialog open={splitDialogOpen} onOpenChange={setSplitDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Arbitrator Pro-Rata Split</DialogTitle>
            <DialogDescription className="text-xs">
              Determine the settlement percentage between freelancer deliverables and client refund.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-semibold">
                <span>Freelancer Settlement:</span>
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

            <div className="rounded-xl bg-muted p-3.5 grid grid-cols-2 gap-2 text-center text-xs">
              <div className="space-y-0.5">
                <p className="text-muted-foreground text-[0.7rem]">Freelancer Receives</p>
                <p className="font-bold text-base text-emerald-600">
                  {formatRupees(Math.round((deal.amount * sellerSplitPercent) / 100))}
                </p>
              </div>
              <div className="space-y-0.5">
                <p className="text-muted-foreground text-[0.7rem]">Client Refund</p>
                <p className="font-bold text-base text-blue-600">
                  {formatRupees(deal.amount - Math.round((deal.amount * sellerSplitPercent) / 100))}
                </p>
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0 pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSplitDialogOpen(false)}
              disabled={isResolving}
              className="text-xs"
            >
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={() => handleResolve("SPLIT", sellerSplitPercent)}
              disabled={isResolving}
              className="text-xs font-semibold"
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
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function DealDetailPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-background">
          <div className="h-16 border-b border-border/80 bg-background/80" />
          <main className="container mx-auto px-4 py-8 max-w-5xl">
            <DealDetailSkeleton />
          </main>
        </div>
      }
    >
      <DealDetailContent />
    </Suspense>
  );
}
