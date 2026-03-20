import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  label: string;
  value: string | number;
  subtext?: string;
  trend?: "up" | "down" | "neutral";
  trendLabel?: string;
  valueColour?: string;
}

export function StatCard({ label, value, subtext, trend, trendLabel, valueColour }: StatCardProps) {
  const TrendIcon =
    trend === "up" ? TrendingUp : trend === "down" ? TrendingDown : Minus;
  const trendColour =
    trend === "up" ? "text-[#166534]" : trend === "down" ? "text-[#991b1b]" : "text-[#475569]";

  return (
    <div className="border border-[#cbd5e1] rounded-lg p-4 bg-white">
      <p className="text-[9px] font-semibold uppercase tracking-[0.08em] text-[#475569] mb-1">{label}</p>
      <p
        className={cn("text-[22px] font-semibold leading-none mb-1", valueColour ?? "text-[#1e293b]")}
      >
        {value}
      </p>
      {subtext && <p className="text-[10px] text-[#475569]">{subtext}</p>}
      {trend && trendLabel && (
        <div className={cn("flex items-center gap-1 mt-1.5 text-[10px]", trendColour)}>
          <TrendIcon size={11} />
          <span>{trendLabel}</span>
        </div>
      )}
    </div>
  );
}
