import React, { useRef } from 'react';
import { X, Image as ImageIcon, Upload, RotateCcw, Check, MapPin, Sparkles, Smartphone, Monitor, Sun, Moon } from 'lucide-react';
import { useElectoral } from '../context/ElectoralContext';
import { getCurrentScheduledWallpaper } from '../data/wallpapers';

export const WallpaperSettingsModal: React.FC = () => {
  const {
    showWallpaperModal,
    setShowWallpaperModal,
    wallpaper,
    setWallpaper,
    currentWallpaperItem,
    isNightTime,
    showToast,
  } = useElectoral();

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!showWallpaperModal) return null;

  const handleCustomUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      setWallpaper(prev => ({
        ...prev,
        imageUrl: dataUrl,
        isCustom: true,
      }));
      showToast('¡Fondo personalizado aplicado en Full HD!');
    };
    reader.readAsDataURL(file);
  };

  const resetToDefaultWallpaper = () => {
    const scheduled = getCurrentScheduledWallpaper();
    setWallpaper({
      imageUrl: scheduled.imageUrl,
      isCustom: false,
      dimOpacity: 15,
      blurAmount: 0,
    });
    showToast('Fondo programado dinámico (Día / Noche 6:10 PM) activado');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-md transition-all">
      <div
        className="w-full max-w-md max-h-[90vh] overflow-y-auto rounded-3xl p-5 shadow-2xl border transition-all bg-slate-950/85 backdrop-blur-xl text-white border-white/20 shadow-black/80"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/15 mb-3.5">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/30">
              <ImageIcon className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold tracking-tight text-white">
                Fondo Dinámico Huacachina
              </h3>
              <p className="text-[11px] text-amber-300 font-medium">
                Cambio automático según horario (Día / 6:10 PM)
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setShowWallpaperModal(false)}
            className="p-1.5 rounded-full hover:bg-white/10 text-white/80 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Current Active Wallpaper Banner */}
        <div className="relative w-full h-44 rounded-2xl overflow-hidden mb-3.5 border border-white/25 shadow-lg group">
          <img
            src={wallpaper.imageUrl}
            alt={currentWallpaperItem?.title || 'Fondo Huacachina'}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <div
            className="absolute inset-0 bg-black transition-opacity"
            style={{ opacity: wallpaper.dimOpacity / 100 }}
          />

          {/* Day / Night Tag */}
          <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-950/80 backdrop-blur-md text-amber-300 text-[10px] font-bold border border-amber-400/30">
            {isNightTime ? (
              <>
                <Moon className="w-3 h-3 text-cyan-300" />
                <span className="text-cyan-200">Horario Noche (6:10 PM+)</span>
              </>
            ) : (
              <>
                <Sun className="w-3 h-3 text-amber-400" />
                <span className="text-amber-200">Horario Día (Hasta 6:10 PM)</span>
              </>
            )}
          </div>

          {/* Landscape info banner */}
          <div className="absolute bottom-2.5 left-2.5 right-2.5 flex items-center justify-between px-3 py-2 rounded-xl bg-slate-950/75 backdrop-blur-md text-white text-[11px] border border-white/15">
            <div className="flex items-center gap-1.5 truncate">
              <MapPin className="w-3.5 h-3.5 text-amber-300 shrink-0" />
              <div className="flex flex-col truncate text-left">
                <span className="font-bold truncate text-white">{currentWallpaperItem?.title || 'Huacachina'}</span>
                <span className="text-[9.5px] text-amber-200/90 truncate">{currentWallpaperItem?.location || 'Ica'}</span>
              </div>
            </div>
            <span className="p-1 rounded-full bg-amber-400 text-slate-950 font-bold shrink-0 ml-2">
              <Check className="w-3 h-3 stroke-[3]" />
            </span>
          </div>
        </div>

        {/* Schedule Explanation Card */}
        <div className="grid grid-cols-2 gap-2 mb-3.5 text-xs">
          <div className={`p-2.5 rounded-xl border transition-all ${
            !isNightTime
              ? 'bg-amber-500/20 border-amber-400/50 text-amber-100 shadow-sm shadow-amber-500/10'
              : 'bg-white/5 border-white/10 text-white/70'
          }`}>
            <div className="flex items-center gap-1.5 font-bold mb-1">
              <Sun className="w-3.5 h-3.5 text-amber-400" />
              <span>Antes de 6:10 PM</span>
            </div>
            <p className="text-[10px] leading-tight opacity-90">
              Laguna Huacachina soleada con palmeras y dunas.
            </p>
          </div>

          <div className={`p-2.5 rounded-xl border transition-all ${
            isNightTime
              ? 'bg-cyan-500/20 border-cyan-400/50 text-cyan-100 shadow-sm shadow-cyan-500/10'
              : 'bg-white/5 border-white/10 text-white/70'
          }`}>
            <div className="flex items-center gap-1.5 font-bold mb-1">
              <Moon className="w-3.5 h-3.5 text-cyan-400" />
              <span>Desde 6:10 PM</span>
            </div>
            <p className="text-[10px] leading-tight opacity-90">
              Laguna Huacachina estrellada bajo la Vía Láctea.
            </p>
          </div>
        </div>

        {/* Compatibility features badge strip */}
        <div className="grid grid-cols-2 gap-2 mb-4">
          <div className="flex items-center gap-2 p-2.5 rounded-xl bg-cyan-950/40 border border-cyan-400/30 text-cyan-200">
            <Smartphone className="w-4 h-4 text-cyan-300 shrink-0" />
            <div className="flex flex-col text-left text-[10.5px]">
              <span className="font-bold">Celulares (Móvil)</span>
              <span className="text-[9px] opacity-80">Vertical Full HD (9:16)</span>
            </div>
          </div>
          <div className="flex items-center gap-2 p-2.5 rounded-xl bg-amber-950/40 border border-amber-400/30 text-amber-200">
            <Monitor className="w-4 h-4 text-amber-300 shrink-0" />
            <div className="flex flex-col text-left text-[10.5px]">
              <span className="font-bold">Computadoras (PC)</span>
              <span className="text-[9px] opacity-80">Panorámico Full HD (16:9)</span>
            </div>
          </div>
        </div>

        {/* Controls: Dim & Blur */}
        <div className="space-y-3 mb-4 text-xs bg-white/10 backdrop-blur-md p-3.5 rounded-2xl border border-white/15">
          {/* Opacity / Dim slider */}
          <div>
            <div className="flex justify-between font-semibold mb-1">
              <span className="text-white/90">Ajustar contraste / oscurecer:</span>
              <span className="font-mono text-cyan-300 font-bold">{wallpaper.dimOpacity}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="70"
              value={wallpaper.dimOpacity}
              onChange={(e) =>
                setWallpaper(prev => ({ ...prev, dimOpacity: Number(e.target.value) }))
              }
              className="w-full accent-cyan-400 h-1.5 bg-black/40 rounded-lg cursor-pointer"
            />
            <div className="flex justify-between text-[9.5px] text-white/60 mt-0.5">
              <span>Más brillante (0%)</span>
              <span>Predeterminado (15%)</span>
              <span>Más oscuro (70%)</span>
            </div>
          </div>

          {/* Blur slider */}
          <div className="pt-1 border-t border-white/10">
            <div className="flex justify-between font-semibold mb-1">
              <span className="text-white/90">Nitidez / desenfoque:</span>
              <span className="font-mono text-cyan-300 font-bold">{wallpaper.blurAmount}px</span>
            </div>
            <input
              type="range"
              min="0"
              max="6"
              value={wallpaper.blurAmount}
              onChange={(e) =>
                setWallpaper(prev => ({ ...prev, blurAmount: Number(e.target.value) }))
              }
              className="w-full accent-cyan-400 h-1.5 bg-black/40 rounded-lg cursor-pointer"
            />
            <div className="flex justify-between text-[9.5px] text-white/60 mt-0.5">
              <span>Máxima nitidez (0px)</span>
              <span>Suave</span>
              <span>Difuminado (6px)</span>
            </div>
          </div>
        </div>

        {/* Actions: Reset or Upload */}
        <div className="space-y-2">
          <button
            type="button"
            onClick={resetToDefaultWallpaper}
            className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs flex items-center justify-center gap-1.5 shadow-lg active:scale-95 transition-all cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>Fijar Modo Automático (Día / Noche 6:10 PM)</span>
          </button>

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="w-full py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white/90 text-xs font-semibold flex items-center justify-center gap-1.5 border border-white/20 active:scale-95 transition-all cursor-pointer"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Subir imagen personalizada desde este equipo</span>
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleCustomUpload}
            className="hidden"
          />
        </div>
      </div>
    </div>
  );
};
