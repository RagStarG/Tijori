"use client";

import { useTheme } from "@/context/ThemeContext";
import { Sun, Moon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export function ThemeToggle() {
  const { theme, toggleTheme, isTransitioning } = useTheme();
  const isDark = theme === "dark";
  const label = isDark ? "Switch to Light Mode" : "Switch to Dark Mode";

  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            disabled={isTransitioning}
            className={cn(
              "relative overflow-hidden rounded-lg transition-all duration-300",
              "hover:scale-105 active:scale-95",
              isDark
                ? "text-amber-400 hover:text-amber-300 hover:bg-amber-400/10"
                : "text-orange-600 hover:text-orange-500 hover:bg-orange-500/10",
              isTransitioning && "cursor-wait opacity-70"
            )}
            aria-label={label}
          >
            <span
              className={cn(
                "relative flex items-center justify-center transition-transform duration-500",
                isDark ? "rotate-0" : "rotate-[360deg]"
              )}
            >
              {isDark ? (
                <Moon className="size-[1.15rem]" />
              ) : (
                <Sun className="size-[1.15rem]" />
              )}
            </span>
            {isTransitioning && (
              <span className="absolute inset-0 flex items-center justify-center">
                <span className="absolute inset-1 rounded-full border-2 border-current border-t-transparent animate-spin opacity-30" />
              </span>
            )}
          </Button>
        }
      />
      <TooltipContent side="bottom" className="text-xs">
        {label}
      </TooltipContent>
    </Tooltip>
  );
}
