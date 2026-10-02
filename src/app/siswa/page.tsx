import type { Metadata } from "next";
import Link from "next/link";
import {
  IconArrowLeft,
  IconChevronRight,
  IconLock,
  IconSiswa,
} from "@/components/icons";
import { bacaDB } from "@/lib/db";

export const metadata: Metadata = {
  title: "Pilih Kelas",
};

export default async function DaftarKelas() {
  const db = await bacaDB();

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-white/10 bg-navy-950">
        <div className="mx-auto flex w-full max-w-5xl items-center gap-3 px-4 py-3.5">
          <Link href="/pilih" className="flex items-center gap-2.5">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-b from-gold-300 to-gold-500 text-sm font-black text-navy-950">
              T
            </span>
            <span className="text-sm font-bold text-white">
              Tabungan Siswa per Kelas
            </span>
          </Link>
        </div>
      </header>

      <main className="mx-auto w-full max-w-5xl px-4 py-10 sm:py-14">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <nav className="flex items-center gap-2 text-xs text-slate-400">
              <Link href="/pilih" className="hover:text-gold-600">
                Kategori
              </Link>
              <span>/</span>
              <span className="font-semibold text-navy-800">Kelas</span>
            </nav>
            <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight text-navy-900">
              Pilih Kelas
            </h1>
            <p className="mt-2 text-sm text-slate-500">
              Pilih kelas untuk membuka dashboard tabungan — PIN diperlukan
              setelah kelas dipilih.
            </p>
          </div>
          <span className="inline-flex w-fit items-center gap-2 rounded-full border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-bold text-slate-500">
            <IconSiswa className="h-4 w-4 text-gold-500" />
            {db.kelas.length} kelas
          </span>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          {db.kelas.map((k) => {
            const jumlah = db.siswa[k.id]?.length ?? 0;
            return (
              <Link
                key={k.id}
                href={`/siswa/${k.id}`}
                className="group flex min-w-0 items-center gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_1px_2px_rgba(15,23,42,0.04)] transition hover:-translate-y-0.5 hover:border-gold-400 hover:shadow-[0_16px_30px_-20px_rgba(15,23,42,0.5)]"
              >
                <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-navy-900 font-display text-lg font-semibold text-gold-300 transition group-hover:bg-gold-500 group-hover:text-navy-950">
                  {k.nama.split(" ")[0]}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-base font-bold tracking-tight text-navy-900">
                    {k.nama}
                  </span>
                  <span className="block truncate text-xs text-slate-500">
                    Wali kelas {k.waliKelas} · {jumlah} siswa
                  </span>
                </span>
                <span className="flex shrink-0 items-center gap-2">
                  <span className="hidden items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-500 sm:flex">
                    <IconLock className="h-3 w-3" /> PIN
                  </span>
                  <IconChevronRight className="h-4 w-4 text-slate-300 transition group-hover:translate-x-0.5 group-hover:text-gold-500" />
                </span>
              </Link>
            );
          })}
        </div>

        <div className="mt-8 text-center">
          <Link
            href="/pilih"
            className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 transition hover:text-navy-900"
          >
            <IconArrowLeft className="h-4 w-4" />
            Ganti kategori tabungan
          </Link>
        </div>
      </main>
    </div>
  );
}
