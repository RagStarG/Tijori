// ── Deal statuses ──────────────────────────────────────────────
export type DealStatus =
  | "CREATED"
  | "FUNDED"
  | "DELIVERED"
  | "COMPLETED"
  | "DISPUTED"
  | "RESOLVED_RELEASED"
  | "RESOLVED_REFUNDED"
  | "RESOLVED_SPLIT";

// ── Role ───────────────────────────────────────────────────────
export type Role = "SELLER" | "BUYER" | "ADMIN";

// ── User / Auth Profile ────────────────────────────────────────
export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  roleTitle?: string;
  upiId?: string;
  phone?: string;
  avatarUrl?: string;
  isVerified: boolean;
  memberSince?: string;
}

// ── AI verdict ─────────────────────────────────────────────────
export type VerdictType = "RELEASE" | "REFUND" | "SPLIT";

export interface AiVerdict {
  verdict: VerdictType;
  sellerAmount: number;
  buyerAmount: number;
  reasoning: string;
}

// ── Timeline event ─────────────────────────────────────────────
export interface TimelineEvent {
  id: string;
  message: string;
  actor: string;
  timestamp: string; // ISO
  icon?: string;
}

// ── Deal ───────────────────────────────────────────────────────
export interface Deal {
  id: string;
  title: string;
  description: string;
  amount: number;
  status: DealStatus;
  sellerName: string;
  buyerName: string | null;
  deliveryProof: string | null;
  disputeReason: string | null;
  aiVerdict: AiVerdict | null;
  timeline: TimelineEvent[];
  createdAt: string; // ISO
  updatedAt: string; // ISO
}

// ── Dashboard stats ────────────────────────────────────────────
export interface DashboardStats {
  totalDeals: number;
  moneyInEscrow: number;
  completedValue: number;
  disputes: number;
  openDisputes?: number;
  resolvedDisputes?: number;
}
