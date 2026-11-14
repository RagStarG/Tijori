"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ShieldCheck,
  User as UserIcon,
  Mail,
  Lock,
  ArrowRight,
  Briefcase,
  ShoppingBag,
  Loader2,
  Phone,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/lib/auth-context";
import { toast } from "sonner";
import type { Role } from "@/lib/types";

export default function RegisterPage() {
  const router = useRouter();
  const { signup } = useAuth();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<Role>("SELLER");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Please enter your full name");
      return;
    }
    if (!email.trim()) {
      toast.error("Please enter your work email");
      return;
    }
    if (!password.trim() || password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    setIsLoading(true);
    try {
      await signup(name.trim(), email.trim(), role, phone.trim());
      toast.success("Account created successfully! Welcome to Tijori Escrow.");
      router.push("/dashboard");
    } catch {
      toast.error("Failed to create account. Please try again.");
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
          Already registered?{" "}
          <Link href="/login" className="font-semibold text-emerald-600 hover:underline">
            Sign in
          </Link>
        </div>
      </header>

      {/* Main card */}
      <main className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-md space-y-6">
          <Card className="border-border/80 shadow-lg shadow-black/5">
            <CardHeader className="space-y-1 text-center pb-4">
              <div className="size-11 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 mx-auto flex items-center justify-center ring-1 ring-emerald-200 dark:ring-emerald-800">
                <ShieldCheck className="size-5" />
              </div>
              <CardTitle className="text-2xl font-bold tracking-tight">Create your account</CardTitle>
              <CardDescription className="text-xs">
                Start securing freelance milestones and project payments with UPI Escrow.
              </CardDescription>
            </CardHeader>

            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">I want to join as</Label>
                  <Tabs value={role} onValueChange={(v) => setRole(v as Role)} className="w-full">
                    <TabsList className="grid grid-cols-2 w-full h-9">
                      <TabsTrigger value="SELLER" className="text-xs gap-1.5 font-medium">
                        <Briefcase className="size-3.5" />
                        Freelancer / Seller
                      </TabsTrigger>
                      <TabsTrigger value="BUYER" className="text-xs gap-1.5 font-medium">
                        <ShoppingBag className="size-3.5" />
                        Client / Buyer
                      </TabsTrigger>
                    </TabsList>
                  </Tabs>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="name" className="text-xs">Full Name / Agency</Label>
                  <div className="relative">
                    <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                    <Input
                      id="name"
                      placeholder="e.g. Arjun Verma"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="pl-9 text-sm"
                      disabled={isLoading}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-xs">Work Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="name@studio.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-9 text-sm"
                      disabled={isLoading}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-xs">Mobile Number (for UPI alerts)</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="+91 98765 43210"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="pl-9 text-sm"
                      disabled={isLoading}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className="text-xs">Create Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                    <Input
                      id="password"
                      type="password"
                      placeholder="Minimum 6 characters"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-9 text-sm"
                      disabled={isLoading}
                      required
                    />
                  </div>
                </div>

                <div className="rounded-lg bg-emerald-50/70 dark:bg-emerald-950/30 p-2.5 text-[0.72rem] text-emerald-800 dark:text-emerald-300 flex items-start gap-2">
                  <CheckCircle2 className="size-4 shrink-0 mt-0.5 text-emerald-600" />
                  <span>
                    Your funds are held in zero-interest nodal escrow accounts adhering to RBI
                    e-commerce escrow guidelines.
                  </span>
                </div>

                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white gap-2 font-semibold shadow-sm mt-2"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="size-4 animate-spin" />
                      Creating Account…
                    </>
                  ) : (
                    <>
                      Complete Registration
                      <ArrowRight className="size-4" />
                    </>
                  )}
                </Button>
              </form>
            </CardContent>

            <CardFooter className="pt-0 pb-5 text-center justify-center text-[0.7rem] text-muted-foreground">
              By registering, you agree to Tijori&apos;s Terms of Escrow Service & Privacy Policy.
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
