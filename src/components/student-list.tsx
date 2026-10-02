"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ubahNamaSiswa } from "@/lib/actions";
import { formatRupiah } from "@/lib/utils";
import EditNamaDialog from "./edit-nama-dialog";
import { IconChevronRight, IconSearch, IconSiswa } from "./icons";

export default function StudentList({
  kelasId,
  siswa,
}: {
  kelasId: string;
  siswa: { absen: number; nama: string; saldo: number }[];
}) {
  const [q, setQ] = useState("");

  const hasil = useMemo(() => {
    const kata = q.trim().toLowerCase();
    if (!kata) return siswa;
    return siswa.filter(
      (s) =>
        s.nama.toLowerCase().includes(kata) || String(s.absen).includes(kata),
    );
  }, [q, siswa]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-sm">
          <IconSearch className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Cari nama atau nomor absen…"
            className="input pl-10"
            aria-label="Cari siswa"
          />
        </div>
        <p className="text-xs font-semibold text-slate-400">
          Menampilkan {hasil.length} dari {siswa.length} siswa
        </p>
      </div>

      {hasil.length === 0 ? (
        <div className="card grid place-items-center gap-2 px-6 py-12 text-center">
          <IconSiswa className="h-8 w-8 text-slate-300" />
          <p className="text-sm font-semibold text-slate-500">
            Siswa tidak ditemukan
          </p>
          <p className="text-xs text-slate-400">
            Coba kata kunci lain, misalnya nama atau angka absen.
          </p>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {hasil.map((s) => (
            <div
              key={s.absen}
              className="group flex items-center gap-2 rounded-2xl border border-slate-200 bg-white p-3.5 shadow-[0_1px_2px_rgba(15,23,42,0.04)] transition hover:-translate-y-0.5 hover:border-gold-400 hover:shadow-[0_12px_24px_-16px_rgba(15,23,42,0.4)]"
            >
              <Link
                href={`/siswa/${kelasId}/siswa/${s.absen}`}
                className="flex min-w-0 flex-1 items-center gap-3"
              >
                <span className="badge-absen transition group-hover:bg-gold-500 group-hover:text-navy-950">
                  {s.absen}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-semibold text-navy-900">
                    {s.nama}
                  </span>
                  <span className="block text-xs text-slate-500">
                    Absen {s.absen} · Saldo{" "}
                    <span className="font-bold text-navy-700">
                      {formatRupiah(s.saldo)}
                    </span>
                  </span>
                </span>
                <IconChevronRight className="h-4 w-4 shrink-0 text-slate-300 transition group-hover:translate-x-0.5 group-hover:text-gold-500" />
              </Link>
              <EditNamaDialog
                aksi={ubahNamaSiswa}
                judul="Edit Nama Siswa"
                subjudul={`Absen ${s.absen}`}
                label="Nama Lengkap Siswa"
                nilaiAwal={s.nama}
                data={{ kelasId, absen: String(s.absen) }}
                ariaTombol={`Edit nama ${s.nama}`}
                classNameTombol="opacity-70 group-hover:opacity-100"
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
