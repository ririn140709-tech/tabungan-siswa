import fs from "node:fs";
import path from "node:path";
import { randomBytes } from "node:crypto";
import { initializeApp, getApps, cert, type App } from "firebase-admin/app";
import { getFirestore, type Firestore } from "firebase-admin/firestore";
import { hashPin } from "./crypto";
import { createSeed } from "./seed";
import type { DB } from "./types";

/** Password/PIN bawaan untuk semua kelas & kategori guru. */
export const PIN_BAWAAN = "123456";
export const SCOPE_GURU = "guru";

const DATA_DIR = path.join(process.cwd(), "data");
const DB_FILE = path.join(DATA_DIR, "db.json");
const SECRET_FILE = path.join(DATA_DIR, "secret.key");

/**
 * Lokasi dokumen DB di Cloud Firestore — seluruh data sekolah (kelas,
 * siswa, transaksi, PIN) tersimpan dalam SATU dokumen: `app/db` dengan
 * bentuk `{ data: DB, etag: string }`. Skala sekolah jauh di bawah batas
 * 1 MB/dokumen, dan satu dokumen membuat baca-tulis-ubah jadi atomik.
 */
const FIRESTORE_DOC = "app/db";

/**
 * Penyimpanan cloud (Cloud Firestore) aktif saat kredensial service
 * account ter-set DAN berjalan di Vercel (VERCEL_ENV ter-set oleh
 * platform). Lokal selalu memakai file `data/db.json` agar data uji tidak
 * bercampur dengan data produksi — kecuali FIREBASE_FORCE=1 untuk
 * menguji jalur Firestore secara lokal.
 */
function pakaiFirebase(): boolean {
  const adaKredensial = Boolean(
    process.env.FIREBASE_PROJECT_ID &&
      process.env.FIREBASE_CLIENT_EMAIL &&
      process.env.FIREBASE_PRIVATE_KEY,
  );
  if (!adaKredensial) return false;
  return Boolean(process.env.VERCEL_ENV) || process.env.FIREBASE_FORCE === "1";
}

export function scopeKelas(idKelas: string): string {
  return `kelas:${idKelas}`;
}

/* ------------------------------------------------------------------ */
/* Backend file (lokal / build statis)                                */
/* ------------------------------------------------------------------ */

