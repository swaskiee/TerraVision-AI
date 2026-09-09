import type { Metadata } from "next";
import Navbar from "../components/Navbar";
import "./globals.css";

export const metadata: Metadata = {
  title: "TerraVision AI • 3LC Scene Intelligence",
  description: "Enterprise Geospatial Scene Classification powered by ResNet-18 and client-side ONNX Runtime Web. Built for the 3LC × HackBlox 2026 AI Challenge.",
  icons: {
    icon: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'%3E%3Cdefs%3E%3ClinearGradient id='g' x1='0' y1='0' x2='32' y2='32'%3E%3Cstop stop-color='%2306b6d4'/%3E%3Cstop offset='1' stop-color='%2310b981'/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width='32' height='32' rx='8' fill='%2306090f'/%3E%3Cpath d='M16 6L6 24h20z' fill='url(%23g)'/%3E%3Ccircle cx='16' cy='18' r='3' fill='%23ffffff'/%3E%3C/svg%3E",
  },
};


export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-[#080c14] text-slate-100 antialiased selection:bg-cyan-500/30 selection:text-cyan-200">
        <div className="relative min-h-screen flex flex-col">
          {/* Subtle Ambient Glow Gradients */}
          <div className="fixed top-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full bg-cyan-600/10 blur-[140px] pointer-events-none -z-10" />
          <div className="fixed bottom-[-20%] right-[-10%] w-[600px] h-[600px] rounded-full bg-emerald-600/10 blur-[140px] pointer-events-none -z-10" />

          <Navbar />

          <main className="flex-1 max-w-7xl w-full mx-auto px-4 lg:px-8">
            {children}
          </main>

          {/* Minimalist Footer */}
          <footer className="border-t border-white/5 py-6 mt-12 text-center text-xs font-mono text-slate-500">
            <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
              <span>TerraVision AI • Team GenWin (HackBlox 2026)</span>
              <span>ResNet-18 From Scratch • Rank 8 Verified</span>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}
