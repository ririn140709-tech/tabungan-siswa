# Tabungan Digital Sekolah

Aplikasi web tabungan sekolah untuk **Siswa (per kelas)** dan **Guru & Staf** —
simpel, rapi, aman, dengan desain modern, bersih, dan elegan (Navy Deep Blue ·
Slate Grey · aksen Gold).

Dibangun dengan **Next.js 16 (App Router)**, React 19, TypeScript, dan
Tailwind CSS v4.

## Menjalankan

```bash
npm install
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000).

Produksi:

```bash
npm run build
npm start
```

## Deploy (Vercel)

Aplikasi live di Vercel: **https://tabungan-siswa-azure.vercel.app**
Terhubung ke GitHub (`ririn140709-tech/tabungan-siswa`) — **setiap push ke
`master` di-deploy otomatis** oleh Vercel (GitHub App terpasang).

Penyimpanan menyesuaikan lingkungan:

- **Lokal (dev)** — file `data/db.json` seperti biasa.
- **Di Vercel** — data disimpan di **Cloud Firestore**
  (project `tabungan-siswa-sekolah-aeff0`, dokumen `app/db` berbentuk
  `{ data, etag }`), otomatis aktif saat `VERCEL_ENV` + kredensial
  `FIREBASE_PROJECT_ID` / `FIREBASE_CLIENT_EMAIL` / `FIREBASE_PRIVATE_KEY`
  tersedia. Setiap mutasi memakai **transaksi Firestore** (baca–ubah–tulis
  atomik) dengan deteksi konflik, aman dari tabrakan antar-instance
  serverless.
- **Uji jalur Firestore secara lokal** — set `FIREBASE_FORCE=1` di
  `.env.local` (hapus lagi setelah selesai agar data uji tidak bercampur).
- **Sesi PIN** — memakai env `SESSION_SECRET` (Production & Preview).

Perubahan kode cukup di-push, deploy jalan sendiri:

```bash
git add -A && git commit -m "pesan" && git push
```

Script utilitas data (sekali jalan / diagnostik):

- `node scripts/migrate-blob-firestore.mjs` — salin data Vercel Blob →
  Firestore (butuh `vercel env pull --environment production` ke
  `.env.migrate`).
- `node scripts/inspect-db.mjs` — bandingkan isi Firestore vs file lokal.

## Alur Aplikasi

1. **Halaman Depan** — judul "Tabungan Digital Sekolah" dan tombol **MASUK**.
2. **Pilihan Kategori** — dua kartu: *Tabungan Siswa per Kelas* dan
   *Tabungan Guru & Staf*.
3. **PIN** — setiap kelas / kategori guru wajib memasukkan password/PIN sebelum
   dashboard terbuka.
4. **Dashboard** — menu **Ganti Password** dan tombol **Keluar (Logout)** di
   bagian atas; logout mengunci sesi dan mengembalikan ke halaman pilihan.

## Keamanan

- **Password/PIN bawaan: `123456`** untuk semua kelas dan kategori guru.
  Segera ganti lewat tombol **Ganti Password** di dalam dashboard.
- PIN disimpan sebagai *hash* `scrypt` + salt (tidak pernah tersimpan polos).
- Sesi memakai **token HMAC-SHA256** di cookie `httpOnly` (berlaku 12 jam),
  dengan tombol Keluar yang benar-benar menghapus sesi.
- Semua Server Action memeriksa ulang sesi + validasi input (nominal, tanggal,
  keterangan) di server.
- Login salah dibatasi: 5 kali gagal → terkunci 30 detik.
- Data disimpan di **server** (file `data/` saat lokal, **Cloud Firestore**
  saat produksi — bukan di browser), sehingga aman dari utak-atik lewat
  DevTools.

## Fitur

### Tabungan Siswa per Kelas

- Daftar kelas → PIN → dashboard kelas dengan **2 menu tab**:
  - **Tabungan Pribadi Siswa** — 45 siswa urut nomor absen + kolom pencarian.
  - **Uang Kas Kelas** — iuran kas mingguan siswa + pengeluaran kas kelas,
    dengan total saldo kas otomatis.
- Profil siswa: ringkasan **Saldo Awal, Total Masuk, Total Keluar, Sisa Saldo**
  (terhitung otomatis), form transaksi (Nominal, Setor/Tarik, Tanggal,
  Keterangan), dan tabel riwayat dengan tombol **Edit** & **Hapus**.
- **Edit nama** — tombol pensil untuk mengubah **nama wali kelas** (header
  dashboard kelas) dan **nama siswa** (di daftar siswa maupun di profil siswa);
  perubahan tersimpan di server dan langsung tampil di semua halaman terkait.

### Tabungan Guru & Staf

- Kolom pencarian nama/jabatan guru.
- Profil guru: form uang masuk/keluar lengkap dengan tanggal & keterangan,
  ringkasan total masuk, total keluar, dan saldo tabungan.

## Struktur Data

- **Cloud Firestore (produksi)** — dokumen `app/db` berbentuk
  `{ data: <isi DB>, etag: <penanda versi> }` di project
  `tabungan-siswa-sekolah-aeff0`.
- `data/db.json` — database JSON **lokal** (dibuat otomatis saat pertama
  dijalankan, berisi contoh data: 4 kelas × 45 siswa, 12 guru, dan beberapa
  transaksi contoh).
- `data/secret.key` — rahasia penanda tangan sesi saat lokal (dibuat
  otomatis).

> Untuk mengembalikan ke data contoh: hentikan server, hapus folder `data/`,
> lalu jalankan ulang.

## Perintah Berguna

| Perintah           | Fungsi                       |
| ------------------ | ---------------------------- |
| `npm run dev`      | Server development (Turbopack) |
| `npm run build`    | Build produksi               |
| `npm start`        | Jalankan server produksi     |
| `npm run lint`     | ESLint                       |
| `npx tsc --noEmit` | Cek tipe TypeScript          |
