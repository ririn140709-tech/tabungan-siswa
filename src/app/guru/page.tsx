import type { Metadata } from "next";
import Link from "next/link";
import { IconGuru } from "@/components/icons";
import TeacherList from "@/components/teacher-list";
import { bacaDB } from "@/lib/db";

export const metadata: Metadata = {
  title: "Daftar Guru & Staf",
};

export default async function DaftarGuru() {
  const db = await bacaDB();

  return (
    <div className="space-y-6">
      <nav className="flex items-center gap-2 text-xs text-slate-400">
        <Link href="/pilih" className="hover:text-gold-600">
          Kategori
        </Link>
        <span>/</span>
        <span className="font-semibold text-navy-800">Guru &amp; Staf</span>
      </nav>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="flex items-center gap-3 font-display text-3xl font-semibold tracking-tight text-navy-900">
            <span className="grid h-11 w-11 place-items-center rounded-2xl bg-navy-900 text-gold-400">
              <IconGuru className="h-5 w-5" />
            </span>
            Tabungan Guru &amp; Staf
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            Klik nama guru untuk membuka profil dan mencatat uang masuk/keluar.
          </p>
        </div>
        <span className="inline-flex w-fit items-center rounded-full border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-bold text-slate-500">
          {db.guru.length} guru &amp; staf
        </span>
      </div>

      <TeacherList guru={db.guru} />
    </div>
  );
}
