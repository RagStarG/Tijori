"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Gavel, AlertCircle, Bot, Sparkles, Scale, CheckCircle2 } from "lucide-react";
import { formatRupees } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { AiVerdict, VerdictType } from "@/lib/types";

interface AiVerdictCardProps {
  verdict: AiVerdict | null;
  dealAmount: number;
  onAccept: () => void;
}

const verdictMeta: Record<
  VerdictType,
  { label: string; badgeClass: string; title: string }
> = {
  RELEASE: {
    label: "Full Release to Freelancer",
    badgeClass: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border-emerald-300",
    title: "100% Freelancer Payout",
  },
  REFUND: {
    label: "Full Refund to Client",
    badgeClass: "bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300 border-red-300",
    title: "100% Client Refund",
  },
  SPLIT: {
    label: "Pro-Rata Settlement Split",
    badgeClass: "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border-amber-300",
    title: "Equitable Milestone Split",
  },
};

export function AiVerdictCard({ verdict, dealAmount, onAccept }: AiVerdictCardProps) {
  if (!verdict) {
    return (
      <Card className="border-dashed border-border/80">
        <CardContent className="flex items-center gap-3 py-6">
          <AlertCircle className="size-5 shrink-0 text-muted-foreground" />
          <div className="space-y-0.5">
            <p className="text-sm font-semibold text-foreground">AI Evaluation Unavailable</p>
            <p className="text-xs text-muted-foreground">
              Please proceed with manual arbitrator evaluation and resolution.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const meta = verdictMeta[verdict.verdict];
  const sellerPct = Math.round((verdict.sellerAmount / dealAmount) * 100);
  const buyerPct = 100 - sellerPct;

  return (
    <Card className="border-amber-300/80 bg-gradient-to-br from-amber-50/30 via-card to-card shadow-sm ring-1 ring-amber-400/20">
      <CardContent className="p-5 flex flex-col gap-4">
        {/* Header */}
        <div className="flex items-start justify-between gap-2 border-b pb-3">
          <div className="flex items-center gap-2">
            <div className="size-8 rounded-lg bg-amber-100 dark:bg-amber-950/60 text-amber-700 flex items-center justify-center shrink-0">
              <Bot className="size-4" />
            </div>
            <div>
              <h3 className="text-xs font-bold tracking-tight flex items-center gap-1.5">
                Panchayat AI™ Advisory
                <Sparkles className="size-3 text-amber-500" />
              </h3>
              <p className="text-[0.68rem] text-muted-foreground">Neural Contract Verification</p>
            </div>
          </div>

          <Badge className={cn("text-[0.68rem] font-bold border", meta.badgeClass)}>
            {meta.label}
          </Badge>
        </div>

        {/* Visual Split Bar */}
        <div className="space-y-2 rounded-xl bg-background/80 p-3 border border-border/60">
          <div className="flex justify-between text-xs font-semibold">
            <span className="text-emerald-700 flex items-center gap-1">
              Freelancer: {formatRupees(verdict.sellerAmount)} ({sellerPct}%)
            </span>
            <span className="text-blue-700 flex items-center gap-1">
              Client: {formatRupees(verdict.buyerAmount)} ({buyerPct}%)
            </span>
          </div>

          <div className="flex h-2.5 w-full overflow-hidden rounded-full bg-muted">
            <div
              className="rounded-l-full bg-emerald-500 transition-all duration-500"
              style={{ width: `${sellerPct}%` }}
            />
            <div
              className="rounded-r-full bg-blue-500 transition-all duration-500"
              style={{ width: `${buyerPct}%` }}
            />
          </div>
        </div>

        {/* Reasoning */}
        <div className="space-y-1">
          <p className="text-[0.7rem] uppercase tracking-wider font-semibold text-muted-foreground">
            Arbitration Rationale
          </p>
          <div className="rounded-lg bg-muted/40 p-3 text-xs leading-relaxed text-foreground border border-border/40">
            {verdict.reasoning}
          </div>
        </div>

        {/* Legal Disclaimer */}
        <p className="text-[0.68rem] italic text-muted-foreground/80 leading-tight">
          ⚖️ AI suggestions are non-binding recommendations. The platform arbitrator holds final discretion to ratify or modify this ruling.
        </p>

        {/* Accept Button */}
        <Button onClick={onAccept} className="w-full gap-2 text-xs font-semibold h-10 shadow-sm bg-amber-600 hover:bg-amber-700 text-white">
          <Gavel className="size-4" />
          Ratify &amp; Execute Panchayat Ruling
        </Button>
      </CardContent>
    </Card>
  );
}
