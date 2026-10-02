import type { ReactNode } from "react";

const TONE: Record<Tone, { card: string; nilai: string; label: string }> = {
  default: {
    card: "card",
    nilai: "text-navy-900",
    label: "text-slate-500",
  },
  sukses: {
    card: "card",
    nilai: "text-emerald-600",
    label: "text-slate-500",
  },
  bahaya: {
    card: "card",
    nilai: "text-rose-600",
    label: "text-slate-500",
  },
  utama: {
    card: "rounded-2xl border border-navy-800 bg-gradient-to-br from-navy-900 to-navy-950 p-4 text-white shadow-[0_12px_28px_-18px_rgba(15,23,42,0.6)] sm:p-5",
    nilai: "text-gold-300",
    label: "text-slate-400",
  },
};

type Tone = "default" | "sukses" | "bahaya" | "utama";

export default function StatCard({
  label,
  nilai,
  sub,
  tone = "default",
  aksi,
}: {
  label: string;
  nilai: string;
  sub?: string;
  tone?: Tone;
  aksi?: ReactNode;
}) {
  const gaya = TONE[tone];
  return (
    <div className={`${gaya.card} p-4 sm:p-5`}>
      <div className="flex items-start justify-between gap-2">
        <p
          className={`text-[11px] font-bold uppercase tracking-[0.12em] ${gaya.label}`}
        >
          {label}
        </p>
        {aksi}
      </div>
      <p
        className={`mt-2 font-display text-2xl font-semibold tracking-tight sm:text-[1.7rem] ${gaya.nilai}`}
      >
        {nilai}
      </p>
      {sub && (
        <p
          className={`mt-1 text-xs ${tone === "utama" ? "text-slate-400" : "text-slate-400"}`}
        >
          {sub}
        </p>
      )}    </div>
  );
}
