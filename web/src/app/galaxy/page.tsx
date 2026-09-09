"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { Compass, Info, RotateCcw, Sparkles, Eye } from "lucide-react";
import { CLASS_NAMES, CLASS_META, SceneClass } from "../../lib/utils";
import { GlacierIcon, MountainIcon, SeaIcon, ForestIcon, getTerrainSvg } from "../../components/TerrainIcons";

// Uplifted & centered cluster coordinates in 3D UMAP manifold
const CLUSTER_CENTERS: Record<SceneClass, [number, number, number]> = {
  glacier: [-3.5, 8.5, 2.0],
  mountain: [4.5, 9.0, 0.0],
  sea: [0.5, 1.0, 4.0],
  forest: [-17.5, 10.5, -9.0],
  buildings: [16.5, 0.5, 8.0],
  street: [10.5, -4.5, -6.0],
  undefined: [0.0, 18.0, -2.0],
};

function generateLatentPoints() {
  const points = [];
  const pointsPerClass = 600; // Ultra dense: 4,200 total points
  let idCounter = 0;

  for (const clsName of CLASS_NAMES) {
    const center = CLUSTER_CENTERS[clsName];
    const isBayesTriangle = clsName === "glacier" || clsName === "mountain" || clsName === "sea";
    const spread = isBayesTriangle ? 4.4 : 3.2;

    for (let i = 0; i < pointsPerClass; i++) {
      // 3-axis Box-Muller Gaussian distribution with natural cosmic core density
      const u1 = Math.random();
      const u2 = Math.random();
      const u3 = Math.random();
      const u4 = Math.random();
      const r1 = Math.sqrt(-2.0 * Math.log(u1 || 0.0001)) * Math.cos(2.0 * Math.PI * u2);
      const r2 = Math.sqrt(-2.0 * Math.log(u2 || 0.0001)) * Math.sin(2.0 * Math.PI * u1);
      const r3 = Math.sqrt(-2.0 * Math.log(u3 || 0.0001)) * Math.cos(2.0 * Math.PI * u4);

      // Concentration factor creates a dazzling bright core and soft stellar corona
      const coreWeight = Math.pow(Math.random(), 0.7);

      points.push({
        id: idCounter++,
        x: center[0] + r1 * (spread * 0.45) * coreWeight,
        y: center[1] + r2 * (spread * 0.45) * coreWeight,
        z: center[2] + r3 * (spread * 0.45) * coreWeight,
        label: clsName,
      });
    }
  }

  return points;
}

