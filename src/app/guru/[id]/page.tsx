import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { IconArrowLeft } from "@/components/icons";
import TeacherSavings from "@/components/teacher-savings";
import { bacaDB } from "@/lib/db";
import { formatRupiah, hitungGuru, inisial } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Profil Tabungan Guru",
};

export default async function ProfilGuru(
  props: PageProps<"/guru/[id]">,
) {
  const { id } = await props.params;
  const db = await bacaDB();

  const guru = db.guru.find((g) => g.id === id);
  if (!guru) notFound();

  const transaksi = db.tabunganGuru[guru.id] ?? [];
  const ringkasan = hitungGuru(transaksi);

  return (
    <div className="space-y-6">
      <Link
        href="/guru"
        className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 transition hover:text-navy-900"
      >
        <IconArrowLeft className="h-4 w-4" />
        Kembali ke daftar guru
      </Link>

      <div className="card flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
        <div className="flex items-center gap-4">
          <span className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-gradient-to-b from-navy-800 to-navy-950 font-display text-xl font-semibold text-gold-300">
            {inisial(guru.nama)}
          </span>
          <div className="min-w-0">
            <h1 className="truncate font-display text-xl font-semibold tracking-tight text-navy-900 sm:text-2xl">
              {guru.nama}
            </h1>
            <p className="mt-0.5 text-sm text-slate-500">{guru.jabatan}</p>
          </div>
        </div>
        <div className="rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3 sm:text-right">
          <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-slate-500">
            Saldo Tabungan
          </p>
          <p className="font-display text-xl font-semibold text-navy-900">
            {formatRupiah(ringkasan.sisaSaldo)}
          </p>
        </div>
      </div>

      <TeacherSavings guruId={guru.id} transaksi={transaksi} />
    </div>
  );
}
