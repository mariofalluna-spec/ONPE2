import React from 'react';
import { Database, Eye, EyeOff } from 'lucide-react';
import { useElectoral } from '../context/ElectoralContext';
import { OdpeSunLogo } from './OdpeSunLogo';

export const Header: React.FC = () => {
  const {
    setShowDbModal,
    immersiveMode,
    setImmersiveMode,
  } = useElectoral();

  return (
    <header className="w-full pt-3 pb-2 px-4 flex items-center justify-between transition-all z-20">
      {/* ODPE ICA Brand with Animated Sunset Icon - iPhone Clean Aesthetic */}
      <div className="flex items-center gap-2.5">
        <OdpeSunLogo size={38} />
        <div>
          <div className="flex items-center gap-1.5">
            <h1 className="font-extrabold text-base sm:text-lg tracking-tight leading-none drop-shadow-md text-white flex items-center gap-1.5">
              <span className="tracking-tight">odpe</span>
              <span className="font-black text-amber-300">ICA</span>
            </h1>
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-sm shadow-emerald-400" title="Directorio conectado" />
          </div>
        </div>
      </div>

      {/* Action Controls - Sleek Translucent Capsule */}
      <div className="flex items-center gap-1 bg-black/15 backdrop-blur-md p-1 rounded-2xl border border-white/20 shadow-xs">
        {/* Toggle Immersive Wallpaper View */}
        <button
          id="btn-toggle-immersive"
          type="button"
          onClick={() => setImmersiveMode(prev => !prev)}
          title={immersiveMode ? 'Mostrar directorio' : 'Apreciar paisajes de Ica en Full HD'}
          aria-label="Ver fondo completo"
          className={`p-1.5 rounded-xl transition-all active:scale-95 ${
            immersiveMode
              ? 'bg-cyan-500 text-white shadow-xs font-bold'
              : 'text-white/80 hover:text-white hover:bg-white/10'
          }`}
        >
          {immersiveMode ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4 text-cyan-300" />}
        </button>

        {/* Database button */}
        <button
          id="btn-open-database"
          type="button"
          onClick={() => setShowDbModal(true)}
          title="Gestionar Base de Datos / Agregar Asignados"
          aria-label="Cargar Base de Datos"
          className="p-1.5 rounded-xl text-white/80 hover:text-white hover:bg-white/10 transition-all active:scale-95"
        >
          <Database className="w-4 h-4 text-cyan-200" />
        </button>
      </div>
    </header>
  );
};
