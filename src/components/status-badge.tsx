import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { DealStatus } from "@/lib/types";

interface StatusConfig {
  label: string;
  classes: string;
}

const statusMap: Record<DealStatus, StatusConfig> = {
  CREATED: {
    label: "Awaiting payment",
    classes: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300",
  },
  FUNDED: {
    label: "In escrow",
    classes: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
  },
  DELIVERED: {
    label: "Delivered",
    classes: "bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300",
  },
  COMPLETED: {
    label: "Completed",
    classes: "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300",
  },
  DISPUTED: {
    label: "Disputed",
    classes: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300",
  },
  RESOLVED_RELEASED: {
    label: "Resolved",
    classes: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
  },
  RESOLVED_REFUNDED: {
    label: "Resolved",
    classes: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
  },
  RESOLVED_SPLIT: {
    label: "Resolved",
    classes: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
  },
};

interface StatusBadgeProps {
  status: DealStatus;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusMap[status];

  return (
    <Badge
      className={cn(
        "border-0 text-[0.7rem] font-semibold",
        config.classes,
        className
      )}
    >
      {config.label}
    </Badge>
  );
}
