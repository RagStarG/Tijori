"use client";

import { useState, useCallback, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Loader2,
  CheckCircle2,
  Smartphone,
  ShieldCheck,
  QrCode,
  Lock,
  ArrowRight,
  Building,
} from "lucide-react";
import { formatRupees } from "@/lib/format";
import { cn } from "@/lib/utils";

interface UpiModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  amount: number;
  onSuccess: () => void;
}

type PaymentState = "idle" | "processing" | "success";

export function UpiModal({ open, onOpenChange, amount, onSuccess }: UpiModalProps) {
  const [state, setState] = useState<PaymentState>("idle");
  const [vpa, setVpa] = useState("rohan@okicici");
  const [selectedApp, setSelectedApp] = useState<string>("gpay");
  const [transactionRef, setTransactionRef] = useState("");

  const handlePay = useCallback(() => {
    setState("processing");
    const fakeUtr = `UTR${Math.floor(100000000000 + Math.random() * 900000000000)}`;
    setTransactionRef(fakeUtr);

    setTimeout(() => {
      setState("success");
      setTimeout(() => {
        onSuccess();
        setTimeout(() => setState("idle"), 400);
      }, 1400);
    }, 1800);
  }, [onSuccess]);

  const handleOpenChange = useCallback(
    (nextOpen: boolean) => {
      if (!nextOpen && state !== "processing") {
        onOpenChange(false);
        setTimeout(() => setState("idle"), 300);
      }
    },
    [onOpenChange, state]
  );

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent showCloseButton={state === "idle"} className="sm:max-w-md p-0 overflow-hidden border-border/80 shadow-2xl">
        {/* Header Strip with Bank Branding */}
        <div className="bg-gradient-to-r from-emerald-800 to-teal-900 p-5 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex size-7 items-center justify-center rounded-lg bg-white/10 ring-1 ring-white/20">
                <ShieldCheck className="size-4 text-emerald-300" />
              </div>
              <span className="text-sm font-bold tracking-tight">Tijori Secure Escrow</span>
            </div>
            <Badge className="bg-emerald-500/20 text-emerald-200 border-emerald-400/30 text-[0.65rem] font-medium">
              256-bit Encrypted
            </Badge>
          </div>

          <div className="mt-4 flex items-baseline justify-between">
            <div>
              <p className="text-[0.7rem] text-emerald-200/80 uppercase tracking-wider font-medium">
                Escrow Deposit
              </p>
              <p className="text-3xl font-extrabold tracking-tight mt-0.5">
                {formatRupees(amount)}
              </p>
            </div>
            <div className="text-right text-[0.7rem] text-emerald-200/80">
              <p>Nodal Beneficiary</p>
              <p className="font-semibold text-white">Tijori Nodal Escrow A/C</p>
            </div>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-5 space-y-5">
          {/* Success State */}
          {state === "success" && (
            <div className="flex flex-col items-center gap-3 py-6 animate-in zoom-in-95 fade-in duration-300 text-center">
              <div className="size-16 rounded-full bg-emerald-100 dark:bg-emerald-950/60 flex items-center justify-center text-emerald-600 ring-4 ring-emerald-50">
                <CheckCircle2 className="size-9" />
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-bold text-foreground">Escrow Deposit Confirmed</h3>
                <p className="text-xs text-muted-foreground">
                  Funds securely credited to Tijori Escrow Nodal Account
                </p>
              </div>
              <div className="rounded-lg bg-muted/60 p-2.5 px-4 text-xs font-mono text-muted-foreground">
                Ref No: <span className="font-bold text-foreground">{transactionRef}</span>
              </div>
            </div>
          )}

          {/* Processing State */}
          {state === "processing" && (
            <div className="flex flex-col items-center gap-4 py-8 animate-in fade-in duration-200 text-center">
              <div className="relative">
                <Loader2 className="size-10 animate-spin text-emerald-600" />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-semibold">Authorizing with Bank Escrow Rails…</p>
                <p className="text-xs text-muted-foreground">
                  Connecting to NPCI UPI network for automated nodal escrow hold
                </p>
              </div>
            </div>
          )}

          {/* Idle State */}
          {state === "idle" && (
            <div className="space-y-4">
              <Tabs defaultValue="apps" className="w-full">
                <TabsList className="grid grid-cols-2 w-full h-9 text-xs">
                  <TabsTrigger value="apps" className="text-xs gap-1.5">
                    <Smartphone className="size-3.5" />
                    Instant UPI App
                  </TabsTrigger>
                  <TabsTrigger value="qr" className="text-xs gap-1.5">
                    <QrCode className="size-3.5" />
                    Scan QR Code
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="apps" className="space-y-3 pt-3">
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { id: "gpay", name: "Google Pay", color: "border-blue-200 hover:bg-blue-50/40" },
                      { id: "phonepe", name: "PhonePe", color: "border-purple-200 hover:bg-purple-50/40" },
                      { id: "paytm", name: "Paytm UPI", color: "border-cyan-200 hover:bg-cyan-50/40" },
                      { id: "cred", name: "CRED / BHIM", color: "border-border hover:bg-muted/40" },
                    ].map((app) => (
                      <button
                        key={app.id}
                        type="button"
                        onClick={() => setSelectedApp(app.id)}
                        className={`p-2.5 rounded-xl border text-xs font-semibold text-left transition-all flex items-center justify-between ${
                          selectedApp === app.id
                            ? "border-emerald-600 bg-emerald-50/50 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200 ring-1 ring-emerald-600"
                            : `${app.color} text-foreground`
                        }`}
                      >
                        <span>{app.name}</span>
                        {selectedApp === app.id && <CheckCircle2 className="size-3.5 text-emerald-600" />}
                      </button>
                    ))}
                  </div>

                  <div className="space-y-1 pt-1">
                    <Label htmlFor="vpa" className="text-[0.7rem] text-muted-foreground">
                      Or pay using Virtual Payment Address (VPA)
                    </Label>
                    <Input
                      id="vpa"
                      value={vpa}
                      onChange={(e) => setVpa(e.target.value)}
                      placeholder="username@upi"
                      className="text-xs h-9 font-mono"
                    />
                  </div>
                </TabsContent>

                <TabsContent value="qr" className="space-y-3 pt-2 text-center">
                  <div className="size-40 mx-auto rounded-2xl bg-white p-3 shadow-inner ring-1 ring-border flex flex-col items-center justify-center">
                    {/* Simulated Clean QR Code Graphic */}
                    <div className="size-32 bg-gradient-to-br from-emerald-950 to-teal-900 rounded-lg p-2 flex flex-col justify-between">
                      <div className="flex justify-between">
                        <div className="size-6 bg-white rounded-sm border-2 border-emerald-950" />
                        <div className="size-6 bg-white rounded-sm border-2 border-emerald-950" />
                      </div>
                      <div className="text-[0.55rem] font-mono text-white text-center font-bold tracking-widest">
                        TIJORI-PAY
                      </div>
                      <div className="flex justify-between items-end">
                        <div className="size-6 bg-white rounded-sm border-2 border-emerald-950" />
                        <div className="size-4 bg-emerald-400 rounded-sm" />
                      </div>
                    </div>
                  </div>
                  <p className="text-[0.72rem] text-muted-foreground">
                    Scan with any UPI app to transfer <strong>{formatRupees(amount)}</strong>
                  </p>
                </TabsContent>
              </Tabs>

              {/* Security confirmation badge */}
              <div className="rounded-xl bg-muted/50 p-2.5 px-3 text-[0.7rem] text-muted-foreground flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Lock className="size-3.5 text-emerald-600" />
                  Protected by Tijori Escrow Guarantee
                </span>
                <span className="font-medium text-foreground">Zero Fees</span>
              </div>

              {/* Pay CTA */}
              <Button
                onClick={handlePay}
                size="lg"
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm h-11 gap-2 shadow-md shadow-emerald-900/10"
              >
                Deposit {formatRupees(amount)} into Escrow
                <ArrowRight className="size-4" />
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
