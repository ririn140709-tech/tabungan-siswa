import { notFound } from "next/navigation";
import { sesiAktif } from "@/lib/auth";
import DashboardShell from "@/components/dashboard-shell";
import PinGate from "@/components/pin-gate";
import { bacaDB, scopeKelas } from "@/lib/db";

export default async function KelasLayout(
  props: LayoutProps<"/siswa/[kelas]">,
) {
  const { kelas } = await props.params;
  const data = (await bacaDB()).kelas.find((k) => k.id === kelas);
  if (!data) notFound();

  const scope = scopeKelas(data.id);
  const aktif = await sesiAktif(scope);

  if (!aktif) {
    return (
      <PinGate
        scope={scope}
        judul={`Kelas ${data.nama}`}
        keterangan={`Masukkan password/PIN kelas ${data.nama} untuk membuka dashboard tabungan agar datanya aman.`}
        kembaliKe="/siswa"
        kembaliLabel="Pilih kelas lain"
      />
    );
  }

  return (
    <DashboardShell
      scope={scope}
      subjudul={`Kelas ${data.nama} · ${data.waliKelas}`}
    >
      {props.children}
    </DashboardShell>
  );
}
