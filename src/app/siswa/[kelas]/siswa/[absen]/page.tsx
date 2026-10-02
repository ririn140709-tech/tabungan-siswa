import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { IconArrowLeft } from "@/components/icons";
import EditNamaDialog from "@/components/edit-nama-dialog";
import StudentSavings from "@/components/student-savings";
import { ubahNamaSiswa } from "@/lib/actions";
import { bacaDB } from "@/lib/db";
import { formatRupiah, hitungSiswa, inisial } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Profil Tabungan Siswa",
};

export default async function ProfilSiswa(
  props: PageProps<"/siswa/[kelas]/siswa/[absen]">,
) {
  const { kelas, absen } = await props.params;
  const db = await bacaDB();

  const dataKelas = db.kelas.find((k) => k.id === kelas);
  if (!dataKelas) notFound();

  const nomor = Number(absen);
  if (!Number.isInteger(nomor) || nomor < 1) notFound();

  const siswa = (db.siswa[kelas] ?? []).find((s) => s.absen === nomor);
  if (!siswa) notFound();

  const transaksi = db.tabunganSiswa[kelas]?.[absen] ?? [];
  const ringkasan = hitungSiswa(siswa.saldoAwal, transaksi);

  return (
    <div className="space-y-6">
      <Link
        href={`/siswa/${dataKelas.id}`}
        className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 transition hover:text-navy-900"
      >
        <IconArrowLeft className="h-4 w-4" />
        Kembali ke daftar siswa {dataKelas.nama}
      </Link>

      <div className="card flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
        <div className="flex items-center gap-4">
          <span className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-gradient-to-b from-navy-800 to-navy-950 font-display text-xl font-semibold text-gold-300">
            {inisial(siswa.nama)}
          </span>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h1 className="min-w-0 truncate font-display text-xl font-semibold tracking-tight text-navy-900 sm:text-2xl">
                {siswa.nama}
              </h1>
              <EditNamaDialog
                aksi={ubahNamaSiswa}
                judul="Edit Nama Siswa"
                subjudul={`Absen ${siswa.absen} · Kelas ${dataKelas.nama}`}
                label="Nama Lengkap Siswa"
                nilaiAwal={siswa.nama}
                data={{
                  kelasId: dataKelas.id,
                  absen: String(siswa.absen),
                }}
                ariaTombol={`Edit nama ${siswa.nama}`}
              />
            </div>
            <p className="mt-0.5 text-sm text-slate-500">
              Absen {siswa.absen} · Kelas {dataKelas.nama} · Wali{" "}
              {dataKelas.waliKelas}
            </p>
          </div>
        </div>
        <div className="rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3 sm:text-right">
          <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-slate-500">
            Sisa Saldo
          </p>
          <p className="font-display text-xl font-semibold text-navy-900">
            {formatRupiah(ringkasan.sisaSaldo)}
          </p>
        </div>
      </div>

      <StudentSavings
        kelasId={dataKelas.id}
        absen={siswa.absen}
        siswa={{ nama: siswa.nama, saldoAwal: siswa.saldoAwal }}
        transaksi={transaksi}
      />
    </div>
  );
}
