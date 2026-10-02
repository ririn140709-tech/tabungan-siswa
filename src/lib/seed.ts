import type {
  DB,
  Guru,
  Kelas,
  Siswa,
  TransaksiGuru,
  TransaksiKas,
  TransaksiSiswa,
} from "./types";

const DEPAN = [
  "Ahmad", "Aldi", "Andika", "Angga", "Ayu", "Bagus", "Bayu", "Bima", "Dewi", "Dedi",
  "Fajar", "Farhan", "Fitri", "Galih", "Gilang", "Hafiz", "Ilham", "Indra", "Joko", "Kurnia",
  "Laras", "Lina", "Lukman", "Maya", "Maulana", "Nabila", "Nurul", "Rendra", "Rizky", "Rio",
  "Sandi", "Sari", "Satria", "Siti", "Teguh", "Wahyu", "Wulan", "Yoga", "Yusuf", "Zahra",
];

const BELAKANG = [
  "Pratama", "Wijaya", "Saputra", "Ramadhan", "Nugroho", "Hakim", "Firmansyah", "Kusuma", "Permana", "Halim",
  "Anggraini", "Permata", "Hidayat", "Sanjaya", "Prakoso", "Wibowo", "Simanjuntak", "Sihombing", "Ginting", "Tarigan",
  "Situmorang", "Damanik", "Lubis", "Yahya", "Karim", "Syahputra", "Oktaviani", "Salsabila", "Putri", "Setiawan",
];

const DAFTAR_KELAS: Kelas[] = [
  { id: "11-rpl-1", nama: "11 RPL 1", waliKelas: "Budi Santoso, S.Kom" },
  { id: "11-rpl-2", nama: "11 RPL 2", waliKelas: "Siti Aminah, S.Pd" },
  { id: "11-tkj-1", nama: "11 TKJ 1", waliKelas: "Agus Setiawan, S.T" },
  { id: "12-rpl-1", nama: "12 RPL 1", waliKelas: "Dewi Lestari, S.Kom" },
];

const DAFTAR_GURU: Guru[] = [
  { id: "sri-wahyuni", nama: "Dra. Sri Wahyuni", jabatan: "Kepala Sekolah" },
  { id: "budi-santoso", nama: "Budi Santoso, S.Kom", jabatan: "Wali Kelas 11 RPL 1" },
  { id: "siti-aminah", nama: "Siti Aminah, S.Pd", jabatan: "Guru Bahasa Indonesia" },
  { id: "agus-setiawan", nama: "Agus Setiawan, S.T", jabatan: "Guru TKJ" },
  { id: "dewi-lestari", nama: "Dewi Lestari, S.Kom", jabatan: "Guru Pemrograman" },
  { id: "hendra-gunawan", nama: "Hendra Gunawan, S.Pd", jabatan: "Guru Matematika" },
  { id: "rina-marlina", nama: "Rina Marlina, S.Pd", jabatan: "Guru Bahasa Inggris" },
  { id: "joko-prasetyo", nama: "Joko Prasetyo, S.Kom", jabatan: "Guru Jaringan Komputer" },
  { id: "maya-indriani", nama: "Maya Indriani, S.Pd", jabatan: "Guru Seni Budaya" },
  { id: "fajar-nugroho", nama: "Fajar Nugroho, S.Pd", jabatan: "Guru PJOK" },
  { id: "ratna-sari", nama: "Ratna Sari, S.Ak", jabatan: "Guru Akuntansi" },
  { id: "dedi-kurniawan", nama: "Dedi Kurniawan, S.Kom", jabatan: "Guru Sistem Operasi" },
];

/** 45 nama unik per kelas (deterministik, tanpa duplikat). */
function buatSiswa(offset: number): Siswa[] {
  const daftar: Siswa[] = [];
  for (let i = 0; i < 45; i++) {
    const nama = `${DEPAN[(i * 7 + offset) % DEPAN.length]} ${
      BELAKANG[(i * 13 + offset * 3) % BELAKANG.length]
    }`;
    daftar.push({ absen: i + 1, nama, saldoAwal: 0 });
  }
  return daftar;
}

function txSiswa(
  id: string,
  tanggal: string,
  jenis: TransaksiSiswa["jenis"],
  nominal: number,
  keterangan: string,
): TransaksiSiswa {
  return { id, tanggal, jenis, nominal, keterangan };
}

