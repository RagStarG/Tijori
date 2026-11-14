"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/navbar";
import { DealCard } from "@/components/deal-card";
import { DashboardSkeleton } from "@/components/loading-skeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Plus,
  ArrowRight,
  TrendingUp,
  Lock,
  CheckCircle2,
  AlertTriangle,
  FolderOpen,
  ShieldAlert,
  Scale,
  RefreshCw,
  Search,
  ShieldCheck,
  Briefcase,
  ShoppingBag,
} from "lucide-react";
import { toast } from "sonner";
import { formatRupees } from "@/lib/format";
import { fetchDeals } from "@/lib/api";
import { getStoredDeals } from "@/lib/storage";
import { useAuth } from "@/lib/auth-context";
import type { Deal, Role } from "@/lib/types";

export default function DashboardPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();

  const [mounted, setMounted] = useState(false);
  const [deals, setDeals] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filter tabs for seller/admin
  const [filterTab, setFilterTab] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Buyer deal link input
  const [dealInput, setDealInput] = useState<string>("");

  const role = user?.role || "SELLER";
  const userName = user?.name || "Arjun Verma";

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const apiDeals = await fetchDeals().catch(() => null);
      if (apiDeals && Array.isArray(apiDeals) && apiDeals.length > 0) {
        setDeals(apiDeals);
      } else {
        const localDeals = getStoredDeals();
        setDeals(localDeals);
      }
    } catch {
      const localDeals = getStoredDeals();
      setDeals(localDeals);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setMounted(true);
    loadData();
  }, []);

  // Filtered deals according to active role
  const roleDeals = useMemo(() => {
    if (!deals) return [];
    if (role === "SELLER") {
      return deals.filter(
        (d) =>
          d.sellerName.toLowerCase() === userName.toLowerCase() ||
          d.sellerName.toLowerCase().includes("arjun") ||
          d.sellerName === "Demo User"
      );
    } else if (role === "BUYER") {
      return deals.filter(
        (d) =>
          (d.buyerName &&
            (d.buyerName.toLowerCase() === userName.toLowerCase() ||
              d.buyerName.toLowerCase().includes("rohan") ||
              d.buyerName === "Demo User")) ||
          d.status === "CREATED"
      );
    } else {
      // Admin sees everything
      return deals;
    }
  }, [deals, role, userName]);

  // Tab & search-filtered deals for seller
  const sellerFilteredDeals = useMemo(() => {
    let result = roleDeals;
    if (filterTab === "awaiting") {
      result = roleDeals.filter((d) => d.status === "CREATED");
    } else if (filterTab === "progress") {
      result = roleDeals.filter((d) => d.status === "FUNDED" || d.status === "DELIVERED");
    } else if (filterTab === "completed") {
      result = roleDeals.filter(
        (d) => d.status === "COMPLETED" || d.status.startsWith("RESOLVED_")
      );
    } else if (filterTab === "disputed") {
      result = roleDeals.filter((d) => d.status === "DISPUTED");
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (d) => d.title.toLowerCase().includes(q) || d.description.toLowerCase().includes(q)
      );
    }
    return result;
  }, [roleDeals, filterTab, searchQuery]);

  // Admin: split into disputed vs others
  const disputedDeals = useMemo(() => {
    return deals.filter((d) => d.status === "DISPUTED");
  }, [deals]);

  const otherAdminDeals = useMemo(() => {
    let result = deals.filter((d) => d.status !== "DISPUTED");
    if (filterTab === "active") {
      result = result.filter((d) => d.status === "CREATED" || d.status === "FUNDED" || d.status === "DELIVERED");
    } else if (filterTab === "completed") {
      result = result.filter((d) => d.status === "COMPLETED" || d.status.startsWith("RESOLVED_"));
    }
    return result;
  }, [deals, filterTab]);

  // Stats calculation
  const stats = useMemo(() => {
    const escrowStatuses = ["FUNDED", "DELIVERED", "DISPUTED"];
    const completedStatuses = ["COMPLETED", "RESOLVED_RELEASED", "RESOLVED_SPLIT"];

    if (role === "SELLER") {
      const inEscrow = roleDeals
        .filter((d) => escrowStatuses.includes(d.status))
        .reduce((sum, d) => sum + d.amount, 0);
      const earned = roleDeals
        .filter((d) => completedStatuses.includes(d.status))
        .reduce((sum, d) => sum + d.amount, 0);
      const disputes = roleDeals.filter((d) => d.status === "DISPUTED").length;

      return [
        { label: "Active Contracts", value: roleDeals.length.toString(), icon: FolderOpen, subtitle: "Total agreements" },
        { label: "Secured in Escrow", value: formatRupees(inEscrow), icon: Lock, highlight: true, subtitle: "100% bank-backed" },
        { label: "Settled Payouts", value: formatRupees(earned), icon: TrendingUp, subtitle: "Disbursed via UPI" },
        { label: "Disputed Deals", value: disputes.toString(), icon: AlertTriangle, alert: disputes > 0, subtitle: disputes > 0 ? "Under Panchayat AI" : "Zero active disputes" },
      ];
    } else if (role === "BUYER") {
      const activeDeals = roleDeals.filter(
        (d) => d.status === "FUNDED" || d.status === "DELIVERED"
      ).length;
      const inEscrow = roleDeals
        .filter((d) => escrowStatuses.includes(d.status))
        .reduce((sum, d) => sum + d.amount, 0);
      const completed = roleDeals.filter((d) => completedStatuses.includes(d.status)).length;
      const disputes = roleDeals.filter((d) => d.status === "DISPUTED").length;

      return [
        { label: "Active Orders", value: activeDeals.toString(), icon: FolderOpen, subtitle: "In development" },
        { label: "Locked in Escrow", value: formatRupees(inEscrow), icon: Lock, highlight: true, subtitle: "Released on your approval" },
        { label: "Completed Deals", value: completed.toString(), icon: CheckCircle2, subtitle: "Successfully fulfilled" },
        { label: "Disputed Items", value: disputes.toString(), icon: AlertTriangle, alert: disputes > 0, subtitle: disputes > 0 ? "Under mediation" : "Zero disputes" },
      ];
    } else {
      const openDisputes = deals.filter((d) => d.status === "DISPUTED").length;
      const resolved = deals.filter((d) => d.status.startsWith("RESOLVED_")).length;
      const inEscrow = deals
        .filter((d) => escrowStatuses.includes(d.status))
        .reduce((sum, d) => sum + d.amount, 0);

      return [
        { label: "Pending Disputes", value: openDisputes.toString(), icon: ShieldAlert, alert: openDisputes > 0, subtitle: "Requires arbitrator ruling" },
        { label: "Resolved Arbitrations", value: resolved.toString(), icon: CheckCircle2, subtitle: "Panchayat settled" },
        { label: "Total Escrow Contracts", value: deals.length.toString(), icon: FolderOpen, subtitle: "Across platform" },
        { label: "Total Vault Value", value: formatRupees(inEscrow), icon: Lock, highlight: true, subtitle: "In nodal accounts" },
      ];
    }
  }, [role, roleDeals, deals]);

  const handleOpenDealInput = (e: React.FormEvent) => {
    e.preventDefault();
    if (!dealInput.trim()) return;

    let id = dealInput.trim();
    if (id.includes("/deals/")) {
      id = id.split("/deals/")[1].split("?")[0].split("#")[0];
    }
    router.push(`/deals/${id}`);
  };

  if (!mounted || authLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="container mx-auto px-4 py-8 max-w-5xl">
          <DashboardSkeleton />
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />

      <main className="flex-1 container mx-auto px-4 py-8 max-w-6xl space-y-8">
        {/* ── Top Executive Header ───────────────────────────────── */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b pb-6">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                Welcome, {userName}
              </h1>
              {user?.isVerified && (
                <Badge className="bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200/60 gap-1 text-[0.68rem] font-semibold">
                  <ShieldCheck className="size-3 text-emerald-600" />
                  Verified KYC
                </Badge>
              )}
            </div>
            <p className="text-xs sm:text-sm text-muted-foreground flex items-center gap-2">
              <span>{user?.roleTitle || "Independent Professional"}</span>
              <span>·</span>
              <span className="capitalize">{role.toLowerCase()} Workspace</span>
              {user?.upiId && (
                <>
                  <span>·</span>
                  <span className="font-mono text-xs">{user.upiId}</span>
                </>
              )}
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <Button
              variant="outline"
              size="sm"
              onClick={loadData}
              disabled={loading}
              className="h-9 px-3 gap-1.5 text-xs border-border"
              title="Sync contracts"
            >
              <RefreshCw className={`size-3.5 ${loading ? "animate-spin" : ""}`} />
              <span className="hidden sm:inline">Sync</span>
            </Button>

            {role === "SELLER" && (
              <Link href="/deals/new">
                <Button className="h-9 bg-emerald-600 hover:bg-emerald-700 text-white gap-2 text-xs font-semibold shadow-sm">
                  <Plus className="size-4" />
                  New Escrow Deal
                </Button>
              </Link>
            )}
          </div>
        </div>

        {/* Loading state */}
        {loading && <DashboardSkeleton />}

        {/* Error state */}
        {!loading && error && (
          <Card className="border-red-200 bg-red-50/50">
            <CardContent className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <AlertTriangle className="size-6 text-red-600 shrink-0" />
                <div>
                  <p className="font-semibold text-red-900 text-sm">Contracts sync interrupted</p>
                  <p className="text-xs text-red-700">{error}</p>
                </div>
              </div>
              <Button variant="outline" size="sm" onClick={loadData}>
                Retry Sync
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Main Dashboard Content */}
        {!loading && !error && (
          <>
            {/* ── Summary Stat Cards ─────────────────────────────── */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {stats.map((stat, i) => {
                const Icon = stat.icon;
                return (
                  <Card
                    key={i}
                    className={`transition-all ${
                      stat.alert
                        ? "border-red-200 bg-red-50/20 dark:bg-red-950/20"
                        : stat.highlight
                        ? "border-emerald-200 bg-emerald-50/20 dark:bg-emerald-950/20"
                        : "border-border/80"
                    }`}
                  >
                    <CardContent className="p-5 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-muted-foreground">
                          {stat.label}
                        </span>
                        <div
                          className={`size-8 rounded-lg flex items-center justify-center ${
                            stat.alert
                              ? "bg-red-100 text-red-700 dark:bg-red-950/60 dark:text-red-300"
                              : stat.highlight
                              ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300"
                              : "bg-muted text-muted-foreground"
                          }`}
                        >
                          <Icon className="size-4" />
                        </div>
                      </div>
                      <div>
                        <p className="text-2xl font-bold tracking-tight text-foreground">
                          {stat.value}
                        </p>
                        <p className="text-[0.7rem] text-muted-foreground mt-0.5">
                          {stat.subtitle}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* ── Buyer Workspace: Quick Paste Deal Link Strip ───── */}
            {role === "BUYER" && (
              <Card className="border-border/80 bg-card shadow-sm">
                <CardContent className="p-4 sm:p-5">
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                    <div className="space-y-0.5">
                      <h3 className="text-sm font-semibold flex items-center gap-1.5">
                        <ShoppingBag className="size-4 text-blue-600" />
                        Open Received Escrow Contract
                      </h3>
                      <p className="text-xs text-muted-foreground">
                        Received a deal link via WhatsApp or email? Paste the deal ID or URL to fund escrow.
                      </p>
                    </div>

                    <form onSubmit={handleOpenDealInput} className="flex gap-2 w-full sm:max-w-md">
                      <Input
                        placeholder="e.g. deal-001 or URL"
                        value={dealInput}
                        onChange={(e) => setDealInput(e.target.value)}
                        className="bg-background text-xs h-9"
                      />
                      <Button type="submit" size="sm" className="bg-primary text-primary-foreground text-xs gap-1 shrink-0 h-9">
                        Open Deal
                        <ArrowRight className="size-3.5" />
                      </Button>
                    </form>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* ── Freelancer / Seller Workspace ─────────────────── */}
            {role === "SELLER" && (
              <div className="space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <Tabs value={filterTab} onValueChange={setFilterTab} className="w-full sm:w-auto">
                    <TabsList className="grid grid-cols-5 w-full sm:w-auto h-9 text-xs">
                      <TabsTrigger value="all" className="text-xs">All ({roleDeals.length})</TabsTrigger>
                      <TabsTrigger value="awaiting" className="text-xs">Awaiting</TabsTrigger>
                      <TabsTrigger value="progress" className="text-xs">In Progress</TabsTrigger>
                      <TabsTrigger value="completed" className="text-xs">Completed</TabsTrigger>
                      <TabsTrigger value="disputed" className="text-xs">Disputed</TabsTrigger>
                    </TabsList>
                  </Tabs>

                  <div className="relative w-full sm:w-64">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
                    <Input
                      placeholder="Search contracts…"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-8 text-xs h-9 bg-card"
                    />
                  </div>
                </div>

                {sellerFilteredDeals.length > 0 ? (
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {sellerFilteredDeals.map((deal) => (
                      <DealCard
                        key={deal.id}
                        deal={deal}
                        counterpartyName={deal.buyerName || "Awaiting Client"}
                      />
                    ))}
                  </div>
                ) : (
                  <Card className="border-dashed py-14 text-center">
                    <CardContent className="flex flex-col items-center gap-3">
                      <div className="size-12 rounded-full bg-muted flex items-center justify-center text-muted-foreground">
                        <FolderOpen className="size-6" />
                      </div>
                      <div>
                        <p className="font-semibold text-base">No contracts in this view</p>
                        <p className="text-xs text-muted-foreground max-w-sm mx-auto mt-1">
                          Draft your first milestone contract and share the secure link with your client.
                        </p>
                      </div>
                      <Link href="/deals/new">
                        <Button className="mt-2 bg-emerald-600 hover:bg-emerald-700 text-white gap-2 text-xs">
                          <Plus className="size-4" />
                          Create New Escrow
                        </Button>
                      </Link>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}

            {/* ── Client / Buyer Workspace ──────────────────────── */}
            {role === "BUYER" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-base font-bold tracking-tight">Your Commissioned Projects</h2>
                  <span className="text-xs text-muted-foreground">{roleDeals.length} Contracts</span>
                </div>

                {roleDeals.length > 0 ? (
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {roleDeals.map((deal) => {
                      const actionNeeded =
                        deal.status === "DELIVERED" || deal.status === "CREATED";
                      return (
                        <DealCard
                          key={deal.id}
                          deal={deal}
                          counterpartyName={deal.sellerName}
                          actionNeeded={actionNeeded}
                        />
                      );
                    })}
                  </div>
                ) : (
                  <Card className="border-dashed py-14 text-center">
                    <CardContent className="flex flex-col items-center gap-3">
                      <FolderOpen className="size-12 text-muted-foreground/40" />
                      <div>
                        <p className="font-semibold text-base">No active orders</p>
                        <p className="text-xs text-muted-foreground max-w-sm mx-auto mt-1">
                          Paste your freelancer&apos;s escrow contract link above to view scope and fund deposit.
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}

            {/* ── Arbitrator / Admin Console ───────────────────── */}
            {role === "ADMIN" && (
              <div className="space-y-8">
                {/* 1. Disputes Needing Ruling */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <ShieldAlert className="size-5 text-red-600" />
                      <h2 className="text-lg font-bold tracking-tight">
                        Disputes Requiring Arbitration ({disputedDeals.length})
                      </h2>
                    </div>
                    {disputedDeals.length > 0 && (
                      <Badge className="bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300 border-0 text-xs">
                        High Priority
                      </Badge>
                    )}
                  </div>

                  {disputedDeals.length > 0 ? (
                    <div className="grid gap-4 sm:grid-cols-2">
                      {disputedDeals.map((deal) => (
                        <Card
                          key={deal.id}
                          className="cursor-pointer border-red-200/80 bg-red-50/10 hover:border-red-300 transition-all shadow-sm"
                          onClick={() => router.push(`/deals/${deal.id}`)}
                        >
                          <CardContent className="p-5 space-y-3.5">
                            <div className="flex items-start justify-between gap-2">
                              <div>
                                <h3 className="font-bold text-base line-clamp-1">{deal.title}</h3>
                                <p className="text-xs text-muted-foreground mt-0.5">
                                  {deal.sellerName} (Seller) vs {deal.buyerName || "Buyer"}
                                </p>
                              </div>
                              <Badge className="bg-red-100 text-red-700 border-0 shrink-0 text-xs font-semibold">
                                DISPUTED
                              </Badge>
                            </div>

                            <p className="text-xl font-extrabold text-foreground">
                              {formatRupees(deal.amount)}
                            </p>

                            {deal.aiVerdict ? (
                              <div className="rounded-xl bg-amber-50/70 dark:bg-amber-950/40 border border-amber-200/80 p-3 text-xs space-y-1.5">
                                <div className="flex items-center justify-between font-semibold text-amber-900 dark:text-amber-200">
                                  <span className="flex items-center gap-1.5">
                                    <Scale className="size-3.5" />
                                    Panchayat AI: {deal.aiVerdict.verdict}
                                  </span>
                                  {deal.aiVerdict.verdict === "SPLIT" && (
                                    <span className="font-mono text-[0.7rem]">
                                      ₹{deal.aiVerdict.sellerAmount} / ₹{deal.aiVerdict.buyerAmount}
                                    </span>
                                  )}
                                </div>
                                <p className="text-muted-foreground line-clamp-2 text-[0.72rem] leading-relaxed">
                                  {deal.aiVerdict.reasoning}
                                </p>
                              </div>
                            ) : (
                              <div className="rounded-lg bg-muted p-2.5 text-xs text-muted-foreground">
                                Manual arbitrator review required
                              </div>
                            )}

                            <Button size="sm" className="w-full gap-1.5 text-xs h-9">
                              Review Evidence &amp; Issue Ruling
                              <ArrowRight className="size-3.5" />
                            </Button>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <Card className="border-dashed py-8 text-center bg-emerald-50/10 border-emerald-200/60">
                      <CardContent className="flex flex-col items-center gap-2">
                        <CheckCircle2 className="size-8 text-emerald-600" />
                        <p className="font-semibold text-base">No pending disputes</p>
                        <p className="text-xs text-muted-foreground">
                          All escrow transactions are progressing smoothly.
                        </p>
                      </CardContent>
                    </Card>
                  )}
                </div>

                {/* 2. Platform Escrow Contracts */}
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <h2 className="text-base font-bold tracking-tight">All Active Platform Contracts</h2>
                    <Tabs value={filterTab} onValueChange={setFilterTab}>
                      <TabsList className="h-8 text-xs">
                        <TabsTrigger value="all" className="text-xs">All</TabsTrigger>
                        <TabsTrigger value="active" className="text-xs">Active</TabsTrigger>
                        <TabsTrigger value="completed" className="text-xs">Completed</TabsTrigger>
                      </TabsList>
                    </Tabs>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {otherAdminDeals.map((deal) => (
                      <DealCard
                        key={deal.id}
                        deal={deal}
                        counterpartyName={`${deal.sellerName} & ${deal.buyerName || "Buyer"}`}
                      />
                    ))}
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
