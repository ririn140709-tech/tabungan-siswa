"use client";

import { useState, useTransition, type FormEvent } from "react";
import type { ActionResult } from "@/lib/types";
import { IconCentang, IconPencil, IconX } from "./icons";

function FormNama({
  aksi,
  label,
  placeholder,
  nilaiAwal,
  data,
  onClose,
}: {
  aksi: (formData: FormData) => Promise<ActionResult>;
  label: string;
  placeholder: string;
  nilaiAwal: string;
  data: Record<string, string>;
  onClose: () => void;
}) {
  const [nama, setNama] = useState(nilaiAwal);
  const [error, setError] = useState<string | null>(null);
  const [sukses, setSukses] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function kirim(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    setError(null);
    setSukses(null);
    startTransition(async () => {
      const hasil = await aksi(formData);
      if (hasil.ok) {
        setSukses(hasil.message ?? "Berhasil diperbarui.");
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
      {Object.entries(data).map(([k, v]) => (
        <input key={k} type="hidden" name={k} value={v} />
      ))}

      <div>
        <label htmlFor="namaEdit" className="label">
          {label}
        </label>
        <input
          id="namaEdit"
          name="nama"
          type="text"
          value={nama}
          onChange={(e) => setNama(e.target.value)}
          maxLength={80}
          required
          autoFocus
          placeholder={placeholder}
          className="input"
        />
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
          {pending ? "Menyimpan…" : "Simpan"}
        </button>
      </div>
    </form>
  );
}

export default function EditNamaDialog({
  aksi,
  judul,
  subjudul,
  label,
  placeholder,
  nilaiAwal,
  data,
  ariaTombol,
  classNameTombol = "",
}: {
  aksi: (formData: FormData) => Promise<ActionResult>;
  judul: string;
  subjudul?: string;
  label: string;
  placeholder?: string;
  nilaiAwal: string;
  data: Record<string, string>;
  ariaTombol: string;
  classNameTombol?: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label={ariaTombol}
        title={ariaTombol}
        className={`inline-grid h-7 w-7 shrink-0 place-items-center rounded-lg border border-slate-200 bg-white text-slate-400 transition hover:border-gold-400 hover:text-gold-600 ${classNameTombol}`}
      >
        <IconPencil className="h-3.5 w-3.5" />
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 grid place-items-center bg-navy-950/70 p-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-label={judul}
        >
          <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl">
            <div className="mb-5 flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-navy-900 text-gold-400">
                  <IconPencil className="h-5 w-5" />
                </span>
                <div>
                  <h2 className="text-base font-bold tracking-tight text-navy-900">
                    {judul}
                  </h2>
                  {subjudul && (
                    <p className="text-xs text-slate-500">{subjudul}</p>
                  )}
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

            <FormNama
              aksi={aksi}
              label={label}
              placeholder={placeholder ?? "Ketik nama…"}
              nilaiAwal={nilaiAwal}
              data={data}
              onClose={() => setOpen(false)}
            />
          </div>
        </div>
      )}
    </>
  );
}
