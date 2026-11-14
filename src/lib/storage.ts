import { Deal } from "./types";
import { SEED_DEALS } from "./mock";

const STORAGE_KEY = "tijori_deals";

export function getStoredDeals(): Deal[] {
  if (typeof window === "undefined") return SEED_DEALS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(SEED_DEALS));
      return SEED_DEALS;
    }
    return JSON.parse(raw);
  } catch {
    return SEED_DEALS;
  }
}

export function saveStoredDeals(deals: Deal[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(deals));
  } catch (e) {
    console.error("Failed to save deals to localStorage", e);
  }
}

export function getStoredDeal(id: string): Deal | null {
  const deals = getStoredDeals();
  return deals.find((d) => d.id === id) || null;
}

export function updateStoredDeal(updated: Deal): void {
  const deals = getStoredDeals();
  const idx = deals.findIndex((d) => d.id === updated.id);
  if (idx >= 0) {
    deals[idx] = updated;
  } else {
    deals.unshift(updated);
  }
  saveStoredDeals(deals);
}

export function resetStoredDeals(): Deal[] {
  if (typeof window !== "undefined") {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(SEED_DEALS));
  }
  return SEED_DEALS;
}
