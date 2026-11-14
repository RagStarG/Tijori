"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import { Navbar } from "@/components/navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  ShieldCheck,
  ArrowLeft,
  Loader2,
  CheckCircle2,
  Smartphone,
  QrCode,
  Lock,
  ArrowRight,
  Building,
  AlertTriangle,
  CheckCircle,
  XCircle,
  ExternalLink,
  SmartphoneNfc,
  CreditCard,
} from "lucide-react";
import { toast } from "sonner";
import { formatRupees } from "@/lib/format";
import { getStoredDeal, updateStoredDeal } from "@/lib/storage";
import { useAuth } from "@/lib/auth-context";
import type { Deal, TimelineEvent } from "@/lib/types";
import { cn } from "@/lib/utils";

type PaymentState = "idle" | "processing" | "success" | "failed";
type PaymentMethod = "upi" | "qr" | "netbanking" | "card";

interface PaymentPageContentProps {
  deal: Deal;
}

function PaymentPageContent({ deal }: PaymentPageContentProps) {
  const router = useRouter();
  const { user } = useAuth();
  const userName = user?.name || "Demo Buyer";

  const [paymentState, setPaymentState] = useState<PaymentState>("idle");
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>("upi");
  const [vpa, setVpa] = useState("");
  const [transactionRef, setTransactionRef] = useState("");
  const [selectedApp, setSelectedApp] = useState("gpay");
  const [showSuccessDetails, setShowSuccessDetails] = useState(false);

  const isOwnDeal = deal.sellerName === userName;
  const isAlreadyFunded = ["FUNDED", "DELIVERED", "COMPLETED", "DISPUTED", "RESOLVED_RELEASED", "RESOLVED_REFUNDED", "RESOLVED_SPLIT"].includes(deal.status);

  const handlePayment = async () => {
    if (isAlreadyFunded) {
      toast.error("This deal has already been funded");
      return;
    }

    if (isOwnDeal) {
      toast.error("You cannot fund your own deal");
      return;
    }

    setPaymentState("processing");
    const fakeUtr = `UTR${Math.floor(100000000000 + Math.random() * 900000000000)}`;
    setTransactionRef(fakeUtr);

    // Simulate payment processing
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Simulate 95% success rate
    const success = Math.random() > 0.05;

    if (success) {
      setPaymentState("success");

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

      updateStoredDeal(updated);

      setTimeout(() => {
        setShowSuccessDetails(true);
      }, 500);

      setTimeout(() => {
        router.push(`/deal/${deal.id}`);
        router.refresh();
      }, 3000);
    } else {
      setPaymentState("failed");
      toast.error("Payment failed. Please try again.");
      setTimeout(() => setPaymentState("idle"), 2000);
    }
  };

  const handleBackToDeal = () => {
    router.push(`/deal/${deal.id}`);
  };

  if (isAlreadyFunded) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Navbar />
        <main className="flex-1 flex items-center justify-center px-4 py-12">
          <Card className="max-w-md w-full border-emerald-200 bg-emerald-50/50 dark:border-emerald-900/40 dark:bg-emerald-950/20">
            <CardContent className="pt-8 pb-10 px-6 text-center space-y-4">
              <div className="size-16 rounded-full bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 mx-auto flex items-center justify-center">
                <CheckCircle className="size-8" />
              </div>
              <h2 className="text-xl font-bold text-emerald-900 dark:text-emerald-200">
                Deal Already Funded
              </h2>
              <p className="text-sm text-emerald-700 dark:text-emerald-300">
                This deal has already been funded and is in escrow. You cannot make another payment.
              </p>
              <div className="flex gap-3 justify-center pt-2">
                <Button variant="outline" onClick={handleBackToDeal} className="text-xs">
                  <ArrowLeft className="mr-1.5 size-3.5" />
                  Back to Deal
                </Button>
                <Button onClick={handleBackToDeal} className="text-xs bg-emerald-600 hover:bg-emerald-700">
                  View Deal Details
                  <ArrowRight className="ml-1.5 size-3.5" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  if (isOwnDeal) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Navbar />
        <main className="flex-1 flex items-center justify-center px-4 py-12">
          <Card className="max-w-md w-full border-amber-200 bg-amber-50/50 dark:border-amber-900/40 dark:bg-amber-950/20">
            <CardContent className="pt-8 pb-10 px-6 text-center space-y-4">
              <div className="size-16 rounded-full bg-amber-100 dark:bg-amber-900/50 text-amber-600 mx-auto flex items-center justify-center">
                <AlertTriangle className="size-8" />
              </div>
              <h2 className="text-xl font-bold text-amber-900 dark:text-amber-200">
                Cannot Fund Own Deal
              </h2>
              <p className="text-sm text-amber-700 dark:text-amber-300">
                As the seller of this deal, you cannot fund your own escrow. Share the link with your buyer to initiate payment.
              </p>
              <Button variant="outline" onClick={handleBackToDeal} className="text-xs">
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

        {/* Demo Warning Banner */}
        <div className="rounded-xl bg-amber-50/80 dark:bg-amber-950/40 border border-amber-200/80 dark:border-amber-800/40 p-4 flex items-start gap-3 ring-1 ring-amber-300/40">
          <AlertTriangle className="size-5 shrink-0 text-amber-600 dark:text-amber-400 mt-0.5" />
          <div className="flex-1 space-y-1">
            <p className="font-semibold text-amber-900 dark:text-amber-200 text-sm">
              DEMO PAYMENT — NO REAL MONEY WILL BE TRANSFERRED
            </p>
            <p className="text-xs text-amber-800 dark:text-amber-300">
              This is a simulated UPI payment for demonstration purposes. No actual funds will be debited from your account.
              A mock transaction reference will be generated upon "payment".
            </p>
          </div>
        </div>

        {/* Deal Summary Card */}
        <Card className="border-border shadow-sm">
          <CardHeader className="pb-3 border-b">
            <div className="flex items-center justify-between gap-2">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <ShieldCheck className="size-4 text-primary" />
                Escrow Payment
              </CardTitle>
              <Badge variant="outline" className="text-[0.65rem] font-medium text-muted-foreground">
                Tijori Secure Escrow
              </Badge>
            </div>
            <CardDescription className="text-xs">
              Fund the escrow for <strong>{deal.title}</strong>. Your payment will be held securely until deliverables are approved.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-4 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <span className="text-[0.7rem] font-medium uppercase tracking-wider text-muted-foreground">Deal Amount</span>
                <p className="text-3xl font-black text-foreground">{formatRupees(deal.amount)}</p>
              </div>
              <div className="space-y-1 text-right">
                <span className="text-[0.7rem] font-medium uppercase tracking-wider text-muted-foreground">Seller</span>
                <p className="font-semibold text-foreground">{deal.sellerName}</p>
              </div>
            </div>

            <Separator />

            <div className="rounded-xl bg-muted/40 p-4 text-xs space-y-2">
              <div className="flex items-center justify-between text-muted-foreground">
                <span>Platform Fee</span>
                <span className="font-medium text-foreground">₹0 (Demo)</span>
              </div>
              <div className="flex items-center justify-between text-muted-foreground">
                <span>GST</span>
                <span className="font-medium text-foreground">₹0 (Demo)</span>
              </div>
              <div className="border-t border-border pt-2 flex items-center justify-between">
                <span className="font-semibold text-foreground">Total Payable</span>
                <span className="text-lg font-black text-primary">{formatRupees(deal.amount)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Payment Methods */}
        <Card className="border-border shadow-sm">
          <CardHeader className="pb-3 border-b">
            <CardTitle className="text-sm font-bold flex items-center gap-2">
              <Smartphone className="size-4 text-muted-foreground" />
              Select Payment Method
            </CardTitle>
            <CardDescription className="text-xs">
              Choose how you'd like to fund the escrow. All methods route through Tijori's secure nodal account.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-4">
            <Tabs defaultValue="upi" value={selectedMethod} onValueChange={setSelectedMethod} className="w-full">
              <TabsList className="grid grid-cols-2 sm:grid-cols-4 h-9 text-xs">
                <TabsTrigger value="upi" className="text-xs gap-1.5">
                  <Smartphone className="size-3.5" />
                  UPI Apps
                </TabsTrigger>
                <TabsTrigger value="qr" className="text-xs gap-1.5">
                  <QrCode className="size-3.5" />
                  Scan QR
                </TabsTrigger>
                <TabsTrigger value="netbanking" className="text-xs gap-1.5">
                  <Building className="size-3.5" />
                  Net Banking
                </TabsTrigger>
                <TabsTrigger value="card" className="text-xs gap-1.5">
                  <CreditCard className="size-3.5" />
                  Card
                </TabsTrigger>
              </TabsList>

              {/* UPI Apps Tab */}
              <TabsContent value="upi" className="space-y-4 pt-4">
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: "gpay", name: "Google Pay", color: "border-blue-200 hover:bg-blue-50/40 dark:hover:bg-blue-950/20", icon: "G" },
                    { id: "phonepe", name: "PhonePe", color: "border-purple-200 hover:bg-purple-50/40 dark:hover:bg-purple-950/20", icon: "Pe" },
                    { id: "paytm", name: "Paytm UPI", color: "border-cyan-200 hover:bg-cyan-50/40 dark:hover:bg-cyan-950/20", icon: "PY" },
                    { id: "bhim", name: "BHIM / Other", color: "border-border hover:bg-muted/40", icon: "BHIM" },
                  ].map((app) => (
                    <button
                      key={app.id}
                      type="button"
                      onClick={() => setSelectedApp(app.id)}
                      className={cn(
                        "p-3 rounded-xl border text-xs font-semibold text-left transition-all flex items-center justify-between",
                        selectedApp === app.id
                          ? "border-primary bg-primary/5 dark:bg-primary/10 text-primary ring-1 ring-primary/20"
                          : `${app.color} text-foreground`
                      )}
                    >
                      <div className="flex items-center gap-2">
                        <div className="size-8 rounded-lg bg-background flex items-center justify-center font-bold text-[0.7rem] border">
                          {app.icon}
                        </div>
                        <span>{app.name}</span>
                      </div>
                      {selectedApp === app.id && <CheckCircle2 className="size-4 text-primary" />}
                    </button>
                  ))}
                </div>

                <div className="space-y-1.5 pt-2 border-t">
                  <Label htmlFor="vpa" className="text-[0.7rem] text-muted-foreground block">
                    Or pay using Virtual Payment Address (VPA)
                  </Label>
                  <Input
                    id="vpa"
                    value={vpa}
                    onChange={(e) => setVpa(e.target.value)}
                    placeholder="username@upi"
                    className="text-xs h-9 font-mono"
                    disabled={paymentState === "processing"}
                  />
                </div>
              </TabsContent>

              {/* QR Code Tab */}
              <TabsContent value="qr" className="space-y-4 pt-4 text-center">
                <div className="size-52 mx-auto rounded-2xl bg-white p-4 shadow-inner ring-1 ring-border flex flex-col items-center justify-center">
                  <div className="size-44 bg-gradient-to-br from-gray-900 to-black rounded-lg p-3 flex flex-col justify-between relative overflow-hidden">
                    {/* QR Pattern Simulation */}
                    <div className="grid grid-cols-8 gap-1">
                      {Array.from({ length: 64 }).map((_, i) => (
                        <div
                          key={i}
                          className={Math.random() > 0.5 ? "bg-white rounded-sm" : "bg-transparent"}
                          style={{ opacity: Math.random() > 0.3 ? 1 : 0.3 }}
                        />
                      ))}
                    </div>
                    <div className="text-[0.55rem] font-mono text-white text-center font-bold tracking-widest">
                      TIJORI-PAY
                    </div>
                    <div className="flex justify-between items-end">
                      <div className="size-6 bg-white rounded-sm border-2 border-black" />
                      <div className="size-4 bg-primary rounded-sm" />
                    </div>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">
                  Scan with any UPI app to transfer <strong className="text-foreground">{formatRupees(deal.amount)}</strong>
                </p>
                <p className="text-[0.7rem] text-muted-foreground/70">
                  Demo QR — not a real payment code
                </p>
              </TabsContent>

              {/* Net Banking Tab */}
              <TabsContent value="netbanking" className="space-y-3 pt-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {[
                    { name: "HDFC Bank", color: "border-blue-200" },
                    { name: "ICICI Bank", color: "border-orange-200" },
                    { name: "SBI", color: "border-blue-200" },
                    { name: "Axis Bank", color: "border-red-200" },
                    { name: "Kotak Bank", color: "border-red-200" },
                    { name: "Other Bank", color: "border-border" },
                  ].map((bank, idx) => (
                    <button
                      key={idx}
                      type="button"
                      className={`p-3 rounded-xl border text-sm font-medium text-left transition-all ${bank.color} hover:bg-muted/40 text-foreground`}
                      disabled={paymentState === "processing"}
                    >
                      {bank.name}
                    </button>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground text-center">
                  Redirects to bank portal (simulated in demo)
                </p>
              </TabsContent>

              {/* Card Tab */}
              <TabsContent value="card" className="space-y-3 pt-4 text-center">
                <div className="rounded-xl bg-muted/40 p-8 flex flex-col items-center gap-3">
                  <CreditCard className="size-12 text-muted-foreground/50" />
                  <p className="text-sm text-muted-foreground">Card payment simulation</p>
                  <p className="text-[0.7rem] text-muted-foreground/70">Demo mode — no real card processing</p>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Security Badges */}
        <div className="flex flex-wrap items-center justify-center gap-3 text-[0.7rem] text-muted-foreground">
          <span className="flex items-center gap-1">
            <Lock className="size-3 text-primary" />
            256-bit Encryption
          </span>
          <span className="flex items-center gap-1">
            <ShieldCheck className="size-3 text-emerald-600" />
            RBI Compliant Escrow
          </span>
          <span className="flex items-center gap-1">
            <Building className="size-3 text-blue-600" />
            Nodal Account Protection
          </span>
          <span className="flex items-center gap-1">
            <CheckCircle className="size-3 text-emerald-600" />
            Zero Platform Fees
          </span>
        </div>

        {/* Pay Button */}
        {paymentState === "idle" && (
          <Button
            onClick={handlePayment}
            size="lg"
            className="w-full bg-gradient-to-r from-primary to-emerald-600 hover:from-primary/90 hover:to-emerald-700 text-white font-bold text-sm h-12 gap-2 shadow-lg shadow-primary/25"
          >
            Pay {formatRupees(deal.amount)} via {selectedApp === "gpay" ? "Google Pay" : selectedApp === "phonepe" ? "PhonePe" : selectedApp === "paytm" ? "Paytm" : "UPI"} Escrow
            <ArrowRight className="size-4" />
          </Button>
        )}

        {/* Processing State */}
        {paymentState === "processing" && (
          <Card className="border-primary/40 bg-primary/5 dark:bg-primary/10 shadow-lg">
            <CardContent className="pt-8 pb-10 px-6 text-center space-y-4">
              <div className="relative mx-auto">
                <Loader2 className="size-12 animate-spin text-primary" />
                <div className="absolute inset-0 rounded-full border-4 border-primary border-t-transparent animate-spin" />
              </div>
              <div className="space-y-1">
                <p className="text-lg font-semibold text-foreground">Processing Secure Payment…</p>
                <p className="text-xs text-muted-foreground">
                  Connecting to NPCI UPI network for automated nodal escrow hold
                </p>
              </div>
              <div className="rounded-lg bg-muted/60 p-2.5 px-4 text-xs font-mono text-muted-foreground">
                Ref No: <span className="font-bold text-foreground">{transactionRef || "Generating..."}</span>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Success State */}
        {paymentState === "success" && showSuccessDetails && (
          <Card className="border-emerald-200 bg-emerald-50/50 dark:border-emerald-900/40 dark:bg-emerald-950/20 shadow-lg">
            <CardContent className="pt-8 pb-10 px-6 text-center space-y-4 animate-in zoom-in-95 fade-in duration-300">
              <div className="size-16 rounded-full bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 mx-auto flex items-center justify-center ring-4 ring-emerald-50">
                <CheckCircle2 className="size-9" />
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-bold text-foreground">Escrow Deposit Confirmed</h3>
                <p className="text-xs text-muted-foreground">
                  Funds securely credited to Tijori Escrow Nodal Account
                </p>
              </div>
              <div className="rounded-lg bg-muted/60 p-2.5 px-4 text-xs font-mono text-muted-foreground">
                Ref No: <span className="font-bold text-foreground">{transactionRef}</span>
              </div>
              <div className="text-[0.7rem] text-emerald-700 dark:text-emerald-300">
                Redirecting to deal details in 2 seconds...
              </div>
            </CardContent>
          </Card>
        )}

        {/* Failed State */}
        {paymentState === "failed" && (
          <Card className="border-red-200 bg-red-50/50 dark:border-red-900/40 dark:bg-red-950/20">
            <CardContent className="pt-6 pb-8 px-6 text-center space-y-3">
              <div className="size-12 rounded-full bg-red-100 dark:bg-red-900/50 text-red-600 mx-auto flex items-center justify-center">
                <XCircle className="size-6" />
              </div>
              <p className="font-semibold text-red-900 dark:text-red-200">Payment Failed</p>
              <p className="text-xs text-red-700 dark:text-red-300">Unable to process the payment. Please try again or use a different method.</p>
              <Button variant="outline" size="sm" onClick={() => setPaymentState("idle")} className="text-xs">
                Try Again
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Footer Note */}
        <p className="text-center text-[0.65rem] text-muted-foreground/60 max-w-sm mx-auto">
          By proceeding, you agree to Tijori's Escrow Terms. Funds are held in a regulated nodal account
          and released only upon mutual approval or Panchayat AI arbitration.
        </p>
      </main>
    </div>
  );
}

function PaymentPageLoader() {
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
          <div className="space-y-6">
            <div className="animate-pulse space-y-4">
              <div className="h-4 w-48 bg-muted rounded" />
              <div className="h-12 w-full bg-muted rounded-xl" />
              <div className="h-40 bg-muted rounded-xl" />
            </div>
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
              <Button onClick={() => window.history.back()} className="text-xs">
                Go Back
              </Button>
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
          <div className="space-y-6">
            <div className="animate-pulse space-y-4">
              <div className="h-4 w-48 bg-muted rounded" />
              <div className="h-12 w-full bg-muted rounded-xl" />
              <div className="h-40 bg-muted rounded-xl" />
            </div>
          </div>
        </main>
      </div>
    }>
      <PaymentPageContent deal={deal} />
    </Suspense>
  );
}

export default PaymentPageLoader;