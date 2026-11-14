import { formatDistanceToNow } from "date-fns";

/** Format ₹ in Indian locale (₹1,50,000) */
export function formatRupees(amount: number): string {
  return "₹" + amount.toLocaleString("en-IN");
}

/** Relative time ("2 hours ago") */
export function timeAgo(iso: string): string {
  return formatDistanceToNow(new Date(iso), { addSuffix: true });
}
