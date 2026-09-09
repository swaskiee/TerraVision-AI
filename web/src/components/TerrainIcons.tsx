import React from "react";

interface IconProps extends React.SVGProps<SVGSVGElement> {
  className?: string;
  size?: number;
}

export const BuildingsIcon = ({ className = "w-6 h-6", size, ...props }: IconProps) => (
  <svg
    viewBox="0 0 48 48"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    width={size}
    height={size}
    {...props}
  >
    <defs>
      <linearGradient id="bldg-grad-1" x1="6" y1="16" x2="22" y2="44" gradientUnits="userSpaceOnUse">
        <stop stopColor="#38bdf8" />
        <stop offset="1" stopColor="#0369a1" />
      </linearGradient>
      <linearGradient id="bldg-grad-2" x1="18" y1="6" x2="42" y2="44" gradientUnits="userSpaceOnUse">
        <stop stopColor="#f59e0b" />
        <stop offset="1" stopColor="#b45309" />
      </linearGradient>
      <linearGradient id="bldg-window" x1="0" y1="0" x2="1" y2="1">
        <stop stopColor="#fef08a" />
        <stop offset="1" stopColor="#fbbf24" />
      </linearGradient>
    </defs>
    {/* Left Building */}
    <rect x="6" y="16" width="16" height="28" rx="2" fill="url(#bldg-grad-1)" stroke="#0284c7" strokeWidth="1.5" />
    <rect x="10" y="20" width="3" height="4" rx="0.5" fill="#e0f2fe" opacity="0.9" />
    <rect x="15" y="20" width="3" height="4" rx="0.5" fill="#e0f2fe" opacity="0.9" />
    <rect x="10" y="27" width="3" height="4" rx="0.5" fill="#e0f2fe" opacity="0.9" />
    <rect x="15" y="27" width="3" height="4" rx="0.5" fill="#e0f2fe" opacity="0.9" />
    <rect x="10" y="34" width="3" height="4" rx="0.5" fill="#e0f2fe" opacity="0.9" />
    <rect x="15" y="34" width="3" height="4" rx="0.5" fill="#e0f2fe" opacity="0.9" />
    {/* Right Tower */}
    <rect x="22" y="8" width="20" height="36" rx="2.5" fill="url(#bldg-grad-2)" stroke="#d97706" strokeWidth="1.5" />
    <rect x="26" y="13" width="4" height="4" rx="0.5" fill="url(#bldg-window)" />
    <rect x="34" y="13" width="4" height="4" rx="0.5" fill="url(#bldg-window)" />
    <rect x="26" y="20" width="4" height="4" rx="0.5" fill="url(#bldg-window)" />
    <rect x="34" y="20" width="4" height="4" rx="0.5" fill="url(#bldg-window)" />
    <rect x="26" y="27" width="4" height="4" rx="0.5" fill="url(#bldg-window)" />
    <rect x="34" y="27" width="4" height="4" rx="0.5" fill="url(#bldg-window)" />
    <rect x="29" y="36" width="6" height="8" rx="1" fill="#78350f" />
    {/* Antenna */}
    <line x1="32" y1="3" x2="32" y2="8" stroke="#fcd34d" strokeWidth="2" strokeLinecap="round" />
    <circle cx="32" cy="2.5" r="1.5" fill="#ef4444" />
  </svg>
);

