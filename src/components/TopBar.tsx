"use client";

type Props = {
  onMenuClick?: () => void;
};

export default function TopBar({ onMenuClick }: Props) {
  return (
    <header className="sticky top-0 z-30 flex items-center justify-between border-b border-[var(--line)] bg-[var(--paper)]/90 backdrop-blur px-4 py-3 pt-[max(0.75rem,env(safe-area-inset-top))]">
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="md:hidden rounded-full p-2 min-w-11 min-h-11 border border-[var(--line)]"
          aria-label="Open menu"
        >
          <span className="block w-4 h-px bg-[var(--ink)] mb-1" />
          <span className="block w-4 h-px bg-[var(--ink)] mb-1" />
          <span className="block w-3 h-px bg-[var(--ink)]" />
        </button>
        <div>
          <p className="label-caption leading-none">Desk</p>
          <h1 className="font-display text-xl leading-tight">MIB</h1>
        </div>
      </div>
    </header>
  );
}