function pastikanFolder() {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

function simpanFile(db: DB) {
  pastikanFolder();
  const sementara = `${DB_FILE}.tmp`;
  fs.writeFileSync(sementara, JSON.stringify(db, null, 2), "utf8");
  fs.renameSync(sementara, DB_FILE);
}

function bacaFile(): DB | null {
  if (!fs.existsSync(DB_FILE)) return null;
  try {
    return JSON.parse(fs.readFileSync(DB_FILE, "utf8")) as DB;
  } catch {
    return null; // korup → biarkan pemanggil membuat seed baru
  }
}

/* ------------------------------------------------------------------ */
/* Backend Cloud Firestore (produksi)                                 */
/* ------------------------------------------------------------------ */

/** Isi dokumen `app/db`: data DB + etag untuk deteksi konflik tulis. */
type DokumenFirestore = { data: DB; etag: string };

/** Error internal ketika tulis bersyarat kalah saing (etag tidak cocok). */
class KonflikFirebase extends Error {
  constructor() {
    super("konflik tulis firestore");
  }
}

function konflik(err: unknown): boolean {
  return (
    err instanceof KonflikFirebase ||
    (err instanceof Error && /aborted|precondition/i.test(err.message))
  );
}

let appFirebase: App | null = null;
let firestoreSingleton: Firestore | null = null;

function firestore(): Firestore {
  if (!firestoreSingleton) {
    appFirebase =
      getApps()[0] ??
      initializeApp({
        credential: cert({
          projectId: process.env.FIREBASE_PROJECT_ID!,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL!,
          privateKey: process.env.FIREBASE_PRIVATE_KEY!.replace(
            /\\n/g,
            "\n",
          ),
        }),
      });
    firestoreSingleton = getFirestore(appFirebase);
  }
  return firestoreSingleton;
}

function etagBaru(): string {
  return randomBytes(8).toString("hex");
}

async function bacaFirestore(): Promise<DokumenFirestore | null> {
  const snap = await firestore().doc(FIRESTORE_DOC).get();
  if (!snap.exists) return null;
  const isi = snap.data() as DokumenFirestore | undefined;
  if (!isi || typeof isi.data !== "object" || isi.data === null) return null;
  return isi;
}

/**
 * Tulis dokumen lewat transaksi Firestore.
 * - `etag` diberikan → tulis bersyarat: gagal (KonflikFirebase) bila isi
 *   dokumen sudah diubah orang lain sejak terakhir dibaca.
 * - tanpa `etag` → tulis mutlak (dipakai saat membuat seed baru).
 */
async function tulisFirestore(db: DB, etag?: string) {
  await firestore().runTransaction(async (tx) => {
    const ref = firestore().doc(FIRESTORE_DOC);
    const snap = await tx.get(ref);
    if (etag !== undefined) {
      const etagKini = snap.exists
        ? (snap.data() as DokumenFirestore).etag
        : null;
      if (etagKini !== etag) throw new KonflikFirebase();
    }
    tx.set(ref, { data: db, etag: etagBaru() } satisfies DokumenFirestore);
  });
}

/* ------------------------------------------------------------------ */
/* Bersama                                                            */
/* ------------------------------------------------------------------ */

/** Isi PIN default untuk scope yang belum punya (mis. kelas baru). */
function lengkapiPinDefault(db: DB): boolean {
  let berubah = false;
  if (!db.pins[SCOPE_GURU]) {
    db.pins[SCOPE_GURU] = hashPin(PIN_BAWAAN);
    berubah = true;
  }
  for (const k of db.kelas) {
    const scope = scopeKelas(k.id);
    if (!db.pins[scope]) {
      db.pins[scope] = hashPin(PIN_BAWAAN);
      berubah = true;
    }
  }
  return berubah;
}

function dbBaru(): DB {
  const db = createSeed();
  lengkapiPinDefault(db);
  return db;
}

/** Baca dokumen DB (file lokal atau Firestore — tergantung lingkungan). */
export async function bacaDB(): Promise<DB> {
  if (pakaiFirebase()) {
    const hasil = await bacaFirestore();
    if (!hasil) {
      const db = dbBaru();
      await tulisFirestore(db);
      return db;
    }
    if (lengkapiPinDefault(hasil.data)) {
      // Tulis bersyarat; bila kalah saing biarkan saja — instance lain sudah
      // mengisi PIN default yang sama.
      try {
        await tulisFirestore(hasil.data, hasil.etag);
      } catch (err) {
        if (!konflik(err)) throw err;
      }
    }
    return hasil.data;
  }

  const db = bacaFile();
  if (!db) {
    const baru = dbBaru();
    simpanFile(baru);
    return baru;
  }
  if (lengkapiPinDefault(db)) simpanFile(db);
  return db;
}

/** Jalankan mutasi secara berantai (satu per satu) agar data tidak saling menimpa. */
export function mutasi<T>(fn: (db: DB) => T): Promise<T> {
  const hasil = antrean.then(() => jalankanMutasi(fn));
  antrean = hasil.then(
    () => undefined,
    () => undefined,
  );
  return hasil;
}

const MAKS_ULANG_KONFLIK = 5;

async function jalankanMutasi<T>(fn: (db: DB) => T): Promise<T> {
  if (pakaiFirebase()) {
    // Transaksi Firestore: baca → ubah → tulis atomik. Bila ada penulis
    // lain di antaranya, SDK mengulang transaksi otomatis dengan data
    // terbaru; loop ini menjaga batas wajar plus pesan yang ramah.
    for (let i = 0; i < MAKS_ULANG_KONFLIK; i++) {
      try {
        let hasil: T | undefined;
        await firestore().runTransaction(async (tx) => {
          const ref = firestore().doc(FIRESTORE_DOC);
          const snap = await tx.get(ref);
          const db = snap.exists
            ? (snap.data() as DokumenFirestore).data
            : dbBaru();
          hasil = fn(db);
          tx.set(ref, { data: db, etag: etagBaru() } satisfies DokumenFirestore);
        });
        return hasil as T;
      } catch (err) {
        if (!konflik(err)) throw err;
      }
    }
    throw new Error(
      "Data sedang banyak diubah oleh pengguna lain. Coba lagi beberapa saat.",
    );
  }

  const db = bacaFile() ?? dbBaru();
  const hasil = fn(db);
  simpanFile(db);
  return hasil;
}

let antrean: Promise<unknown> = Promise.resolve();

let secretCache: string | null = null;

/** Rahasia penandatangan token sesi — env SESSION_SECRET atau data/secret.key. */
export function rahasia(): string {
  if (process.env.SESSION_SECRET) return process.env.SESSION_SECRET;
  if (secretCache) return secretCache;
  pastikanFolder();
  if (!fs.existsSync(SECRET_FILE)) {
    fs.writeFileSync(SECRET_FILE, randomBytes(32).toString("hex"), {
      encoding: "utf8",
      mode: 0o600,
    });
  }
  secretCache = fs.readFileSync(SECRET_FILE, "utf8").trim();
  return secretCache;
}
