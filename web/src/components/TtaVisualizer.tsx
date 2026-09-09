"use client";

import { motion } from "framer-motion";
import { Grid, Eye } from "lucide-react";
import { CLASS_META } from "../lib/utils";
import { getTerrainSvg } from "./TerrainIcons";

interface TtaVisualizerProps {
  crops?: {
    cropName: string;
    label: string;
    confidence: number;
  }[];
}

export default function TtaVisualizer({ crops }: TtaVisualizerProps) {
  if (!crops || crops.length === 0) return null;

  return (
    <div className="rounded-3xl glass-panel border border-white/10 p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs font-mono text-cyan-400 uppercase tracking-wider">
          <Grid className="w-4 h-4" />
          <span>Multi-Scale Test-Time Augmentation (TTA) Consensus</span>
        </div>
        <span className="text-[11px] font-mono text-slate-500">6 Multi-Crop Views</span>
      </div>

      <p className="text-xs text-slate-400 leading-relaxed">
        Instead of a single forward pass, TerraVision decomposes the image into multi-scale crops (Center, Top-Left, Top-Right, Bottom-Left, Bottom-Right, and Wide-Angle) and fuses their probability distributions:
      </p>

      {/* Grid of Crops */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2.5 pt-2">
        {crops.map((c, i) => {
          const meta = CLASS_META[c.label as keyof typeof CLASS_META];
          return (
            <motion.div
              key={c.cropName}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="p-3 rounded-2xl bg-slate-900/80 border border-white/5 flex flex-col items-center text-center space-y-1 hover:border-cyan-500/40 transition-colors"
            >
              <span className="text-[10px] font-mono text-slate-400 uppercase">{c.cropName}</span>
              <div className="w-8 h-8 flex items-center justify-center my-1">
                {getTerrainSvg(c.label, "w-7 h-7")}
              </div>
              <span className="text-xs font-semibold text-slate-200">{meta?.name || c.label}</span>
              <span className="text-[10px] font-mono text-cyan-400">
                {(c.confidence * 100).toFixed(0)}%
              </span>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
