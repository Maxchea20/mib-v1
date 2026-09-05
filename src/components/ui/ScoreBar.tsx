// File: src/components/ui/ScoreBar.tsx
import { scoreTier } from "@/lib/ui-theme";

export default function ScoreBar({ score }: { score: number }) {
  const tier = scoreTier(score);

  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <span className="label-caption">Match score</span>
        <span className={`font-data text-sm font-semibold ${tier.textClass}`}>
          {score}%
        </span>
      </div>
      <div className="w-full bg-white/[0.06] rounded-full h-1.5 overflow-hidden">
        <div
          className={`h-full rounded-full ${tier.barClass} ${tier.glowClass}`}
          style={{ width: `${score}%` }}
        />
      </div>
    </div>
  );
}
