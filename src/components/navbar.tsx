"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ShieldCheck,
  ChevronDown,
  User as UserIcon,
  Briefcase,
  ShoppingBag,
  Scale,
  LogOut,
  Plus,
  LayoutDashboard,
  CheckCircle2,
  ExternalLink,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/lib/auth-context";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import type { Role } from "@/lib/types";

const roleConfig: Record<
  Role,
  { label: string; badgeClass: string; icon: typeof Briefcase }
> = {
  SELLER: {
    label: "Freelancer",
    badgeClass: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-600/20 dark:bg-emerald-950/40 dark:text-emerald-300",
    icon: Briefcase,
  },
  BUYER: {
    label: "Client",
    badgeClass: "bg-blue-50 text-blue-700 ring-1 ring-blue-600/20 dark:bg-blue-950/40 dark:text-blue-300",
    icon: ShoppingBag,
  },
  ADMIN: {
    label: "Arbitrator",
    badgeClass: "bg-amber-50 text-amber-700 ring-1 ring-amber-600/20 dark:bg-amber-950/40 dark:text-amber-300",
    icon: Scale,
  },
};

export function Navbar() {
  const [pathname, setPathname] = useState("");
  const router = useRouter();
  const { user, isAuthenticated, switchRole, logout, loginAsPreset } = useAuth();

  useEffect(() => {
    if (typeof window !== "undefined") {
      setPathname(window.location.pathname);
    }
  }, []);

  const currentRole = user?.role || "SELLER";
  const roleInfo = roleConfig[currentRole];
  const RoleIcon = roleInfo.icon;

  const handleRoleChange = (newRole: Role) => {
    switchRole(newRole);
    router.refresh();
  };

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/80 bg-background/95 backdrop-blur-md supports-[backdrop-filter]:bg-background/80">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        {/* Left: Brand Logo */}
        <div className="flex items-center gap-6">
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

          {/* Navigation Links for Authenticated Users */}
          {isAuthenticated && (
            <nav className="hidden md:flex items-center gap-1 text-sm font-medium">
              <Link
                href="/dashboard"
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors ${
                  pathname === "/dashboard"
                    ? "text-emerald-700 bg-emerald-50/80 dark:bg-emerald-950/40 dark:text-emerald-300"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                }`}
              >
                <LayoutDashboard className="size-4" />
                Dashboard
              </Link>

              {user?.role === "SELLER" && (
                <Link
                  href="/deals/new"
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors ${
                    pathname === "/deals/new"
                      ? "text-emerald-700 bg-emerald-50/80 dark:bg-emerald-950/40 dark:text-emerald-300"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                  }`}
                >
                  <Plus className="size-4" />
                  New Escrow
                </Link>
              )}
            </nav>
          )}
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-3">
          {isAuthenticated && user ? (
            <>
              <ThemeToggle />
              {/* Role Indicator & Fast Switcher */}
              <DropdownMenu>
                <DropdownMenuTrigger className="inline-flex items-center justify-center rounded-lg border border-border bg-card px-2.5 h-8 gap-1.5 text-xs font-medium hover:bg-muted/60 transition-colors cursor-pointer outline-none">
                  <RoleIcon className="size-3.5 text-muted-foreground" />
                  <span className="hidden sm:inline">Workspace:</span>
                  <span className="font-semibold text-foreground">{roleInfo.label}</span>
                  <ChevronDown className="size-3 text-muted-foreground opacity-60" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 p-1">
                  <DropdownMenuLabel className="text-xs text-muted-foreground font-normal">
                    Switch Workspace Role
                  </DropdownMenuLabel>
                  <DropdownMenuItem
                    onClick={() => handleRoleChange("SELLER")}
                    className={`flex items-center gap-2 text-xs font-medium ${
                      user.role === "SELLER" ? "bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 font-semibold" : ""
                    }`}
                  >
                    <Briefcase className="size-3.5 text-emerald-600" />
                    Freelancer / Seller
                    {user.role === "SELLER" && <CheckCircle2 className="size-3.5 ml-auto text-emerald-600" />}
                  </DropdownMenuItem>

                  <DropdownMenuItem
                    onClick={() => handleRoleChange("BUYER")}
                    className={`flex items-center gap-2 text-xs font-medium ${
                      user.role === "BUYER" ? "bg-blue-50 text-blue-800 dark:bg-blue-950/40 font-semibold" : ""
                    }`}
                  >
                    <ShoppingBag className="size-3.5 text-blue-600" />
                    Client / Buyer
                    {user.role === "BUYER" && <CheckCircle2 className="size-3.5 ml-auto text-blue-600" />}
                  </DropdownMenuItem>

                  <DropdownMenuItem
                    onClick={() => handleRoleChange("ADMIN")}
                    className={`flex items-center gap-2 text-xs font-medium ${
                      user.role === "ADMIN" ? "bg-amber-50 text-amber-800 dark:bg-amber-950/40 font-semibold" : ""
                    }`}
                  >
                    <Scale className="size-3.5 text-amber-600" />
                    Arbitrator / Admin
                    {user.role === "ADMIN" && <CheckCircle2 className="size-3.5 ml-auto text-amber-600" />}
                  </DropdownMenuItem>

                  <DropdownMenuSeparator />
                  <DropdownMenuLabel className="text-[0.68rem] text-muted-foreground font-normal">
                    Switch Verified Persona
                  </DropdownMenuLabel>
                  <DropdownMenuItem onClick={() => loginAsPreset("seller")} className="text-xs">
                    Arjun Verma (Creative Lead)
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => loginAsPreset("buyer")} className="text-xs">
                    Rohan Mehta (Tech Lead)
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => loginAsPreset("admin")} className="text-xs">
                    Panchayat Compliance Desk
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* User Avatar & Profile Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger className="relative size-9 rounded-full ring-1 ring-border p-0 cursor-pointer outline-none hover:ring-2 hover:ring-emerald-500/30 transition-all">
                  <Avatar className="size-9">
                    <AvatarImage src={user.avatarUrl} alt={user.name} />
                    <AvatarFallback className="bg-emerald-100 text-emerald-800 text-xs font-bold">
                      {user.name.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  {user.isVerified && (
                    <span
                      className="absolute bottom-0 right-0 size-2.5 rounded-full bg-emerald-500 ring-2 ring-background"
                      title="Verified KYC Identity"
                    />
                  )}
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-64 p-2">
                  <div className="flex items-center gap-2.5 p-2">
                    <Avatar className="size-10">
                      <AvatarImage src={user.avatarUrl} alt={user.name} />
                      <AvatarFallback className="bg-emerald-100 text-emerald-800 text-xs font-bold">
                        {user.name.slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col truncate">
                      <div className="flex items-center gap-1 font-semibold text-sm">
                        <span className="truncate">{user.name}</span>
                        {user.isVerified && (
                          <CheckCircle2 className="size-3.5 text-emerald-600 shrink-0" />
                        )}
                      </div>
                      <span className="text-xs text-muted-foreground truncate">{user.email}</span>
                      <span className="text-[0.68rem] text-emerald-700 dark:text-emerald-400 font-medium">
                        {user.roleTitle || roleInfo.label}
                      </span>
                    </div>
                  </div>

                  {user.upiId && (
                    <div className="mx-2 mb-2 rounded-md bg-muted/60 p-1.5 px-2 text-[0.7rem] text-muted-foreground flex justify-between">
                      <span>UPI VPA</span>
                      <span className="font-mono text-foreground font-medium">{user.upiId}</span>
                    </div>
                  )}

                  <DropdownMenuSeparator />

                  <DropdownMenuItem
                    onClick={() => router.push("/dashboard")}
                    className="flex items-center gap-2 text-xs cursor-pointer"
                  >
                    <LayoutDashboard className="size-3.5 text-muted-foreground" />
                    Dashboard &amp; Escrow Contracts
                  </DropdownMenuItem>

                  {user.role === "SELLER" && (
                    <DropdownMenuItem
                      onClick={() => router.push("/deals/new")}
                      className="flex items-center gap-2 text-xs cursor-pointer"
                    >
                      <Plus className="size-3.5 text-muted-foreground" />
                      Create New Escrow Deal
                    </DropdownMenuItem>
                  )}

                  <DropdownMenuSeparator />

                  <DropdownMenuItem
                    onClick={handleLogout}
                    className="flex items-center gap-2 text-xs text-red-600 focus:bg-red-50 dark:focus:bg-red-950/40 dark:text-red-400 cursor-pointer"
                  >
                    <LogOut className="size-3.5" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <Link href="/login">
                <Button variant="ghost" size="sm" className="text-xs">
                  Sign In
                </Button>
              </Link>
              <Link href="/register">
                <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs shadow-sm">
                  Create Account
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