export const ForestIcon = ({ className = "w-6 h-6", size, ...props }: IconProps) => (
  <svg
    viewBox="0 0 48 48"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    width={size}
    height={size}
    {...props}
  >
    <defs>
      <linearGradient id="tree-grad-main" x1="24" y1="4" x2="24" y2="38" gradientUnits="userSpaceOnUse">
        <stop stopColor="#34d399" />
        <stop offset="0.5" stopColor="#10b981" />
        <stop offset="1" stopColor="#047857" />
      </linearGradient>
      <linearGradient id="tree-grad-sub" x1="12" y1="14" x2="12" y2="40" gradientUnits="userSpaceOnUse">
        <stop stopColor="#6ee7b7" />
        <stop offset="1" stopColor="#059669" />
      </linearGradient>
      <linearGradient id="trunk-grad" x1="0" y1="0" x2="0" y2="1">
        <stop stopColor="#92400e" />
        <stop offset="1" stopColor="#451a03" />
      </linearGradient>
    </defs>
    {/* Left Secondary Tree */}
    <rect x="10" y="34" width="4" height="8" rx="1" fill="url(#trunk-grad)" />
    <path d="M12 14L4 34H20L12 14Z" fill="url(#tree-grad-sub)" opacity="0.85" />
    {/* Right Secondary Tree */}
    <rect x="34" y="34" width="4" height="8" rx="1" fill="url(#trunk-grad)" />
    <path d="M36 14L28 34H44L36 14Z" fill="url(#tree-grad-sub)" opacity="0.85" />
    {/* Main Center Fir Tree */}
    <rect x="22" y="36" width="5" height="9" rx="1" fill="url(#trunk-grad)" />
    <path d="M24.5 4L13 20H18L10 32H16L8 40H41L33 32H39L31 20H36L24.5 4Z" fill="url(#tree-grad-main)" stroke="#065f46" strokeWidth="1.2" />
    <circle cx="24.5" cy="5" r="1.5" fill="#a7f3d0" />
  </svg>
);

export const GlacierIcon = ({ className = "w-6 h-6", size, ...props }: IconProps) => (
  <svg
    viewBox="0 0 48 48"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    width={size}
    height={size}
    {...props}
  >
    <defs>
      <linearGradient id="ice-grad-top" x1="24" y1="6" x2="24" y2="34" gradientUnits="userSpaceOnUse">
        <stop stopColor="#e0f2fe" />
        <stop offset="0.6" stopColor="#7dd3fc" />
        <stop offset="1" stopColor="#0284c7" />
      </linearGradient>
      <linearGradient id="ice-grad-facet" x1="8" y1="12" x2="38" y2="42" gradientUnits="userSpaceOnUse">
        <stop stopColor="#38bdf8" />
        <stop offset="1" stopColor="#0369a1" />
      </linearGradient>
      <linearGradient id="ice-sub" x1="0" y1="0" x2="0" y2="1">
        <stop stopColor="#0ea5e9" stopOpacity="0.4" />
        <stop offset="1" stopColor="#0369a1" stopOpacity="0.9" />
      </linearGradient>
    </defs>
    {/* Water Base Line */}
    <path d="M4 38C10 36.5 16 39.5 22 38C28 36.5 34 39.5 44 38" stroke="#38bdf8" strokeWidth="2" strokeLinecap="round" opacity="0.8" />
    <path d="M6 42C12 40.5 18 43.5 24 42C30 40.5 36 43.5 42 42" stroke="#0284c7" strokeWidth="1.5" strokeLinecap="round" opacity="0.5" />
    {/* Underwater mass */}
    <path d="M12 38L18 44H30L36 38H12Z" fill="url(#ice-sub)" />
    {/* Main Glacier Shards */}
    <polygon points="22,6 31,18 20,38 9,38" fill="url(#ice-grad-top)" stroke="#bae6fd" strokeWidth="1.2" />
    <polygon points="22,6 36,14 41,38 20,38" fill="url(#ice-grad-facet)" stroke="#7dd3fc" strokeWidth="1.2" />
    <polygon points="31,18 36,14 41,38 20,38" fill="#0284c7" opacity="0.4" />
    {/* Glint highlights */}
    <path d="M22 8L20 18" stroke="#ffffff" strokeWidth="1.8" strokeLinecap="round" opacity="0.9" />
    <circle cx="22" cy="7" r="1.5" fill="#ffffff" />
  </svg>
);

