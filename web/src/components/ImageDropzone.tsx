"use client";

import { useState, useRef, ChangeEvent, DragEvent } from "react";
import { UploadCloud, Image as ImageIcon, Sparkles, Zap } from "lucide-react";
import { cn } from "../lib/utils";
import { 
  GlacierIcon, MountainIcon, SeaIcon, ForestIcon, 
  BuildingsIcon, StreetIcon, UndefinedAnomalyIcon 
} from "./TerrainIcons";

interface ImageDropzoneProps {
  onImageSelected: (imgElement: HTMLImageElement, previewUrl: string) => void;
  isLoading: boolean;
}

const SAMPLE_PRESETS = [
  { name: "Glacier", file: "/samples/glacier.jpg", Icon: GlacierIcon },
  { name: "Mountain", file: "/samples/mountain.jpg", Icon: MountainIcon },
  { name: "Sea", file: "/samples/sea.jpg", Icon: SeaIcon },
  { name: "Forest", file: "/samples/forest.jpg", Icon: ForestIcon },
  { name: "Buildings", file: "/samples/buildings.jpg", Icon: BuildingsIcon },
  { name: "Street", file: "/samples/street.jpg", Icon: StreetIcon },
  { name: "Undefined", file: "/samples/waterfall_scene.jpg", Icon: UndefinedAnomalyIcon },
];

export default function ImageDropzone({ onImageSelected, isLoading }: ImageDropzoneProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [selectedPreview, setSelectedPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFile = (file: File) => {
    if (!file.type.startsWith("image/")) return;
    const url = URL.createObjectURL(file);
    loadImage(url);
  };

  const loadImage = (src: string) => {
    setSelectedPreview(src);
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      onImageSelected(img, src);
    };
    img.src = src;
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  return (
    <div className="space-y-4">
      {/* Upload Drop Container */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={cn(
          "relative group cursor-pointer overflow-hidden rounded-3xl border-2 border-dashed transition-all duration-300 p-6 sm:p-8 flex flex-col items-center justify-center text-center",
          isDragOver
            ? "border-cyan-400 bg-cyan-500/10 scale-[1.01]"
            : "border-slate-800 hover:border-cyan-500/50 bg-slate-900/40 hover:bg-slate-900/70"
        )}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
        />

        {/* Selected Image Preview with Glow overlay */}
        <div className="relative w-full aspect-[4/3] max-h-[340px] rounded-2xl overflow-hidden bg-black/60 border border-white/10 flex items-center justify-center shadow-2xl group-hover:border-cyan-500/40 transition-colors">
          {selectedPreview ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={selectedPreview}
              alt="Scene preview"
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
          ) : (
            <div className="flex flex-col items-center justify-center gap-3 p-8 text-center">
              <div className="w-16 h-16 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 group-hover:scale-110 transition-transform">
                <UploadCloud className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <span className="text-sm font-semibold text-slate-200 block">No Image Loaded</span>
                <span className="text-xs text-slate-400 font-mono block">
                  Select a preset below or drop any satellite / drone photo
                </span>
              </div>
            </div>
          )}

          {/* Laser Scanner Line when loading */}
          {isLoading && (
            <div className="absolute inset-0 bg-cyan-950/20 backdrop-blur-[2px] flex items-center justify-center">
              <div className="w-full h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent absolute shadow-[0_0_15px_#22d3ee] animate-laser" />
              <div className="px-5 py-2.5 rounded-2xl glass-panel-glow text-cyan-200 text-xs font-mono flex items-center gap-2.5 shadow-2xl">
                <Sparkles className="w-4 h-4 animate-spin text-cyan-400" />
                <span>Running ONNX Neural Inference...</span>
              </div>
            </div>
          )}
        </div>

        {/* Action Prompt */}
        <div className="mt-4 flex flex-col items-center gap-1.5">
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-200">
            <UploadCloud className="w-4 h-4 text-cyan-400" />
            <span>Drop any scene photo or <span className="text-cyan-400 hover:text-cyan-300 underline decoration-cyan-400/30">browse files</span></span>
          </div>
          <p className="text-[11px] text-slate-400 font-mono">
            Directly executes inside your browser GPU via client-side WebAssembly • Zero server latency
          </p>
        </div>
      </div>

      {/* 1-Click Preset Samples */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between px-1">
          <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            <span>Instant Benchmark Presets</span>
          </span>
          <span className="text-[10px] font-mono text-cyan-400/80">Click any card to test</span>
        </div>
        <div className="grid grid-cols-3 sm:grid-cols-7 gap-2">
          {SAMPLE_PRESETS.map((p) => {
            const isSelected = selectedPreview === p.file;
            const IconComp = p.Icon;
            return (
              <button
                key={p.name}
                type="button"
                onClick={() => loadImage(p.file)}
                className={cn(
                  "flex flex-col items-center justify-center p-3 rounded-2xl glass-card text-center group cursor-pointer transition-all",
                  isSelected
                    ? "border-cyan-500 bg-cyan-500/15 shadow-[0_0_20px_rgba(6,182,212,0.25)] scale-[1.02]"
                    : "hover:border-white/20 hover:bg-slate-800/60"
                )}
              >
                <div className="w-8 h-8 flex items-center justify-center group-hover:scale-115 transition-transform duration-300">
                  <IconComp className="w-7 h-7" />
                </div>
                <span className={cn("text-xs font-semibold mt-1.5", isSelected ? "text-cyan-300" : "text-slate-300")}>
                  {p.name}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
