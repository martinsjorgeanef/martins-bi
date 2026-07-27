import { ReactNode } from "react";
import { clsx } from "clsx";

export type CalloutTone = "gold" | "bad" | "good";

interface Props {
  title: string;
  subtitle?: string;
  value?: string;
  valueLabel?: string;
  tone?: CalloutTone;
  children?: ReactNode;
  className?: string;
}

var TONE_CLASSES: Record<CalloutTone, string> = {
  gold: "bg-[#FBEBA1] border-[#E8C547]/50 text-[#5A4300]",
  bad: "bg-bad-bg border-bad/30 text-bad",
  good: "bg-good-bg border-good/30 text-good"
};

var VALUE_CLASSES: Record<CalloutTone, string> = {
  gold: "text-[#946200]",
  bad: "text-bad",
  good: "text-good"
};

export function Callout({ title, subtitle, value, valueLabel, tone, children, className }: Props) {
  var t = tone || "gold";
  return (
    <div className={clsx("flex items-center justify-between gap-4 rounded-xl border px-4 py-3", TONE_CLASSES[t], className)}>
      <div>
        <div className="text-[13px] font-semibold">{title}</div>
        {subtitle ? <div className="mt-0.5 text-[12px] opacity-80">{subtitle}</div> : null}
        {children}
      </div>
      {value ? (
        <div className="text-right">
          <div className={clsx("text-[22px] font-bold leading-tight tabular-nums", VALUE_CLASSES[t])}>{value}</div>
          {valueLabel ? <div className="text-[11px] font-medium uppercase opacity-70">{valueLabel}</div> : null}
        </div>
      ) : null}
    </div>
  );
}