export const MountainIcon = ({ className = "w-6 h-6", size, ...props }: IconProps) => (
  <svg
    viewBox="0 0 48 48"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    width={size}
    height={size}
    {...props}
  >
    <defs>
      <linearGradient id="mtn-bg" x1="12" y1="12" x2="12" y2="40" gradientUnits="userSpaceOnUse">
        <stop stopColor="#a855f7" />
        <stop offset="1" stopColor="#581c87" />
      </linearGradient>
      <linearGradient id="mtn-main" x1="28" y1="6" x2="28" y2="42" gradientUnits="userSpaceOnUse">
        <stop stopColor="#c084fc" />
        <stop offset="0.4" stopColor="#7e22ce" />
        <stop offset="1" stopColor="#3b0764" />
      </linearGradient>
      <linearGradient id="mtn-snow" x1="0" y1="0" x2="0" y2="1">
        <stop stopColor="#ffffff" />
        <stop offset="1" stopColor="#e9d5ff" />
      </linearGradient>
    </defs>
    {/* Background Peak */}
    <polygon points="14,14 3 40 26 40" fill="url(#mtn-bg)" stroke="#9333ea" strokeWidth="1.2" />
    <polygon points="14,14 9,25 14,23 18,25" fill="url(#mtn-snow)" opacity="0.8" />
    {/* Foreground Majestic Peak */}
    <polygon points="30,7 13 40 45 40" fill="url(#mtn-main)" stroke="#a855f7" strokeWidth="1.5" />
    {/* Snowcap with crevasse detail */}
    <polygon points="30,7 23,20 27,18 30,22 34,17 38,20" fill="url(#mtn-snow)" />
    {/* Shadow Ridge */}
    <polygon points="30,7 30,22 31 40 45 40" fill="#3b0764" opacity="0.35" />
    <path d="M30 22L31 40" stroke="#581c87" strokeWidth="1.2" />
  </svg>
);

export const SeaIcon = ({ className = "w-6 h-6", size, ...props }: IconProps) => (
  <svg
    viewBox="0 0 48 48"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    width={size}
    height={size}
    {...props}
  >
    <defs>
      <linearGradient id="sea-wave-1" x1="0" y1="12" x2="48" y2="44" gradientUnits="userSpaceOnUse">
        <stop stopColor="#38bdf8" />
        <stop offset="0.5" stopColor="#2563eb" />
        <stop offset="1" stopColor="#1e3a8a" />
      </linearGradient>
      <linearGradient id="sea-sun" x1="0" y1="0" x2="1" y2="1">
        <stop stopColor="#fde047" />
        <stop offset="1" stopColor="#f97316" />
      </linearGradient>
    </defs>
    {/* Golden Setting Sun */}
    <circle cx="24" cy="18" r="9" fill="url(#sea-sun)" opacity="0.9" />
    <path d="M12 18H36" stroke="#fef08a" strokeWidth="1.5" strokeLinecap="round" opacity="0.6" />
    {/* Deep Wave Layer 1 */}
    <path
      d="M3 26C8 23 15 23 21 26C27 29 34 29 40 26C43 24.5 46 25 48 26V43H0V26C1 25.5 2 25.5 3 26Z"
      fill="#1d4ed8"
      opacity="0.6"
    />
    {/* Dynamic Wave Layer 2 */}
    <path
      d="M0 31C6 28 13 28 19 31C25 34 32 34 38 31C42 29 45 30 48 31V44H0V31Z"
      fill="url(#sea-wave-1)"
    />
    {/* Spray Crests */}
    <path
      d="M16 30C18 27.5 22 28.5 25 31"
      stroke="#bae6fd"
      strokeWidth="2"
      strokeLinecap="round"
    />
    <path
      d="M34 30C36 28 40 28.5 43 31"
      stroke="#bae6fd"
      strokeWidth="2"
      strokeLinecap="round"
    />
    {/* Littoral Wave Foreground */}
    <path
      d="M0 37C7 34 14 34 21 37C28 40 35 40 42 37C45 35.5 47 36 48 37V44H0V37Z"
      fill="#0c4a6e"
      opacity="0.9"
    />
  </svg>
);

