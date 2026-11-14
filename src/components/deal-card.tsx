"use client";

import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "@/components/status-badge";
import { formatRupees, timeAgo } from "@/lib/format";
import { cn } from "@/lib/utils";
import { User, ChevronRight, Clock, ShieldCheck } from "lucide-react";
import type { Deal } from "@/lib/types";

interface DealCardProps {
  deal: Deal;
  counterpartyName: string;
  actionNeeded?: boolean;
}

export function DealCard({ deal, counterpartyName, actionNeeded }: DealCardProps) {
  const router = useRouter();

  return (
    <Card
      className={cn(
        "group cursor-pointer transition-all duration-200 border-border/80 bg-card hover:border-emerald-500/40 hover:shadow-md hover:-translate-y-0.5"
      )}
      onClick={() => router.push(`/deals/${deal.id}`)}
    >
      <CardContent className="p-4 sm:p-5 flex flex-col gap-3.5">
        {/* Top: Deal ID + StatusBadge */}
        <div className="flex items-center justify-between gap-2">
          <span className="font-mono text-[0.68rem] text-muted-foreground uppercase tracking-wider">
            {deal.id}
          </span>
          <StatusBadge status={deal.status} />
        </div>

        {/* Title & Amount */}
        <div className="space-y-1">
          <h3 className="line-clamp-1 font-bold text-base leading-snug group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors">
            {deal.title}
          </h3>
          <p className="text-xl font-extrabold tracking-tight text-foreground">
            {formatRupees(deal.amount)}
          </p>
        </div>

        {/* Bottom row: Counterparty + Timestamp + Action Tag */}
        <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground pt-2 border-t border-border/60">
          <div className="flex items-center gap-1.5 truncate">
            <div className="size-5 rounded-full bg-muted flex items-center justify-center text-[0.6rem] font-bold text-foreground shrink-0">
              {counterpartyName.slice(0, 1).toUpperCase()}
            </div>
            <span className="truncate text-[0.72rem]">{counterpartyName}</span>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            {actionNeeded && (
              <Badge className="border-0 bg-amber-100 text-[0.65rem] font-bold text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                Action Needed
              </Badge>
            )}
            <span className="text-[0.68rem]">{timeAgo(deal.updatedAt)}</span>
            <ChevronRight className="size-3.5 text-muted-foreground group-hover:translate-x-0.5 transition-transform" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
