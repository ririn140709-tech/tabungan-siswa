"use client";

import { useState, useTransition, type FormEvent } from "react";
import { ubahPinAction } from "@/lib/actions";
import { IconCentang, IconKunci, IconX } from "./icons";

function FormPin({
  scope,
  onClose,
}: {
  scope: string;
  onClose: () => void;
}) {
  const [error, setError] = useState<string | null>(null);
  const [sukses, setSukses] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function kirim(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);
    setError(null);
    setSukses(null);
    startTransition(async () => {
      const hasil = await ubahPinAction(formData);
      if (hasil.ok) {
        form.reset();
        setSukses(hasil.message ?? "Password/PIN berhasil diubah.");
        setTimeout(() => {
          setSukses(null);
          onClose();
        }, 1400);
      } else {
        setError(hasil.error);
      }
    });
  }

  return (
    <form method="post" onSubmit={kirim} className="space-y-4">
      <input type="hidden" name="scope" value={scope} />

      <div>
        <label htmlFor="pinLama" className="label">
          Password / PIN Lama
        </label>
        <input
          id="pinLama"
          name="pinLama"
          type="password"
          inputMode="numeric"
          autoComplete="off"
          maxLength={32}
          required
          placeholder="••••••"
          className="input"
        />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="pinBaru" className="label">
            PIN Baru
          </label>
          <input
            id="pinBaru"
            name="pinBaru"
            type="password"
            inputMode="numeric"
            autoComplete="off"
            maxLength={32}
            required
            placeholder="min. 6 karakter"
            className="input"
          />
        </div>
        <div>
          <label htmlFor="pinUlang" className="label">
            Ulangi PIN Baru
          </label>
          <input
            id="pinUlang"
            name="pinUlang"
            type="password"
            inputMode="numeric"
            autoComplete="off"
            maxLength={32}
            required
            placeholder="ketik ulang"
            className="input"
          />
        </div>
      </div>

      {error && <p className="alert-error">{error}</p>}
      {sukses && (
        <p className="alert-success flex items-center gap-2">
          <IconCentang className="h-4 w-4 shrink-0" />
          {sukses}
        </p>
      )}

      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <button type="button" onClick={onClose} className="btn-outline">
          Batal
        </button>
        <button type="submit" disabled={pending} className="btn-primary">
          {pending ? "Menyimpan…" : "Simpan PIN Baru"}
        </button>
      </div>
    </form>
  );
}

export default function ChangePinDialog({ scope }: { scope: string }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="btn-ghost border border-white/15 text-slate-100 hover:border-gold-400/60 hover:text-gold-300"
      >
        <IconKunci className="h-4 w-4" />
        <span className="hidden sm:inline">Ganti Password</span>
        <span className="sm:hidden">PIN</span>
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 grid place-items-center bg-navy-950/70 p-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-label="Ganti Password"
        >
          <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl">
            <div className="mb-5 flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-navy-900 text-gold-400">
                  <IconKunci className="h-5 w-5" />
                </span>
                <div>
                  <h2 className="text-base font-bold tracking-tight text-navy-900">
                    Ganti Password / PIN
                  </h2>
                  <p className="text-xs text-slate-500">
                    Berlaku untuk area ini saja.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-navy-900"
                aria-label="Tutup"
              >
                <IconX className="h-5 w-5" />
              </button>
            </div>

            <FormPin scope={scope} onClose={() => setOpen(false)} />
          </div>
        </div>
      )}
    </>
  );
}