export const StreetIcon = ({ className = "w-6 h-6", size, ...props }: IconProps) => (
  <svg
    viewBox="0 0 48 48"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    width={size}
    height={size}
    {...props}
  >
    <defs>
      <linearGradient id="road-grad" x1="24" y1="6" x2="24" y2="44" gradientUnits="userSpaceOnUse">
        <stop stopColor="#475569" />
        <stop offset="0.5" stopColor="#334155" />
        <stop offset="1" stopColor="#0f172a" />
      </linearGradient>
      <linearGradient id="curb-grad" x1="0" y1="0" x2="0" y2="1">
        <stop stopColor="#10b981" />
        <stop offset="1" stopColor="#047857" />
      </linearGradient>
    </defs>
    {/* Road Surface with Perspective */}
    <polygon points="19,6 29,6 44,44 4,44" fill="url(#road-grad)" stroke="#64748b" strokeWidth="1.2" />
    {/* Left Green Verge */}
    <polygon points="0,6 19,6 4,44 0,44" fill="url(#curb-grad)" opacity="0.75" />
    {/* Right Green Verge */}
    <polygon points="29,6 48,6 48,44 44,44" fill="url(#curb-grad)" opacity="0.75" />
    {/* Dashed Central Yellow Lines */}
    <polygon points="23.5,8 24.5,8 25,14 23,14" fill="#fbbf24" />
    <polygon points="23,18 25,18 25.5,25 22.5,25" fill="#fbbf24" />
    <polygon points="22.5,29 25.5,29 26.5,37 21.5,37" fill="#fbbf24" />
    <polygon points="21.5,40 26.5,40 27.5,44 20.5,44" fill="#fbbf24" />
    {/* Road Edge Reflective White Strips */}
    <line x1="18.5" y1="6" x2="4.5" y2="44" stroke="#f8fafc" strokeWidth="1.2" opacity="0.9" />
    <line x1="29.5" y1="6" x2="43.5" y2="44" stroke="#f8fafc" strokeWidth="1.2" opacity="0.9" />
  </svg>
);

export const UndefinedAnomalyIcon = ({ className = "w-6 h-6", size, ...props }: IconProps) => (
  <svg
    viewBox="0 0 48 48"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    width={size}
    height={size}
    {...props}
  >
    <defs>
      <linearGradient id="ood-glow" x1="0" y1="0" x2="48" y2="48" gradientUnits="userSpaceOnUse">
        <stop stopColor="#fb7185" />
        <stop offset="0.5" stopColor="#e11d48" />
        <stop offset="1" stopColor="#881337" />
      </linearGradient>
      <linearGradient id="ood-inner" x1="0" y1="0" x2="1" y2="1">
        <stop stopColor="#ffe4e6" />
        <stop offset="1" stopColor="#f43f5e" />
      </linearGradient>
    </defs>
    {/* Hexagonal Radar Frame */}
    <polygon
      points="24,4 42,14 42,34 24,44 6,34 6,14"
      fill="#1f131a"
      stroke="url(#ood-glow)"
      strokeWidth="2.2"
      strokeDasharray="4 2"
    />
    <polygon
      points="24,8 38,16 38,32 24,40 10,32 10,16"
      fill="url(#ood-glow)"
      opacity="0.15"
    />
    {/* Futuristic Radar Target Reticle */}
    <circle cx="24" cy="24" r="13" stroke="#f43f5e" strokeWidth="1" strokeDasharray="3 3" opacity="0.7" />
    <line x1="24" y1="12" x2="24" y2="16" stroke="#fb7185" strokeWidth="2" strokeLinecap="round" />
    <line x1="24" y1="32" x2="24" y2="36" stroke="#fb7185" strokeWidth="2" strokeLinecap="round" />
    <line x1="12" y1="24" x2="16" y2="24" stroke="#fb7185" strokeWidth="2" strokeLinecap="round" />
    <line x1="32" y1="24" x2="36" y2="24" stroke="#fb7185" strokeWidth="2" strokeLinecap="round" />
    {/* Center High-Contrast Question Glyph */}
    <path
      d="M20 18.5C20 16 21.8 14 24 14C26.2 14 28 16 28 18.5C28 20.8 26 21.8 24.5 23.5C24.1 24 24 24.8 24 25.5"
      stroke="url(#ood-inner)"
      strokeWidth="2.6"
      strokeLinecap="round"
    />
    <circle cx="24" cy="30" r="1.6" fill="#fecdd3" />
  </svg>
);

