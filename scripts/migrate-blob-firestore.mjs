/**
 * Migrasi satu kali: Vercel Blob (data/db.json) → Cloud Firestore (app/db).
 *
 * Pakai:
 *   1. npx vercel env pull .env.migrate --environment production
 *   2. node scripts/migrate-blob-firestore.mjs
 *   3. hapus .env.migrate setelah sukses
 *
 * Aman: batal sendiri bila dokumen Firestore sudah berisi data
 * (pakai argumen --force untuk menimpa).
 */
import fs from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { get } from "@vercel/blob";
import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

const direktori = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(direktori, "..");

// Muat .env.local (kredensial Firebase asli) dulu, lalu .env.migrate
// (BLOB_READ_WRITE_TOKEN asli; nilai Secret lain berupa placeholder
// "[SENSITIVE]" dan tidak menimpa yang sudah terbaca).
const envFile = path.join(root, ".env.migrate");
if (!fs.existsSync(envFile)) {
  console.error("✕ .env.migrate tidak ada — jalankan `vercel env pull` dulu.");
  process.exit(1);
}
for (const file of [".env.local", ".env.migrate"]) {
  const p = path.join(root, file);
  if (!fs.existsSync(p)) continue;
  for (const baris of fs.readFileSync(p, "utf8").split(/\r?\n/)) {
    const m = baris.match(/^([A-Za-z0-9_]+)=(.*)$/);
    if (!m || process.env[m[1]]) continue;
    let nilai = m[2];
    // env pull membungkus nilai dengan tanda kutip ganda — buang.
    if (nilai.startsWith('"') && nilai.endsWith('"') && nilai.length > 1) {
      nilai = nilai.slice(1, -1);
    }
    process.env[m[1]] = nilai;
  }
}

const { FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY } =
  process.env;
if (!FIREBASE_PROJECT_ID || !FIREBASE_CLIENT_EMAIL || !FIREBASE_PRIVATE_KEY) {
  console.error("✕ FIREBASE_* tidak lengkap di .env.migrate.");
  process.exit(1);
}
if (!process.env.BLOB_READ_WRITE_TOKEN) {
  console.error("✕ BLOB_READ_WRITE_TOKEN tidak ada.");
  process.exit(1);
}

if (getApps().length === 0) {
  initializeApp({
    credential: cert({
      projectId: FIREBASE_PROJECT_ID,
      clientEmail: FIREBASE_CLIENT_EMAIL,
      privateKey: FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n"),
    }),
  });
}
const db = getFirestore();

// 1) Baca Blob
const hasil = await get("data/db.json", {
  access: "private",
  useCache: false,
});
if (!hasil || hasil.statusCode !== 200 || !hasil.stream) {
  console.error("✕ Blob data/db.json tidak ditemukan.");
  process.exit(1);
}
const isiBlob = JSON.parse(await new Response(hasil.stream).text());
const jumlahSiswa = Object.values(isiBlob.siswa ?? {}).reduce(
  (n, daftar) => n + daftar.length,
  0,
);
console.log(
  `✓ Blob dibaca: ${isiBlob.kelas?.length ?? 0} kelas, ${jumlahSiswa} siswa, ` +
    `${isiBlob.uangKas?.length ?? 0} uang kas, ${Object.keys(isiBlob.guru ?? {}).length} guru`,
);

// 2) Pastikan Firestore kosong (jangan timpa tanpa izin)
const ref = db.doc("app/db");
const kini = await ref.get();
const paksa = process.argv.includes("--force");
if (kini.exists && kini.data()?.data && !paksa) {
  console.error(
    "✕ Dokumen app/db di Firestore SUDAH berisi data. Batal (pakai --force bila yakin menimpa).",
  );
  process.exit(1);
}

// 3) Tulis ke Firestore
const etag = Date.now().toString(36);
await ref.set({ data: isiBlob, etag });
console.log("✓ Ditulis ke Firestore: app/db");

// 4) Verifikasi baca balik
const ulang = await ref.get();
const dataUlang = ulang.data()?.data;
const jumlahUlang = Object.values(dataUlang?.siswa ?? {}).reduce(
  (n, daftar) => n + daftar.length,
  0,
);
if (jumlahUlang !== jumlahSiswa) {
  console.error(`✕ Verifikasi gagal: ${jumlahUlang} != ${jumlahSiswa} siswa`);
  process.exit(1);
}
console.log(`✓ Verifikasi cocok: ${jumlahUlang} siswa ✓ — migrasi SELESAI.`);
