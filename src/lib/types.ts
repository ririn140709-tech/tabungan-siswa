export type JenisSiswa = "setor" | "tarik";
export type JenisGuru = "masuk" | "keluar";
export type JenisKas = "iuran" | "pengeluaran";

export interface Kelas {
  id: string;
  nama: string;
  waliKelas: string;
}

export interface Siswa {
  absen: number;
  nama: string;
  saldoAwal: number;
}

export interface Guru {
  id: string;
  nama: string;
  jabatan: string;
}

export interface DasarTransaksi {
  id: string;
  tanggal: string; // format ISO: YYYY-MM-DD
  nominal: number;
  keterangan: string;
}

export interface TransaksiSiswa extends DasarTransaksi {
  jenis: JenisSiswa;
}

export interface TransaksiGuru extends DasarTransaksi {
  jenis: JenisGuru;
}

export interface TransaksiKas extends DasarTransaksi {
  jenis: JenisKas;
  /** Hanya diisi untuk iuran kas — nomor absen siswa yang membayar. */
  absen?: number;
}

export interface DB {
  versi: number;
  /** scope ("guru" | "kelas:<id>") -> hash PIN ("salt:hash") */
  pins: Record<string, string>;
  kelas: Kelas[];
  /** kelasId -> daftar siswa (urut nomor absen) */
  siswa: Record<string, Siswa[]>;
  /** kelasId -> absen -> daftar transaksi tabungan pribadi */
  tabunganSiswa: Record<string, Record<string, TransaksiSiswa[]>>;
  /** kelasId -> daftar transaksi uang kas kelas */
  kasKelas: Record<string, TransaksiKas[]>;
  guru: Guru[];
  /** guruId -> daftar transaksi tabungan guru */
  tabunganGuru: Record<string, TransaksiGuru[]>;
}

export interface Ringkasan {
  totalMasuk: number;
  totalKeluar: number;
  sisaSaldo: number;
}

export interface RingkasanSiswa extends Ringkasan {
  saldoAwal: number;
}

/** Hasil standar untuk semua Server Action. */
export interface ActionResult {
  ok: boolean;
  error: string | null;
  message: string | null;
}
