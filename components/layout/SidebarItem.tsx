"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";
import { DomainHealthDot } from "@/components/ui/DomainHealthDot";

interface SidebarItemProps {
  href: string;
  label: string;
  icon?: LucideIcon;
  health?: "green" | "amber" | "red";
  domainColour?: string;
  indent?: boolean;
}

export function SidebarItem({ href, label, icon: Icon, health, domainColour, indent }: SidebarItemProps) {
  const pathname = usePathname();
  const isActive = pathname === href || (href !== "/dashboard" && pathname.startsWith(href));

  return (
    <Link
      href={href}
      className={cn(
        "flex items-center gap-2 px-3 py-1.5 rounded-md text-[12px] transition-colors group",
        indent ? "ml-4" : "",
        isActive
          ? "bg-[#dbeafe] text-[#1d4ed8] font-medium"
          : "text-[#475569] hover:bg-[#f1f5f9] hover:text-[#1e293b]"
      )}
    >
      {health && !domainColour && (
        <DomainHealthDot health={health} size="sm" />
      )}
      {domainColour && (
        <DomainHealthDot health={health ?? "green"} domainColour={domainColour} size="sm" />
      )}
      {Icon && !health && !domainColour && (
        <Icon size={13} className="flex-shrink-0 text-[#94a3b8]" />
      )}
      <span className="truncate">{label}</span>
    </Link>
  );
}
