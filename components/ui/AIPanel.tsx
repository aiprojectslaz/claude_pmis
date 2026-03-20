"use client";

import { Sparkles } from "lucide-react";

interface AIPanelChip {
  label: string;
  onClick?: () => void;
}

interface AIPanelProps {
  analysis: string;
  chips?: AIPanelChip[];
}

export function AIPanel({ analysis, chips }: AIPanelProps) {
  return (
    <div className="border border-[#93c5fd] rounded-lg bg-[#dbeafe] p-3">
      <div className="flex items-start gap-2">
        <Sparkles size={13} className="text-[#1d4ed8] flex-shrink-0 mt-0.5" />
        <div className="flex-1 min-w-0">
          <p className="text-[11px] text-[#1e40af] leading-relaxed">{analysis}</p>
          {chips && chips.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {chips.map((chip, i) => (
                <button
                  key={i}
                  onClick={chip.onClick}
                  className="ai-chip"
                >
                  <Sparkles size={10} />
                  {chip.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
