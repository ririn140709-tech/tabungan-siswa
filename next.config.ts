import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* firebase-admin dijalankan sebagai modul Node asli, jangan dibundle */
  serverExternalPackages: ["firebase-admin"],
};

export default nextConfig;
