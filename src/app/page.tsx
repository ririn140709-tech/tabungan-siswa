import Link from "next/link";
import { IconArrowRight, IconDompet, IconLock } from "@/components/icons";

const polaLatar = {
  backgroundImage:
    "linear-gradient(to right, rgba(255,255,255,0.6) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.6) 1px, transparent 1px)",
  backgroundSize: "4.5rem 4.5rem",
  maskImage:
    "radial-gradient(ellipse 70% 60% at 50% 40%, black 20%, transparent 75%)",
  WebkitMaskImage:
    "radial-gradient(ellipse 70% 60% at 50% 40%, black 20%, transparent 75%)",
};

export default function Beranda() {
  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden bg-navy-950 text-white">
      {/* Cahaya dekoratif */}
      <div className="pointer-events-none absolute -top-40 left-1/2 h-[30rem] w-[64rem] -translate-x-1/2 rounded-full bg-gold-500/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-40 -left-24 h-96 w-96 rounded-full bg-navy-600/40 blur-3xl" />
      <div className="pointer-events-none absolute -right-24 top-1/3 h-80 w-80 rounded-full bg-gold-400/10 blur-3xl" />
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.35]"
        style={polaLatar}
      />

      <header className="relative z-10 mx-auto flex w-full max-w-6xl items-center gap-3 px-6 pt-7">
        <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-b from-gold-300 to-gold-500 text-sm font-black text-navy-950 shadow-sm shadow-gold-500/30">
          T
        </span>
        <span className="text-sm font-bold tracking-tight text-slate-200">
          Tabungan Digital Sekolah
        </span>
      </header>

      <main className="relative z-10 mx-auto flex w-full max-w-4xl flex-1 flex-col items-center justify-center px-6 py-14 text-center">
        <span className="animate-fade-up inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.2em] text-gold-300">
          <IconLock className="h-3.5 w-3.5" />
          Sistem Tabungan Sekolah
        </span>

        <h1 className="animate-fade-up-1 mt-7 font-display text-4xl font-semibold leading-[1.06] tracking-tight sm:text-6xl lg:text-7xl">
          Tabungan Digital
          <span className="block bg-gradient-to-r from-gold-200 via-gold-400 to-gold-500 bg-clip-text text-transparent">
            Sekolah
          </span>
        </h1>

        <div className="animate-fade-up-1 mt-7 h-px w-32 bg-gradient-to-r from-transparent via-gold-400 to-transparent" />

        <p className="animate-fade-up-2 mt-6 max-w-xl text-base leading-relaxed text-slate-300/90 sm:text-lg">
          Kelola tabungan siswa per kelas dan tabungan guru &amp; staf dalam
          satu tempat — rapi, transparan, dan dilindungi password/PIN.
        </p>

        <Link
          href="/pilih"
          className="animate-fade-up-2 mt-9 inline-flex items-center gap-3 rounded-full bg-gradient-to-b from-gold-300 to-gold-500 px-10 py-4 text-sm font-black uppercase tracking-[0.25em] text-navy-950 shadow-[0_18px_44px_-16px_rgba(217,180,65,0.75)] transition hover:-translate-y-0.5 hover:brightness-105 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-gold-400/40"
        >
          MASUK
          <IconArrowRight className="h-4 w-4" />
        </Link>

        <div className="animate-fade-up-3 mt-10 flex flex-wrap items-center justify-center gap-x-7 gap-y-2 text-xs text-slate-400">
          <span className="inline-flex items-center gap-1.5">
            <IconLock className="h-3.5 w-3.5 text-gold-400" />
            Proteksi PIN per kelas &amp; guru
          </span>
          <span className="inline-flex items-center gap-1.5">
            <IconDompet className="h-3.5 w-3.5 text-gold-400" />
            Saldo terhitung otomatis
          </span>
        </div>
      </main>

      <footer className="relative z-10 py-6 text-center text-[11px] tracking-wide text-slate-500">
        © 2026 Tabungan Digital Sekolah
      </footer>
    </div>
  );
}
