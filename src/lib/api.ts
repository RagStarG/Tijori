import { Deal, DealStatus, DashboardStats, AiVerdict } from "./types";

// ── Helpers ────────────────────────────────────────────────────
function getRole(): string {
  if (typeof window === "undefined") return "SELLER";
  return localStorage.getItem("tijori_role") || "SELLER";
}

function getName(): string {
  if (typeof window === "undefined") return "Demo User";
  return localStorage.getItem("tijori_name") || "Demo User";
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "";

async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      "x-user-role": getRole(),
      "x-user-name": getName(),
      ...(options?.headers || {}),
    },
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.message || `API error: ${res.status}`);
  }

  return res.json();
}

// ── Deal API ───────────────────────────────────────────────────
export async function fetchDeals(params?: Record<string, string>): Promise<Deal[]> {
  const qs = params ? "?" + new URLSearchParams(params).toString() : "";
  return apiFetch<Deal[]>(`/api/deals${qs}`);
}

export async function fetchDeal(id: string): Promise<Deal> {
  return apiFetch<Deal>(`/api/deals/${id}`);
}

export async function createDeal(data: {
  title: string;
  description: string;
  amount: number;
}): Promise<Deal> {
  return apiFetch<Deal>("/api/deals", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function fundDeal(id: string): Promise<Deal> {
  return apiFetch<Deal>(`/api/deals/${id}/fund`, { method: "POST" });
}

export async function deliverDeal(id: string, proof: string): Promise<Deal> {
  return apiFetch<Deal>(`/api/deals/${id}/deliver`, {
    method: "POST",
    body: JSON.stringify({ proof }),
  });
}

export async function acceptDeal(id: string): Promise<Deal> {
  return apiFetch<Deal>(`/api/deals/${id}/accept`, { method: "POST" });
}

export async function disputeDeal(id: string, reason: string): Promise<Deal> {
  return apiFetch<Deal>(`/api/deals/${id}/dispute`, {
    method: "POST",
    body: JSON.stringify({ reason }),
  });
}

export async function resolveDeal(
  id: string,
  resolution: "RELEASE" | "REFUND" | "SPLIT",
  splitPercent?: number
): Promise<Deal> {
  return apiFetch<Deal>(`/api/deals/${id}/resolve`, {
    method: "POST",
    body: JSON.stringify({ resolution, splitPercent }),
  });
}

// ── Stats API ──────────────────────────────────────────────────
export async function fetchStats(): Promise<DashboardStats> {
  return apiFetch<DashboardStats>("/api/stats");
}

// ── Seed (dev) ─────────────────────────────────────────────────
export async function seedData(): Promise<void> {
  await apiFetch<void>("/api/dev/seed", { method: "POST" });
}
