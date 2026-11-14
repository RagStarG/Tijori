import {
  Plus,
  Wallet,
  Package,
  AlertTriangle,
  CheckCircle,
  Bot,
  Gavel,
  type LucideIcon,
  Circle,
} from "lucide-react";
import { timeAgo } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { TimelineEvent } from "@/lib/types";

const iconMap: Record<string, LucideIcon> = {
  plus: Plus,
  wallet: Wallet,
  package: Package,
  "alert-triangle": AlertTriangle,
  "check-circle": CheckCircle,
  bot: Bot,
  gavel: Gavel,
};

interface TimelineProps {
  events: TimelineEvent[];
}

export function Timeline({ events }: TimelineProps) {
  return (
    <div className="relative space-y-0">
      {events.map((event, index) => {
        const Icon = (event.icon && iconMap[event.icon]) || Circle;
        const isLast = index === events.length - 1;

        return (
          <div key={event.id} className="relative flex gap-4 pb-6 last:pb-0">
            {/* Vertical line */}
            {!isLast && (
              <div className="absolute left-[11px] top-6 h-[calc(100%-12px)] w-px bg-border" />
            )}

            {/* Dot / Icon */}
            <div
              className={cn(
                "relative z-10 flex size-6 shrink-0 items-center justify-center rounded-full bg-muted ring-2 ring-background"
              )}
            >
              <Icon className="size-3 text-muted-foreground" />
            </div>

            {/* Content */}
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
  );
}
