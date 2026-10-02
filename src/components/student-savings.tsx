"use client";

import { useState, useTransition, type FormEvent } from "react";
import {
  hapusTransaksiSiswa,
  simpanTransaksiSiswa,
  ubahSaldoAwal,
} from "@/lib/actions";
import type { TransaksiSiswa } from "@/lib/types";
import {
  formatRupiah,
  formatTanggal,
  hariIni,
  hitungSiswa,
  urutTerbaru,
} from "@/lib/utils";
import {
  IconKosong,
  IconNaik,
  IconPencil,
  IconPlus,
  IconTrash,
  IconTurun,
} from "./icons";
import StatCard from "./stat-card";

type Flash = { tipe: "sukses" | "error"; teks: string } | null;

export default function StudentSavings({
  kelasId,
  absen,
  siswa,
  transaksi,
}: {
  kelasId: string;
  absen: number;
  siswa: { nama: string; saldoAwal: number };
  transaksi: TransaksiSiswa[];
}) {
  const ringkasan = hitungSiswa(siswa.saldoAwal, transaksi);
  const daftar = urutTerbaru(transaksi);

  const [edit, setEdit] = useState<TransaksiSiswa | null>(null);
  const [editSaldo, setEditSaldo] = useState(false);
  const [flash, setFlash] = useState<Flash>(null);
  const [error, setError] = useState<string | null>(null);
  const [errorSaldo, setErrorSaldo] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function beritahu(f: Flash) {
    setFlash(f);
    setTimeout(() => setFlash(null), 4000);
  }

  function simpanTransaksi(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);
    setError(null);
    startTransition(async () => {
      const hasil = await simpanTransaksiSiswa(formData);
      if (!hasil.ok) {
        setError(hasil.error);
        return;
      }
      setEdit(null);
      // Bersihkan isian untuk entri berikutnya (tanggal & jenis tetap).
      const nominal = form.elements.namedItem("nominal");
      const keterangan = form.elements.namedItem("keterangan");
      if (nominal instanceof HTMLInputElement) {
        nominal.value = "";
        nominal.focus();
      }
      if (keterangan instanceof HTMLInputElement) keterangan.value = "";
      beritahu({ tipe: "sukses", teks: hasil.message ?? "Tersimpan." });
    });
  }

  function simpanSaldoAwal(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    setErrorSaldo(null);
    startTransition(async () => {
      const hasil = await ubahSaldoAwal(formData);
      if (hasil.ok) {
        setEditSaldo(false);
        beritahu({ tipe: "sukses", teks: hasil.message ?? "Tersimpan." });
      } else {
        setErrorSaldo(hasil.error);
      }
    });
  }

  function mulaiEdit(t: TransaksiSiswa) {
    setError(null);
    setEdit(t);
    document
      .getElementById("form-transaksi")
      ?.scrollIntoView({ behavior: "smooth", block: "center" });
  }

  function hapus(t: TransaksiSiswa) {
    if (!window.confirm("Hapus transaksi ini? Tindakan tidak bisa dibatalkan."))
      return;
    startTransition(async () => {
      const hasil = await hapusTransaksiSiswa({
        kelasId,
        absen,
        id: t.id,
      });
      beritahu({
        tipe: hasil.ok ? "sukses" : "error",
        teks: hasil.ok
          ? (hasil.message ?? "Transaksi dihapus.")
          : (hasil.error ?? "Gagal."),
      });
      if (edit?.id === t.id) setEdit(null);
    });
  }

  return (
    <div className="space-y-6">
      {/* Ringkasan saldo */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Saldo Awal"
          nilai={formatRupiah(ringkasan.saldoAwal)}
          sub="Saldo sebelum transaksi"
          aksi={
            <button
              type="button"
              onClick={() => setEditSaldo((v) => !v)}
              className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-navy-800"
              title="Ubah saldo awal"
            >
              <IconPencil className="h-4 w-4" />
            </button>
          }
        />
        <StatCard
          label="Total Masuk"
          nilai={formatRupiah(ringkasan.totalMasuk)}
          tone="sukses"
          sub="Jumlah seluruh setoran"
        />
        <StatCard
          label="Total Keluar"
          nilai={formatRupiah(ringkasan.totalKeluar)}
          tone="bahaya"
          sub="Jumlah seluruh penarikan"
        />
        <StatCard
          label="Sisa Saldo"
          nilai={formatRupiah(ringkasan.sisaSaldo)}
          tone="utama"
          sub="Terhitung otomatis"
        />
      </div>

      {editSaldo && (
        <div className="card p-4">
          <form method="post" onSubmit={simpanSaldoAwal} className="flex flex-col gap-3 sm:flex-row sm:items-end">
            <input type="hidden" name="kelasId" value={kelasId} />
            <input type="hidden" name="absen" value={absen} />
            <div className="flex-1">
              <label className="label" htmlFor="saldoAwal">
                Ubah Saldo Awal (Rp)
              </label>
              <input
                id="saldoAwal"
                name="saldoAwal"
                inputMode="numeric"
                className="input sm:max-w-xs"
                defaultValue={String(siswa.saldoAwal)}
                placeholder="contoh: 20000"
              />
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                disabled={pending}
                className="btn-primary"
              >
                {pending ? "Menyimpan…" : "Simpan"}
              </button>
              <button
                type="button"
                onClick={() => setEditSaldo(false)}
                className="btn-outline"
              >
                Batal
              </button>
            </div>
          </form>
          {errorSaldo && <p className="alert-error mt-3">{errorSaldo}</p>}
        </div>
      )}

      {flash && (
        <p className={flash.tipe === "sukses" ? "alert-success" : "alert-error"}>
          {flash.teks}
        </p>
      )}

      {/* Form transaksi */}
      <div id="form-transaksi" className="card scroll-mt-24 p-5 sm:p-6">
        <div className="mb-5 flex items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-bold tracking-tight text-navy-900">
              {edit ? "Edit Transaksi" : "Catat Transaksi Baru"}
            </h2>
            <p className="text-xs text-slate-500">
              {edit
                ? `Memperbarui "${edit.keterangan}" (${formatTanggal(edit.tanggal)})`
                : "Isi nominal, jenis, tanggal, lalu simpan."}
            </p>
          </div>
          {edit && (
            <button
              type="button"
              onClick={() => setEdit(null)}
              className="btn-outline shrink-0"
            >
              Batal Edit
            </button>
          )}
        </div>

        <form
          key={edit?.id ?? "baru"}
          method="post"
          onSubmit={simpanTransaksi}
          className="space-y-4"
        >
          <input type="hidden" name="kelasId" value={kelasId} />
          <input type="hidden" name="absen" value={absen} />
          {edit && <input type="hidden" name="id" value={edit.id} />}

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="label" htmlFor="nominal">
                Nominal
              </label>
              <div className="relative">
                <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-400">
                  Rp
                </span>
                <input
                  id="nominal"
                  name="nominal"
                  inputMode="numeric"
                  required
                  placeholder="50000"
                  defaultValue={edit ? String(edit.nominal) : ""}
                  className="input pl-10"
                />
              </div>
            </div>

            <div>
              <label className="label" htmlFor="tanggal">
                Tanggal Transaksi
              </label>
              <input
                id="tanggal"
                name="tanggal"
                type="date"
                required
                defaultValue={edit?.tanggal ?? hariIni()}
                className="input"
              />
            </div>

            <div>
              <span className="label">Jenis Transaksi</span>
              <div className="grid grid-cols-2 gap-1.5 rounded-xl bg-slate-100 p-1">
                <label className="cursor-pointer">
                  <input
                    type="radio"
                    name="jenis"
                    value="setor"
                    className="peer sr-only"
                    defaultChecked={!edit || edit.jenis === "setor"}
                  />
                  <span className="block rounded-lg px-3 py-2 text-center text-sm font-bold text-slate-500 transition peer-checked:bg-white peer-checked:text-emerald-600 peer-checked:shadow-sm">
                    Setor
                  </span>
                </label>
                <label className="cursor-pointer">
                  <input
                    type="radio"
                    name="jenis"
                    value="tarik"
                    className="peer sr-only"
                    defaultChecked={edit?.jenis === "tarik"}
                  />
                  <span className="block rounded-lg px-3 py-2 text-center text-sm font-bold text-slate-500 transition peer-checked:bg-white peer-checked:text-rose-600 peer-checked:shadow-sm">
                    Tarik
                  </span>
                </label>
              </div>
            </div>

            <div>
              <label className="label" htmlFor="keterangan">
                Keterangan
              </label>
              <input
                id="keterangan"
                name="keterangan"
                required
                maxLength={120}
                placeholder="contoh: Beli sapu kelas"
                defaultValue={edit?.keterangan ?? ""}
                className="input"
              />
            </div>
          </div>

          {error && <p className="alert-error">{error}</p>}

          <div className="flex justify-end">
            <button type="submit" disabled={pending} className="btn-gold">
              {pending ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-navy-950/30 border-t-navy-950" />
                  Menyimpan…
                </>
              ) : edit ? (
                <>
                  <IconPencil className="h-4 w-4" />
                  Simpan Perubahan
                </>
              ) : (
                <>
                  <IconPlus className="h-4 w-4" />
                  Tambah Transaksi
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Riwayat transaksi */}
      <div className="card overflow-hidden">
        <div className="flex items-center justify-between gap-3 border-b border-slate-100 px-5 py-4">
          <h2 className="text-base font-bold tracking-tight text-navy-900">
            Riwayat Transaksi
          </h2>
          <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-bold text-slate-500">
            {daftar.length} transaksi
          </span>
        </div>

        {daftar.length === 0 ? (
          <div className="grid place-items-center gap-2 px-6 py-12 text-center">
            <IconKosong className="h-8 w-8 text-slate-300" />
            <p className="text-sm font-semibold text-slate-500">
              Belum ada transaksi
            </p>
            <p className="text-xs text-slate-400">
              Catat setoran pertama lewat form di atas.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-sm">
              <thead className="bg-slate-50">
                <tr>
                  <th className="th">Tanggal</th>
                  <th className="th">Keterangan</th>
                  <th className="th">Jenis</th>
                  <th className="th text-right">Nominal</th>
                  <th className="th text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {daftar.map((t) => (
                  <tr
                    key={t.id}
                    className={
                      edit?.id === t.id
                        ? "bg-gold-100/60"
                        : "transition hover:bg-slate-50/80"
                    }
                  >
                    <td className="whitespace-nowrap px-4 py-3 text-slate-600">
                      {formatTanggal(t.tanggal)}
                    </td>
                    <td className="px-4 py-3 font-medium text-navy-900">
                      {t.keterangan}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide ${
                          t.jenis === "setor"
                            ? "border-emerald-100 bg-emerald-50 text-emerald-700"
                            : "border-rose-100 bg-rose-50 text-rose-600"
                        }`}
                      >
                        {t.jenis === "setor" ? (
                          <IconNaik className="h-3 w-3" />
                        ) : (
                          <IconTurun className="h-3 w-3" />
                        )}
                        {t.jenis}
                      </span>
                    </td>
                    <td
                      className={`whitespace-nowrap px-4 py-3 text-right font-display text-base font-semibold ${
                        t.jenis === "setor"
                          ? "text-emerald-600"
                          : "text-rose-600"
                      }`}
                    >
                      {t.jenis === "setor" ? "+" : "−"}{" "}
                      {formatRupiah(t.nominal)}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3">
                      <div className="flex justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => mulaiEdit(t)}
                          className="rounded-lg p-2 text-slate-400 transition hover:bg-navy-900 hover:text-white"
                          title="Edit transaksi"
                        >
                          <IconPencil className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          disabled={pending}
                          onClick={() => hapus(t)}
                          className="rounded-lg p-2 text-slate-400 transition hover:bg-rose-500 hover:text-white disabled:opacity-50"
                          title="Hapus transaksi"
                        >
                          <IconTrash className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
