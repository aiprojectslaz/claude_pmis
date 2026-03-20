interface PlaceholderPageProps {
  title: string;
  domain?: string;
  stage: number;
  description?: string;
}

export function PlaceholderPage({ title, domain, stage, description }: PlaceholderPageProps) {
  return (
    <div className="p-6">
      <div className="mb-1">
        {domain && <p className="section-label mb-2">{domain}</p>}
        <h1 className="text-[14px] font-semibold text-[#1e293b]">{title}</h1>
      </div>
      <p className="text-[11px] text-[#475569] mt-1">{description ?? `Full implementation coming in Stage ${stage}.`}</p>
      <div className="mt-4 border border-dashed border-[#cbd5e1] rounded-lg p-6 text-center">
        <p className="text-[11px] text-[#94a3b8]">Stage {stage} — {title}</p>
      </div>
    </div>
  );
}
