"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Sparkles, Cpu, Layers, ShieldCheck, ArrowRight } from "lucide-react";
import ImageDropzone from "../components/ImageDropzone";
import PredictionCard from "../components/PredictionCard";
import TtaVisualizer from "../components/TtaVisualizer";
import { runInference, PredictionResult } from "../lib/onnxInference";

export default function Home() {
  const [result, setResult] = useState<PredictionResult | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [useTTA, setUseTTA] = useState<boolean>(true);

  const [activeImageSrc, setActiveImageSrc] = useState<string>("");

  const runPrediction = async (src: string, tta: boolean) => {
    setIsLoading(true);
    try {
      const pred = await runInference(src, tta);
      setResult(pred);
    } catch (err) {
      console.error("[Inference error]:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // Warm up inference session in background without setting any initial image result
  useEffect(() => {
    runInference("/samples/forest.jpg", false).catch(console.error);
  }, []);

  const handleImageSelected = async (imgElement: HTMLImageElement, previewUrl: string) => {
    setActiveImageSrc(previewUrl);
    runPrediction(previewUrl, useTTA);
  };

  const handleToggleTTA = () => {
    const nextTTA = !useTTA;
    setUseTTA(nextTTA);
    if (activeImageSrc) {
      runPrediction(activeImageSrc, nextTTA);
    }
  };


  return (
    <div className="space-y-10 py-6">
      {/* Hero Section */}
      <section className="text-center space-y-4 max-w-4xl mx-auto pt-4">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-xs font-mono text-cyan-300 shadow-sm animate-pulse">
          <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
          <span>Edge UAV Perception & Autonomous Terrain Reconnaissance Engine</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-white leading-tight">
          Tactical Edge Intelligence &{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-teal-300 to-emerald-400">
            Hazard Terrain Telemetry
          </span>
        </h1>

        <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-2xl mx-auto">
          An autonomous on-device vision system for search-and-rescue UAVs and satellite environmental monitoring. 
          Evaluates surface friction, canopy density, and emergency landing safety index at <strong>zero latency with 100% offline edge privacy</strong>.
        </p>

        {/* Feature Pills */}
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2 text-xs font-mono text-slate-300">
          <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900/90 border border-white/10">
            <Cpu className="w-3.5 h-3.5 text-cyan-400" />
            ResNet-18 (Random Weights Baseline)
          </span>
          <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900/90 border border-white/10">
            <Layers className="w-3.5 h-3.5 text-emerald-400" />
            3LC Capped Budget: 2,960 Samples
          </span>
          <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900/90 border border-white/10">
            <ShieldCheck className="w-3.5 h-3.5 text-purple-400" />
            Rank 8 Official Kaggle Private Leaderboard
          </span>
        </div>
      </section>


      {/* Main Interactive Playground Grid */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Image Dropzone & Presets */}
        <div className="lg:col-span-6 space-y-4">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-mono text-slate-400 uppercase tracking-wider">
              1. Input Scene Image
            </span>

            {/* TTA Toggle */}
            <button
              type="button"
              onClick={handleToggleTTA}
              className="flex items-center gap-2 cursor-pointer text-xs font-mono text-slate-300 hover:text-cyan-300 p-1 rounded-lg transition-colors"
            >
              <div className={`w-8 h-4 rounded-full p-0.5 transition-colors ${useTTA ? "bg-cyan-500" : "bg-slate-700"}`}>
                <div className={`w-3 h-3 rounded-full bg-white transition-transform ${useTTA ? "translate-x-4" : "translate-x-0"}`} />
              </div>
              <span>Multi-View TTA {useTTA ? "(Active)" : "(Off)"}</span>
            </button>
          </div>


          <ImageDropzone onImageSelected={handleImageSelected} isLoading={isLoading} />
        </div>

        {/* Right Column: Prediction Results & Confidence */}
        <div className="lg:col-span-6 space-y-4">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-mono text-slate-400 uppercase tracking-wider">
              2. Neural Diagnostics
            </span>
          </div>

          <PredictionCard result={result} isLoading={isLoading} />
        </div>
      </section>

      {/* TTA Consensus Decomposition Panel */}
      {useTTA && result && <TtaVisualizer crops={result.ttaCrops} />}

      {/* Quick Access Link to 3D Galaxy */}
      <section className="p-6 sm:p-8 rounded-3xl glass-panel border border-white/10 flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="space-y-1.5">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <span>Explore the 3D UMAP Latent Galaxy</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 font-mono">
              Three.js
            </span>
          </h3>
          <p className="text-xs text-slate-400 max-w-xl">
            See the 1,200 scene validation manifold in 3D feature space and inspect the entangled Bayes Error Triangle between Glaciers, Mountains, and Sea.
          </p>
        </div>

        <Link
          href="/galaxy"
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-emerald-500 hover:opacity-90 text-black font-semibold text-xs transition-all shadow-lg shadow-cyan-500/20 whitespace-nowrap group"
        >
          <span>Launch 3D Explorer</span>
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </Link>
      </section>
    </div>
  );
}
