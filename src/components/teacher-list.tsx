"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { inisial } from "@/lib/utils";
import { IconChevronRight, IconGuru, IconSearch } from "./icons";

export default function TeacherList({
  guru,
}: {
  guru: { id: string; nama: string; jabatan: string }[];
}) {
  const [q, setQ] = useState("");

  const hasil = useMemo(() => {
    const kata = q.trim().toLowerCase();
    if (!kata) return guru;
    return guru.filter(
      (g) =>
        g.nama.toLowerCase().includes(kata) ||
        g.jabatan.toLowerCase().includes(kata),
    );
  }, [q, guru]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-sm">
          <IconSearch className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Cari nama atau jabatan guru…"
            className="input pl-10"
            aria-label="Cari guru"
          />
        </div>
        <p className="text-xs font-semibold text-slate-400">
          Menampilkan {hasil.length} dari {guru.length} guru &amp; staf
        </p>
      </div>

      {hasil.length === 0 ? (
        <div className="card grid place-items-center gap-2 px-6 py-12 text-center">
          <IconGuru className="h-8 w-8 text-slate-300" />
          <p className="text-sm font-semibold text-slate-500">
            Guru tidak ditemukan
          </p>
          <p className="text-xs text-slate-400">
            Coba kata kunci lain, misalnya nama atau jabatan.
          </p>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {hasil.map((g) => (
            <Link
              key={g.id}
              href={`/guru/${g.id}`}
              className="group flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-3.5 shadow-[0_1px_2px_rgba(15,23,42,0.04)] transition hover:-translate-y-0.5 hover:border-gold-400 hover:shadow-[0_12px_24px_-16px_rgba(15,23,42,0.4)]"
            >
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-navy-900 text-sm font-bold text-gold-300 transition group-hover:bg-gold-500 group-hover:text-navy-950">
                {inisial(g.nama)}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-semibold text-navy-900">
                  {g.nama}
                </span>
                <span className="block truncate text-xs text-slate-500">
                  {g.jabatan}
                </span>
              </span>
              <IconChevronRight className="h-4 w-4 shrink-0 text-slate-300 transition group-hover:translate-x-0.5 group-hover:text-gold-500" />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
