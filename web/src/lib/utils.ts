import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const CLASS_NAMES = [
  "buildings",
  "forest",
  "glacier",
  "mountain",
  "sea",
  "street",
] as const;

export type StandardSceneClass = (typeof CLASS_NAMES)[number];
export type SceneClass = StandardSceneClass | "undefined";

export const CLASS_META: Record<
  SceneClass,
  {
    name: string;
    subName: string;
    callsign: string;
    badgeColor: string;
    glowColor: string;
    icon: string;
    description: string;
    landingSuitability: {
      score: number; // 0 to 100
      status: "OPTIMAL" | "CAUTION" | "HAZARDOUS" | "CRITICAL_ABORT";
      color: string;
    };
    tacticalAssessment: string;
    hazards: string[];
    environmentalSensor: {
      terrainFriction: string;
      canopyDensity: string;
      opticalReflectance: string;
    };
  }
> = {
  buildings: {
    name: "Buildings",
    subName: "Urban Sector",
    callsign: "URBAN-BUILDINGS",
    badgeColor: "bg-amber-500/15 text-amber-300 border-amber-500/40",
    glowColor: "rgba(245, 158, 11, 0.3)",
    icon: "🏢",
    description: "High-density architectural cluster, vertical infrastructure, and multi-story structural corridors.",
    landingSuitability: {
      score: 35,
      status: "CAUTION",
      color: "text-amber-400",
    },
    tacticalAssessment: "Restricted LZ. High civilian presence risk. Severe GNSS multipath and signal occlusion from concrete corridors.",
    hazards: ["Signal Reflection", "Rooftop Turbulence", "Civilian Density"],
    environmentalSensor: {
      terrainFriction: "High (Asphalt/Concrete)",
      canopyDensity: "0% (Non-vegetated)",
      opticalReflectance: "Moderate (0.32 albedo)",
    },
  },
  forest: {
    name: "Forest",
    subName: "Dense Arbor",
    callsign: "VERDANT-FOREST",
    badgeColor: "bg-emerald-500/15 text-emerald-300 border-emerald-500/40",
    glowColor: "rgba(16, 185, 129, 0.3)",
    icon: "🌲",
    description: "Unbroken arboreal canopy, dense temperate forestry, and non-traversable vegetative ground cover.",
    landingSuitability: {
      score: 12,
      status: "HAZARDOUS",
      color: "text-rose-400",
    },
    tacticalAssessment: "Zero line-of-sight to ground floor. Propeller entangling hazard. Carbon sequestration zone / Wildfire vulnerability.",
    hazards: ["Canopy Entanglement", "Blind Ground LZ", "LiDAR Attenuation"],
    environmentalSensor: {
      terrainFriction: "Variable (Humus/Biomass)",
      canopyDensity: "94% (Dense)",
      opticalReflectance: "Low (0.14 albedo)",
    },
  },
  glacier: {
    name: "Glacier",
    subName: "Perennial Ice",
    callsign: "CRYO-GLACIER",
    badgeColor: "bg-cyan-500/15 text-cyan-300 border-cyan-500/40",
    glowColor: "rgba(6, 182, 212, 0.3)",
    icon: "🧊",
    description: "High-latitude glacial ice sheet, crevassed arctic terrain, and frozen sérac formations.",
    landingSuitability: {
      score: 5,
      status: "CRITICAL_ABORT",
      color: "text-red-500",
    },
    tacticalAssessment: "Severe sub-zero airframe icing. Hidden crevasses below snow bridges. Extreme optical albedo glare blinding optical sensors.",
    hazards: ["Sensor Whiteout", "Ice Crevasses", "Rapid Calving"],
    environmentalSensor: {
      terrainFriction: "Zero (Micro-ice)",
      canopyDensity: "0% (Barren)",
      opticalReflectance: "Extreme (0.88 albedo)",
    },
  },
  mountain: {
    name: "Mountain",
    subName: "Alpine Ridge",
    callsign: "ALPINE-MOUNTAIN",
    badgeColor: "bg-purple-500/15 text-purple-300 border-purple-500/40",
    glowColor: "rgba(168, 85, 247, 0.3)",
    icon: "⛰️",
    description: "Rugged tectonic rock faces, scree slopes, acute ridge inclines, and high-altitude scree.",
    landingSuitability: {
      score: 22,
      status: "HAZARDOUS",
      color: "text-rose-400",
    },
    tacticalAssessment: "Violent downdrafts and katabatic winds along leeward slopes. Inclines exceed 45°, high rollover hazard for landing gear.",
    hazards: ["Katabatic Downdrafts", "Steep Gradient (>45°)", "Rockfall"],
    environmentalSensor: {
      terrainFriction: "High (Scree/Granite)",
      canopyDensity: "4% (Sparse alpine)",
      opticalReflectance: "Moderate (0.28 albedo)",
    },
  },
  sea: {
    name: "Sea",
    subName: "Maritime Basin",
    callsign: "PELAGIC-SEA",
    badgeColor: "bg-blue-500/15 text-blue-300 border-blue-500/40",
    glowColor: "rgba(59, 130, 246, 0.3)",
    icon: "🌊",
    description: "Open aquatic expanses, littoral wave action, open coastal tides, and marine surfaces.",
    landingSuitability: {
      score: 0,
      status: "CRITICAL_ABORT",
      color: "text-red-500",
    },
    tacticalAssessment: "Airframe non-amphibious. Unrecoverable immersion hazard. Surface wave motion corrupts downward sonar altimetry.",
    hazards: ["Hydro-Submersion", "Salt Corrosive Spray", "Acoustic Glare"],
    environmentalSensor: {
      terrainFriction: "Fluid Medium",
      canopyDensity: "0%",
      opticalReflectance: "Low (0.06 albedo)",
    },
  },
  street: {
    name: "Street",
    subName: "Arterial Transit",
    callsign: "CORRIDOR-STREET",
    badgeColor: "bg-emerald-500/15 text-emerald-300 border-emerald-500/40",
    glowColor: "rgba(16, 185, 129, 0.3)",
    icon: "🛣️",
    description: "Level asphalt pavement, linear transportation arteries, and open vehicular thoroughfares.",
    landingSuitability: {
      score: 88,
      status: "OPTIMAL",
      color: "text-emerald-400",
    },
    tacticalAssessment: "Flat, high-bearing load surface. Clear unobstructed descent vector if vehicular traffic is clear. Optimal emergency LZ.",
    hazards: ["Active Vehicle Traffic", "Powerlines", "Debris"],
    environmentalSensor: {
      terrainFriction: "Optimal Grip",
      canopyDensity: "0%",
      opticalReflectance: "Low (0.12 albedo)",
    },
  },
  undefined: {
    name: "Undefined",
    subName: "Ambiguous / Out-of-Distribution",
    callsign: "OOD-ANOMALY",
    badgeColor: "bg-rose-500/15 text-rose-300 border-rose-500/40",
    glowColor: "rgba(244, 63, 94, 0.3)",
    icon: "❓",
    description: "Unclassified terrain feature, waterfalls, abstract imagery, or anomalous out-of-distribution scene not belonging to the 6 trained classes.",
    landingSuitability: {
      score: 15,
      status: "CAUTION",
      color: "text-rose-400",
    },
    tacticalAssessment: "High epistemic uncertainty detected. The neural ensemble cannot confidently assign this topography to any trained class. Emergency landing aborted or requires manual UAV operator override.",
    hazards: ["Uncertain Topography", "Low Model Margin", "Uncalibrated Surface"],
    environmentalSensor: {
      terrainFriction: "Uncalibrated",
      canopyDensity: "Indeterminate",
      opticalReflectance: "Non-standard",
    },
  },
};


export const SCENE_CLASSES = CLASS_NAMES.map((name) => ({
  name,
  displayName: CLASS_META[name].name,
  badgeColor: CLASS_META[name].badgeColor,
  glowColor: CLASS_META[name].glowColor,
  icon: CLASS_META[name].icon,
  description: CLASS_META[name].description,
}));

