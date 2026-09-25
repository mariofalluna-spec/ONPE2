import React from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { useElectoral } from '../context/ElectoralContext';
import { OdpeSunLogo } from './OdpeSunLogo';

export const Header: React.FC = () => {
  const {
    immersiveMode,
    setImmersiveMode,
  } = useElectoral();

  return (
    <header className="w-full pt-1.5 pb-0.5 px-3 flex items-center justify-between transition-all z-20">
      {/* ODPE ICA Brand - Compact Header */}
      <div className="flex items-center gap-1.5">
        <OdpeSunLogo size={26} />
        <div className="flex items-center gap-1">
          <h1 className="font-extrabold text-sm sm:text-base tracking-tight leading-none text-white flex items-center gap-1">
            <span className="tracking-tight">odpe</span>
            <span className="font-black text-amber-300">ICA</span>
          </h1>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" title="Directorio conectado" />
        </div>
      </div>

      {/* Action Controls - Ultra-Slim Capsule */}
      <div className="flex items-center gap-0.5 bg-black/15 backdrop-blur-md p-0.5 rounded-xl border border-white/20 shadow-xs">
        {/* Toggle Immersive Wallpaper View */}
        <button
          id="btn-toggle-immersive"
          type="button"
          onClick={() => setImmersiveMode(prev => !prev)}
          title={immersiveMode ? 'Mostrar directorio' : 'Ver solo fondo de pantalla'}
          aria-label="Ver solo fondo de pantalla"
          className="p-1 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-all active:scale-95"
        >
          {immersiveMode ? <EyeOff className="w-3.5 h-3.5 text-cyan-300" /> : <Eye className="w-3.5 h-3.5 text-cyan-300" />}
        </button>
      </div>
    </header>
  );
};

