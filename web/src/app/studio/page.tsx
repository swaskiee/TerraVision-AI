"use client";

import { useState } from "react";
import { 
  Database, Filter, Zap, Play, CheckCircle, RefreshCw, BarChart2,
  Sparkles, Layers, Sliders, ShieldCheck, ArrowRight, TrendingUp
} from "lucide-react";
import { SCENE_CLASSES } from "../../lib/utils";

interface SampleRow {
  id: number;
  filename: string;
  category: string;
  margin: number;
  uncertainty: number;
  status: "included" | "excluded" | "flagged";
}

const MOCK_CANDIDATES: SampleRow[] = [
  { id: 1042, filename: "glacier_mist_042.jpg", category: "glacier", margin: 0.04, uncertainty: 0.96, status: "flagged" },
  { id: 2119, filename: "rocky_peak_119.jpg", category: "mountain", margin: 0.08, uncertainty: 0.92, status: "flagged" },
  { id: 3084, filename: "ocean_coastline_084.jpg", category: "sea", margin: 0.12, uncertainty: 0.88, status: "included" },
  { id: 4120, filename: "pine_canopy_120.jpg", category: "forest", margin: 0.89, uncertainty: 0.11, status: "excluded" },
  { id: 5091, filename: "downtown_skyscrapers.jpg", category: "buildings", margin: 0.05, uncertainty: 0.95, status: "flagged" },
  { id: 6204, filename: "asphalt_alley_204.jpg", category: "street", margin: 0.07, uncertainty: 0.93, status: "flagged" },
  { id: 7101, filename: "alpine_snowfall_101.jpg", category: "glacier", margin: 0.15, uncertainty: 0.85, status: "included" },
  { id: 8203, filename: "ridge_cliffside_203.jpg", category: "mountain", margin: 0.76, uncertainty: 0.24, status: "excluded" },
];

