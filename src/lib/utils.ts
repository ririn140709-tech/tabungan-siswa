import type {
  Guru,
  Ringkasan,
  RingkasanSiswa,
  TransaksiGuru,
  TransaksiKas,
  TransaksiSiswa,
} from "./types";

/** Format rupiah: 100000 -> "Rp 100.000" */
export function formatRupiah(nilai: number): string {
  return `Rp ${new Intl.NumberFormat("id-ID").format(nilai)}`;
}

/** Format tanggal ISO (YYYY-MM-DD) -> "5 Sep 2026" */
export function formatTanggal(iso: string): string {
  const tanggal = new Date(`${iso}T00:00:00`);
  if (Number.isNaN(tanggal.getTime())) return iso;
  return tanggal.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

/** Hari ini dalam format ISO (timezone lokal). */
export function hariIni(): string {
  const now = new Date();
  const bulan = String(now.getMonth() + 1).padStart(2, "0");
  const hari = String(now.getDate()).padStart(2, "0");
  return `${now.getFullYear()}-${bulan}-${hari}`;
}

/** Inisial nama untuk avatar (mengabaikan gelar seperti "Dra.", "S.Kom"). */
export function inisial(nama: string): string {
  const kata = nama
    .split(/\s+/)
    .filter((k) => k && !k.includes("."))
    .slice(0, 2)
    .map((k) => k[0]?.toUpperCase() ?? "");
  return kata.join("") || "?";
}

export function hitungSiswa(
  saldoAwal: number,
  transaksi: TransaksiSiswa[],
): RingkasanSiswa {
  let totalMasuk = 0;
  let totalKeluar = 0;
  for (const t of transaksi) {
    if (t.jenis === "setor") totalMasuk += t.nominal;
    else totalKeluar += t.nominal;
  }
  return {
    saldoAwal,
    totalMasuk,
    totalKeluar,
    sisaSaldo: saldoAwal + totalMasuk - totalKeluar,
  };
}

export function hitungGuru(transaksi: TransaksiGuru[]): Ringkasan {
  let totalMasuk = 0;
  let totalKeluar = 0;
  for (const t of transaksi) {
    if (t.jenis === "masuk") totalMasuk += t.nominal;
    else totalKeluar += t.nominal;
  }
  return { totalMasuk, totalKeluar, sisaSaldo: totalMasuk - totalKeluar };
}

export function hitungKas(transaksi: TransaksiKas[]): Ringkasan {
  let totalMasuk = 0;
  let totalKeluar = 0;
  for (const t of transaksi) {
    if (t.jenis === "iuran") totalMasuk += t.nominal;
    else totalKeluar += t.nominal;
  }
  return { totalMasuk, totalKeluar, sisaSaldo: totalMasuk - totalKeluar };
}

/** Urutkan transaksi terbaru dahulu (stable sort berdasarkan tanggal). */
export function urutTerbaru<T extends { tanggal: string }>(list: T[]): T[] {
  return [...list].sort((a, b) => b.tanggal.localeCompare(a.tanggal));
}

/** Nama siswa dari daftar berdasarkan nomor absen. */
export function namaSiswa(
  daftar: { absen: number; nama: string }[],
  absen: number | undefined,
): string | null {
  if (absen == null) return null;
  return daftar.find((s) => s.absen === absen)?.nama ?? null;
}

export function judulGuru(guru: Guru): string {
  return `${guru.nama} — ${guru.jabatan}`;
}
