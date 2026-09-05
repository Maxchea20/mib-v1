// File: src/components/ui/Badge.tsx
import { badgeClassesForStatus, badgeClassesForTone, StatusTone } from "@/lib/ui-theme";

type Props = {
  children: React.ReactNode;
  status?: string | null;
  tone?: StatusTone;
  className?: string;
};

export default function Badge({ children, status, tone, className = "" }: Props) {
  const classes = tone ? badgeClassesForTone(tone) : badgeClassesForStatus(status);

  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium ring-1 ring-inset ${classes} ${className}`}
    >
      {children}
    </span>
  );
}
