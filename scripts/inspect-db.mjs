/* Bandingkan isi & tipe data: Firestore (app/db) vs file lokal data/db.json. */
import fs from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
for (const file of [".env.local", ".env.migrate"]) {
  const p = path.join(root, file);
  if (!fs.existsSync(p)) continue;
  for (const baris of fs.readFileSync(p, "utf8").split(/\r?\n/)) {
    const m = baris.match(/^([A-Za-z0-9_]+)=(.*)$/);
    if (!m || process.env[m[1]]) continue;
    let nilai = m[2];
    if (nilai.startsWith('"') && nilai.endsWith('"') && nilai.length > 1) {
      nilai = nilai.slice(1, -1);
    }
    process.env[m[1]] = nilai;
  }
}

if (!getApps().length) {
  initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n"),
    }),
  });
}

const snap = await getFirestore().doc("app/db").get();
const f = snap.data()?.data;
console.log("FIRESTORE:");
if (!f) {
  console.log("  (kosong/tidak ada)");
} else {
  console.log("  kelas ids :", JSON.stringify(f.kelas?.map((k) => k.id)));
  console.log("  siswa keys:", JSON.stringify(Object.keys(f.siswa ?? {})));
  const arr = f.siswa?.["11-rpl-1"];
  console.log("  jumlah    :", arr ? arr.length : "undefined!");
  if (arr?.[0]) {
    console.log(
      "  siswa[0]  :",
      JSON.stringify(arr[0]),
      "| typeof absen:",
      typeof arr[0].absen,
      "| absen:",
      arr[0].absen,
    );
  }
  console.log(
    "  tabunganSiswa keys:",
    JSON.stringify(Object.keys(f.tabunganSiswa ?? {})),
  );
}

const file = path.join(root, "data", "db.json");
if (fs.existsSync(file)) {
  const p = JSON.parse(fs.readFileSync(file, "utf8"));
  console.log("FILE LOKAL:");
  console.log("  kelas ids :", JSON.stringify(p.kelas.map((k) => k.id)));
  const arr = p.siswa?.["11-rpl-1"];
  if (arr?.[0]) {
    console.log(
      "  siswa[0]  :",
      JSON.stringify(arr[0]),
      "| typeof absen:",
      typeof arr[0].absen,
      "| absen:",
      arr[0].absen,
    );
  }
}

// Transaksi Ahmad Pratama (11-rpl-1 absen 1) di kedua sumber
if (f?.tabunganSiswa) {
  console.log(
    "TX Firestore 11-rpl-1/1 :",
    JSON.stringify(f.tabunganSiswa["11-rpl-1"]?.["1"] ?? []),
  );
}
if (fs.existsSync(file)) {
  const p = JSON.parse(fs.readFileSync(file, "utf8"));
  console.log(
    "TX File      11-rpl-1/1 :",
    JSON.stringify(p.tabunganSiswa?.["11-rpl-1"]?.["1"] ?? []),
  );
}
process.exit(0);
