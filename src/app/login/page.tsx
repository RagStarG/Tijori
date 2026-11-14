"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ShieldCheck,
  Lock,
  Mail,
  ArrowRight,
  Briefcase,
  ShoppingBag,
  Scale,
  CheckCircle2,
  Loader2,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth, PRESET_USERS } from "@/lib/auth-context";
import { toast } from "sonner";
import type { Role } from "@/lib/types";

export default function LoginPage() {
  const router = useRouter();
  const { login, loginAsPreset } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<Role>("SELLER");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      toast.error("Please enter your work email");
      return;
    }
    if (!password.trim()) {
      toast.error("Please enter your password");
      return;
    }

    setIsLoading(true);
    try {
      await login(email.trim(), role);
      toast.success("Welcome back to Tijori Escrow!");
      router.push("/dashboard");
    } catch {
      toast.error("Authentication failed. Please check your credentials.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickLogin = async (presetKey: "seller" | "buyer" | "admin") => {
    setIsLoading(true);
    try {
      const u = await loginAsPreset(presetKey);
      toast.success(`Signed in as ${u.name} (${u.roleTitle || u.role})`);
      router.push("/dashboard");
    } catch {
      toast.error("Quick sign-in failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-muted/20 to-background flex flex-col justify-between">
      {/* Header bar */}
      <header className="px-6 py-5 flex items-center justify-between max-w-6xl w-full mx-auto">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="flex size-9 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-600 to-teal-700 text-white shadow-sm">
            <ShieldCheck className="size-5" />
          </div>
          <span className="text-lg font-bold tracking-tight">
            TIJORI <span className="text-xs font-normal text-muted-foreground">ESCROW</span>
          </span>
        </Link>

        <div className="text-xs text-muted-foreground">
          Don&apos;t have an account?{" "}
          <Link href="/register" className="font-semibold text-emerald-600 hover:underline">
            Register now
          </Link>
        </div>
      </header>

      {/* Main card */}
      <main className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-md space-y-6">
          <Card className="border-border/80 shadow-lg shadow-black/5">
            <CardHeader className="space-y-1 text-center pb-4">
              <div className="size-11 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 mx-auto flex items-center justify-center ring-1 ring-emerald-200 dark:ring-emerald-800">
                <Lock className="size-5" />
              </div>
              <CardTitle className="text-2xl font-bold tracking-tight">Sign in to Tijori</CardTitle>
              <CardDescription className="text-xs">
                Access your escrow contracts, verify deliverables, and release payments safely.
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-5">
              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-xs">Work Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="name@company.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-9 text-sm"
                      disabled={isLoading}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password" className="text-xs">Password</Label>
                    <span className="text-[0.7rem] text-emerald-600 hover:underline cursor-pointer">
                      Forgot password?
                    </span>
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                    <Input
                      id="password"
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-9 text-sm"
                      disabled={isLoading}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1.5 pt-1">
                  <Label className="text-xs">Select Primary Workspace</Label>
                  <Tabs value={role} onValueChange={(v) => setRole(v as Role)} className="w-full">
                    <TabsList className="grid grid-cols-3 w-full h-8 text-xs">
                      <TabsTrigger value="SELLER" className="text-xs">Freelancer</TabsTrigger>
                      <TabsTrigger value="BUYER" className="text-xs">Client</TabsTrigger>
                      <TabsTrigger value="ADMIN" className="text-xs">Arbitrator</TabsTrigger>
                    </TabsList>
                  </Tabs>
                </div>

                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white gap-2 font-semibold shadow-sm"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="size-4 animate-spin" />
                      Authenticating…
                    </>
                  ) : (
                    <>
                      Sign In
                      <ArrowRight className="size-4" />
                    </>
                  )}
                </Button>
              </form>

              {/* Divider */}
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-border" />
                </div>
                <div className="relative flex justify-center text-[0.68rem] uppercase">
                  <span className="bg-card px-2 text-muted-foreground font-medium">
                    Or instant sign-in as verified account
                  </span>
                </div>
              </div>

              {/* Quick Persona Logins */}
              <div className="grid grid-cols-1 gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleQuickLogin("seller")}
                  disabled={isLoading}
                  className="justify-start gap-2.5 h-11 text-xs border-border/80 hover:bg-emerald-50/50 hover:border-emerald-200"
                >
                  <div className="size-7 rounded-lg bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 flex items-center justify-center shrink-0">
                    <Briefcase className="size-3.5" />
                  </div>
                  <div className="text-left flex-1 truncate">
                    <div className="font-semibold text-foreground flex items-center gap-1">
                      {PRESET_USERS.seller.name}
                      <CheckCircle2 className="size-3 text-emerald-600" />
                    </div>
                    <div className="text-[0.65rem] text-muted-foreground truncate">
                      {PRESET_USERS.seller.roleTitle} (Freelancer)
                    </div>
                  </div>
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleQuickLogin("buyer")}
                  disabled={isLoading}
                  className="justify-start gap-2.5 h-11 text-xs border-border/80 hover:bg-blue-50/50 hover:border-blue-200"
                >
                  <div className="size-7 rounded-lg bg-blue-100 dark:bg-blue-950/60 text-blue-700 flex items-center justify-center shrink-0">
                    <ShoppingBag className="size-3.5" />
                  </div>
                  <div className="text-left flex-1 truncate">
                    <div className="font-semibold text-foreground flex items-center gap-1">
                      {PRESET_USERS.buyer.name}
                      <CheckCircle2 className="size-3 text-blue-600" />
                    </div>
                    <div className="text-[0.65rem] text-muted-foreground truncate">
                      {PRESET_USERS.buyer.roleTitle} (Client)
                    </div>
                  </div>
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleQuickLogin("admin")}
                  disabled={isLoading}
                  className="justify-start gap-2.5 h-11 text-xs border-border/80 hover:bg-amber-50/50 hover:border-amber-200"
                >
                  <div className="size-7 rounded-lg bg-amber-100 dark:bg-amber-950/60 text-amber-700 flex items-center justify-center shrink-0">
                    <Scale className="size-3.5" />
                  </div>
                  <div className="text-left flex-1 truncate">
                    <div className="font-semibold text-foreground flex items-center gap-1">
                      {PRESET_USERS.admin.name}
                      <CheckCircle2 className="size-3 text-amber-600" />
                    </div>
                    <div className="text-[0.65rem] text-muted-foreground truncate">
                      Panchayat AI Compliance Desk
                    </div>
                  </div>
                </Button>
              </div>
            </CardContent>

            <CardFooter className="pt-0 pb-5 text-center justify-center text-[0.7rem] text-muted-foreground">
              <span className="flex items-center gap-1">
                <ShieldCheck className="size-3.5 text-emerald-600" />
                RBI Compliant Escrow Partner · 256-bit SSL Security
              </span>
            </CardFooter>
          </Card>
        </div>
      </main>

      {/* Footer bar */}
      <footer className="py-4 text-center text-xs text-muted-foreground border-t">
        © 2026 Tijori Technologies Pvt Ltd. All rights reserved.
      </footer>
    </div>
  );
}
