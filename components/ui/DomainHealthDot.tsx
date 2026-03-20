"use client";

import { cn } from "@/lib/utils";

interface DomainHealthDotProps {
  /** "green" | "amber" | "red" — overall health */
  health: "green" | "amber" | "red";
  /** Optional domain-specific colour override (for domain labels) */
  domainColour?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const healthColour: Record<string, string> = {
  green: "#10b981",
  amber: "#f59e0b",
  red:   "#ef4444",
};

const sizeClass: Record<string, string> = {
  sm: "w-1.5 h-1.5",
  md: "w-2 h-2",
  lg: "w-3 h-3",
};

export function DomainHealthDot({ health, domainColour, size = "md", className }: DomainHealthDotProps) {
  const colour = domainColour ?? healthColour[health];
  return (
    <span
      className={cn("inline-block rounded-full flex-shrink-0", sizeClass[size], className)}
      style={{ backgroundColor: colour }}
      aria-label={`Health: ${health}`}
    />
  );
}