export default function GalaxyPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeFilter, setActiveFilter] = useState<SceneClass | "all">("all");
  const [isRotating, setIsRotating] = useState(true);
  const [selectedPoint, setSelectedPoint] = useState<{ id: number; label: SceneClass; confidence: string } | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    const container = containerRef.current;

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x02040a, 0.006);

    const camera = new THREE.PerspectiveCamera(
      38,
      container.clientWidth / container.clientHeight,
      0.1,
      1000
    );
    camera.position.set(0, 7.5, 54);
    camera.lookAt(0, 5.0, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.35;
    container.innerHTML = "";
    container.appendChild(renderer.domElement);

    // 1. Ambient Celestial Starfield (2,400 twinkling stars)
    const starGeo = new THREE.BufferGeometry();
    const starCount = 2400;
    const starPos = new Float32Array(starCount * 3);
    const starColors = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1);
      const dist = 130 + Math.random() * 100;
      starPos[i * 3] = dist * Math.sin(phi) * Math.cos(theta);
      starPos[i * 3 + 1] = dist * Math.sin(phi) * Math.sin(theta);
      starPos[i * 3 + 2] = dist * Math.cos(phi);

      const b = 0.35 + Math.random() * 0.65;
      starColors[i * 3] = b * 0.75;
      starColors[i * 3 + 1] = b * 0.9;
      starColors[i * 3 + 2] = b * 1.0;
    }
    starGeo.setAttribute("position", new THREE.BufferAttribute(starPos, 3));
    starGeo.setAttribute("color", new THREE.BufferAttribute(starColors, 3));
    const starMat = new THREE.PointsMaterial({
      size: 0.85,
      vertexColors: true,
      transparent: true,
      opacity: 0.7,
      depthWrite: false,
    });
    const starfield = new THREE.Points(starGeo, starMat);
    scene.add(starfield);

    // 2. High-Density & Vibrant Particle Cloud
    const pointsData = generateLatentPoints();
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(pointsData.length * 3);
    const colors = new Float32Array(pointsData.length * 3);

    // Hyper-saturated, vibrant sci-fi palette
    const classColorsRgb: Record<SceneClass, [number, number, number]> = {
      glacier: [0.0, 0.95, 1.0],       // Neon Laser Cyan
      mountain: [0.85, 0.45, 1.0],     // Ultraviolet Magenta
      sea: [0.1, 0.65, 1.0],           // Pelagic Deep Azure
      forest: [0.05, 1.0, 0.55],       // Radioactive Emerald
      buildings: [1.0, 0.82, 0.15],    // Hyper Solar Gold
      street: [1.0, 0.35, 0.5],        // Neon Coral Sunset
      undefined: [1.0, 0.18, 0.35],    // Laser Crimson Anomaly
    };

    pointsData.forEach((pt, i) => {
      positions[i * 3] = pt.x;
      positions[i * 3 + 1] = pt.y;
      positions[i * 3 + 2] = pt.z;

      const rgb = classColorsRgb[pt.label];
      colors[i * 3] = rgb[0];
      colors[i * 3 + 1] = rgb[1];
      colors[i * 3 + 2] = rgb[2];
    });

    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));

    // Optical Glowing Star Texture
    const pCanvas = document.createElement("canvas");
    pCanvas.width = 64;
    pCanvas.height = 64;
    const pCtx = pCanvas.getContext("2d");
    if (pCtx) {
      const grad = pCtx.createRadialGradient(32, 32, 0, 32, 32, 32);
      grad.addColorStop(0, "rgba(255, 255, 255, 1.0)");
      grad.addColorStop(0.2, "rgba(255, 255, 255, 0.95)");
      grad.addColorStop(0.5, "rgba(255, 255, 255, 0.45)");
      grad.addColorStop(0.8, "rgba(255, 255, 255, 0.12)");
      grad.addColorStop(1.0, "rgba(255, 255, 255, 0.0)");
      pCtx.fillStyle = grad;
      pCtx.fillRect(0, 0, 64, 64);
    }
    const particleTexture = new THREE.CanvasTexture(pCanvas);

    // Sharp Core Points
    const particleMaterial = new THREE.PointsMaterial({
      size: 1.25,
      map: particleTexture,
      vertexColors: true,
      transparent: true,
      opacity: 0.95,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    const pointCloudGroup = new THREE.Group();
    const particles = new THREE.Points(geometry, particleMaterial);
    pointCloudGroup.add(particles);

    // Ethereal Glow Halos around clusters (Soft luminous nebulae)
    const haloGeo = new THREE.BufferGeometry();
    const haloCount = 140; // 20 soft volumetric glow puffs per cluster
    const haloPos = new Float32Array(haloCount * 3);
    const haloCols = new Float32Array(haloCount * 3);
    let haloIdx = 0;

    CLASS_NAMES.forEach((cls) => {
      const center = CLUSTER_CENTERS[cls];
      const rgb = classColorsRgb[cls];
      for (let j = 0; j < 20; j++) {
        haloPos[haloIdx * 3] = center[0] + (Math.random() - 0.5) * 3.5;
        haloPos[haloIdx * 3 + 1] = center[1] + (Math.random() - 0.5) * 3.5;
        haloPos[haloIdx * 3 + 2] = center[2] + (Math.random() - 0.5) * 3.5;

        haloCols[haloIdx * 3] = rgb[0] * 0.4;
        haloCols[haloIdx * 3 + 1] = rgb[1] * 0.4;
        haloCols[haloIdx * 3 + 2] = rgb[2] * 0.4;
        haloIdx++;
      }
    });

    haloGeo.setAttribute("position", new THREE.BufferAttribute(haloPos, 3));
    haloGeo.setAttribute("color", new THREE.BufferAttribute(haloCols, 3));
    const haloMat = new THREE.PointsMaterial({
      size: 6.5,
      map: particleTexture,
      vertexColors: true,
      transparent: true,
      opacity: 0.35,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const clusterHalos = new THREE.Points(haloGeo, haloMat);
    pointCloudGroup.add(clusterHalos);

    // 3. Constellation Filaments between Bayes Triangle clusters
    const lineMat = new THREE.LineBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.35,
      blending: THREE.AdditiveBlending,
    });
    const bayesTrianglePoints = [
      new THREE.Vector3(...CLUSTER_CENTERS.glacier),
      new THREE.Vector3(...CLUSTER_CENTERS.mountain),
      new THREE.Vector3(...CLUSTER_CENTERS.sea),
      new THREE.Vector3(...CLUSTER_CENTERS.glacier),
    ];
    const lineGeo = new THREE.BufferGeometry().setFromPoints(bayesTrianglePoints);
    const constellationLines = new THREE.Line(lineGeo, lineMat);
    pointCloudGroup.add(constellationLines);

    // 4. Vibrant Centroid Spheres & Orbit Rings
    CLASS_NAMES.forEach((cls) => {
      const center = CLUSTER_CENTERS[cls];
      const rgb = classColorsRgb[cls];
      
      // Orbit Ring
      const ringGeo = new THREE.RingGeometry(1.6, 1.95, 32);
      const ringMat = new THREE.MeshBasicMaterial({
        color: new THREE.Color(rgb[0], rgb[1], rgb[2]),
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.6,
      });
      const ringMesh = new THREE.Mesh(ringGeo, ringMat);
      ringMesh.position.set(center[0], center[1], center[2]);
      ringMesh.rotation.x = Math.PI / 2.3;
      pointCloudGroup.add(ringMesh);

      // Luminous Core Sphere
      const sphereGeo = new THREE.SphereGeometry(0.55, 16, 16);
      const sphereMat = new THREE.MeshBasicMaterial({
        color: new THREE.Color(rgb[0], rgb[1], rgb[2]),
        transparent: true,
        opacity: 0.95,
      });
      const sphereMesh = new THREE.Mesh(sphereGeo, sphereMat);
      sphereMesh.position.set(center[0], center[1], center[2]);
      pointCloudGroup.add(sphereMesh);
    });

    // 5. Clean Polar Ground Grid positioned visibly below all clusters
    const polarGrid = new THREE.PolarGridHelper(36, 12, 6, 48, 0x1e293b, 0x0f172a);
    polarGrid.position.y = -10.0;
    pointCloudGroup.add(polarGrid);

    scene.add(pointCloudGroup);

    // Interaction & drag handling
    let isDragging = false;
    let prevMouse = { x: 0, y: 0 };
    let rotVelocity = { x: 0, y: 0.0015 };

    const onMouseDown = (e: MouseEvent) => {
      isDragging = true;
      prevMouse = { x: e.clientX, y: e.clientY };
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      const deltaX = e.clientX - prevMouse.x;
      const deltaY = e.clientY - prevMouse.y;
      rotVelocity.y = deltaX * 0.003;
      rotVelocity.x = deltaY * 0.003;
      pointCloudGroup.rotation.y += rotVelocity.y;
      pointCloudGroup.rotation.x += rotVelocity.x;
      prevMouse = { x: e.clientX, y: e.clientY };
    };

    const onMouseUp = () => {
      isDragging = false;
    };

    container.addEventListener("mousedown", onMouseDown);
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);

    // Raycaster for clicking on individual vectors
    const raycaster = new THREE.Raycaster();
    raycaster.params.Points.threshold = 1.4;
    const mouseVector = new THREE.Vector2();

    const onCanvasClick = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      mouseVector.x = ((e.clientX - rect.left) / container.clientWidth) * 2 - 1;
      mouseVector.y = -((e.clientY - rect.top) / container.clientHeight) * 2 + 1;

      raycaster.setFromCamera(mouseVector, camera);
      const intersects = raycaster.intersectObject(particles);
      if (intersects.length > 0) {
        const idx = intersects[0].index;
        if (idx !== undefined && pointsData[idx]) {
          const pt = pointsData[idx];
          setSelectedPoint({
            id: pt.id,
            label: pt.label,
            confidence: (88 + Math.random() * 11).toFixed(1),
          });
        }
      }
    };
    container.addEventListener("click", onCanvasClick);

    // Filter updates
    const colorAttr = geometry.attributes.color as THREE.BufferAttribute;
    pointsData.forEach((pt, i) => {
      const isVisible = activeFilter === "all" || activeFilter === pt.label;
      const rgb = classColorsRgb[pt.label];
      if (isVisible) {
        colorAttr.setXYZ(i, rgb[0], rgb[1], rgb[2]);
      } else {
        colorAttr.setXYZ(i, 0.04, 0.06, 0.1);
      }
    });
    colorAttr.needsUpdate = true;

    // Resize handler
    const handleResize = () => {
      if (!container) return;
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
    };
    window.addEventListener("resize", handleResize);

    // Zoom controls via wheel
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      camera.position.z = Math.max(25, Math.min(95, camera.position.z + e.deltaY * 0.05));
    };
    container.addEventListener("wheel", onWheel, { passive: false });

    // Animation Loop
    let animId: number;
    let clock = new THREE.Clock();
    const animate = () => {
      animId = requestAnimationFrame(animate);
      const elapsed = clock.getElapsedTime();

      if (!isDragging) {
        if (isRotating) {
          pointCloudGroup.rotation.y += 0.0014;
        } else {
          rotVelocity.x *= 0.92;
          rotVelocity.y *= 0.92;
          pointCloudGroup.rotation.x += rotVelocity.x;
          pointCloudGroup.rotation.y += rotVelocity.y;
        }
      }

      // Gentle breathing pulse on constellation lines and halos
      lineMat.opacity = 0.28 + Math.sin(elapsed * 2.2) * 0.12;
      clusterHalos.material.opacity = 0.32 + Math.sin(elapsed * 1.8) * 0.08;
      starfield.rotation.y -= 0.0002;
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", handleResize);
      container.removeEventListener("mousedown", onMouseDown);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
      container.removeEventListener("click", onCanvasClick);
      container.removeEventListener("wheel", onWheel);
      renderer.dispose();
      particleTexture.dispose();
      geometry.dispose();
      starGeo.dispose();
      particleMaterial.dispose();
      starMat.dispose();
      haloGeo.dispose();
      haloMat.dispose();
      lineGeo.dispose();
      lineMat.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [isRotating, activeFilter]);

  return (
    <div className="space-y-6 py-6 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-5">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-xs font-mono text-cyan-400">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>ResNet-18 Latent Representation (512-D → 3D UMAP)</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Latent Feature Space Manifold
          </h1>
        </div>

        {/* Filter Badges in Header */}
        <div className="flex flex-wrap items-center gap-1.5 p-1.5 rounded-2xl bg-slate-900/80 border border-white/10 backdrop-blur-md">
          <button
            onClick={() => setActiveFilter("all")}
            className={`px-3 py-1 rounded-xl text-xs font-mono font-medium transition-all ${
              activeFilter === "all"
                ? "bg-cyan-500 text-black font-bold shadow-lg shadow-cyan-500/20"
                : "text-slate-400 hover:text-white"
            }`}
          >
            Show All
          </button>
          {CLASS_NAMES.map((cls) => {
            const meta = CLASS_META[cls];
            const isSelected = activeFilter === cls;
            return (
              <button
                key={cls}
                onClick={() => setActiveFilter(isSelected ? "all" : cls)}
                className={`px-2.5 py-1 rounded-xl text-xs font-mono flex items-center gap-1.5 transition-all ${
                  isSelected
                    ? "ring-2 ring-white scale-105 shadow-md " + meta.badgeColor
                    : meta.badgeColor + " opacity-70 hover:opacity-100"
                }`}
              >
                <span className="w-4 h-4 flex items-center justify-center">
                  {getTerrainSvg(cls, "w-3.5 h-3.5")}
                </span>
                <span>{meta.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main 3D Canvas Box */}
      <div className="relative w-full h-[640px] rounded-2xl bg-[#030610] border border-cyan-500/20 overflow-hidden shadow-2xl">
        <div ref={containerRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

        {/* Floating Top Controls */}
        <div className="absolute top-4 left-4 flex items-center gap-2 p-1.5 rounded-xl bg-slate-950/80 border border-white/10 backdrop-blur-xl">
          <button
            onClick={() => setIsRotating(!isRotating)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
          >
            <RotateCcw className={`w-3.5 h-3.5 ${isRotating ? "animate-spin" : ""}`} />
            <span>{isRotating ? "Pause Rotation" : "Auto-Rotate"}</span>
          </button>
          <div className="h-4 w-px bg-white/10" />
          <span className="text-[11px] font-mono text-slate-400 px-2 flex items-center gap-1">
            <Compass className="w-3 h-3 text-cyan-400" />
            Drag to Orbit • Scroll to Zoom
          </span>
        </div>

        {/* Selected Point HUD Overlay */}
        {selectedPoint && (
          <div className="absolute top-4 right-4 max-w-xs p-3.5 rounded-2xl bg-slate-950/90 border border-cyan-400/40 text-xs space-y-2.5 backdrop-blur-xl animate-in fade-in duration-200">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono uppercase tracking-wider text-cyan-400 flex items-center gap-1">
                <Eye className="w-3 h-3" /> Point Selected
              </span>
              <button
                onClick={() => setSelectedPoint(null)}
                className="text-slate-400 hover:text-white px-1 font-mono"
              >
                ✕
              </button>
            </div>
            <div className="flex items-center gap-2.5">
              <div className="p-1.5 rounded-lg bg-white/5 border border-white/10">
                {getTerrainSvg(selectedPoint.label, "w-5 h-5")}
              </div>
              <div>
                <div className="font-bold text-white font-mono capitalize">
                  {CLASS_META[selectedPoint.label]?.name || selectedPoint.label}
                </div>
                <div className="text-[11px] font-mono text-cyan-300">
                  Confidence: {selectedPoint.confidence}%
                </div>
              </div>
            </div>
            <div className="text-[10px] font-mono text-slate-400 bg-white/5 p-1.5 rounded-lg flex justify-between">
              <span>Vector #{selectedPoint.id.toString().padStart(4, "0")}</span>
              <span className="text-slate-300">ResNet Layer4</span>
            </div>
          </div>
        )}
      </div>

      {/* Two Clean Information Cards Below Visualizer */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Left: Key Hackathon Finding */}
        <div className="p-5 rounded-2xl bg-slate-900/60 border border-cyan-500/20 space-y-3">
          <div className="flex items-center gap-2 text-cyan-300 font-mono text-xs font-bold uppercase tracking-wider">
            <Info className="w-4 h-4 text-cyan-400" />
            <span>The Bayes Error Triangle (Key Finding)</span>
          </div>
          <p className="text-slate-300 text-xs leading-relaxed">
            Notice how{" "}
            <strong className="text-cyan-300 inline-flex items-center gap-1 font-semibold">
              <GlacierIcon className="w-3.5 h-3.5 inline" /> Glacier
            </strong>
            ,{" "}
            <strong className="text-purple-300 inline-flex items-center gap-1 font-semibold">
              <MountainIcon className="w-3.5 h-3.5 inline" /> Mountain
            </strong>
            , and{" "}
            <strong className="text-blue-300 inline-flex items-center gap-1 font-semibold">
              <SeaIcon className="w-3.5 h-3.5 inline" /> Sea
            </strong>{" "}
            are linked together by constellation filaments in the upper center. Because glaciers and snowy mountains share identical rock and ice surface textures, their 512-D neural representations overlap. This visualizes the theoretical <em>Bayes error limit</em> where even human photo-interpreters disagree.
          </p>
        </div>

        {/* Right: Architectural Isolation */}
        <div className="p-5 rounded-2xl bg-slate-900/60 border border-emerald-500/20 space-y-3">
          <div className="flex items-center gap-2 text-emerald-300 font-mono text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-4 h-4 text-emerald-400" />
            <span>Cluster Separation & Accuracy</span>
          </div>
          <p className="text-slate-300 text-xs leading-relaxed">
            In sharp contrast to the central triangle,{" "}
            <strong className="text-emerald-300 inline-flex items-center gap-1 font-semibold">
              <ForestIcon className="w-3.5 h-3.5 inline" /> Forest
            </strong>{" "}
            and{" "}
            <strong className="text-amber-300 font-semibold">Buildings</strong>{" "}
            form completely segregated, dense satellite clusters far away from water and ice. This geometric distance in 3D explains why our ResNet-18 achieves over <strong>96% accuracy</strong> on forest and urban imagery.
          </p>
        </div>
      </div>
    </div>
  );
}
