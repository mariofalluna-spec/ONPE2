import React, { useRef } from 'react';
import { X, Image as ImageIcon, Sliders, Upload, RotateCcw, Check, Play, Pause, ChevronLeft, ChevronRight, MapPin, Sparkles } from 'lucide-react';
import { useElectoral } from '../context/ElectoralContext';

export const WallpaperSettingsModal: React.FC = () => {
  const {
    showWallpaperModal,
    setShowWallpaperModal,
    wallpaper,
    setWallpaper,
    hdWallpapers,
    wallpaperIndex,
    autoRotateWallpapers,
    setAutoRotateWallpapers,
    rotationInterval,
    setRotationInterval,
    selectWallpaperByIndex,
    nextWallpaper,
    prevWallpaper,
    currentWallpaperItem,
    darkMode,
    showToast,
  } = useElectoral();

  const fileInputRef = useRef<HTMLInputElement>(null);

  const formatInterval = (sec: number) => {
    if (sec >= 60) {
      const mins = Math.floor(sec / 60);
      return mins === 1 ? '1 minuto' : `${mins} minutos`;
    }
    return `${sec} segundos`;
  };

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
      setAutoRotateWallpapers(false);
      showToast('¡Fondo personalizado aplicado en Full HD!');
    };
    reader.readAsDataURL(file);
  };

  const resetToDefaultWallpaper = () => {
    selectWallpaperByIndex(0);
    setAutoRotateWallpapers(true);
    setRotationInterval(600); // 10 minutes default
    setWallpaper(prev => ({
      ...prev,
      dimOpacity: 20,
      blurAmount: 0,
    }));
    showToast('Fondo restablecido a rotación cada 10 min (Full HD)');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/45 backdrop-blur-xs transition-all">
      <div
        className={`w-full max-w-md max-h-[90vh] overflow-y-auto rounded-3xl p-5 shadow-2xl border transition-all ${
          darkMode
            ? 'bg-slate-950/80 backdrop-blur-xl text-white border-white/20'
            : 'bg-white/90 backdrop-blur-xl text-slate-900 border-white/60 shadow-slate-900/10'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-3.5">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-amber-500/20 text-amber-300">
              <ImageIcon className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold tracking-tight">
                Fondos de Pantalla Full HD • Región Ica
              </h3>
              <p className="text-[11px] text-amber-200/90 font-medium">
                ODPE Región Ica
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setShowWallpaperModal(false)}
            className="p-1.5 rounded-full hover:bg-white/10 text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Current Active Preview with Carousel Arrows */}
        <div className="relative w-full h-36 rounded-2xl overflow-hidden mb-3 border border-white/25 shadow-lg group">
          <img
            src={wallpaper.imageUrl}
            alt={currentWallpaperItem.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <div
            className="absolute inset-0 bg-black transition-opacity"
            style={{ opacity: wallpaper.dimOpacity / 100 }}
          />

          {/* Quick next / prev buttons */}
          <button
            type="button"
            onClick={prevWallpaper}
            title="Paisaje anterior"
            className="absolute left-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-black/50 hover:bg-black/80 text-white backdrop-blur-md transition-all active:scale-90"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={nextWallpaper}
            title="Siguiente paisaje"
            className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-black/50 hover:bg-black/80 text-white backdrop-blur-md transition-all active:scale-90"
          >
            <ChevronRight className="w-4 h-4" />
          </button>

          {/* Landscape info banner */}
          <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between px-2.5 py-1.5 rounded-xl bg-black/60 backdrop-blur-md text-white text-[11px]">
            <div className="flex items-center gap-1.5 truncate">
              <MapPin className="w-3.5 h-3.5 text-amber-300 shrink-0" />
              <span className="font-bold truncate">{currentWallpaperItem.title}</span>
            </div>
            <span className="text-[10px] text-amber-200 shrink-0 font-medium ml-1">
              {wallpaperIndex + 1}/{hdWallpapers.length}
            </span>
          </div>
        </div>

        {/* Auto-Rotation Controls (Every 10 Seconds) */}
        <div className="p-3 rounded-2xl bg-black/20 border border-white/10 mb-4 space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className={`p-1.5 rounded-lg ${autoRotateWallpapers ? 'bg-emerald-500/20 text-emerald-300' : 'bg-white/10 text-white/60'}`}>
                {autoRotateWallpapers ? <Play className="w-3.5 h-3.5" /> : <Pause className="w-3.5 h-3.5" />}
              </div>
              <div>
                <p className="text-xs font-bold leading-tight">Cambio de fondo automático</p>
                <p className="text-[10px] opacity-75">
                  {autoRotateWallpapers
                    ? `Rotando cada ${formatInterval(rotationInterval)} en Full HD`
                    : 'Rotación pausada'}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setAutoRotateWallpapers(prev => !prev)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all active:scale-95 ${
                autoRotateWallpapers
                  ? 'bg-emerald-500 hover:bg-emerald-400 text-white shadow-xs'
                  : 'bg-white/15 hover:bg-white/25 text-white'
              }`}
            >
              {autoRotateWallpapers ? 'Activado' : 'Pausado'}
            </button>
          </div>

          {/* Interval Selector */}
          <div className="flex flex-wrap items-center gap-1.5 pt-1">
            <span className="text-[10px] opacity-80 mr-1">Frecuencia:</span>
            {[
              { label: '10 min (Predet.)', sec: 600 },
              { label: '5 min', sec: 300 },
              { label: '1 min', sec: 60 },
              { label: '30 seg', sec: 30 },
              { label: '10 seg', sec: 10 },
            ].map(item => (
              <button
                key={item.sec}
                type="button"
                onClick={() => {
                  setRotationInterval(item.sec);
                  setAutoRotateWallpapers(true);
                  showToast(`Fondo configurado para cambiar cada ${formatInterval(item.sec)}`);
                }}
                className={`px-2 py-1 rounded-lg text-[10px] font-semibold transition-all ${
                  rotationInterval === item.sec && autoRotateWallpapers
                    ? 'bg-amber-400 text-slate-950 font-bold shadow-xs'
                    : 'bg-white/10 hover:bg-white/20 text-white/80'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        {/* 8 HD Wallpapers Grid */}
        <div className="mb-4">
          <p className="text-xs font-bold mb-2 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>Galería de Paisajes de Ica (Toca para activar):</span>
          </p>
          <div className="grid grid-cols-4 gap-2">
            {hdWallpapers.map((item, idx) => {
              const isSelected = idx === wallpaperIndex && !wallpaper.isCustom;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    selectWallpaperByIndex(idx);
                    showToast(`Fondo cambiado a: ${item.title}`);
                  }}
                  className={`relative group rounded-xl overflow-hidden aspect-video border transition-all active:scale-95 ${
                    isSelected
                      ? 'border-amber-400 ring-2 ring-amber-400/50 scale-[1.02] shadow-md'
                      : 'border-white/20 hover:border-white/50 opacity-80 hover:opacity-100'
                  }`}
                >
                  <img
                    src={item.imageUrl}
                    alt={item.title}
                    className="w-full h-full object-cover"
                  />
                  {isSelected && (
                    <div className="absolute inset-0 bg-amber-500/20 flex items-center justify-center">
                      <div className="p-0.5 rounded-full bg-amber-400 text-slate-950 shadow-xs">
                        <Check className="w-3 h-3 stroke-[3]" />
                      </div>
                    </div>
                  )}
                  <div className="absolute inset-x-0 bottom-0 p-1 bg-black/70 backdrop-blur-xs text-[8px] text-white font-medium truncate leading-tight">
                    {item.title}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Controls: Dim & Blur */}
        <div className="space-y-3 mb-4 text-xs bg-black/15 p-3 rounded-2xl border border-white/10">
          {/* Opacity / Dim slider */}
          <div>
            <div className="flex justify-between font-semibold mb-1">
              <span>Oscurecer para mayor contraste:</span>
              <span className="font-mono text-cyan-300">{wallpaper.dimOpacity}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="80"
              value={wallpaper.dimOpacity}
              onChange={(e) =>
                setWallpaper(prev => ({ ...prev, dimOpacity: Number(e.target.value) }))
              }
              className="w-full accent-cyan-400 h-1.5 bg-black/30 rounded-lg cursor-pointer"
            />
          </div>

          {/* Blur slider */}
          <div>
            <div className="flex justify-between font-semibold mb-1">
              <span>Desenfoque de fondo:</span>
              <span className="font-mono text-cyan-300">{wallpaper.blurAmount}px</span>
            </div>
            <input
              type="range"
              min="0"
              max="8"
              value={wallpaper.blurAmount}
              onChange={(e) =>
                setWallpaper(prev => ({ ...prev, blurAmount: Number(e.target.value) }))
              }
              className="w-full accent-cyan-400 h-1.5 bg-black/30 rounded-lg cursor-pointer"
            />
          </div>
        </div>

        {/* Actions: Upload or Reset */}
        <div className="space-y-2">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="w-full py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md active:scale-95 transition-all"
          >
            <Upload className="w-4 h-4" />
            <span>Subir imagen personalizada</span>
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleCustomUpload}
            className="hidden"
          />

          <button
            type="button"
            onClick={resetToDefaultWallpaper}
            className="w-full py-2 rounded-xl bg-black/20 hover:bg-black/30 text-xs font-semibold flex items-center justify-center gap-1.5 border border-white/10 active:scale-95 transition-all"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Restablecer rotación cada 10 min (Full HD)</span>
          </button>
        </div>
      </div>
    </div>
  );
};
