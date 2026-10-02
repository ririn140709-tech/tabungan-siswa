"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { randomUUID } from "node:crypto";
import { buatSesi, hapusSesi, scopeValid, sesiAktif } from "./auth";
import { hashPin, verifyPin } from "./crypto";
import { bacaDB, mutasi, scopeKelas } from "./db";
import type {
  ActionResult,
  JenisGuru,
  JenisKas,
  JenisSiswa,
} from "./types";

/* ------------------------------------------------------------------ */
/* Helper                                                             */
/* ------------------------------------------------------------------ */

const gagal = (error: string): ActionResult => ({
  ok: false,
  error,
  message: null,
});

const sukses = (message: string): ActionResult => ({
  ok: true,
  error: null,
  message,
});

function teks(v: FormDataEntryValue | null | undefined): string {
  return typeof v === "string" ? v : "";
}

function uid(): string {
  return randomUUID();
}

function parseNominal(
  v: FormDataEntryValue | null | undefined,
  bolehNol = false,
): number | null {
  const bersih = teks(v).replace(/[^\d]/g, "");
  if (!bersih) return null;
  const n = Number(bersih);
  if (!Number.isFinite(n)) return null;
  if (bolehNol ? n < 0 : n <= 0) return null;
  if (n > 1_000_000_000) return null;
  return Math.trunc(n);
}

function parseTanggal(v: FormDataEntryValue | null | undefined): string | null {
  const s = teks(v);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(s)) return null;
  const d = new Date(`${s}T00:00:00`);
  if (Number.isNaN(d.getTime())) return null;
  const tahun = d.getFullYear();
  if (tahun < 2000 || tahun > 2100) return null;
  return s;
}

function parseKeterangan(
  v: FormDataEntryValue | null | undefined,
): string | null {
  const s = teks(v).trim().replace(/\s+/g, " ");
  if (s.length < 3 || s.length > 120) return null;
  return s;
}

function parseId(v: FormDataEntryValue | null | undefined): string | null {
  const s = teks(v).trim();
  return /^[A-Za-z0-9_-]{1,64}$/.test(s) ? s : null;
}

function parseAbsen(v: FormDataEntryValue | null | undefined): number | null {
  const s = teks(v).trim();
  if (!/^\d{1,3}$/.test(s)) return null;
  const n = Number(s);
  return n >= 1 && n <= 999 ? n : null;
}

