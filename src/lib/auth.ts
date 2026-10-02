import { cookies } from "next/headers";
import { safeEqual, signToken } from "./crypto";
import { bacaDB, rahasia, SCOPE_GURU } from "./db";

/** Masa berlaku sesi: 12 jam. */
const MASA_BERLAKU_DETIK = 60 * 60 * 12;

function namaCookie(scope: string): string {
  return `tabungan_${scope.replace(/[^a-zA-Z0-9]+/g, "_")}`;
}

/** Validasi scope dari input luar (hanya kelas yang ada & guru). */
export async function scopeValid(
  scope: string | null | undefined,
): Promise<string | null> {
  if (!scope) return null;
  const nilai = scope.trim();
  if (nilai === SCOPE_GURU) return SCOPE_GURU;
  const cocok = /^kelas:([a-z0-9-]+)$/.exec(nilai);
  if (cocok) {
    const db = await bacaDB();
    if (db.kelas.some((k) => k.id === cocok[1])) return nilai;
  }
  return null;
}

export async function buatSesi(scope: string): Promise<void> {
  const exp = Math.floor(Date.now() / 1000) + MASA_BERLAKU_DETIK;
  const token = `${exp}.${signToken(`${scope}|${exp}`, rahasia())}`;
  const store = await cookies();
  store.set(namaCookie(scope), token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: MASA_BERLAKU_DETIK,
  });
}

export async function hapusSesi(scope: string): Promise<void> {
  const store = await cookies();
  store.delete(namaCookie(scope));
}

/** Cek sesi terautentikasi untuk sebuah scope (token ditandatangani + belum kedaluwarsa). */
export async function sesiAktif(scope: string): Promise<boolean> {
  const store = await cookies();
  const nilai = store.get(namaCookie(scope))?.value;
  if (!nilai) return false;

  const [expStr, ttd] = nilai.split(".");
  const exp = Number(expStr);
  if (!Number.isFinite(exp) || !ttd) return false;
  if (exp * 1000 < Date.now()) return false;

  const diharapkan = signToken(`${scope}|${exp}`, rahasia());
  return safeEqual(ttd, diharapkan);
}
