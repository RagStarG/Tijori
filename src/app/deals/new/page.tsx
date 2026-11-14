"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Navbar } from "@/components/navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Sparkles,
  ArrowLeft,
  Loader2,
  ShieldAlert,
  ShieldCheck,
  FileText,
  Lock,
  ArrowRight,
  Eye,
  CheckCircle2,
} from "lucide-react";
import { toast } from "sonner";
import { createDeal } from "@/lib/api";
import { updateStoredDeal } from "@/lib/storage";
import { useAuth } from "@/lib/auth-context";
import { formatRupees } from "@/lib/format";
import type { Deal, Role } from "@/lib/types";

export default function CreateDealPage() {
  const router = useRouter();
  const { user, isAuthenticated, switchRole } = useAuth();

  const [mounted, setMounted] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const role = user?.role || "SELLER";
  const userName = user?.name || "Arjun Verma";

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
      </div>
    );
  }

  // Role Guard: Buyer/Admin cannot create deals
  if (role !== "SELLER") {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Navbar />
        <main className="flex-1 container mx-auto px-4 py-16 max-w-md flex flex-col items-center justify-center text-center">
          <Card className="border-border shadow-md">
            <CardContent className="pt-8 space-y-4">
              <div className="size-14 rounded-2xl bg-amber-50 dark:bg-amber-950/60 flex items-center justify-center mx-auto text-amber-700 ring-1 ring-amber-200">
                <ShieldAlert className="size-7" />
              </div>
              <h2 className="text-xl font-bold">Freelancer Workspace Required</h2>
              <p className="text-xs text-muted-foreground leading-relaxed">
                You are currently signed in as <strong>{role === "BUYER" ? "Client" : "Arbitrator"}</strong>.
                Only registered freelancers or agencies can author new escrow contracts.
              </p>
              <div className="flex flex-col gap-2 pt-2">
                <Button
                  onClick={() => {
                    switchRole("SELLER");
                    toast.success("Switched to Freelancer workspace");
                  }}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold"
                >
                  Switch to Freelancer Workspace
                </Button>
                <Button variant="outline" size="sm" onClick={() => router.push("/dashboard")} className="text-xs">
                  Return to Dashboard
                </Button>
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  const numAmount = parseInt(amount, 10);
  const validAmount = !isNaN(numAmount) && numAmount > 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      toast.error("Please enter a contract title");
      return;
    }
    if (title.length > 80) {
      toast.error("Title must be 80 characters or less");
      return;
    }
    if (!description.trim()) {
      toast.error("Please provide the agreed scope of work");
      return;
    }
    if (!validAmount) {
      toast.error("Please enter a valid amount greater than ₹0");
      return;
    }

    setIsSubmitting(true);

    try {
      let created: Deal | null = null;
      try {
        created = await createDeal({
          title: title.trim(),
          description: description.trim(),
          amount: numAmount,
        });
      } catch (err: unknown) {
        console.warn("Backend API unavailable, saving locally", err);
      }

      if (!created) {
        const id = `deal-${Date.now().toString().slice(-4)}`;
        const now = new Date().toISOString();
        created = {
          id,
          title: title.trim(),
          description: description.trim(),
          amount: numAmount,
          status: "CREATED",
          sellerName: userName,
          buyerName: null,
          deliveryProof: null,
          disputeReason: null,
          aiVerdict: null,
          timeline: [
            {
              id: `t-${Date.now()}`,
              message: "Escrow contract initiated by freelancer",
              actor: userName,
              timestamp: now,
              icon: "plus",
            },
          ],
          createdAt: now,
          updatedAt: now,
        };
      }

      updateStoredDeal(created);
      toast.success("Escrow agreement created! Share the link with your client.");
      router.push(`/deals/${created.id}`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to create deal";
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col pb-12">
      <Navbar />

      <main className="flex-1 container mx-auto px-4 py-8 max-w-5xl space-y-6">
        <div>
          <Link
            href="/dashboard"
            className="inline-flex items-center text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="mr-1.5 size-3.5" />
            Back to Dashboard
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Form Builder (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            <Card className="border-border shadow-sm">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-2 text-emerald-700 text-xs font-semibold">
                  <ShieldCheck className="size-4" />
                  <span>Legally Enforceable Escrow Contract</span>
                </div>
                <CardTitle className="text-2xl font-bold tracking-tight">
                  Draft New Escrow Deal
                </CardTitle>
                <CardDescription className="text-xs">
                  Define your deliverables and pricing. Your client will deposit the full amount
                  via UPI before you begin work.
                </CardDescription>
              </CardHeader>

              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-5">
                  {/* Title */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center">
                      <Label htmlFor="title" className="text-xs font-semibold">
                        Contract Title *
                      </Label>
                      <span className="text-[0.68rem] text-muted-foreground font-mono">
                        {title.length}/80
                      </span>
                    </div>
                    <Input
                      id="title"
                      placeholder="e.g. 3 Custom Logo Concepts + Vector SVG Exports"
                      maxLength={80}
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      disabled={isSubmitting}
                      className="text-sm h-10"
                      required
                    />
                  </div>

                  {/* Agreed Scope with AI Hint */}
                  <div className="space-y-2">
                    <Label htmlFor="description" className="text-xs font-semibold">
                      Agreed Scope &amp; Deliverables *
                    </Label>

                    {/* Panchayat AI Helper Banner */}
                    <div className="rounded-xl bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-200/80 p-3.5 flex gap-2.5 items-start">
                      <Sparkles className="size-4 text-emerald-600 shrink-0 mt-0.5" />
                      <p className="text-xs text-emerald-900 dark:text-emerald-200 leading-relaxed">
                        <strong>Panchayat AI Guideline:</strong> Clearly state formats, quantity, and revision
                        limits (e.g. &ldquo;Figma source link + 2 rounds of design revisions&rdquo;). In case of a dispute,
                        our AI reads this exact contract scope to arbitrate fairly.
                      </p>
                    </div>

                    <Textarea
                      id="description"
                      rows={5}
                      placeholder="Detail exact specifications: files included, timelines, specific milestone criteria, and revision limits..."
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      disabled={isSubmitting}
                      className="text-xs leading-relaxed"
                      required
                    />
                  </div>

                  {/* Escrow Amount */}
                  <div className="space-y-1.5">
                    <Label htmlFor="amount" className="text-xs font-semibold">
                      Total Escrow Value (₹) *
                    </Label>
                    <div className="relative">
                      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground font-bold text-base">
                        ₹
                      </span>
                      <Input
                        id="amount"
                        type="number"
                        min="100"
                        step="100"
                        placeholder="5000"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        disabled={isSubmitting}
                        className="pl-8 text-lg font-bold h-11"
                        required
                      />
                    </div>
                    <p className="text-[0.7rem] text-muted-foreground">
                      Client deposits 100% of this amount into Tijori Nodal Escrow upon receiving the deal link.
                    </p>
                  </div>

                  {/* Submit actions */}
                  <div className="flex items-center justify-end gap-3 pt-4 border-t">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => router.push("/dashboard")}
                      disabled={isSubmitting}
                      className="text-xs"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white min-w-[150px] text-xs font-semibold shadow-sm"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="mr-2 size-4 animate-spin" />
                          Publishing…
                        </>
                      ) : (
                        <>
                          Publish Escrow Deal
                          <ArrowRight className="ml-1.5 size-3.5" />
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Right Column: Live Client Preview (5 cols) */}
          <div className="lg:col-span-5 space-y-4">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
              <Eye className="size-3.5" />
              <span>Live Client View Preview</span>
            </div>

            <Card className="border-border/80 bg-card/60 shadow-md">
              <CardContent className="p-5 space-y-4">
                <div className="flex items-center justify-between border-b pb-3">
                  <Badge variant="outline" className="text-[0.68rem] bg-gray-100 text-gray-700 border-0">
                    Awaiting Payment
                  </Badge>
                  <span className="text-xs text-muted-foreground">Tijori Escrow Protect</span>
                </div>

                <div className="space-y-1">
                  <h3 className="text-lg font-bold text-foreground">
                    {title || "Your Contract Title Will Appear Here"}
                  </h3>
                  <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
                    {validAmount ? formatRupees(numAmount) : "₹0"}
                  </p>
                </div>

                {/* Banner preview */}
                <div className="rounded-xl bg-gray-50 dark:bg-gray-900/40 p-3 text-xs text-muted-foreground flex items-center gap-2 border border-border/60">
                  <Lock className="size-4 text-muted-foreground shrink-0" />
                  <span>Funds will be held safely in Tijori Escrow once paid.</span>
                </div>

                {/* Scope preview */}
                <div className="space-y-1">
                  <span className="text-[0.7rem] font-semibold uppercase tracking-wider text-muted-foreground">
                    Deliverables &amp; Scope
                  </span>
                  <div className="rounded-lg bg-muted/40 p-3 text-xs text-muted-foreground leading-relaxed min-h-[90px] whitespace-pre-wrap">
                    {description || "Deliverables specifications and agreed terms will be displayed to your client here."}
                  </div>
                </div>

                <div className="pt-2 text-xs text-muted-foreground border-t flex items-center justify-between">
                  <span>Seller: <strong>{userName}</strong></span>
                  <span className="flex items-center gap-1 text-emerald-600">
                    <CheckCircle2 className="size-3" /> Escrow Verified
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
