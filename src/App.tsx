import React from 'react';
import { ElectoralProvider, useElectoral } from './context/ElectoralContext';
import { Header } from './components/Header';
import { BingSearchBar } from './components/BingSearchBar';
import { QuickActions } from './components/QuickActions';
import { VotingTableCard } from './components/VotingTableCard';
import { GestoresView } from './components/GestoresView';
import { TableDetailModal } from './components/TableDetailModal';
import { VoiceSearchModal } from './components/VoiceSearchModal';
import { DatabaseModal } from './components/DatabaseModal';
import { WallpaperSettingsModal } from './components/WallpaperSettingsModal';
import { PWAInstallModal } from './components/PWAInstallModal';
import { OdpeSunLogo } from './components/OdpeSunLogo';
import { SearchX, Mic, CheckCircle2, Eye, MapPin, Phone, MessageCircle, ChevronRight, Building } from 'lucide-react';

const MainContent: React.FC = () => {
  const {
    wallpaper,
    darkMode,
    viewMode,
    filteredMesas,
    searchQuery,
    setSearchQuery,
    filterDistrito,
    setFilterDistrito,
    startVoiceSearch,
    isListening,
    toastMessage,
    immersiveMode,
    setImmersiveMode,
    callContact,
    sendWhatsApp,
    hdWallpapers,
    wallpaperIndex,
    autoRotateWallpapers,
    nextWallpaper,
    prevWallpaper,
    currentWallpaperItem,
    showInstallModal,
    setShowInstallModal,
  } = useElectoral();

  // 15-Second Inactivity Timer for Wallpaper Screensaver Mode
  const timerRef = React.useRef<NodeJS.Timeout | null>(null);
  const wakeUpTimeRef = React.useRef<number>(0);

  const resetIdleTimer = React.useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    // Do not trigger idle screensaver if voice listening is active
    if (isListening) return;

    timerRef.current = setTimeout(() => {
      setImmersiveMode(true);
    }, 15000); // 15 seconds of inactivity
  }, [isListening, setImmersiveMode]);

  // Clean wake-up function that blocks any accidental click-through to underlying cards or modals
  const handleWakeUp = React.useCallback((e: React.SyntheticEvent) => {
    e.preventDefault();
    e.stopPropagation();
    wakeUpTimeRef.current = Date.now();
    setImmersiveMode(false);
    resetIdleTimer();
  }, [resetIdleTimer, setImmersiveMode]);

  // Global capture-phase listener to drop any ghost synthetic clicks dispatched right after wake-up
  React.useEffect(() => {
    const swallowGhostClick = (e: Event) => {
      if (Date.now() - wakeUpTimeRef.current < 450) {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
      }
    };

    window.addEventListener('click', swallowGhostClick, { capture: true });
    window.addEventListener('touchend', swallowGhostClick, { capture: true });
    window.addEventListener('pointerup', swallowGhostClick, { capture: true });

    return () => {
      window.removeEventListener('click', swallowGhostClick, { capture: true });
      window.removeEventListener('touchend', swallowGhostClick, { capture: true });
      window.removeEventListener('pointerup', swallowGhostClick, { capture: true });
    };
  }, []);

  // Track user activity across all input and pointer types
  React.useEffect(() => {
    if (immersiveMode) {
      // While idle wallpaper is active, clear the timer
      if (timerRef.current) clearTimeout(timerRef.current);
      return;
    }

    const activityEvents = ['pointerdown', 'touchstart', 'mousedown', 'mousemove', 'keydown', 'scroll', 'click'];

    const handleUserActivity = () => {
      // Avoid resetting during ghost click window
      if (Date.now() - wakeUpTimeRef.current < 450) return;
      resetIdleTimer();
    };

    // Initial start of timer
    resetIdleTimer();

    activityEvents.forEach((evt) => {
      window.addEventListener(evt, handleUserActivity, { passive: true });
    });

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      activityEvents.forEach((evt) => {
        window.removeEventListener(evt, handleUserActivity);
      });
    };
  }, [immersiveMode, resetIdleTimer]);

  // Unique districts found in search results
  const distritosEncontrados = React.useMemo(() => {
    if (!searchQuery.trim()) return [];
    const set = new Set<string>();
    filteredMesas.forEach(m => {
      if (m.distrito) set.add(m.distrito);
    });
    return Array.from(set);
  }, [filteredMesas, searchQuery]);

  // District coordinator for the active district (shown once at district level)
  const districtCoordinator = React.useMemo(() => {
    if (searchQuery.trim()) return null;
    return filteredMesas[0]?.coordinadorDistrital || null;
  }, [filteredMesas, searchQuery]);

  // Smooth crossfade state for wallpaper transitions (every 10 minutes)
  const [displayWallpaper, setDisplayWallpaper] = React.useState(wallpaper.imageUrl);
  const [prevWallpaperUrl, setPrevWallpaperUrl] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (wallpaper.imageUrl !== displayWallpaper) {
      setPrevWallpaperUrl(displayWallpaper);
      setDisplayWallpaper(wallpaper.imageUrl);
      const timer = setTimeout(() => {
        setPrevWallpaperUrl(null);
      }, 1400);
      return () => clearTimeout(timer);
    }
  }, [wallpaper.imageUrl, displayWallpaper]);

  return (
    <div
      className={`relative min-h-screen w-full font-sans transition-colors selection:bg-cyan-500 selection:text-white ${
        darkMode ? 'dark text-slate-100' : 'text-slate-900'
      }`}
    >
      {/* FULL HD WALLPAPER LAYER WITH DISSOLVE TRANSITIONS */}
      <div
        className="fixed inset-0 pointer-events-none z-0 overflow-hidden"
        style={{
          transform: 'translateZ(0)',
          willChange: 'transform',
        }}
      >
        {/* Outgoing wallpaper during transition */}
        {prevWallpaperUrl && (
          <img
            src={prevWallpaperUrl}
            alt="Fondo anterior"
            className="absolute inset-0 w-full h-full object-cover object-center"
            style={{
              filter: wallpaper.blurAmount > 0 ? `blur(${wallpaper.blurAmount}px)` : 'none',
              transform: 'scale(1.01)',
            }}
          />
        )}

        {/* Current incoming wallpaper with cinematic fade */}
        <img
          key={displayWallpaper}
          src={displayWallpaper}
          alt={currentWallpaperItem?.title || 'Fondo Full HD Ica'}
          className={`absolute inset-0 w-full h-full object-cover object-center ${
            prevWallpaperUrl ? 'animate-wallpaper-fade' : ''
          }`}
          style={{
            filter: wallpaper.blurAmount > 0 ? `blur(${wallpaper.blurAmount}px)` : 'none',
            transform: 'scale(1.01)',
          }}
          loading="eager"
        />

        {/* Dynamic Translucent contrast overlay */}
        <div
          className="absolute inset-0 transition-opacity duration-700 pointer-events-none"
          style={{
            backgroundColor: immersiveMode
              ? 'transparent'
              : 'rgba(0, 0, 0, 0.08)',
          }}
        />
      </div>

      {/* FULL-SCREEN IDLE TOUCH CATCHER (Screen Saver / Wallpaper View) */}
      {immersiveMode && (
        <div
          id="idle-wallpaper-touch-catcher"
          onPointerDown={handleWakeUp}
          onTouchStart={handleWakeUp}
          onClick={handleWakeUp}
          className="fixed inset-0 z-50 cursor-pointer flex flex-col justify-between items-center pt-12 pb-8 px-4 select-none touch-none"
        >
          {/* Subtle iPhone Lockscreen Watermark with Animated Sun */}
          <div className="flex flex-col items-center gap-2">
            <OdpeSunLogo size={52} />
            <div className="text-center">
              <h2 className="text-xl font-extrabold text-white tracking-wider drop-shadow-md">
                odpe <span className="font-black text-amber-300">ICA</span>
              </h2>
            </div>

            {/* Active HD Wallpaper Landscape Badge */}
            <div className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-black/45 backdrop-blur-md border border-white/20 text-white shadow-lg mt-1 text-xs">
              <MapPin className="w-3.5 h-3.5 text-amber-300 shrink-0" />
              <span className="font-bold tracking-tight">{currentWallpaperItem?.title || 'Ica'}</span>
              <span className="opacity-80 text-[10px] hidden sm:inline">• {currentWallpaperItem?.location}</span>
            </div>

            {/* Auto-rotation indicator dots */}
            <div className="flex items-center gap-1.5 mt-2">
              {hdWallpapers.map((wp, idx) => (
                <span
                  key={wp.id}
                  className={`h-1.5 rounded-full transition-all duration-500 ${
                    idx === wallpaperIndex
                      ? 'w-5 bg-amber-300 shadow-xs shadow-amber-300/80'
                      : 'w-1.5 bg-white/30'
                  }`}
                />
              ))}
            </div>
          </div>

          <div className="px-4 py-2.5 rounded-full bg-black/40 hover:bg-black/60 backdrop-blur-md text-white/95 border border-white/20 text-xs font-medium shadow-2xl flex items-center gap-2 animate-pulse active:scale-95 transition-all">
            <Eye className="w-4 h-4 text-cyan-300" />
            <span>Toca en cualquier lugar para volver al directorio</span>
          </div>
        </div>
      )}

      {/* MOBILE APPLICATION SHELL - Preserved in memory, smoothly fades out during idle */}
      <div
        className={`relative z-10 max-w-md mx-auto min-h-screen flex flex-col pb-8 transition-opacity duration-500 ${
          immersiveMode ? 'opacity-0 pointer-events-none' : 'opacity-100'
        }`}
      >
        {/* Bing Header */}
        <Header />

        {/* Bing Pill Search Bar with Voice Search */}
        <BingSearchBar />

        {/* Bing Quick Action Navigation Tiles */}
        <QuickActions />

        {/* Dynamic Views */}
        <main className="flex-1 w-full space-y-2 pb-6">
              {/* If viewMode is 'coordinadores', 'miembros' or 'asignados', show directory listing */}
              {viewMode !== 'todas' && <GestoresView />}

              {/* If viewMode is 'todas', show focused mesas strictly scoped to district or search */}
              {viewMode === 'todas' && (
                <>
                  {/* CASE 1: SEARCH ACTIVE -> Show ONLY what was searched, plus option for that district */}
                  {searchQuery.trim() ? (
                    <div className="px-4 space-y-2.5">
                      {/* Search Results Header */}
                      <div className="flex items-center justify-between text-xs pt-1">
                        <span className="font-semibold text-white/90 drop-shadow-sm text-[11px]">
                          Búsqueda: "{searchQuery}" ({filteredMesas.length} {filteredMesas.length === 1 ? 'coincidencia' : 'coincidencias'})
                        </span>
                        <button
                          type="button"
                          onClick={() => setSearchQuery('')}
                          className="text-cyan-300 hover:underline font-bold text-[11px]"
                        >
                          ✕ Limpiar
                        </button>
                      </div>

                      {filteredMesas.length > 0 ? (
                        <>
                          {/* Cards List (Only what was searched!) */}
                          <div className="space-y-2">
                            {filteredMesas.map((mesa) => (
                              <VotingTableCard key={mesa.id} mesa={mesa} showCoordinator={true} />
                            ))}
                          </div>

                          {/* OPTION REQUESTED BY USER: Provide quick access to tables of that same district only */}
                          {distritosEncontrados.map((dist) => (
                            <div
                              key={dist}
                              className={`p-3 rounded-2xl border backdrop-blur-md shadow-lg flex items-center justify-between gap-2 transition-all ${
                                darkMode
                                  ? 'bg-black/20 border-cyan-400/40 text-white'
                                  : 'bg-white/25 border-white/40 text-white shadow-black/10'
                              }`}
                            >
                              <div className="min-w-0 flex-1">
                                <span className="text-[10px] uppercase font-bold text-cyan-400 block tracking-wider">
                                  Opción de Distrito
                                </span>
                                <p className="text-xs font-semibold truncate">
                                  Ver únicamente las mesas de <span className="text-cyan-300 font-bold">{dist}</span>
                                </p>
                              </div>
                              <button
                                type="button"
                                onClick={() => {
                                  setFilterDistrito(dist);
                                  setSearchQuery('');
                                }}
                                className="px-3 py-1.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-white font-bold text-xs shrink-0 flex items-center gap-1 active:scale-95 transition-all shadow-md"
                              >
                                <span>Ver distrito</span>
                                <ChevronRight className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ))}
                        </>
                      ) : (
                        /* Empty state when searching */
                        <div
                          className={`p-6 rounded-2xl text-center border backdrop-blur-md ${
                            darkMode
                              ? 'bg-black/20 border-white/20 text-white'
                              : 'bg-white/25 border-white/40 text-white shadow-black/10'
                          }`}
                        >
                          <SearchX className="w-8 h-8 text-cyan-400 mx-auto mb-2 opacity-80" />
                          <h3 className="font-bold text-xs mb-1">
                            No se encontraron resultados
                          </h3>
                          <p className="text-[11px] opacity-75 mb-3">
                            No hay mesas ni contactos para "{searchQuery}".
                          </p>
                          <div className="flex items-center justify-center gap-2">
                            <button
                              type="button"
                              onClick={() => setSearchQuery('')}
                              className="px-3 py-1 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-white text-xs font-bold"
                            >
                              Volver a {filterDistrito.split('/')[0].trim()}
                            </button>
                            <button
                              type="button"
                              onClick={startVoiceSearch}
                              className="px-3 py-1 rounded-xl bg-black/40 hover:bg-black/60 text-cyan-300 text-xs font-bold flex items-center gap-1 border border-white/10"
                            >
                              <Mic className="w-3 h-3" />
                              <span>Voz</span>
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    /* CASE 2: INITIAL / DISTRICT VIEW -> Strictly single district, no redundancy */
                    <div className="px-4 space-y-2.5">
                      {/* District Header with Coordinator ONCE */}
                      <div
                        className={`p-3 rounded-2xl border backdrop-blur-md shadow-lg transition-all ${
                          darkMode
                            ? 'bg-black/20 border-white/20 text-white'
                            : 'bg-white/25 border-white/40 text-white shadow-black/10'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-1.5">
                            <MapPin className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                            <span className="text-xs font-bold tracking-tight">{filterDistrito}</span>
                          </div>
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-400/30">
                            {filteredMesas.length} {filteredMesas.length === 1 ? 'mesa' : 'mesas'}
                          </span>
                        </div>

                        {districtCoordinator && (
                          <div className="pt-2 border-t border-white/10 flex items-center justify-between gap-2">
                            <div className="min-w-0 flex-1">
                              <span className="text-[9px] uppercase font-bold text-cyan-400 tracking-wider block">
                                ★ Coordinador Distrital
                              </span>
                              <p className="text-xs font-bold truncate">{districtCoordinator.nombre}</p>
                              <p className="text-[11px] font-mono opacity-80">{districtCoordinator.telefono}</p>
                            </div>
                            <div className="flex items-center gap-1.5 shrink-0">
                              <button
                                type="button"
                                onClick={() => callContact(districtCoordinator.telefono, districtCoordinator.nombre, 'Coordinador Distrital', filterDistrito)}
                                className="px-2.5 py-1.5 rounded-xl bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-400 hover:to-green-500 text-white font-bold text-xs flex items-center gap-1 shadow-xs active:scale-95 transition-all"
                                title={`Llamar a ${districtCoordinator.nombre}`}
                              >
                                <Phone className="w-3 h-3 fill-current" />
                                <span>Llamar</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => sendWhatsApp(districtCoordinator.telefono, districtCoordinator.nombre, 'Coordinador Distrital', filterDistrito)}
                                className="p-1.5 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 border border-emerald-500/30 active:scale-95"
                                title="WhatsApp al coordinador"
                              >
                                <MessageCircle className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Mesa cards of this district ONLY */}
                      <div className="space-y-2">
                        {filteredMesas.map((mesa) => (
                          <VotingTableCard key={mesa.id} mesa={mesa} showCoordinator={false} />
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
            </main>

            {/* Minimalist Floating Footer Note */}
            <footer className="w-full text-center text-[10px] text-white/75 px-4 py-1">
              <span className="drop-shadow-sm font-medium">ODPE Región Ica</span>
            </footer>
          </div>

      {/* Floating Toast Notification */}
      {toastMessage && !immersiveMode && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-2xl bg-black/80 text-white border border-cyan-500/40 shadow-2xl backdrop-blur-md flex items-center gap-2 text-xs font-medium max-w-sm">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* All Application Modals (fade out during idle screensaver, preserving their exact open state) */}
      <div
        className={`transition-opacity duration-300 ${
          immersiveMode ? 'opacity-0 pointer-events-none' : 'opacity-100'
        }`}
      >
        <TableDetailModal />
        <VoiceSearchModal />
        <DatabaseModal />
        <WallpaperSettingsModal />
        <PWAInstallModal isOpen={showInstallModal} onClose={() => setShowInstallModal(false)} />
      </div>
    </div>
  );
};

export default function App() {
  return (
    <ElectoralProvider>
      <MainContent />
    </ElectoralProvider>
  );
}
