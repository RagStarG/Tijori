import { Deal, DashboardStats } from "./types";

// ── Realistic Enterprise Freelance Deals ───────────────────────
export const SEED_DEALS: Deal[] = [
  {
    id: "deal-001",
    title: "Brand Identity & Design System",
    description: "3 unique brand logo concepts, primary typography system, color palette, and vector source assets in SVG, AI, and Figma format with 2 rounds of design revisions.",
    amount: 15000,
    status: "CREATED",
    sellerName: "Arjun Verma",
    buyerName: null,
    deliveryProof: null,
    disputeReason: null,
    aiVerdict: null,
    timeline: [
      { id: "t1", message: "Escrow contract drafted by Arjun Verma", actor: "Arjun Verma", timestamp: "2026-11-14T06:00:00Z", icon: "plus" },
    ],
    createdAt: "2026-11-14T06:00:00Z",
    updatedAt: "2026-11-14T06:00:00Z",
  },
  {
    id: "deal-002",
    title: "60-Second Product Launch Video Edit",
    description: "Full post-production edit of 4K product footage with sound design, dynamic motion typography, color grading, and vertical format optimization for social campaigns.",
    amount: 12000,
    status: "DELIVERED",
    sellerName: "Arjun Verma",
    buyerName: "Rohan Mehta",
    deliveryProof: "Final render deliverables exported in ProRes 422 & MP4: https://assets.tijoriescrow.in/deliveries/product-launch-final.mp4",
    disputeReason: null,
    aiVerdict: null,
    timeline: [
      { id: "t1", message: "Contract agreed & signed", actor: "Arjun Verma", timestamp: "2026-11-12T10:00:00Z", icon: "plus" },
      { id: "t2", message: "Escrow deposit confirmed — ₹12,000 locked in nodal account", actor: "Rohan Mehta", timestamp: "2026-11-12T11:30:00Z", icon: "wallet" },
      { id: "t3", message: "Final deliverables submitted for client audit", actor: "Arjun Verma", timestamp: "2026-11-13T18:00:00Z", icon: "package" },
    ],
    createdAt: "2026-11-12T10:00:00Z",
    updatedAt: "2026-11-13T18:00:00Z",
  },
  {
    id: "deal-003",
    title: "SaaS Marketing Website & CMS",
    description: "Responsive Next.js & Tailwind marketing website with contact lead capture, pricing calculator, and documentation pages. Full source code repository delivery.",
    amount: 28000,
    status: "DISPUTED",
    sellerName: "Priya Patel",
    buyerName: "Rohan Mehta",
    deliveryProof: "Preview deployment: https://saas-launch-preview.vercel.app (Landing page completed, CMS not integrated)",
    disputeReason: "Only the hero and features sections were delivered. The interactive pricing calculator and CMS integration specified in milestone 2 were omitted. Requesting pro-rata adjustment.",
    aiVerdict: {
      verdict: "SPLIT",
      sellerAmount: 11200,
      buyerAmount: 16800,
      reasoning: "Panchayat AI evaluated the repository commit history against contractual deliverables. The frontend landing page was successfully built (approx 40% of scope), while CMS backend and pricing modules remain unbuilt. Recommending a 40/60 pro-rata settlement: ₹11,200 released to freelancer for completed UI, and ₹16,800 refunded to client.",
    },
    timeline: [
      { id: "t1", message: "Contract initiated", actor: "Priya Patel", timestamp: "2026-11-08T09:00:00Z", icon: "plus" },
      { id: "t2", message: "Escrow deposit confirmed — ₹28,000 locked in escrow", actor: "Rohan Mehta", timestamp: "2026-11-08T10:00:00Z", icon: "wallet" },
      { id: "t3", message: "Partial delivery submitted", actor: "Priya Patel", timestamp: "2026-11-11T14:00:00Z", icon: "package" },
      { id: "t4", message: "Grievance submitted by client", actor: "Rohan Mehta", timestamp: "2026-11-11T20:00:00Z", icon: "alert-triangle" },
      { id: "t5", message: "Panchayat AI evaluated case — recommends 40/60 SPLIT", actor: "Panchayat AI", timestamp: "2026-11-11T20:00:05Z", icon: "bot" },
    ],
    createdAt: "2026-11-08T09:00:00Z",
    updatedAt: "2026-11-11T20:00:05Z",
  },
  {
    id: "deal-004",
    title: "Technical Whitepaper & Case Study",
    description: "2,500-word comprehensive technical case study on 'UPI Infrastructure Architecture for Scalable Fintech'. Includes 4 custom SVG architectural diagrams.",
    amount: 9500,
    status: "COMPLETED",
    sellerName: "Arjun Verma",
    buyerName: "Amitabh Sen",
    deliveryProof: "Document repository: https://docs.google.com/document/d/whitepaper-upi-infra-final",
    disputeReason: null,
    aiVerdict: null,
    timeline: [
      { id: "t1", message: "Agreement drafted", actor: "Arjun Verma", timestamp: "2026-11-05T08:00:00Z", icon: "plus" },
      { id: "t2", message: "Payment deposited — ₹9,500 in escrow", actor: "Amitabh Sen", timestamp: "2026-11-05T09:00:00Z", icon: "wallet" },
      { id: "t3", message: "Deliverables submitted", actor: "Arjun Verma", timestamp: "2026-11-07T12:00:00Z", icon: "package" },
      { id: "t4", message: "Deliverables approved — ₹9,500 disbursed to seller", actor: "Amitabh Sen", timestamp: "2026-11-07T18:00:00Z", icon: "check-circle" },
    ],
    createdAt: "2026-11-05T08:00:00Z",
    updatedAt: "2026-11-07T18:00:00Z",
  },
  {
    id: "deal-005",
    title: "Mobile App Wireframes & Interactive Prototype",
    description: "Interactive Figma prototype covering 15 screens for a cross-platform consumer delivery application with component kit and design tokens.",
    amount: 18000,
    status: "RESOLVED_SPLIT",
    sellerName: "Neha Gupta",
    buyerName: "Rohan Mehta",
    deliveryProof: "Figma prototype link: https://figma.com/@neha/delivery-app-prototype-v2",
    disputeReason: "Only 10 screens were delivered instead of the agreed 15, and interactive component states were partially missing.",
    aiVerdict: {
      verdict: "SPLIT",
      sellerAmount: 12000,
      buyerAmount: 6000,
      reasoning: "Work was substantially executed (10 out of 15 screens completed with high fidelity). Recommending a 66/34 pro-rata settlement: ₹12,000 released to freelancer and ₹6,000 returned to client.",
    },
    timeline: [
      { id: "t1", message: "Contract initiated", actor: "Neha Gupta", timestamp: "2026-11-01T10:00:00Z", icon: "plus" },
      { id: "t2", message: "Escrow funded — ₹18,000 held in escrow", actor: "Rohan Mehta", timestamp: "2026-11-01T11:00:00Z", icon: "wallet" },
      { id: "t3", message: "Prototype submitted", actor: "Neha Gupta", timestamp: "2026-11-02T16:00:00Z", icon: "package" },
      { id: "t4", message: "Dispute opened by client", actor: "Rohan Mehta", timestamp: "2026-11-02T20:00:00Z", icon: "alert-triangle" },
      { id: "t5", message: "Panchayat AI evaluated — recommends 66/34 SPLIT", actor: "Panchayat AI", timestamp: "2026-11-02T20:00:04Z", icon: "bot" },
      { id: "t6", message: "Arbitrator ruling executed: ₹12,000 to seller, ₹6,000 to buyer", actor: "Compliance Arbitrator", timestamp: "2026-11-03T10:00:00Z", icon: "gavel" },
    ],
    createdAt: "2026-11-01T10:00:00Z",
    updatedAt: "2026-11-03T10:00:00Z",
  },
];

// ── Mock stats by role ─────────────────────────────────────────
export function getMockStats(role: string, name: string): DashboardStats {
  const myDeals = SEED_DEALS.filter((d) =>
    role === "SELLER" ? d.sellerName === name : role === "BUYER" ? d.buyerName === name : true
  );

  const escrowStatuses = ["FUNDED", "DELIVERED", "DISPUTED"];
  const completedStatuses = ["COMPLETED", "RESOLVED_RELEASED", "RESOLVED_SPLIT"];

  return {
    totalDeals: myDeals.length,
    moneyInEscrow: myDeals
      .filter((d) => escrowStatuses.includes(d.status))
      .reduce((s, d) => s + d.amount, 0),
    completedValue: myDeals
      .filter((d) => completedStatuses.includes(d.status))
      .reduce((s, d) => s + d.amount, 0),
    disputes: myDeals.filter((d) => d.status === "DISPUTED").length,
    openDisputes: myDeals.filter((d) => d.status === "DISPUTED").length,
    resolvedDisputes: myDeals.filter((d) => d.status.startsWith("RESOLVED_")).length,
  };
}
