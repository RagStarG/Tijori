"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import {
  ShieldCheck,
  Briefcase,
  ShoppingBag,
  Scale,
  ArrowRight,
  CheckCircle2,
  Sparkles,
  Lock,
  Users,
  ChevronRight,
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { cn } from "@/lib/utils";
import type { Role } from "@/lib/types";

const roleConfig: Record<Role, {
  label: string;
  description: string;
  icon: typeof Briefcase;
  badgeClass: string;
  iconColor: string;
  gradient: string;
  features: string[];
}> = {
  SELLER: {
    label: "Freelancer / Seller",
    description: "Create deals and get paid securely. Deliver work with confidence knowing funds are held in escrow.",
    icon: Briefcase,
    badgeClass: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200/60",
    iconColor: "text-emerald-600 dark:text-emerald-400",
    gradient: "from-emerald-600 to-teal-700",
    features: [
      "Create milestone-based escrow contracts",
      "Share secure deal links via WhatsApp/Email",
      "Submit deliverables for client review",
      "Get paid instantly upon approval",
      "Access Panchayat AI for fair disputes",
    ],
  },
  BUYER: {
    label: "Client / Buyer",
    description: "Pay safely and approve delivered work. Your money stays protected until you're satisfied with the deliverables.",
    icon: ShoppingBag,
    badgeClass: "bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border-blue-200/60",
    iconColor: "text-blue-600 dark:text-blue-400",
    gradient: "from-blue-600 to-indigo-700",
    features: [
      "Review and fund escrow deals via UPI",
      "Inspect deliverables before releasing payment",
      "Raise disputes with Panchayat AI arbitration",
      "Track all your commissioned projects",
      "Transparent transaction timeline",
    ],
  },
  ADMIN: {
    label: "Arbitrator / Admin",
    description: "Review disputes and make final decisions. Access Panchayat AI recommendations and execute binding resolutions.",
    icon: Scale,
    badgeClass: "bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200/60",
    iconColor: "text-amber-600 dark:text-amber-400",
    gradient: "from-amber-600 to-orange-700",
    features: [
      "View all open disputes requiring arbitration",
      "Access Panchayat AI recommendations",
      "Execute binding resolutions (Release/Refund/Split)",
      "Monitor platform escrow contracts",
      "Compliance audit trail access",
    ],
  },
};

