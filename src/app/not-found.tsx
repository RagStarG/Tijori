"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Home } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-6 px-4 text-center">
      <h1 className="text-6xl font-bold">404</h1>
      <p className="text-xl text-muted-foreground">Ye page nahi mila 🤷</p>
      <Link href="/dashboard">
        <Button>
          <Home className="mr-2 h-4 w-4" />
          Dashboard pe chalein
        </Button>
      </Link>
    </div>
  );
}