export function createSeed(): DB {
  const siswa: DB["siswa"] = {};
  const tabunganSiswa: DB["tabunganSiswa"] = {};
  const kasKelas: DB["kasKelas"] = {};

  DAFTAR_KELAS.forEach((k, i) => {
    siswa[k.id] = buatSiswa(i);
    tabunganSiswa[k.id] = {};
    kasKelas[k.id] = [];
  });

  // ---- Contoh data kelas 11 RPL 1 ----
  const kelasUtama = "11-rpl-1";
  const contohSaldo: Record<number, number> = {
    1: 20000, 2: 15000, 3: 25000, 4: 10000, 5: 30000, 8: 12000,
  };
  for (const [absen, saldo] of Object.entries(contohSaldo)) {
    const s = siswa[kelasUtama].find((x) => x.absen === Number(absen));
    if (s) s.saldoAwal = saldo;
  }

  tabunganSiswa[kelasUtama] = {
    "1": [
      txSiswa("s1-1", "2026-09-02", "setor", 10000, "Setoran awal tabungan"),
      txSiswa("s1-2", "2026-09-09", "setor", 15000, "Iuran tabungan minggu ke-2"),
      txSiswa("s1-3", "2026-09-20", "tarik", 5000, "Beli sapu kelas"),
    ],
    "2": [
      txSiswa("s2-1", "2026-09-03", "setor", 20000, "Setoran awal tabungan"),
      txSiswa("s2-2", "2026-09-17", "tarik", 10000, "Beli papan tulis kelas"),
    ],
    "3": [txSiswa("s3-1", "2026-09-05", "setor", 15000, "Setoran awal tabungan")],
    "4": [
      txSiswa("s4-1", "2026-09-05", "setor", 10000, "Setoran awal tabungan"),
      txSiswa("s4-2", "2026-09-12", "setor", 5000, "Iuran tabungan minggu ke-2"),
    ],
    "5": [
      txSiswa("s5-1", "2026-09-08", "setor", 25000, "Setoran awal tabungan"),
      txSiswa("s5-2", "2026-09-15", "setor", 10000, "Iuran tabungan minggu ke-3"),
    ],
    "7": [txSiswa("s7-1", "2026-09-10", "setor", 5000, "Iuran tabungan minggu ke-2")],
    "8": [
      txSiswa("s8-1", "2026-09-01", "setor", 10000, "Setoran awal tabungan"),
      txSiswa("s8-2", "2026-09-19", "tarik", 8000, "Beli angpau kelas"),
    ],
  };

  const kas: TransaksiKas[] = [];
  for (let absen = 1; absen <= 12; absen++) {
    kas.push({
      id: `kas-iuran-${absen}`,
      tanggal: "2026-09-05",
      jenis: "iuran",
      absen,
      nominal: 10000,
      keterangan: "Iuran kas minggu ke-1",
    });
  }
  for (let absen = 1; absen <= 6; absen++) {
    kas.push({
      id: `kas-iuran2-${absen}`,
      tanggal: "2026-09-12",
      jenis: "iuran",
      absen,
      nominal: 10000,
      keterangan: "Iuran kas minggu ke-2",
    });
  }
  for (let absen = 1; absen <= 12; absen++) {
    kas.push({
      id: `kas-iuran3-${absen}`,
      tanggal: "2026-09-19",
      jenis: "iuran",
      absen,
      nominal: 10000,
      keterangan: "Iuran kas minggu ke-3",
    });
  }
  kas.push(
    {
      id: "kas-k-1",
      tanggal: "2026-09-12",
      jenis: "pengeluaran",
      nominal: 45000,
      keterangan: "Beli kapur dan penghapus papan tulis",
    },
    {
      id: "kas-k-2",
      tanggal: "2026-09-18",
      jenis: "pengeluaran",
      nominal: 100000,
      keterangan: "Beli sapu kelas",
    },
    {
      id: "kas-k-3",
      tanggal: "2026-09-25",
      jenis: "pengeluaran",
      nominal: 35000,
      keterangan: "Beli trash bag dan pengharum kelas",
    },
  );
  kasKelas[kelasUtama] = kas;

  // ---- Contoh tabungan guru ----
  const tabunganGuru: DB["tabunganGuru"] = {};
  for (const g of DAFTAR_GURU) tabunganGuru[g.id] = [];

  const txGuru = (
    id: string,
    tanggal: string,
    jenis: TransaksiGuru["jenis"],
    nominal: number,
    keterangan: string,
  ): TransaksiGuru => ({ id, tanggal, jenis, nominal, keterangan });

  tabunganGuru["sri-wahyuni"] = [
    txGuru("g0-1", "2026-09-03", "masuk", 150000, "Setoran tabungan bulanan"),
    txGuru("g0-2", "2026-09-20", "keluar", 100000, "Iuran arisan minggu I"),
  ];
  tabunganGuru["budi-santoso"] = [
    txGuru("g1-1", "2026-09-01", "masuk", 200000, "Setoran tabungan bulanan"),
    txGuru("g1-2", "2026-09-14", "keluar", 50000, "Iuran seragam"),
  ];
  tabunganGuru["rina-marlina"] = [
    txGuru("g6-1", "2026-09-08", "masuk", 100000, "Setoran awal tabungan"),
  ];
  tabunganGuru["dewi-lestari"] = [
    txGuru("g4-1", "2026-09-05", "masuk", 120000, "Setoran tabungan bulanan"),
    txGuru("g4-2", "2026-09-22", "keluar", 60000, "Iuran paket soal semester"),
  ];

  return {
    versi: 1,
    pins: {},
    kelas: DAFTAR_KELAS,
    siswa,
    tabunganSiswa,
    kasKelas,
    guru: DAFTAR_GURU,
    tabunganGuru,
  };
}
