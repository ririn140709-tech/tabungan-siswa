"use client";

import { useState, useTransition, type FormEvent } from "react";
import { hapusKas, simpanKas } from "@/lib/actions";
import type { TransaksiKas } from "@/lib/types";
import {
  formatRupiah,
  formatTanggal,
  hariIni,
  hitungKas,
  namaSiswa,
  urutTerbaru,
} from "@/lib/utils";
import {
  IconKosong,
  IconNaik,
  IconPencil,
  IconTrash,
  IconTurun,
} from "./icons";
import StatCard from "./stat-card";

type Flash = { tipe: "sukses" | "error"; teks: string } | null;

function bersihkan(form: HTMLFormElement) {
  for (const nama of ["nominal", "keterangan"]) {
    const el = form.elements.namedItem(nama);
    if (el instanceof HTMLInputElement) el.value = "";
  }
  const nominal = form.elements.namedItem("nominal");
  if (nominal instanceof HTMLInputElement) nominal.focus();
}

/* ------------------------------ Form Iuran ------------------------------ */

function FormIuran({
  kelasId,
  siswa,
  editing,
  onClose,
}: {
  kelasId: string;
  siswa: { absen: number; nama: string }[];
  editing: TransaksiKas | null;
  onClose: () => void;
}) {
  const [error, setError] = useState<string | null>(null);
  const [sukses, setSukses] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function kirim(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);
    setError(null);
    setSukses(null);
    startTransition(async () => {
      const hasil = await simpanKas(formData);
      if (!hasil.ok) {
        setError(hasil.error);
        return;
      }
      bersihkan(form);
      onClose();
      setSukses(hasil.message ?? "Tersimpan.");
      setTimeout(() => setSukses(null), 4000);
    });
  }

  return (
    <div className="card p-5">
      <div className="mb-4 flex items-center gap-3">
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-emerald-50 text-emerald-600">
          <IconNaik className="h-4.5 w-4.5" />
        </span>
        <div>
          <h3 className="text-sm font-bold tracking-tight text-navy-900">
            {editing ? "Edit Iuran Kas" : "Catat Iuran Kas Siswa"}
          </h3>
          <p className="text-xs text-slate-500">
            Iuran mingguan per siswa (kas masuk).
          </p>
        </div>
      </div>

      <form method="post" onSubmit={kirim} className="space-y-4">
        <input type="hidden" name="kelasId" value={kelasId} />
        <input type="hidden" name="jenis" value="iuran" />
        {editing && <input type="hidden" name="id" value={editing.id} />}

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="label" htmlFor="tanggalIuran">
              Tanggal
            </label>
            <input
              id="tanggalIuran"
              name="tanggal"
              type="date"
              required
              defaultValue={editing?.tanggal ?? hariIni()}
              className="input"
            />
          </div>
          <div>
            <label className="label" htmlFor="absenIuran">
              Siswa
            </label>
            <select
              id="absenIuran"
              name="absen"
              required
              defaultValue={editing?.absen ? String(editing.absen) : ""}
              className="input"
            >
              <option value="" disabled>
                — Pilih siswa —
              </option>
              {siswa.map((s) => (
                <option key={s.absen} value={s.absen}>
                  {s.absen}. {s.nama}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="label" htmlFor="nominalIuran">
              Nominal
            </label>
            <div className="relative">
              <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-400">
                Rp
              </span>
              <input
                id="nominalIuran"
                name="nominal"
                inputMode="numeric"
                required
                placeholder="10000"
                defaultValue={editing ? String(editing.nominal) : ""}
                className="input pl-10"
              />
            </div>
          </div>
          <div>
            <label className="label" htmlFor="keteranganIuran">
              Keterangan
            </label>
            <input
              id="keteranganIuran"
              name="keterangan"
              required
              maxLength={120}
              placeholder="contoh: Iuran kas minggu ke-2"
              defaultValue={editing?.keterangan ?? ""}
              className="input"
            />
          </div>
        </div>

        {error && <p className="alert-error">{error}</p>}
        {sukses && <p className="alert-success">{sukses}</p>}

        <div className="flex justify-end gap-2">
          {editing && (
            <button type="button" onClick={onClose} className="btn-outline">
              Batal
            </button>
          )}
          <button type="submit" disabled={pending} className="btn-gold">
            {pending ? "Menyimpan…" : editing ? "Simpan Perubahan" : "Catat Iuran"}
          </button>
        </div>
      </form>
    </div>
  );
}

/* --------------------------- Form Pengeluaran --------------------------- */

function FormPengeluaran({
  kelasId,
  editing,
  onClose,
}: {
  kelasId: string;
  editing: TransaksiKas | null;
  onClose: () => void;
}) {
  const [error, setError] = useState<string | null>(null);
  const [sukses, setSukses] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function kirim(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);
    setError(null);
    setSukses(null);
    startTransition(async () => {
      const hasil = await simpanKas(formData);
      if (!hasil.ok) {
        setError(hasil.error);
        return;
      }
      bersihkan(form);
      onClose();
      setSukses(hasil.message ?? "Tersimpan.");
      setTimeout(() => setSukses(null), 4000);
    });
  }

  return (
    <div className="card p-5">
      <div className="mb-4 flex items-center gap-3">
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-rose-50 text-rose-600">
          <IconTurun className="h-4.5 w-4.5" />
        </span>
        <div>
          <h3 className="text-sm font-bold tracking-tight text-navy-900">
            {editing ? "Edit Pengeluaran Kas" : "Catat Pengeluaran Kas Kelas"}
          </h3>
          <p className="text-xs text-slate-500">
            Kebutuhan kelas seperti alat kebersihan (kas keluar).
          </p>
        </div>
      </div>

      <form method="post" onSubmit={kirim} className="space-y-4">
        <input type="hidden" name="kelasId" value={kelasId} />
        <input type="hidden" name="jenis" value="pengeluaran" />
        {editing && <input type="hidden" name="id" value={editing.id} />}

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="label" htmlFor="tanggalKeluar">
              Tanggal
            </label>
            <input
              id="tanggalKeluar"
              name="tanggal"
              type="date"
              required
              defaultValue={editing?.tanggal ?? hariIni()}
              className="input"
            />
          </div>
          <div>
            <label className="label" htmlFor="nominalKeluar">
              Nominal
            </label>
            <div className="relative">
              <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-400">
                Rp
              </span>
              <input
                id="nominalKeluar"
                name="nominal"
                inputMode="numeric"
                required
                placeholder="100000"
                defaultValue={editing ? String(editing.nominal) : ""}
                className="input pl-10"
              />
            </div>
          </div>
          <div className="sm:col-span-2">
            <label className="label" htmlFor="keteranganKeluar">
              Keterangan
            </label>
            <input
              id="keteranganKeluar"
              name="keterangan"
              required
              maxLength={120}
              placeholder="contoh: Beli sapu kelas Rp100.000"
              defaultValue={editing?.keterangan ?? ""}
              className="input"
            />
          </div>
        </div>

        {error && <p className="alert-error">{error}</p>}
        {sukses && <p className="alert-success">{sukses}</p>}

        <div className="flex justify-end gap-2">
          {editing && (
            <button type="button" onClick={onClose} className="btn-outline">
              Batal
            </button>
          )}
          <button type="submit" disabled={pending} className="btn-gold">
            {pending
              ? "Menyimpan…"
              : editing
                ? "Simpan Perubahan"
                : "Catat Pengeluaran"}
          </button>
        </div>
      </form>
    </div>
  );
}

/* ------------------------------- Panel Kas ------------------------------- */

export default function KasPanel({
  kelasId,
  kas,
  siswa,
}: {
  kelasId: string;
  kas: TransaksiKas[];
  siswa: { absen: number; nama: string }[];
}) {
  const ringkasan = hitungKas(kas);
  const daftar = urutTerbaru(kas);
  const [editing, setEditing] = useState<TransaksiKas | null>(null);
  const [flash, setFlash] = useState<Flash>(null);
  const [pending, startTransition] = useTransition();

  const editingIuran = editing?.jenis === "iuran" ? editing : null;
  const editingKeluar =
    editing?.jenis === "pengeluaran" ? editing : null;

  function beritahu(f: Flash) {
    setFlash(f);
    setTimeout(() => setFlash(null), 4000);
  }

  function hapus(t: TransaksiKas) {
    const yangHapus =
      t.jenis === "iuran" && t.absen
        ? `iuran ${namaSiswa(siswa, t.absen) ?? `absen ${t.absen}`}`
        : `pengeluaran "${t.keterangan}"`;
    if (!window.confirm(`Hapus ${yangHapus}? Tindakan tidak bisa dibatalkan.`))
      return;
    startTransition(async () => {
      const hasil = await hapusKas({ kelasId, id: t.id });
      beritahu({
        tipe: hasil.ok ? "sukses" : "error",
        teks: hasil.ok
          ? (hasil.message ?? "Berhasil dihapus.")
          : (hasil.error ?? "Gagal."),
      });
      if (editing?.id === t.id) setEditing(null);
    });
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-3 sm:grid-cols-3">
        <StatCard
          label="Total Saldo Kas Kelas"
          nilai={formatRupiah(ringkasan.sisaSaldo)}
          tone="utama"
          sub="Sisa kas yang tersedia"
        />
        <StatCard
          label="Total Iuran Masuk"
          nilai={formatRupiah(ringkasan.totalMasuk)}
          tone="sukses"
          sub={`${daftar.filter((k) => k.jenis === "iuran").length} catatan iuran`}
        />
        <StatCard
          label="Total Pengeluaran"
          nilai={formatRupiah(ringkasan.totalKeluar)}
          tone="bahaya"
          sub={`${daftar.filter((k) => k.jenis === "pengeluaran").length} catatan keluar`}
        />
      </div>

      {flash && (
        <p className={flash.tipe === "sukses" ? "alert-success" : "alert-error"}>
          {flash.teks}
        </p>
      )}

      <div className="grid gap-4 lg:grid-cols-2">
        <FormIuran
          key={editingIuran?.id ?? "iuran-baru"}
          kelasId={kelasId}
          siswa={siswa}
          editing={editingIuran}
          onClose={() => setEditing(null)}
        />
        <FormPengeluaran
          key={editingKeluar?.id ?? "keluar-baru"}
          kelasId={kelasId}
          editing={editingKeluar}
          onClose={() => setEditing(null)}
        />
      </div>

      <div className="card overflow-hidden">
        <div className="flex items-center justify-between gap-3 border-b border-slate-100 px-5 py-4">
          <h2 className="text-base font-bold tracking-tight text-navy-900">
            Riwayat Kas Kelas
          </h2>
          <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-bold text-slate-500">
            {daftar.length} transaksi
          </span>
        </div>

        {daftar.length === 0 ? (
          <div className="grid place-items-center gap-2 px-6 py-12 text-center">
            <IconKosong className="h-8 w-8 text-slate-300" />
            <p className="text-sm font-semibold text-slate-500">
              Belum ada catatan kas
            </p>
            <p className="text-xs text-slate-400">
              Mulai dari iuran kas mingguan siswa.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[680px] text-sm">
              <thead className="bg-slate-50">
                <tr>
                  <th className="th">Tanggal</th>
                  <th className="th">Jenis</th>
                  <th className="th">Keterangan</th>
                  <th className="th text-right">Nominal</th>
                  <th className="th text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {daftar.map((t) => (
                  <tr
                    key={t.id}
                    className={
                      editing?.id === t.id
                        ? "bg-gold-100/60"
                        : "transition hover:bg-slate-50/80"
                    }
                  >
                    <td className="whitespace-nowrap px-4 py-3 text-slate-600">
                      {formatTanggal(t.tanggal)}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide ${
                          t.jenis === "iuran"
                            ? "border-emerald-100 bg-emerald-50 text-emerald-700"
                            : "border-rose-100 bg-rose-50 text-rose-600"
                        }`}
                      >
                        {t.jenis === "iuran" ? (
                          <IconNaik className="h-3 w-3" />
                        ) : (
                          <IconTurun className="h-3 w-3" />
                        )}
                        {t.jenis}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="font-medium text-navy-900">
                        {t.keterangan}
                      </span>
                      {t.jenis === "iuran" && t.absen != null && (
                        <span className="block text-xs text-slate-500">
                          {namaSiswa(siswa, t.absen) ?? "—"} · Absen {t.absen}
                        </span>
                      )}
                    </td>
                    <td
                      className={`whitespace-nowrap px-4 py-3 text-right font-display text-base font-semibold ${
                        t.jenis === "iuran"
                          ? "text-emerald-600"
                          : "text-rose-600"
                      }`}
                    >
                      {t.jenis === "iuran" ? "+" : "−"}{" "}
                      {formatRupiah(t.nominal)}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3">
                      <div className="flex justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => setEditing(t)}
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