export default function StudioPage() {
  const [marginThreshold, setMarginThreshold] = useState<number>(0.15);
  const [budgetCap, setBudgetCap] = useState<number>(3000);
  const [balancePriority, setBalancePriority] = useState<boolean>(true);
  const [isMining, setIsMining] = useState<boolean>(false);
  const [minedCount, setMinedCount] = useState<number>(1420);
  const [simulatedAcc, setSimulatedAcc] = useState<number>(82.78);

  const triggerMiningSimulation = () => {
    setIsMining(true);
    setTimeout(() => {
      setIsMining(false);
      const count = Math.min(budgetCap, Math.round(budgetCap * (marginThreshold / 0.25) * 0.95));
      setMinedCount(count);
      const acc = 79.5 + (count / budgetCap) * 3.28;
      setSimulatedAcc(Number(acc.toFixed(2)));
    }, 1200);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-mono font-medium">
          <Database className="w-3.5 h-3.5" />
          3LC ACTIVE LEARNING SIMULATOR
        </div>
        <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white">
          Data-Centric <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-blue-400 to-indigo-400">Selection Studio</span>
        </h1>
        <p className="text-slate-400 max-w-2xl mx-auto text-sm sm:text-base">
          Explore how we mined hard boundary edge-cases across Glacier, Mountain, and Sea within the strict <span className="text-cyan-300 font-semibold">3,000 image constraint</span> to outperform 14,000+ uncurated datasets.
        </p>
      </div>

      {/* Main Grid: Controls & Pipeline */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Interactive Selection Hyperparameters */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-800/80 space-y-6 lg:col-span-1">
          <div className="flex items-center gap-2 pb-4 border-b border-slate-800">
            <Sliders className="w-5 h-5 text-cyan-400" />
            <h2 className="text-lg font-bold text-white">Curation Policy</h2>
          </div>

          {/* Budget Slider */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-mono">
              <span className="text-slate-400">BUDGET CAP</span>
              <span className="text-cyan-400 font-bold">{budgetCap.toLocaleString()} images</span>
            </div>
            <input
              type="range"
              min="500"
              max="3000"
              step="100"
              value={budgetCap}
              onChange={(e) => setBudgetCap(Number(e.target.value))}
              className="w-full accent-cyan-400 bg-slate-800 rounded-lg cursor-pointer h-1.5"
            />
            <div className="text-[11px] text-slate-500">
              Competition limit: Strictly capped at 3,000 images.
            </div>
          </div>

          {/* Margin Uncertainty Slider */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-mono">
              <span className="text-slate-400">MARGIN THRESHOLD (Δp)</span>
              <span className="text-emerald-400 font-bold">≤ {marginThreshold.toFixed(2)}</span>
            </div>
            <input
              type="range"
              min="0.02"
              max="0.30"
              step="0.01"
              value={marginThreshold}
              onChange={(e) => setMarginThreshold(Number(e.target.value))}
              className="w-full accent-emerald-400 bg-slate-800 rounded-lg cursor-pointer h-1.5"
            />
            <div className="text-[11px] text-slate-500">
              Selects samples where Top-1 and Top-2 logits are nearly indistinguishable.
            </div>
          </div>

          {/* Balance Constraint Toggle */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900/60 border border-slate-800">
            <div className="space-y-0.5">
              <div className="text-xs font-medium text-slate-200">Enforce Class Parity</div>
              <div className="text-[11px] text-slate-500">500 images exact per class</div>
            </div>
            <button
              onClick={() => setBalancePriority(!balancePriority)}
              className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors ${
                balancePriority ? "bg-cyan-500 justify-end" : "bg-slate-700 justify-start"
              }`}
            >
              <div className="w-4 h-4 rounded-full bg-white shadow" />
            </button>
          </div>

          {/* Run Curation Button */}
          <button
            onClick={triggerMiningSimulation}
            disabled={isMining}
            className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-semibold text-sm shadow-lg shadow-cyan-500/20 flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-50"
          >
            {isMining ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin text-white" />
                Mining Ambiguous Embeddings...
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-current text-white" />
                Simulate Active Curation
              </>
            )}
          </button>

          {/* Quick Metrics Summary */}
          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-3">
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-400">Simulated Dataset Size:</span>
              <span className="font-mono font-bold text-white">{minedCount} / 3,000</span>
            </div>
            <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
              <div 
                className="bg-cyan-400 h-full transition-all duration-500" 
                style={{ width: `${(minedCount / 3000) * 100}%` }}
              />
            </div>
            <div className="flex justify-between items-center text-xs pt-1 border-t border-slate-800/60">
              <span className="text-slate-400 flex items-center gap-1">
                <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
                Projected Test Acc:
              </span>
              <span className="font-mono font-bold text-emerald-400 text-sm">{simulatedAcc}%</span>
            </div>
          </div>
        </div>

        {/* Right Column: Live Data Pipeline & Visualizer */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-800/80 space-y-6 lg:col-span-2 flex flex-col justify-between">
          <div className="space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Layers className="w-5 h-5 text-indigo-400" />
                <h2 className="text-lg font-bold text-white">Active Learning Edge Candidates</h2>
              </div>
              <span className="text-xs font-mono px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                Sorted by Margin Uncertainty
              </span>
            </div>

            {/* Candidate Samples Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 font-mono">
                    <th className="pb-3 font-medium">SAMPLE</th>
                    <th className="pb-3 font-medium">CATEGORY</th>
                    <th className="pb-3 font-medium">MARGIN (Δp)</th>
                    <th className="pb-3 font-medium">UNCERTAINTY</th>
                    <th className="pb-3 font-medium text-right">ACTION</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-mono">
                  {MOCK_CANDIDATES.map((sample) => {
                    const isMined = sample.margin <= marginThreshold;
                    return (
                      <tr key={sample.id} className="hover:bg-slate-800/30 transition-colors">
                        <td className="py-3 text-slate-300 flex items-center gap-2">
                          <span className="text-slate-500">#{sample.id}</span>
                          <span className="font-sans font-medium text-white">{sample.filename}</span>
                        </td>
                        <td className="py-3">
                          <span className="capitalize px-2 py-0.5 rounded text-[11px] font-sans bg-slate-800 text-slate-300 border border-slate-700">
                            {sample.category}
                          </span>
                        </td>
                        <td className="py-3">
                          <span className={sample.margin < 0.1 ? "text-amber-400 font-bold" : "text-slate-400"}>
                            {sample.margin.toFixed(2)}
                          </span>
                        </td>
                        <td className="py-3">
                          <div className="flex items-center gap-2">
                            <div className="w-16 bg-slate-800 rounded-full h-1.5 overflow-hidden">
                              <div 
                                className={`h-full ${sample.uncertainty > 0.8 ? "bg-amber-400" : "bg-slate-600"}`} 
                                style={{ width: `${sample.uncertainty * 100}%` }}
                              />
                            </div>
                            <span className="text-slate-400 text-[11px]">{(sample.uncertainty * 100).toFixed(0)}%</span>
                          </div>
                        </td>
                        <td className="py-3 text-right font-sans">
                          {isMined ? (
                            <span className="inline-flex items-center gap-1 text-emerald-400 text-xs font-medium">
                              <CheckCircle className="w-3.5 h-3.5" /> Selected
                            </span>
                          ) : (
                            <span className="text-slate-500 text-xs">Omitted</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Educational Insight Card */}
          <div className="p-4 rounded-xl bg-gradient-to-r from-blue-950/40 via-cyan-950/20 to-slate-900/40 border border-cyan-500/20 flex items-start gap-3 mt-4">
            <Sparkles className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
            <div className="text-xs text-slate-300 space-y-1">
              <span className="font-bold text-white">Why Margin Mining Won the Hackathon:</span>
              <p className="leading-relaxed">
                Standard random sampling wastes the 3,000 image quota on thousands of trivial forest canopies and clear street alleys. By selecting samples where the model was least certain (<span className="text-cyan-300 font-mono">Δp &lt; 0.15</span> between Glacier and Mountain), our ResNet-18 learned the sharpest hyperplanes with zero label noise.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
