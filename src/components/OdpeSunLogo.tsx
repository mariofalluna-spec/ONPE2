import React, { useState } from 'react';
import { playAppleTap } from '../utils/appleSound';

interface OdpeSunLogoProps {
  className?: string;
  size?: number;
}

export const OdpeSunLogo: React.FC<OdpeSunLogoProps> = ({ className = '', size = 38 }) => {
  const [isManualTrigger, setIsManualTrigger] = useState(false);

  const handleTap = () => {
    playAppleTap();
    setIsManualTrigger(true);
    setTimeout(() => setIsManualTrigger(false), 2000);
  };

  return (
    <div
      onClick={handleTap}
      title="ODPE ICA • Sol radiante en movimiento"
      className={`relative inline-flex items-center justify-center cursor-pointer select-none group active:scale-95 transition-transform duration-200 ${className}`}
      style={{ width: size, height: size }}
    >
      <style>{`
        @keyframes odpeSunContinuousGlow {
          0%, 100% {
            transform: scale(1) rotate(0deg);
            filter: drop-shadow(0 0 8px rgba(253, 224, 71, 0.85)) drop-shadow(0 0 16px rgba(245, 158, 11, 0.6));
          }
          50% {
            transform: scale(1.08) rotate(5deg);
            filter: drop-shadow(0 0 14px rgba(255, 255, 255, 0.95)) drop-shadow(0 0 24px rgba(251, 191, 36, 0.85));
          }
        }

        @keyframes odpeRaysShimmer {
          0%, 100% {
            transform: scale(1);
            opacity: 0.9;
          }
          30% {
            transform: scale(1.15) rotate(2deg);
            opacity: 1;
          }
          60% {
            transform: scale(1.22) rotate(-2deg);
            opacity: 1;
          }
          85% {
            transform: scale(1.08);
            opacity: 0.95;
          }
        }

        @keyframes odpeGlowHalo {
          0%, 100% {
            transform: scale(0.9);
            opacity: 0.6;
          }
          50% {
            transform: scale(1.3);
            opacity: 1;
          }
        }

        @keyframes odpeWaveShift {
          0%, 100% {
            transform: translateX(0) scaleY(1);
          }
          35% {
            transform: translateX(1.5px) scaleY(1.18) translateY(-1px);
          }
          70% {
            transform: translateX(-1.5px) scaleY(1.12);
          }
        }

        .odpe-sun-animated {
          animation: odpeSunContinuousGlow 4s ease-in-out infinite;
          transform-origin: 50% 55%;
        }

        .odpe-rays-animated {
          animation: odpeRaysShimmer 4s ease-in-out infinite;
          transform-origin: 50% 55%;
        }

        .odpe-halo-animated {
          animation: odpeGlowHalo 4s ease-in-out infinite;
          transform-origin: 50% 55%;
        }

        .odpe-wave-animated {
          animation: odpeWaveShift 4s ease-in-out infinite;
          transform-origin: 50% 75%;
        }

        .odpe-manual-burst {
          animation: odpeSunContinuousGlow 1.2s cubic-bezier(0.34, 1.56, 0.64, 1) !important;
        }
      `}</style>

      {/* Bright Radial Sun Glow Backdrop */}
      <div className="absolute inset-0 rounded-full bg-amber-400/30 odpe-halo-animated blur-md pointer-events-none" />

      {/* Glass Pod Backdrop */}
      <div className="absolute inset-0 rounded-2xl bg-amber-500/15 backdrop-blur-xs border border-amber-300/40 group-hover:bg-amber-500/30 transition-all duration-300 shadow-sm" />

      {/* SVG Vector Matching Attached Sunset Concept */}
      <svg
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={`w-full h-full p-1 transition-all duration-300 relative z-10 ${
          isManualTrigger ? 'odpe-manual-burst' : 'odpe-sun-animated'
        }`}
      >
        <defs>
          <linearGradient id="odpeSunGradient" x1="20" y1="20" x2="80" y2="80" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="25%" stopColor="#FEF08A" />
            <stop offset="65%" stopColor="#FBBF24" />
            <stop offset="100%" stopColor="#F59E0B" />
          </linearGradient>

          <linearGradient id="odpeRaysGradient" x1="10" y1="10" x2="90" y2="90" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="35%" stopColor="#FEF08A" />
            <stop offset="70%" stopColor="#FBBF24" />
            <stop offset="100%" stopColor="#F59E0B" />
          </linearGradient>

          <linearGradient id="odpeWaveGradient" x1="15" y1="65" x2="85" y2="75" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#FDE047" />
            <stop offset="50%" stopColor="#F59E0B" />
            <stop offset="100%" stopColor="#D97706" />
          </linearGradient>
        </defs>

        {/* 1. RADIATING RAYS */}
        <g className="odpe-rays-animated">
          {/* Ray 1: Left Horizontal (~180°) */}
          <line
            x1="12"
            y1="56"
            x2="28"
            y2="57.5"
            stroke="url(#odpeRaysGradient)"
            strokeWidth="3.6"
            strokeLinecap="round"
          />

          {/* Ray 2: Lower-Left (~155°) */}
          <line
            x1="18"
            y1="42"
            x2="31"
            y2="47"
            stroke="url(#odpeRaysGradient)"
            strokeWidth="3.6"
            strokeLinecap="round"
          />

          {/* Ray 3: Mid-Left (~135°) */}
          <line
            x1="27"
            y1="28"
            x2="38"
            y2="37"
            stroke="url(#odpeRaysGradient)"
            strokeWidth="3.8"
            strokeLinecap="round"
          />

          {/* Ray 4: Upper-Left (~115°) */}
          <line
            x1="40"
            y1="18"
            x2="45.5"
            y2="29"
            stroke="url(#odpeRaysGradient)"
            strokeWidth="3.8"
            strokeLinecap="round"
          />

          {/* Ray 5: Center Vertical (90° Summit Ray) */}
          <line
            x1="50"
            y1="13"
            x2="50"
            y2="26"
            stroke="url(#odpeRaysGradient)"
            strokeWidth="4"
            strokeLinecap="round"
          />

          {/* Ray 6: Upper-Right (~65°) */}
          <line
            x1="60"
            y1="18"
            x2="54.5"
            y2="29"
            stroke="url(#odpeRaysGradient)"
            strokeWidth="3.8"
            strokeLinecap="round"
          />

          {/* Ray 7: Mid-Right (~45°) */}
          <line
            x1="73"
            y1="28"
            x2="62"
            y2="37"
            stroke="url(#odpeRaysGradient)"
            strokeWidth="3.8"
            strokeLinecap="round"
          />

          {/* Ray 8: Lower-Right (~25°) */}
          <line
            x1="82"
            y1="42"
            x2="69"
            y2="47"
            stroke="url(#odpeRaysGradient)"
            strokeWidth="3.6"
            strokeLinecap="round"
          />

          {/* Ray 9: Right Horizontal (~0°) */}
          <line
            x1="88"
            y1="56"
            x2="72"
            y2="57.5"
            stroke="url(#odpeRaysGradient)"
            strokeWidth="3.6"
            strokeLinecap="round"
          />
        </g>

        {/* 2. SEMICIRCULAR SUN DOME (Half-Sun setting on horizon) */}
        <path
          d="M 27 60 C 27 40 37.3 30 50 30 C 62.7 30 73 40 73 60"
          stroke="url(#odpeSunGradient)"
          strokeWidth="4.4"
          strokeLinecap="round"
        />

        {/* 3. DUNE / WAVE CURVE (Underneath the sun) */}
        <path
          className="odpe-wave-animated"
          d="M 22 75 C 34 75 42 73 48 68 C 53 64 58 64 57 70 C 56 74 64 76 74 74 C 77 73.5 82 72.5 83 72.5"
          stroke="url(#odpeWaveGradient)"
          strokeWidth="3.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
};

