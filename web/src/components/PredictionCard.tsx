import { motion } from "framer-motion";
import { 
  CheckCircle2, Zap, Clock, ShieldCheck, AlertTriangle, 
  PlaneLanding, Wind, Compass, FileText, Download 
} from "lucide-react";
import { PredictionResult } from "../lib/onnxInference";
import { CLASS_META, CLASS_NAMES } from "../lib/utils";
import { getTerrainSvg } from "./TerrainIcons";

interface PredictionCardProps {
  result: PredictionResult | null;
  isLoading: boolean;
}

export default function PredictionCard({ result, isLoading }: PredictionCardProps) {
  if (isLoading || !result) {
    return (
      <div className="h-full min-h-[460px] rounded-3xl glass-panel border border-white/10 p-8 flex flex-col items-center justify-center text-center space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center animate-pulse">
          <Zap className="w-8 h-8 text-cyan-400" />
        </div>
        <div className="space-y-1">
          <h3 className="text-base font-bold text-slate-200 uppercase font-mono tracking-wider">
            {isLoading ? "Analyzing Satellite / UAV Telemetry..." : "UAV Sensors on Standby"}
          </h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto font-mono leading-relaxed">
            {isLoading
              ? "Running multi-crop terrain consensus & flight hazard evaluation inside browser WebAssembly..."
              : "Feed an aerial photograph or select a preset to compute landing safety, terrain friction, and tactical risk."}
          </p>
        </div>
      </div>
    );
  }

  const meta = CLASS_META[result.label];
  const confidencePercent = (result.confidence * 100).toFixed(1);

  const exportTelemetryJson = () => {
    const data = {
      timestamp: new Date().toISOString(),
      terrainClass: meta.name,
      callsign: meta.callsign,
      confidence: result.confidence,
      landingScore: meta.landingSuitability.score,
      landingStatus: meta.landingSuitability.status,
      tacticalAssessment: meta.tacticalAssessment,
      hazards: meta.hazards,
      sensors: meta.environmentalSensor,
      allProbabilities: result.probabilities,
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `recon_telemetry_${meta.name.toLowerCase()}_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="h-full rounded-3xl glass-panel-glow p-6 sm:p-7 flex flex-col justify-between space-y-6">
      {/* Top Header & Detected Class */}
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span className="text-[11px] font-mono text-emerald-300 font-bold uppercase tracking-wider">
              {meta.callsign} IDENTIFIED
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={exportTelemetryJson}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-[11px] font-mono text-slate-300 hover:text-white transition-colors"
              title="Download full tactical recon payload"
            >
              <Download className="w-3 h-3 text-cyan-400" />
              <span>Export Recon</span>
            </button>
            <div className="flex items-center gap-1 text-[11px] font-mono text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded-md border border-cyan-500/30">
              <Clock className="w-3 h-3" />
              {result.inferenceTimeMs}ms
            </div>
          </div>
        </div>

        {/* Primary Classification & Tactical Summary */}
        <div className={`flex items-start gap-4 p-4 rounded-2xl border shadow-lg ${
          result.isUndefined 
            ? "bg-rose-950/30 border-rose-500/40 shadow-[0_0_25px_rgba(244,63,94,0.15)]" 
            : "bg-slate-900/90 border-white/10"
        }`}>
          <div className="p-2.5 rounded-xl bg-slate-800/90 border border-white/10 shrink-0 shadow-md">
            {getTerrainSvg(result.label, "w-10 h-10")}
          </div>
          <div className="space-y-1.5 flex-1">
            <div className="flex items-center justify-between">
              <div className="flex items-baseline gap-2">
                <h2 className="text-2xl font-black text-white tracking-tight">{meta.name}</h2>
                <span className="text-xs text-slate-400 font-mono">({meta.subName})</span>
              </div>
              <span className={`text-xs px-2.5 py-0.5 rounded-full border font-mono font-bold ${meta.badgeColor}`}>
                {result.isUndefined ? "AMBIGUOUS / OOD" : `${confidencePercent}% CONFIDENCE`}
              </span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed font-sans">{meta.tacticalAssessment}</p>

            {result.isUndefined && (
              <div className="mt-2.5 p-2 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-between text-[11px] font-mono text-rose-200">
                <span className="flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
                  <span>Out-of-Distribution Data Point (e.g. Waterfall / Non-standard scene)</span>
                </span>
                <span className="text-[10px] text-rose-300 font-bold bg-rose-500/20 px-2 py-0.5 rounded">
                  Entropy: {result.entropy ?? "High"}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Tactical UAV Landing Zone Rating */}
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3.5 rounded-xl bg-slate-950/60 border border-white/10 space-y-1.5">
            <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
              <span className="flex items-center gap-1">
                <PlaneLanding className="w-3.5 h-3.5 text-cyan-400" />
                UAV LZ RATING
              </span>
              <span className={`font-bold ${meta.landingSuitability.color}`}>
                {meta.landingSuitability.status}
              </span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black font-mono text-white">{meta.landingSuitability.score}</span>
              <span className="text-xs font-mono text-slate-500">/ 100 Safety Index</span>
            </div>
            <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
              <div 
                className={`h-full ${
                  meta.landingSuitability.score > 70 
                    ? "bg-emerald-400" 
                    : meta.landingSuitability.score > 30 
                    ? "bg-amber-400" 
                    : "bg-red-500"
                }`} 
                style={{ width: `${meta.landingSuitability.score}%` }} 
              />
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950/60 border border-white/10 space-y-1.5">
            <div className="flex items-center gap-1 text-[11px] font-mono text-slate-400">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
              <span>DETECTED HAZARDS</span>
            </div>
            <div className="flex flex-wrap gap-1 pt-0.5">
              {meta.hazards.map((h) => (
                <span key={h} className="text-[10px] font-mono px-2 py-0.5 rounded bg-red-500/10 text-rose-300 border border-red-500/20">
                  {h}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Environmental Sensor Telemetry */}
        <div className="p-3 rounded-xl bg-slate-900/60 border border-white/5 space-y-1.5 text-xs font-mono">
          <div className="text-[10px] text-slate-400 uppercase tracking-wider">Surface Sensor Telemetry</div>
          <div className="grid grid-cols-3 gap-2 text-[11px]">
            <div>
              <span className="text-slate-500 block text-[10px]">FRICTION</span>
              <span className="text-slate-200 font-semibold">{meta.environmentalSensor.terrainFriction}</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px]">CANOPY</span>
              <span className="text-slate-200 font-semibold">{meta.environmentalSensor.canopyDensity}</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px]">ALBEDO</span>
              <span className="text-slate-200 font-semibold">{meta.environmentalSensor.opticalReflectance}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 6-Class Probability Spectrum */}
      <div className="space-y-2 pt-2 border-t border-white/10">
        <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 uppercase tracking-wider">
          <span>Terrain Classification Probabilities</span>
          <span className="text-cyan-400 font-semibold">TTA Ensemble</span>
        </div>

        <div className="space-y-1.5">
          {CLASS_NAMES.map((cls) => {
            const prob = result.probabilities[cls] || 0;
            const pct = (prob * 100).toFixed(1);
            const isWinner = cls === result.label;
            const cMeta = CLASS_META[cls];

            return (
              <div key={cls} className="space-y-1 p-1.5 rounded-lg hover:bg-white/[0.02] transition-colors">
                <div className="flex items-center justify-between text-xs">
                  <span className="flex items-center gap-2 font-medium text-slate-300">
                    <span className="w-5 h-5 flex items-center justify-center">
                      {getTerrainSvg(cls, "w-4 h-4")}
                    </span>
                    <span className={isWinner ? "text-white font-bold" : "text-slate-300"}>
                      {cMeta.name}
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono hidden sm:inline">
                      • {cMeta.subName}
                    </span>
                    {isWinner && (
                      <span className="text-[9px] font-mono font-bold text-emerald-400 px-1 py-0.2 rounded bg-emerald-500/10 border border-emerald-500/30">
                        PRIMARY
                      </span>
                    )}
                  </span>
                  <span className={isWinner ? "font-mono font-bold text-cyan-300 text-xs" : "font-mono text-slate-500 text-xs"}>
                    {pct}%
                  </span>
                </div>

                <div className="w-full h-1.5 rounded-full bg-slate-950 overflow-hidden border border-white/5">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${pct}%` }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                    className={`h-full rounded-full ${
                      isWinner
                        ? "bg-gradient-to-r from-cyan-400 via-teal-300 to-emerald-400 shadow-[0_0_8px_rgba(6,182,212,0.5)]"
                        : "bg-slate-800"
                    }`}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

