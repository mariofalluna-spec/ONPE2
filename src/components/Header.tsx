import React, { useState, useEffect } from 'react';
import { Eye, EyeOff, Wifi, WifiOff } from 'lucide-react';
import { useElectoral } from '../context/ElectoralContext';

export const Header: React.FC = () => {
  const {
    immersiveMode,
    setImmersiveMode,
  } = useElectoral();

  const [isOnline, setIsOnline] = useState(typeof navigator !== 'undefined' ? navigator.onLine : true);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return (
    <header className="w-full pt-1 sm:pt-2 pb-0.5 px-3 md:px-6 flex items-center justify-between transition-all z-20">
      {/* ODPE ICA Brand & Offline Badge in top header */}
      <div className="flex items-center gap-2 sm:gap-3">
        <div className="flex items-center gap-1.5">
          <h1 className="font-black text-sm sm:text-base md:text-xl tracking-tight leading-none text-white flex items-center gap-1">
            <span className="tracking-tight">odpe</span>
            <span className="font-black text-amber-300">ICA</span>
          </h1>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" title="Directorio conectado" />
        </div>

        {/* Offline / Sin Señal Status Indicator relocated to top header */}
        <div
          title={isOnline ? 'Directorio 100% guardado localmente: funciona con o sin señal' : 'Modo sin señal activo: todos los distritos y teléfonos disponibles'}
          className={`flex items-center gap-1 px-2 py-0.5 rounded-lg text-[9px] font-bold border shadow-xs transition-all backdrop-blur-sm ${
            isOnline
              ? 'bg-emerald-950/60 text-emerald-200 border-emerald-500/40'
              : 'bg-amber-950/70 text-amber-200 border-amber-500/50 animate-pulse'
          }`}
        >
          {isOnline ? (
            <>
              <Wifi className="w-2.5 h-2.5 text-emerald-400 shrink-0" />
              <span className="font-extrabold tracking-tight">Offline Listo</span>
            </>
          ) : (
            <>
              <WifiOff className="w-2.5 h-2.5 text-amber-400 shrink-0" />
              <span className="font-extrabold tracking-tight">Sin Señal</span>
            </>
          )}
        </div>
      </div>

      {/* Action Controls */}
      <div className="flex items-center gap-1 bg-black/20 backdrop-blur-md p-1 rounded-xl border border-white/20 shadow-xs">
        {/* Toggle Immersive Wallpaper View */}
        <button
          id="btn-toggle-immersive"
          type="button"
          onClick={() => setImmersiveMode(prev => !prev)}
          title={immersiveMode ? 'Mostrar directorio' : 'Ver solo fondo de pantalla'}
          aria-label="Ver solo fondo de pantalla"
          className="p-1 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-all active:scale-95 flex items-center gap-1"
        >
          {immersiveMode ? <EyeOff className="w-3.5 h-3.5 text-cyan-300" /> : <Eye className="w-3.5 h-3.5 text-cyan-300" />}
          <span className="hidden sm:inline text-[11px] font-semibold text-white/90">Fondo</span>
        </button>
      </div>
    </header>
  );
};
