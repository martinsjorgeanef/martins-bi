import { clsx } from "clsx";

export type BadgeTone = "good" | "warn" | "bad" | "neutral" | "accent" | "gold";

interface Props {
  children: React.ReactNode;
  tone: BadgeTone;
}

var TONE_CLASSES: Record<BadgeTone, string> = {
  good: "bg-good-bg text-good border-good/20",
  warn: "bg-warn-bg text-warn border-warn/20",
  bad: "bg-bad-bg text-bad border-bad/20",
  neutral: "bg-ink-800/5 text-ink-600 border-ink-600/10",
  accent: "bg-accent/10 text-accent-dark border-accent/20",
  gold: "bg-[#FBEBA1] text-[#946200] border-[#E8C547]/40"
};

export function Badge({ children, tone }: Props) {
  return (
    <span className={clsx("inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[12px] font-medium whitespace-nowrap", TONE_CLASSES[tone])}>
      {children}
    </span>
  );
}
