import Link from "next/link";
import type { ReactNode } from "react";
import { logoutAction } from "@/lib/actions";
import ChangePinDialog from "./change-pin-dialog";
import { IconLogout } from "./icons";

export default function DashboardShell({
  scope,
  subjudul,
  children,
}: {
  scope: string;
  subjudul: string;
  children: ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <header className="sticky top-0 z-40 border-b border-white/10 bg-navy-950/95 backdrop-blur">
        <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center gap-x-3 gap-y-2 px-4 py-3">
          <Link
            href="/pilih"
            className="group flex items-center gap-2.5 rounded-xl py-1 pr-2"
          >
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-gradient-to-b from-gold-300 to-gold-500 text-sm font-black text-navy-950 shadow-sm shadow-gold-500/30">
              T
            </span>
            <span className="hidden leading-tight sm:block">
              <span className="block text-sm font-bold text-white transition group-hover:text-gold-300">
                Tabungan Digital Sekolah
              </span>
              <span className="block text-[11px] text-slate-400">
                {subjudul}
              </span>
            </span>
          </Link>

          <span className="max-w-[10rem] truncate rounded-full border border-gold-400/30 bg-gold-400/10 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-gold-300 sm:hidden">
            {subjudul}
          </span>

          <div className="ml-auto flex items-center gap-2">
            <ChangePinDialog scope={scope} />
            <form action={logoutAction}>
              <input type="hidden" name="scope" value={scope} />
              <button
                type="submit"
                className="btn-ghost border border-rose-400/30 bg-rose-500/10 text-rose-200 transition hover:border-rose-400/60 hover:bg-rose-500/20 hover:text-white"
              >
                <IconLogout className="h-4 w-4" />
                Keluar
              </button>
            </form>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-7 sm:py-9">
        {children}
      </main>

      <footer className="border-t border-slate-200 bg-white/70 py-5">
        <p className="mx-auto max-w-6xl px-4 text-center text-xs text-slate-400">
          Tabungan Digital Sekolah · Data tersimpan aman di server sekolah
        </p>
      </footer>
    </div>
  );
}