export default function RoleSelectionPage() {
  const router = useRouter();
  const { loginAsPreset } = useAuth();
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [isEntering, setIsEntering] = useState(false);

  const handleRoleSelect = async (role: Role) => {
    setSelectedRole(role);
    setIsEntering(true);
    try {
      await loginAsPreset(role.toLowerCase() as "seller" | "buyer" | "admin");
      router.push("/dashboard");
      router.refresh();
    } catch (error) {
      console.error("Failed to enter as role:", error);
      setIsEntering(false);
      setSelectedRole(null);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* Custom Nav for Enter Page */}
      <header className="sticky top-0 z-50 w-full border-b border-border/80 bg-background/95 backdrop-blur-md supports-[backdrop-filter]:bg-background/80">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <Link href="/" className="group flex items-center gap-2.5 transition-opacity hover:opacity-90">
            <div className="relative flex size-9 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-600 to-teal-700 text-white shadow-sm shadow-emerald-900/20 ring-1 ring-emerald-500/30">
              <ShieldCheck className="size-5 transition-transform group-hover:scale-105" />
            </div>
            <div className="flex flex-col">
              <span className="text-base font-bold tracking-tight text-foreground leading-none flex items-center gap-1.5">
                TIJORI
                <span className="rounded bg-emerald-100 dark:bg-emerald-950/60 px-1 py-0.2 text-[0.62rem] font-semibold text-emerald-800 dark:text-emerald-300 tracking-wider">
                  ESCROW
                </span>
              </span>
              <span className="text-[0.65rem] text-muted-foreground font-medium tracking-wide">
                UPI Protection Network
              </span>
            </div>
          </Link>

          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Link href="/">
              <Button variant="ghost" size="sm" className="text-xs">
                Back to Home
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-5xl space-y-10">
          {/* Hero Section */}
          <div className="text-center space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3.5 py-1 text-xs font-medium text-primary shadow-sm backdrop-blur-sm">
              <Sparkles className="size-3.5" />
              <span>Choose Your Workspace</span>
            </div>

            <h1 className="font-heading text-4xl sm:text-6xl md:text-7xl font-bold tracking-tight leading-[1.1] text-foreground">
              HOW DO YOU WANT TO
              <br className="hidden sm:inline" />
              <span className="bg-gradient-to-r from-emerald-600 via-primary to-amber-600 bg-clip-text text-transparent">
                ENTER TIJORI?
              </span>
            </h1>

            <p className="text-base sm:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Select your role to access the appropriate dashboard. This is a demo mode — you can switch roles anytime from the navbar.
            </p>

            <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
              <Badge variant="outline" className="gap-1">
                <ShieldCheck className="size-3" /> Demo Mode
              </Badge>
              <span>·</span>
              <Badge variant="outline" className="gap-1">
                <Users className="size-3" /> No Real Authentication
              </Badge>
              <span>·</span>
              <Badge variant="outline" className="gap-1">
                <Lock className="size-3" /> No Real Payments
              </Badge>
            </div>
          </div>

          {/* Role Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {(["SELLER", "BUYER", "ADMIN"] as Role[]).map((role) => {
              const config = roleConfig[role];
              const Icon = config.icon;
              const isSelected = selectedRole === role;

              return (
                <Card
                  key={role}
                  className={cn(
                    "relative overflow-hidden transition-all duration-300 group cursor-pointer",
                    isSelected
                      ? "ring-2 ring-primary scale-[1.01] shadow-xl shadow-primary/10"
                      : "border-border/80 hover:border-primary/40 hover:shadow-lg hover:-translate-y-1"
                  )}
                  onClick={() => !isEntering && handleRoleSelect(role)}
                >
                  {/* Gradient Top Border */}
                  <div
                    className={cn(
                      "absolute top-0 left-0 right-0 h-1.5 transition-opacity duration-300",
                      isSelected ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                    )}
                    style={{ background: `linear-gradient(90deg, ${config.gradient.replace("from-", "").replace("to-", "")})` }}
                  />

                  <CardContent className="p-6 sm:p-8 flex flex-col h-full">
                    {/* Icon & Badge */}
                    <div className="flex items-start justify-between gap-4 mb-6">
                      <div className={cn(
                        "size-14 rounded-2xl flex items-center justify-center shrink-0 transition-all duration-300",
                        isSelected
                          ? `bg-gradient-to-br ${config.gradient} text-white shadow-lg shadow-primary/25`
                          : `bg-muted/50 ${config.iconColor} group-hover:bg-gradient-to-br group-hover:${config.gradient} group-hover:text-white`
                      )}>
                        <Icon className="size-7" />
                      </div>
                      <Badge className={cn(config.badgeClass, "text-[0.65rem] font-semibold shrink-0")}>
                        {config.label}
                      </Badge>
                    </div>

                    {/* Description */}
                    <div className="space-y-3 mb-6 flex-1">
                      <h3 className="text-xl font-bold tracking-tight text-foreground">
                        {config.label}
                      </h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {config.description}
                      </p>
                    </div>

                    {/* Features */}
                    <ul className="space-y-2.5 mb-8">
                      {config.features.map((feature, idx) => (
                        <li key={idx} className="flex items-start gap-2.5 text-xs text-muted-foreground">
                          <CheckCircle2 className={cn("size-3.5 shrink-0 mt-0.5", config.iconColor)} />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>

                    {/* Enter Button */}
                    <Button
                      onClick={() => !isEntering && handleRoleSelect(role)}
                      disabled={isEntering || selectedRole !== null && selectedRole !== role}
                      className={cn(
                        "w-full gap-2 text-sm font-semibold h-11 transition-all duration-200",
                        isSelected
                          ? `bg-gradient-to-r ${config.gradient} text-white shadow-md shadow-primary/20 hover:shadow-lg hover:shadow-primary/30`
                          : "bg-muted hover:bg-muted/80 text-foreground border-border hover:border-primary/40"
                      )}
                    >
                      {isEntering && selectedRole === role ? (
                        <>
                          <svg className="size-4 animate-spin" viewBox="0 0 24 24">
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="3"
                              fill="none"
                              strokeDasharray="60"
                              strokeDashoffset="20"
                            />
                          </svg>
                          Entering...
                        </>
                      ) : isSelected ? (
                        <>
                          <ArrowRight className="size-4" />
                          Enter as {config.label.split(" / ")[0]}
                        </>
                      ) : (
                        <>
                          <ChevronRight className="size-4" />
                          Select This Role
                        </>
                      )}
                    </Button>

                    {/* Selected Indicator */}
                    {isSelected && (
                      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r" style={{ background: config.gradient }} />
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Demo Notice */}
          <div className="rounded-2xl bg-muted/50 p-4 sm:p-6 border border-border/60">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
              <div className="flex items-center justify-center sm:justify-start gap-2 text-sm text-muted-foreground">
                <span className="font-medium text-foreground">Demo Environment</span>
                <span>·</span>
                <span>All data persists in localStorage</span>
                <span>·</span>
                <span>Switch roles anytime from navbar</span>
                <span>·</span>
                <span>Reset demo data from dashboard</span>
              </div>
              <Link href="/">
                <Button variant="outline" size="sm" className="h-9 px-4 text-xs">
                  Back to Landing Page
                  <ChevronRight className="size-3.5 ml-1" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}