export const SatelliteBadgeIcon = ({ className = "w-6 h-6", size, ...props }: IconProps) => (
  <svg
    viewBox="0 0 48 48"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    width={size}
    height={size}
    {...props}
  >
    <defs>
      <linearGradient id="sat-solar" x1="0" y1="0" x2="1" y2="1">
        <stop stopColor="#38bdf8" />
        <stop offset="1" stopColor="#0284c7" />
      </linearGradient>
      <linearGradient id="sat-body" x1="0" y1="0" x2="1" y2="1">
        <stop stopColor="#e2e8f0" />
        <stop offset="1" stopColor="#64748b" />
      </linearGradient>
      <linearGradient id="sat-dish" x1="0" y1="0" x2="1" y2="1">
        <stop stopColor="#f59e0b" />
        <stop offset="1" stopColor="#d97706" />
      </linearGradient>
    </defs>
    {/* Left Solar Array */}
    <rect x="3" y="19" width="13" height="10" rx="1.5" fill="url(#sat-solar)" stroke="#0284c7" strokeWidth="1.2" />
    <line x1="7.3" y1="19" x2="7.3" y2="29" stroke="#0369a1" strokeWidth="1" />
    <line x1="11.6" y1="19" x2="11.6" y2="29" stroke="#0369a1" strokeWidth="1" />
    <line x1="3" y1="24" x2="16" y2="24" stroke="#0369a1" strokeWidth="1" />
    {/* Right Solar Array */}
    <rect x="32" y="19" width="13" height="10" rx="1.5" fill="url(#sat-solar)" stroke="#0284c7" strokeWidth="1.2" />
    <line x1="36.3" y1="19" x2="36.3" y2="29" stroke="#0369a1" strokeWidth="1" />
    <line x1="40.6" y1="19" x2="40.6" y2="29" stroke="#0369a1" strokeWidth="1" />
    <line x1="32" y1="24" x2="45" y2="24" stroke="#0369a1" strokeWidth="1" />
    {/* Connectors */}
    <line x1="16" y1="24" x2="20" y2="24" stroke="#94a3b8" strokeWidth="2.5" />
    <line x1="28" y1="24" x2="32" y2="24" stroke="#94a3b8" strokeWidth="2.5" />
    {/* Central Avionics Body */}
    <rect x="19" y="17" width="10" height="14" rx="2" fill="url(#sat-body)" stroke="#cbd5e1" strokeWidth="1.2" />
    <circle cx="24" cy="22" r="2" fill="#10b981" />
    <circle cx="24" cy="27" r="1.5" fill="#38bdf8" />
    {/* Communication Dish */}
    <path d="M19 12C20.5 7 27.5 7 29 12" stroke="url(#sat-dish)" strokeWidth="2" strokeLinecap="round" />
    <line x1="24" y1="12" x2="24" y2="17" stroke="#fbbf24" strokeWidth="2" />
    <circle cx="24" cy="7" r="1.5" fill="#ef4444" />
  </svg>
);

