import type { Metadata } from "next";
import Link from "next/link";
import {
  IconArrowLeft,
  IconArrowRight,
  IconGuru,
  IconSiswa,
} from "@/components/icons";

export const metadata: Metadata = {
  title: "Pilih Kategori Tabungan",
};

export default function PilihKategori() {
  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-white/10 bg-navy-950">
        <div className="mx-auto flex w-full max-w-5xl items-center gap-3 px-4 py-3.5">
          <Link href="/" className="flex items-center gap-2.5">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-b from-gold-300 to-gold-500 text-sm font-black text-navy-950">
              T
            </span>
            <span className="text-sm font-bold text-white">
              Tabungan Digital Sekolah
            </span>
          </Link>
        </div>
      </header>

      <main className="mx-auto w-full max-w-5xl px-4 py-12 sm:py-16">
        <div className="text-center">
          <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-gold-600">
            Langkah 1 dari 2
          </p>
          <h1 className="mt-3 font-display text-3xl font-semibold tracking-tight text-navy-900 sm:text-4xl">
            Pilih Kategori Tabungan
          </h1>
          <p className="mx-auto mt-3 max-w-lg text-sm leading-relaxed text-slate-500 sm:text-base">
            Tentukan data tabungan yang ingin dibuka. Setiap kategori
            dilindungi password/PIN agar data tidak diutak-atik pihak lain.
          </p>
        </div>

        <div className="mt-10 grid gap-5 md:grid-cols-2">
          <Link
            href="/siswa"
            className="group card relative overflow-hidden p-6 transition hover:-translate-y-1 hover:border-gold-400 sm:p-7"
          >
            <span className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-gold-100 blur-2xl" />
            <span className="relative grid h-12 w-12 place-items-center rounded-2xl bg-navy-900 text-gold-400 transition group-hover:bg-gold-500 group-hover:text-navy-950">
              <IconSiswa className="h-6 w-6" />
            </span>
            <h2 className="relative mt-5 text-lg font-bold tracking-tight text-navy-900">
              Tabungan Siswa per Kelas
            </h2>
            <p className="relative mt-2 text-sm leading-relaxed text-slate-500">
              Daftar 45 siswa per kelas menurut nomor absen, tabungan pribadi
              siswa, sekaligus uang kas kelas.
            </p>
            <span className="relative mt-5 inline-flex items-center gap-2 text-sm font-bold text-navy-800 transition group-hover:text-gold-600">
              Buka daftar kelas
              <IconArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
            </span>
          </Link>

          <Link
            href="/guru"
            className="group card relative overflow-hidden p-6 transition hover:-translate-y-1 hover:border-gold-400 sm:p-7"
          >
            <span className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-gold-100 blur-2xl" />
            <span className="relative grid h-12 w-12 place-items-center rounded-2xl bg-navy-900 text-gold-400 transition group-hover:bg-gold-500 group-hover:text-navy-950">
              <IconGuru className="h-6 w-6" />
            </span>
            <h2 className="relative mt-5 text-lg font-bold tracking-tight text-navy-900">
              Tabungan Guru &amp; Staf
            </h2>
            <p className="relative mt-2 text-sm leading-relaxed text-slate-500">
              Pencarian nama guru yang cepat, lalu catat uang masuk/keluar
              lengkap dengan tanggal dan keterangan.
            </p>
            <span className="relative mt-5 inline-flex items-center gap-2 text-sm font-bold text-navy-800 transition group-hover:text-gold-600">
              Buka daftar guru
              <IconArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
            </span>
          </Link>
        </div>

        <div className="mt-9 text-center">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 transition hover:text-navy-900"
          >
            <IconArrowLeft className="h-4 w-4" />
            Kembali ke halaman depan
          </Link>
        </div>
      </main>
    </div>
  );
}