function tidur(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/* ------------------------------------------------------------------ */
/* Rate limiting sederhana untuk login PIN                            */
/* ------------------------------------------------------------------ */

const percobaan = new Map<string, { jumlah: number; kunciSampai: number }>();
const MAKS_PERCOBAAN = 5;
const KUNCI_MILI_DETIK = 30_000;
const JEDA_GAGAL_MILI_DETIK = 400;

/* ------------------------------------------------------------------ */
/* Autentikasi                                                        */
/* ------------------------------------------------------------------ */

export async function loginAction(
  formData: FormData,
): Promise<ActionResult> {
  const scope = await scopeValid(teks(formData.get("scope")));
  if (!scope) return gagal("Kategori tidak ditemukan.");

  const pin = teks(formData.get("pin"));
  if (!pin) return gagal("PIN wajib diisi.");

  const sekarang = Date.now();
  let catatan = percobaan.get(scope);
  if (catatan && catatan.kunciSampai > sekarang) {
    const detik = Math.ceil((catatan.kunciSampai - sekarang) / 1000);
    return gagal(
      `Terlalu banyak percobaan gagal. Coba lagi dalam ${detik} detik.`,
    );
  }
  if (catatan && catatan.kunciSampai && catatan.kunciSampai <= sekarang) {
    percobaan.delete(scope);
    catatan = undefined;
  }

  const db = await bacaDB();
  if (!verifyPin(pin, db.pins[scope])) {
    await tidur(JEDA_GAGAL_MILI_DETIK);
    const baru = catatan ?? { jumlah: 0, kunciSampai: 0 };
    baru.jumlah += 1;
    if (baru.jumlah >= MAKS_PERCOBAAN) {
      baru.kunciSampai = sekarang + KUNCI_MILI_DETIK;
    }
    percobaan.set(scope, baru);

    if (baru.kunciSampai > sekarang) {
      return gagal(
        `PIN salah. Percobaan terbatas, terkunci ${KUNCI_MILI_DETIK / 1000} detik.`,
      );
    }
    const sisa = MAKS_PERCOBAAN - baru.jumlah;
    return gagal(`PIN salah. Percobaan tersisa ${sisa} kali.`);
  }

  percobaan.delete(scope);
  await buatSesi(scope);
  return sukses("Berhasil masuk.");
}

export async function logoutAction(formData: FormData): Promise<void> {
  const scope = teks(formData.get("scope"));
  if (scope) await hapusSesi(scope);
  redirect("/pilih");
}

export async function ubahPinAction(
  formData: FormData,
): Promise<ActionResult> {
  const scope = await scopeValid(teks(formData.get("scope")));
  if (!scope) return gagal("Kategori tidak ditemukan.");
  if (!(await sesiAktif(scope)))
    return gagal("Sesi Anda telah berakhir. Silakan masuk kembali.");

  const pinLama = teks(formData.get("pinLama"));
  const pinBaru = teks(formData.get("pinBaru"));
  const pinUlang = teks(formData.get("pinUlang"));

  const db = await bacaDB();
  if (!verifyPin(pinLama, db.pins[scope]))
    return gagal("Password/PIN lama tidak sesuai.");
  if (pinBaru.length < 6) return gagal("Password/PIN baru minimal 6 karakter.");
  if (pinBaru.length > 32) return gagal("Password/PIN baru maksimal 32 karakter.");
  if (pinBaru !== pinUlang)
    return gagal("Konfirmasi password/PIN baru tidak sama.");
  if (pinBaru === pinLama)
    return gagal("Password/PIN baru tidak boleh sama dengan yang lama.");

  await mutasi((d) => {
    d.pins[scope] = hashPin(pinBaru);
  });

  return sukses("Password/PIN berhasil diubah.");
}

/* ------------------------------------------------------------------ */
/* Tabungan Siswa                                                     */
/* ------------------------------------------------------------------ */

export async function simpanTransaksiSiswa(
  formData: FormData,
): Promise<ActionResult> {
  const kelasId = teks(formData.get("kelasId"));
  const scope = await scopeValid(scopeKelas(kelasId));
  if (!scope) return gagal("Kelas tidak ditemukan.");
  if (!(await sesiAktif(scope)))
    return gagal("Sesi Anda telah berakhir. Silakan masuk kembali.");

  const absen = parseAbsen(formData.get("absen"));
  if (!absen) return gagal("Siswa tidak ditemukan.");

  const jenisRaw = teks(formData.get("jenis"));
  if (jenisRaw !== "setor" && jenisRaw !== "tarik")
    return gagal("Jenis transaksi tidak valid.");

  const nominal = parseNominal(formData.get("nominal"));
  if (nominal === null) return gagal("Nominal harus lebih dari Rp 0.");

  const tanggal = parseTanggal(formData.get("tanggal"));
  if (!tanggal) return gagal("Tanggal transaksi tidak valid.");
  const keterangan = parseKeterangan(formData.get("keterangan"));
  if (!keterangan)
    return gagal("Keterangan wajib diisi (3–120 karakter).");

  const idEdit = parseId(formData.get("id"));
  const jenis = jenisRaw as JenisSiswa;

  const awal = await bacaDB();
  if (!awal.siswa[kelasId]?.some((s) => s.absen === absen))
    return gagal("Siswa tidak ditemukan.");
  if (
    idEdit &&
    !awal.tabunganSiswa[kelasId]?.[String(absen)]?.some((t) => t.id === idEdit)
  )
    return gagal("Transaksi tidak ditemukan.");

  await mutasi((db) => {
    const kunci = String(absen);
    db.tabunganSiswa[kelasId] ??= {};
    const daftar = (db.tabunganSiswa[kelasId][kunci] ??= []);
    if (idEdit) {
      const t = daftar.find((x) => x.id === idEdit);
      if (t) {
        t.jenis = jenis;
        t.nominal = nominal;
        t.tanggal = tanggal;
        t.keterangan = keterangan;
      }
    } else {
      daftar.push({ id: uid(), tanggal, jenis, nominal, keterangan });
    }
  });

  revalidatePath(`/siswa/${kelasId}`);
  revalidatePath(`/siswa/${kelasId}/siswa/${absen}`);
  return sukses(
    idEdit
      ? "Transaksi berhasil diperbarui."
      : "Transaksi berhasil ditambahkan.",
  );
}

export async function hapusTransaksiSiswa(input: {
  kelasId: string;
  absen: number;
  id: string;
}): Promise<ActionResult> {
  const kelasId = teks(input?.kelasId);
  const scope = await scopeValid(scopeKelas(kelasId));
  if (!scope) return gagal("Kelas tidak ditemukan.");
  if (!(await sesiAktif(scope)))
    return gagal("Sesi Anda telah berakhir. Silakan masuk kembali.");

  const absen = Number(input?.absen);
  const id = teks(input?.id);
  if (!Number.isInteger(absen) || absen < 1 || absen > 999 || !id)
    return gagal("Data transaksi tidak valid.");

  let ditemukan = false;
  await mutasi((db) => {
    const daftar = db.tabunganSiswa[kelasId]?.[String(absen)];
    if (!daftar) return;
    const idx = daftar.findIndex((t) => t.id === id);
    if (idx >= 0) {
      daftar.splice(idx, 1);
      ditemukan = true;
    }
  });

  if (!ditemukan) return gagal("Transaksi tidak ditemukan.");

  revalidatePath(`/siswa/${kelasId}`);
  revalidatePath(`/siswa/${kelasId}/siswa/${absen}`);
  return sukses("Transaksi berhasil dihapus.");
}

export async function ubahSaldoAwal(
  formData: FormData,
): Promise<ActionResult> {
  const kelasId = teks(formData.get("kelasId"));
  const scope = await scopeValid(scopeKelas(kelasId));
  if (!scope) return gagal("Kelas tidak ditemukan.");
  if (!(await sesiAktif(scope)))
    return gagal("Sesi Anda telah berakhir. Silakan masuk kembali.");

  const absen = parseAbsen(formData.get("absen"));
  if (!absen) return gagal("Siswa tidak ditemukan.");

  const nominal = parseNominal(formData.get("saldoAwal"), true);
  if (nominal === null) return gagal("Saldo awal tidak valid.");

  const ditemukan = (await bacaDB()).siswa[kelasId]?.some((s) => s.absen === absen);
  if (!ditemukan) return gagal("Siswa tidak ditemukan.");

  await mutasi((db) => {
    const siswa = db.siswa[kelasId]?.find((s) => s.absen === absen);
    if (siswa) siswa.saldoAwal = nominal;
  });

  revalidatePath(`/siswa/${kelasId}`);
  revalidatePath(`/siswa/${kelasId}/siswa/${absen}`);
  return sukses("Saldo awal berhasil diperbarui.");
}

export async function ubahWaliKelas(
  formData: FormData,
): Promise<ActionResult> {
  const kelasId = teks(formData.get("kelasId"));
  const scope = await scopeValid(scopeKelas(kelasId));
  if (!scope) return gagal("Kelas tidak ditemukan.");
  if (!(await sesiAktif(scope)))
    return gagal("Sesi Anda telah berakhir. Silakan masuk kembali.");

  const nama = teks(formData.get("nama")).replace(/\s+/g, " ").trim();
  if (nama.length < 3 || nama.length > 80)
    return gagal("Nama wali kelas harus 3–80 karakter.");

  let ada = false;
  await mutasi((db) => {
    const k = db.kelas.find((x) => x.id === kelasId);
    if (k) {
      k.waliKelas = nama;
      ada = true;
    }
  });
  if (!ada) return gagal("Kelas tidak ditemukan.");

  revalidatePath("/siswa");
  revalidatePath(`/siswa/${kelasId}`);
  return sukses("Nama wali kelas berhasil diperbarui.");
}

export async function ubahNamaSiswa(
  formData: FormData,
): Promise<ActionResult> {
  const kelasId = teks(formData.get("kelasId"));
  const scope = await scopeValid(scopeKelas(kelasId));
  if (!scope) return gagal("Kelas tidak ditemukan.");
  if (!(await sesiAktif(scope)))
    return gagal("Sesi Anda telah berakhir. Silakan masuk kembali.");

  const absen = parseAbsen(formData.get("absen"));
  if (!absen) return gagal("Siswa tidak ditemukan.");

  const nama = teks(formData.get("nama")).replace(/\s+/g, " ").trim();
  if (nama.length < 2 || nama.length > 80)
    return gagal("Nama siswa harus 2–80 karakter.");

  let ada = false;
  await mutasi((db) => {
    const s = db.siswa[kelasId]?.find((x) => x.absen === absen);
    if (s) {
      s.nama = nama;
      ada = true;
    }
  });
  if (!ada) return gagal("Siswa tidak ditemukan.");

  revalidatePath(`/siswa/${kelasId}`);
  revalidatePath(`/siswa/${kelasId}/siswa/${absen}`);
  return sukses("Nama siswa berhasil diperbarui.");
}

/* ------------------------------------------------------------------ */
/* Uang Kas Kelas                                                     */
/* ------------------------------------------------------------------ */

export async function simpanKas(
  formData: FormData,
): Promise<ActionResult> {
  const kelasId = teks(formData.get("kelasId"));
  const scope = await scopeValid(scopeKelas(kelasId));
  if (!scope) return gagal("Kelas tidak ditemukan.");
  if (!(await sesiAktif(scope)))
    return gagal("Sesi Anda telah berakhir. Silakan masuk kembali.");

  const jenisRaw = teks(formData.get("jenis"));
  if (jenisRaw !== "iuran" && jenisRaw !== "pengeluaran")
    return gagal("Jenis kas tidak valid.");
  const jenis = jenisRaw as JenisKas;

  const nominal = parseNominal(formData.get("nominal"));
  if (nominal === null) return gagal("Nominal harus lebih dari Rp 0.");

  const tanggal = parseTanggal(formData.get("tanggal"));
  if (!tanggal) return gagal("Tanggal transaksi tidak valid.");
  const keterangan = parseKeterangan(formData.get("keterangan"));
  if (!keterangan) return gagal("Keterangan wajib diisi (3–120 karakter).");

  const idEdit = parseId(formData.get("id"));

  let absen: number | undefined;
  if (jenis === "iuran") {
    const a = parseAbsen(formData.get("absen"));
    if (!a) return gagal("Pilih siswa yang membayar iuran.");
    absen = a;
    if (!(await bacaDB()).siswa[kelasId]?.some((s) => s.absen === a))
      return gagal("Siswa tidak ditemukan.");
  }

  const awal = await bacaDB();
  if (idEdit && !awal.kasKelas[kelasId]?.some((k) => k.id === idEdit))
    return gagal("Transaksi kas tidak ditemukan.");

  await mutasi((db) => {
    db.kasKelas[kelasId] ??= [];
    const daftar = db.kasKelas[kelasId];
    if (idEdit) {
      const t = daftar.find((k) => k.id === idEdit);
      if (t) {
        t.jenis = jenis;
        t.nominal = nominal;
        t.tanggal = tanggal;
        t.keterangan = keterangan;
        t.absen = absen;
      }
    } else {
      daftar.push({
        id: uid(),
        tanggal,
        jenis,
        nominal,
        keterangan,
        ...(absen ? { absen } : {}),
      });
    }
  });

  revalidatePath(`/siswa/${kelasId}`);
  return sukses(
    idEdit ? "Transaksi kas berhasil diperbarui." : "Berhasil dicatat.",
  );
}

export async function hapusKas(input: {
  kelasId: string;
  id: string;
}): Promise<ActionResult> {
  const kelasId = teks(input?.kelasId);
  const scope = await scopeValid(scopeKelas(kelasId));
  if (!scope) return gagal("Kelas tidak ditemukan.");
  if (!(await sesiAktif(scope)))
    return gagal("Sesi Anda telah berakhir. Silakan masuk kembali.");

  const id = teks(input?.id);
  if (!id) return gagal("Data transaksi tidak valid.");

  let ditemukan = false;
  await mutasi((db) => {
    const daftar = db.kasKelas[kelasId];
    if (!daftar) return;
    const idx = daftar.findIndex((k) => k.id === id);
    if (idx >= 0) {
      daftar.splice(idx, 1);
      ditemukan = true;
    }
  });

  if (!ditemukan) return gagal("Transaksi kas tidak ditemukan.");

  revalidatePath(`/siswa/${kelasId}`);
  return sukses("Transaksi kas berhasil dihapus.");
}

/* ------------------------------------------------------------------ */
/* Tabungan Guru                                                      */
/* ------------------------------------------------------------------ */

export async function simpanTransaksiGuru(
  formData: FormData,
): Promise<ActionResult> {
  const guruId = teks(formData.get("guruId"));
  const scope = await scopeValid("guru");
  if (!scope) return gagal("Kategori tidak ditemukan.");
  if (!(await sesiAktif(scope)))
    return gagal("Sesi Anda telah berakhir. Silakan masuk kembali.");

  const jenisRaw = teks(formData.get("jenis"));
  if (jenisRaw !== "masuk" && jenisRaw !== "keluar")
    return gagal("Jenis transaksi tidak valid.");
  const jenis = jenisRaw as JenisGuru;

  const nominal = parseNominal(formData.get("nominal"));
  if (nominal === null) return gagal("Nominal harus lebih dari Rp 0.");

  const tanggal = parseTanggal(formData.get("tanggal"));
  if (!tanggal) return gagal("Tanggal transaksi tidak valid.");
  const keterangan = parseKeterangan(formData.get("keterangan"));
  if (!keterangan) return gagal("Keterangan wajib diisi (3–120 karakter).");

  const idEdit = parseId(formData.get("id"));

  const awal = await bacaDB();
  if (!awal.guru.some((g) => g.id === guruId))
    return gagal("Guru tidak ditemukan.");
  if (idEdit && !awal.tabunganGuru[guruId]?.some((t) => t.id === idEdit))
    return gagal("Transaksi tidak ditemukan.");

  await mutasi((db) => {
    db.tabunganGuru[guruId] ??= [];
    const daftar = db.tabunganGuru[guruId];
    if (idEdit) {
      const t = daftar.find((x) => x.id === idEdit);
      if (t) {
        t.jenis = jenis;
        t.nominal = nominal;
        t.tanggal = tanggal;
        t.keterangan = keterangan;
      }
    } else {
      daftar.push({ id: uid(), tanggal, jenis, nominal, keterangan });
    }
  });

  revalidatePath("/guru");
  revalidatePath(`/guru/${guruId}`);
  return sukses(
    idEdit
      ? "Transaksi berhasil diperbarui."
      : "Transaksi berhasil ditambahkan.",
  );
}

export async function hapusTransaksiGuru(input: {
  guruId: string;
  id: string;
}): Promise<ActionResult> {
  const guruId = teks(input?.guruId);
  const scope = await scopeValid("guru");
  if (!scope) return gagal("Kategori tidak ditemukan.");
  if (!(await sesiAktif(scope)))
    return gagal("Sesi Anda telah berakhir. Silakan masuk kembali.");

  const id = teks(input?.id);
  if (!id) return gagal("Data transaksi tidak valid.");

  let ditemukan = false;
  await mutasi((db) => {
    const daftar = db.tabunganGuru[guruId];
    if (!daftar) return;
    const idx = daftar.findIndex((t) => t.id === id);
    if (idx >= 0) {
      daftar.splice(idx, 1);
      ditemukan = true;
    }
  });

  if (!ditemukan) return gagal("Transaksi tidak ditemukan.");

  revalidatePath("/guru");
  revalidatePath(`/guru/${guruId}`);
  return sukses("Transaksi berhasil dihapus.");
}
