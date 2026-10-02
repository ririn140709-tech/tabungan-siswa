"use client";

import Link from "next/link";
import { useState, useTransition, type FormEvent } from "react";
import { loginAction } from "@/lib/actions";
import { IconArrowLeft, IconLock, IconMata, IconMataTutup } from "./icons";

export default function PinGate({
  scope,
  judul,
  keterangan,
  kembaliKe,
  kembaliLabel,
}: {
  scope: string;
  judul: string;
  keterangan: string;
  kembaliKe: string;
  kembaliLabel: string;
}) {
  const [error, setError] = useState<string | null>(null);
  const [lihat, setLihat] = useState(false);
  const [pending, startTransition] = useTransition();

  function kirim(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    setError(null);
    startTransition(async () => {
      const hasil = await loginAction(formData);
      if (!hasil.ok) setError(hasil.error);
      // Berhasil: cookie sesi di-set server, halaman di-render ulang otomatis
      // sehingga gerbang PIN terbuka menjadi dashboard.
    });
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-navy-950 px-4 py-10">
      {/* Latar dekoratif */}
      <div className="pointer-events-none absolute -top-32 left-1/2 h-96 w-[42rem] -translate-x-1/2 rounded-full bg-gold-500/15 blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 right-0 h-72 w-72 rounded-full bg-navy-600/40 blur-3xl" />

      <div className="relative w-full max-w-md animate-fade-up">
        <Link
          href={kembaliKe}
          className="mb-5 inline-flex items-center gap-2 text-sm font-semibold text-slate-300 transition hover:text-gold-300"
        >
          <IconArrowLeft className="h-4 w-4" />
          {kembaliLabel}
        </Link>

        <div className="rounded-3xl border border-white/10 bg-white p-7 shadow-2xl shadow-navy-950/40 sm:p-8">
          <div className="mb-6 flex items-center gap-4">
            <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-navy-900 text-gold-400">
              <IconLock className="h-6 w-6" />
            </span>
            <div>
              <h1 className="font-display text-2xl font-semibold tracking-tight text-navy-900">
                {judul}
              </h1>
              <p className="mt-0.5 text-sm leading-relaxed text-slate-500">
                {keterangan}
              </p>
            </div>
          </div>

          <form method="post" onSubmit={kirim} className="space-y-4">
            <input type="hidden" name="scope" value={scope} />

            <div>
              <label htmlFor="pin" className="label">
                Password / PIN
              </label>
              <div className="relative">
                <input
                  id="pin"
                  name="pin"
                  type={lihat ? "text" : "password"}
                  inputMode="numeric"
                  autoComplete="off"
                  maxLength={32}
                  required
                  autoFocus
                  onChange={() => setError(null)}
                  placeholder="••••••"
                  className="input pr-12 tracking-[0.3em]"
                />
                <button
                  type="button"
                  onClick={() => setLihat((v) => !v)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-navy-800"
                  aria-label={lihat ? "Sembunyikan PIN" : "Tampilkan PIN"}
                >
                  {lihat ? (
                    <IconMataTutup className="h-4.5 w-4.5" />
                  ) : (
                    <IconMata className="h-4.5 w-4.5" />
                  )}
                </button>
              </div>
            </div>

            {error && <p className="alert-error">{error}</p>}

            <button
              type="submit"
              disabled={pending}
              className="btn-primary w-full py-3"
            >
              {pending ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                  Memeriksa…
                </>
              ) : (
                <>
                  <IconLock className="h-4 w-4" />
                  Buka Dashboard
                </>
              )}
            </button>
          </form>

          <p className="mt-5 rounded-xl bg-slate-50 px-3.5 py-2.5 text-center text-xs leading-relaxed text-slate-500">
            Gunakan PIN bawaan{" "}
            <span className="font-bold tracking-widest text-navy-800">
              123456
            </span>{" "}
            bila belum diubah, lalu ganti dari dalam dashboard.
          </p>
        </div>
      </div>
    </div>
  );
}
