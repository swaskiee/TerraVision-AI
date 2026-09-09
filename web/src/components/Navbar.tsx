"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Sparkles, Compass, Activity, Award, Code2 } from "lucide-react";
import { cn } from "../lib/utils";
import { SatelliteBadgeIcon } from "./TerrainIcons";


export default function Navbar() {
  const pathname = usePathname();

  const links = [
    { href: "/", label: "Tactical Recon", icon: Sparkles },
    { href: "/galaxy", label: "3D Latent Manifold", icon: Compass },
    { href: "/studio", label: "Active Learning Lab", icon: Activity },
    { href: "/leaderboard", label: "Benchmark Audit", icon: Award },
  ];

  return (
    <header className="sticky top-0 z-50 w-full glass-panel border-b border-white/10 px-4 lg:px-8 py-3.5 transition-all">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-emerald-500 p-0.5 shadow-lg shadow-cyan-500/20 group-hover:scale-105 transition-transform">
            <div className="w-full h-full bg-[#06090f] rounded-[10px] flex items-center justify-center p-1.5">
              <SatelliteBadgeIcon className="w-full h-full" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold tracking-tight text-white text-lg group-hover:text-cyan-400 transition-colors">
                TerraVision AI
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 uppercase tracking-wider font-semibold">
                Autonomous Recon
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-mono tracking-tight hidden sm:block">
              On-Device UAV & Geospatial Intelligence
            </p>
          </div>
        </Link>


        {/* Navigation items */}
        <nav className="hidden md:flex items-center gap-1.5 p-1 rounded-2xl bg-slate-900/60 border border-white/5 shadow-inner">
          {links.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-medium transition-all",
                  isActive
                    ? "bg-gradient-to-r from-cyan-500/20 to-emerald-500/20 text-cyan-300 border border-cyan-500/30 shadow-sm shadow-cyan-500/20"
                    : "text-slate-400 hover:text-slate-200 hover:bg-white/5"
                )}
              >
                <Icon className={cn("w-3.5 h-3.5", isActive ? "text-cyan-400" : "text-slate-400")} />
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Action Button & GitHub */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 text-xs font-mono px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            ONNX WebGL Engine Active
          </div>

          <a
            href="https://github.com/swaskiee/HackBox-AI"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-white/10 transition-colors shadow-sm"
          >
            <Code2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Repo</span>
          </a>
        </div>
      </div>
    </header>

  );
}
