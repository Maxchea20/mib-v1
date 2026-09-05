// File: src/components/ui/Card.tsx
type Props = {
  children: React.ReactNode;
  className?: string;
};

export default function Card({ children, className = "" }: Props) {
  return (
    <div
      className={`bg-[#10151f] rounded-lg border border-[#1e2733] ${className}`}
    >
      {children}
    </div>
  );
}

export function CardHeader({
  title,
  caption,
  subtitle,
  action,
}: {
  title: string;
  caption?: string;
  subtitle?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="border-b border-[#1e2733] px-6 py-4 flex items-center justify-between">
      <div>
        {caption && <p className="label-caption mb-1">{caption}</p>}
        <h2 className="text-base font-semibold text-[#e7ecf3]">{title}</h2>
        {subtitle && <p className="text-sm text-[#8b95a5] mt-0.5">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}
