type Props = {
  children: React.ReactNode;
  className?: string;
};

export default function Card({ children, className = "" }: Props) {
  return (
    <div className={`surface overflow-hidden ${className}`}>
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
    <div className="border-b border-[var(--line)] px-5 py-4 flex items-center justify-between gap-3">
      <div>
        {caption && <p className="label-caption mb-1">{caption}</p>}
        <h2 className="text-lg font-semibold text-[var(--ink)]">{title}</h2>
        {subtitle && <p className="text-sm text-[var(--ink-soft)] mt-0.5">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}