export const GoldMedalIcon = ({ className = "w-5 h-5", size, ...props }: IconProps) => (
  <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} width={size} height={size} {...props}>
    <path d="M11 4L16 14L21 4H26L18 17V19H14V17L6 4H11Z" fill="#3b82f6" />
    <circle cx="16" cy="21" r="9" fill="url(#gold-grad)" stroke="#f59e0b" strokeWidth="1.5" />
    <circle cx="16" cy="21" r="6.5" stroke="#fef08a" strokeWidth="0.8" strokeDasharray="2 2" />
    <text x="16" y="24" textAnchor="middle" fontSize="9" fontWeight="bold" fill="#78350f" fontFamily="sans-serif">1</text>
    <defs>
      <linearGradient id="gold-grad" x1="8" y1="13" x2="24" y2="29" gradientUnits="userSpaceOnUse">
        <stop stopColor="#fef08a" />
        <stop offset="0.5" stopColor="#fbbf24" />
        <stop offset="1" stopColor="#d97706" />
      </linearGradient>
    </defs>
  </svg>
);

export const SilverMedalIcon = ({ className = "w-5 h-5", size, ...props }: IconProps) => (
  <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} width={size} height={size} {...props}>
    <path d="M11 4L16 14L21 4H26L18 17V19H14V17L6 4H11Z" fill="#ef4444" />
    <circle cx="16" cy="21" r="9" fill="url(#silver-grad)" stroke="#94a3b8" strokeWidth="1.5" />
    <circle cx="16" cy="21" r="6.5" stroke="#ffffff" strokeWidth="0.8" strokeDasharray="2 2" />
    <text x="16" y="24" textAnchor="middle" fontSize="9" fontWeight="bold" fill="#334155" fontFamily="sans-serif">2</text>
    <defs>
      <linearGradient id="silver-grad" x1="8" y1="13" x2="24" y2="29" gradientUnits="userSpaceOnUse">
        <stop stopColor="#ffffff" />
        <stop offset="0.5" stopColor="#cbd5e1" />
        <stop offset="1" stopColor="#64748b" />
      </linearGradient>
    </defs>
  </svg>
);

export const BronzeMedalIcon = ({ className = "w-5 h-5", size, ...props }: IconProps) => (
  <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} width={size} height={size} {...props}>
    <path d="M11 4L16 14L21 4H26L18 17V19H14V17L6 4H11Z" fill="#10b981" />
    <circle cx="16" cy="21" r="9" fill="url(#bronze-grad)" stroke="#b45309" strokeWidth="1.5" />
    <circle cx="16" cy="21" r="6.5" stroke="#fed7aa" strokeWidth="0.8" strokeDasharray="2 2" />
    <text x="16" y="24" textAnchor="middle" fontSize="9" fontWeight="bold" fill="#451a03" fontFamily="sans-serif">3</text>
    <defs>
      <linearGradient id="bronze-grad" x1="8" y1="13" x2="24" y2="29" gradientUnits="userSpaceOnUse">
        <stop stopColor="#fed7aa" />
        <stop offset="0.5" stopColor="#f97316" />
        <stop offset="1" stopColor="#9a3412" />
      </linearGradient>
    </defs>
  </svg>
);

export function getTerrainSvg(name: string, className = "w-6 h-6", size?: number) {
  const lower = (name || "").toLowerCase();
  if (lower.includes("building")) return <BuildingsIcon className={className} size={size} />;
  if (lower.includes("forest")) return <ForestIcon className={className} size={size} />;
  if (lower.includes("glacier") || lower.includes("ice")) return <GlacierIcon className={className} size={size} />;
  if (lower.includes("mountain") || lower.includes("alpine")) return <MountainIcon className={className} size={size} />;
  if (lower.includes("sea") || lower.includes("water") || lower.includes("ocean")) return <SeaIcon className={className} size={size} />;
  if (lower.includes("street") || lower.includes("road")) return <StreetIcon className={className} size={size} />;
  return <UndefinedAnomalyIcon className={className} size={size} />;
}
