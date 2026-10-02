import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import KasPanel from "@/components/kas-panel";
import StudentList from "@/components/student-list";
import EditNamaDialog from "@/components/edit-nama-dialog";
import { IconKas, IconSiswa } from "@/components/icons";
import { ubahWaliKelas } from "@/lib/actions";
import { bacaDB } from "@/lib/db";
import { hitungSiswa } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Dashboard Kelas",
};

export default async function HalamanKelas(
  props: PageProps<"/siswa/[kelas]">,
) {
  const { kelas } = await props.params;
  const { tab } = await props.searchParams;

  const db = await bacaDB();
  const data = db.kelas.find((k) => k.id === kelas);
  if (!data) notFound();

  const daftarDenganSaldo = (db.siswa[kelas] ?? []).map((s) => ({
    absen: s.absen,
    nama: s.nama,
    saldo: hitungSiswa(
      s.saldoAwal,
      db.tabunganSiswa[kelas]?.[String(s.absen)] ?? [],
    ).sisaSaldo,
  }));

  const kas = db.kasKelas[kelas] ?? [];
  const tabAktif = tab === "kas" ? "kas" : "pribadi";

  const gayaTab = (aktif: boolean) =>
    `flex flex-1 items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold transition sm:flex-none ${
      aktif
        ? "bg-navy-900 text-white shadow-sm"
        : "text-slate-500 hover:bg-slate-100 hover:text-navy-900"
    }`;

  return (
    <div className="space-y-6">
      <nav className="flex items-center gap-2 text-xs text-slate-400">
        <Link href="/pilih" className="hover:text-gold-600">
          Kategori
        </Link>
        <span>/</span>
        <Link href="/siswa" className="hover:text-gold-600">
          Kelas
        </Link>
        <span>/</span>
        <span className="font-semibold text-navy-800">{data.nama}</span>
      </nav>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-display text-3xl font-semibold tracking-tight text-navy-900">
            Kelas {data.nama}
          </h1>
          <p className="mt-1.5 flex flex-wrap items-center gap-2 text-sm text-slate-500">
            <span>
              Wali kelas {data.waliKelas} · {daftarDenganSaldo.length} siswa
            </span>
            <EditNamaDialog
              aksi={ubahWaliKelas}
              judul="Edit Nama Wali Kelas"
              subjudul={`Kelas ${data.nama}`}
              label="Nama Wali Kelas"
              nilaiAwal={data.waliKelas}
              data={{ kelasId: data.id }}
              ariaTombol="Edit nama wali kelas"
            />
          </p>
        </div>
        <span className="inline-flex w-fit items-center gap-2 rounded-full border border-emerald-100 bg-emerald-50 px-3.5 py-1.5 text-xs font-bold text-emerald-700">
          <span className="h-2 w-2 rounded-full bg-emerald-500" />
          Sesi terbuka
        </span>
      </div>

      <div className="flex gap-1.5 rounded-2xl border border-slate-200 bg-white p-1.5 shadow-sm">
        <Link
          href={`/siswa/${data.id}`}
          className={gayaTab(tabAktif === "pribadi")}
        >
          <IconSiswa className="h-4 w-4" />
          Tabungan Pribadi Siswa
        </Link>
        <Link
          href={`/siswa/${data.id}?tab=kas`}
          className={gayaTab(tabAktif === "kas")}
        >
          <IconKas className="h-4 w-4" />
          Uang Kas Kelas
        </Link>
      </div>

      {tabAktif === "pribadi" ? (
        <StudentList kelasId={data.id} siswa={daftarDenganSaldo} />
      ) : (
        <KasPanel kelasId={data.id} kas={kas} siswa={db.siswa[kelas] ?? []} />
      )}
    </div>
  );
}
