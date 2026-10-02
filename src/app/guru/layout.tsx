import { sesiAktif } from "@/lib/auth";
import DashboardShell from "@/components/dashboard-shell";
import PinGate from "@/components/pin-gate";

export default async function GuruLayout(props: LayoutProps<"/guru">) {
  const aktif = await sesiAktif("guru");

  if (!aktif) {
    return (
      <PinGate
        scope="guru"
        judul="Tabungan Guru & Staf"
        keterangan="Masukkan password/PIN kategori guru untuk membuka daftar dan data tabungan agar datanya aman."
        kembaliKe="/pilih"
        kembaliLabel="Kembali ke pilihan kategori"
      />
    );
  }

  return (
    <DashboardShell scope="guru" subjudul="Kategori Guru & Staf">
      {props.children}
    </DashboardShell>
  );
}
