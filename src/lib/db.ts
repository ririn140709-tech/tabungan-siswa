import fs from "node:fs";
import path from "node:path";
import { randomBytes } from "node:crypto";
import { get, put, BlobPreconditionFailedError } from "@vercel/blob";
import { hashPin } from "./crypto";
import { createSeed } from "./seed";
import type { DB } from "./types";

/** Password/PIN bawaan untuk semua kelas & kategori guru. */
export const PIN_BAWAAN = "123456";
export const SCOPE_GURU = "guru";

const DATA_DIR = path.join(process.cwd(), "data");
const DB_FILE = path.join(DATA_DIR, "db.json");
const SECRET_FILE = path.join(DATA_DIR, "secret.key");

/** Lokasi dokumen DB di Vercel Blob (dipakai saat berjalan di Vercel). */
const BLOB_PATH = "data/db.json";

/**
 * Penyimpanan cloud (Vercel Blob) aktif hanya saat berjalan DI Vercel
 * (VERCEL_ENV ter-set oleh platform). Lokal selalu memakai file
 * `data/db.json` agar data uji tidak bercampur dengan data produksi.
 */
function pakaiBlob(): boolean {
  return (
    Boolean(process.env.VERCEL_ENV) &&
    Boolean(
      process.env.BLOB_STORE_ID || process.env.BLOB_READ_WRITE_TOKEN,
    )
  );
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
/* Backend Vercel Blob (produksi)                                     */
/* ------------------------------------------------------------------ */

async function bacaBlob(): Promise<{ db: DB; etag: string } | null> {
  const hasil = await get(BLOB_PATH, {
    access: "private",
    useCache: false, // selalu baca versi terbaru
  });
  if (!hasil || hasil.statusCode !== 200 || !hasil.stream) return null;
  const teks = await new Response(hasil.stream).text();
  try {
    return { db: JSON.parse(teks) as DB, etag: etagKuat(hasil.blob.etag) };
  } catch {
    return null; // korup → seed baru
  }
}

async function tulisBlob(db: DB, etag?: string) {
  await put(BLOB_PATH, JSON.stringify(db, null, 2), {
    access: "private",
    contentType: "application/json",
    allowOverwrite: true,
    ...(etag ? { ifMatch: etag } : {}),
  });
}

/**
 * `get()` mengembalikan etag lemah (`W/"…"`) yang selalu ditolak oleh
 * `If-Match` (harus etag kuat) — buang prefix `W/`-nya.
 */
function etagKuat(e: string): string {
  return e.replace(/^W\//, "");
}

function konflik(err: unknown): boolean {
  return (
    err instanceof BlobPreconditionFailedError ||
    (err instanceof Error && /precondition failed/i.test(err.message))
  );
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

/** Baca dokumen DB (file lokal atau Vercel Blob — tergantung lingkungan). */
export async function bacaDB(): Promise<DB> {
  if (pakaiBlob()) {
    const hasil = await bacaBlob();
    if (!hasil) {
      const db = dbBaru();
      await tulisBlob(db);
      return db;
    }
    if (lengkapiPinDefault(hasil.db)) {
      // Tulis bersyarat; bila kalah saing biarkan saja — instance lain sudah
      // mengisi PIN default yang sama.
      try {
        await tulisBlob(hasil.db, hasil.etag);
      } catch (err) {
        if (!konflik(err)) throw err;
      }
    }
    return hasil.db;
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
  if (pakaiBlob()) {
    // Optimistic concurrency: baca etag → ubah → tulis bersyarat.
    // Bila ada yang menulis di antaranya, ETag beda → ulangi dengan data terbaru.
    for (let i = 0; i < MAKS_ULANG_KONFLIK; i++) {
      const awal = await bacaBlob();
      const db = awal ? awal.db : dbBaru();
      const hasil = fn(db);
      try {
        await tulisBlob(db, awal?.etag);
        return hasil;
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
