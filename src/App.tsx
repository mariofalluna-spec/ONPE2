import React from 'react';
import { ElectoralProvider, useElectoral } from './context/ElectoralContext';
import { Header } from './components/Header';
import { VotingTableCard } from './components/VotingTableCard';
import { GestoresView } from './components/GestoresView';
import { TableDetailModal } from './components/TableDetailModal';
import { VoiceSearchModal } from './components/VoiceSearchModal';
import { DatabaseModal } from './components/DatabaseModal';
import { WallpaperSettingsModal } from './components/WallpaperSettingsModal';
import { PWAInstallModal } from './components/PWAInstallModal';
import { SupabaseBackupModal } from './components/SupabaseBackupModal';
import { OdpeSunLogo } from './components/OdpeSunLogo';
import { DistritosGrid } from './components/DistritosGrid';
import { WhatsAppAppIcon } from './components/WhatsAppAppIcon';
import { SearchX, Mic, CheckCircle2, Eye, MapPin, Phone, ChevronRight, ChevronLeft, Building } from 'lucide-react';

const MainContent: React.FC = () => {
  const {
    wallpaper,
    darkMode,
    viewMode,
    setViewMode,
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
    showSupabaseModal,
    setShowSupabaseModal,
    layoutMode,
  } = useElectoral();

  // 1-Minute Inactivity Timer for Wallpaper Screensaver Mode (despeja y muestra solo fondo tras 1 min)
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
    }, 60000); // 1 minuto (60 segundos) de inactividad
  }, [isListening, setImmersiveMode]);

  // Clean wake-up function that blocks any accidental click-through to underlying cards or modals
  const handleWakeUp = React.useCallback((e?: React.SyntheticEvent | Event) => {
    if (e) {
      e.preventDefault?.();
      e.stopPropagation?.();
    }
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

  // While in screensaver mode (immersiveMode), wake up immediately on ANY user activity (movement, key, click, touch)
  React.useEffect(() => {
    if (!immersiveMode) return;

    const wakeCooldown = Date.now();
    const handleWakeActivity = (e: Event) => {
      // Small debounce of 200ms to avoid immediate wake-up from the triggering event
      if (Date.now() - wakeCooldown < 200) return;
      handleWakeUp(e);
    };

    const wakeEvents = ['mousemove', 'mousedown', 'pointerdown', 'touchstart', 'keydown', 'wheel'];
    wakeEvents.forEach((evt) => {
      window.addEventListener(evt, handleWakeActivity, { passive: true });
    });

    return () => {
      wakeEvents.forEach((evt) => {
        window.removeEventListener(evt, handleWakeActivity);
      });
    };
  }, [immersiveMode, handleWakeUp]);

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

  // Check if we are currently away from the main 31 districts view
  const isNotInMainDistritos = viewMode !== 'distritos' || Boolean(filterDistrito) || Boolean(searchQuery.trim());

  const handleGoBackToMainDistritos = React.useCallback(() => {
    setFilterDistrito('');
    setSearchQuery('');
    setViewMode('distritos');
  }, [setFilterDistrito, setSearchQuery, setViewMode]);

  // Touch Swipe Gesture Handling: Swiping right (atrás) navigates back to 31 Distritos
  const touchStartXRef = React.useRef<number>(0);
  const touchStartYRef = React.useRef<number>(0);
  const touchStartTimeRef = React.useRef<number>(0);
  const [swipeBackProgress, setSwipeBackProgress] = React.useState<number>(0);
  const swipeRafRef = React.useRef<number | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length !== 1) return;
    touchStartXRef.current = e.touches[0].clientX;
    touchStartYRef.current = e.touches[0].clientY;
    touchStartTimeRef.current = Date.now();
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isNotInMainDistritos || e.touches.length !== 1) return;
    const deltaX = e.touches[0].clientX - touchStartXRef.current;
    const deltaY = Math.abs(e.touches[0].clientY - touchStartYRef.current);

    // Only activate indicator if deliberate back swipe
    if (deltaX > 25 && deltaX > deltaY * 1.3) {
      if (!swipeRafRef.current) {
        swipeRafRef.current = requestAnimationFrame(() => {
          setSwipeBackProgress(Math.min(deltaX / 90, 1));
          swipeRafRef.current = null;
        });
      }
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (swipeRafRef.current) {
      cancelAnimationFrame(swipeRafRef.current);
      swipeRafRef.current = null;
    }
    setSwipeBackProgress(0);

    if (!isNotInMainDistritos) {
      return;
    }
    const touchEndX = e.changedTouches[0].clientX;
    const touchEndY = e.changedTouches[0].clientY;
    const deltaX = touchEndX - touchStartXRef.current;
    const deltaY = Math.abs(touchEndY - touchStartYRef.current);
    const timeTaken = Date.now() - touchStartTimeRef.current;

    // Threshold for back swipe:
    // 1. Swiping right at least 45px with predominantly horizontal direction
    // 2. OR a fast flick/swipe
    const isHorizontalSwipe = deltaX > 45 && deltaX > deltaY * 1.1;
    const isFlick = deltaX > 35 && timeTaken < 350 && deltaX > deltaY;

    if (isHorizontalSwipe || isFlick) {
      handleGoBackToMainDistritos();
    }
  };

  // Browser / Phone Native Back Button & Edge-Swipe Integration
  React.useEffect(() => {
    if (isNotInMainDistritos) {
      window.history.pushState({ page: 'detail' }, '');
    }

    const handlePopState = () => {
      if (isNotInMainDistritos) {
        setFilterDistrito('');
        setSearchQuery('');
        setViewMode('distritos');
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [isNotInMainDistritos, setFilterDistrito, setSearchQuery, setViewMode]);

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
      {/* FULL HD OFFICIAL WALLPAPER LAYER - OPTIMIZED 100% FOR PC AND MOBILE */}
      <div
        className="fixed inset-0 pointer-events-none z-0 overflow-hidden bg-slate-950"
        style={{
          transform: 'translateZ(0)',
          WebkitTransform: 'translateZ(0)',
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

        {/* Current incoming wallpaper with responsive picture (PC wide panoramic & mobile vertical) */}
        <picture className="absolute inset-0 w-full h-full pointer-events-none">
          {currentWallpaperItem?.wideImageUrl && (
            <source
              media="(min-width: 768px)"
              srcSet={currentWallpaperItem.wideImageUrl}
            />
          )}
          <img
            key={displayWallpaper}
            src={displayWallpaper}
            alt={currentWallpaperItem?.title || 'Fondo Laguna de Huacachina bajo la Vía Láctea'}
            className={`absolute inset-0 w-full h-full object-cover object-center ${
              prevWallpaperUrl ? 'animate-wallpaper-fade' : ''
            }`}
            style={{
              filter: wallpaper.blurAmount > 0 ? `blur(${wallpaper.blurAmount}px)` : 'none',
              transform: 'scale(1.01)',
            }}
            loading="eager"
            fetchPriority="high"
          />
        </picture>

        {/* Dynamic Translucent contrast overlay */}
        <div
          className="absolute inset-0 transition-opacity duration-700 pointer-events-none"
          style={{
            backgroundColor: immersiveMode
              ? 'transparent'
              : `rgba(0, 0, 0, ${wallpaper.dimOpacity / 100})`,
          }}
        />
      </div>

      {/* FULL-SCREEN IDLE TOUCH CATCHER (Screen Saver / Solo Fondo de Pantalla tras 1 min) */}
      {immersiveMode && (
        <div
          id="idle-wallpaper-touch-catcher"
          onPointerDown={handleWakeUp}
          onTouchStart={handleWakeUp}
          onClick={handleWakeUp}
          className="fixed inset-0 z-50 cursor-pointer select-none touch-none bg-transparent"
          title="Toca o mueve el cursor para volver al directorio"
        />
      )}

      {/* APPLICATION SHELL - Responsive fluid container allowing all 31 districts to fit in a single screen or full PC mode */}
      <div
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        className={`relative z-10 w-full mx-auto transition-all duration-300 ${
          layoutMode === 'pc'
            ? 'max-w-[1440px] 2xl:max-w-[1680px] px-3 sm:px-6 min-h-screen flex flex-col pb-4'
            : 'max-w-md h-[100dvh] flex flex-col overflow-hidden px-1 sm:px-2 pb-1'
        } ${
          immersiveMode ? 'opacity-0 pointer-events-none' : 'opacity-100'
        }`}
      >
        {/* Floating Visual Swipe-Back Indicator for touch feedback */}
        {isNotInMainDistritos && swipeBackProgress > 0 && (
          <div
            className="fixed left-2 top-1/2 -translate-y-1/2 z-50 pointer-events-none flex items-center gap-1.5 px-3 py-2 rounded-full bg-slate-950/95 border border-cyan-400 text-cyan-300 shadow-2xl backdrop-blur-md transition-all duration-75"
            style={{
              opacity: Math.max(0.4, swipeBackProgress),
              transform: `translateY(-50%) translateX(${Math.min(swipeBackProgress * 20, 20)}px) scale(${0.85 + swipeBackProgress * 0.15})`,
            }}
          >
            <ChevronLeft className="w-4 h-4 animate-pulse text-cyan-300" />
            <span className="text-xs font-black tracking-tight">31 Distritos</span>
          </div>
        )}

        {/* Executive Header */}
        <Header />

        {/* Dynamic Views */}
        <main className={`w-full ${layoutMode === 'mobile' ? 'flex-1 flex flex-col min-h-0 overflow-hidden' : 'flex-1 space-y-3 pb-2'}`}>
              {/* If viewMode is 'distritos', show the 31 Districts Grid */}
              {viewMode === 'distritos' && <DistritosGrid />}

              {/* If viewMode is 'coordinadores' or 'asignados', show directory listing */}
              {(viewMode === 'coordinadores' || viewMode === 'asignados') && <GestoresView />}

              {/* If viewMode is 'todas', show focused mesas or 31 districts if none selected */}
              {viewMode === 'todas' && (
                <>
                  {!searchQuery.trim() && !filterDistrito ? (
                    <DistritosGrid />
                  ) : (
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

                              {/* OPTION: Provide quick access to tables of that same district only */}
                              {distritosEncontrados.map((dist) => (
                                <div
                                  key={dist}
                                  className="p-3 rounded-2xl border border-cyan-400/30 bg-slate-950/35 hover:bg-slate-950/50 backdrop-blur-md shadow-lg flex items-center justify-between gap-2 transition-all text-white"
                                >
                                  <div className="min-w-0 flex-1">
                                    <span className="text-[10px] uppercase font-bold text-cyan-300 block tracking-wider drop-shadow-xs">
                                      Opción de Distrito
                                    </span>
                                    <p className="text-xs font-semibold truncate drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)]">
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
                              className="p-6 rounded-2xl text-center border border-white/20 bg-slate-950/35 backdrop-blur-md text-white shadow-lg"
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
                                  onClick={() => {
                                    setSearchQuery('');
                                    setViewMode('distritos');
                                  }}
                                  className="px-3 py-1 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-white text-xs font-bold"
                                >
                                  Ver 31 Distritos
                                </button>
                                <button
                                  type="button"
                                  onClick={startVoiceSearch}
                                  className="px-3 py-1 rounded-xl bg-white/10 hover:bg-white/20 text-cyan-300 text-xs font-bold flex items-center gap-1 border border-white/20 backdrop-blur-md"
                                >
                                  <Mic className="w-3 h-3" />
                                  <span>Voz</span>
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      ) : (
                        /* CASE 2: DISTRICT VIEW -> Strictly single district, with quick button back to 31 districts */
                        <div className="px-4 space-y-2.5">
                          {/* District Header with Coordinator ONCE */}
                          <div
                            className="p-3 rounded-2xl border border-white/20 bg-slate-950/35 hover:bg-slate-950/50 backdrop-blur-md shadow-lg text-white transition-all"
                          >
                            <div className="flex items-center justify-between gap-2 mb-2">
                              <button
                                type="button"
                                onClick={() => {
                                  setFilterDistrito('');
                                  setViewMode('distritos');
                                }}
                                className="px-2.5 py-1 rounded-xl bg-white/10 hover:bg-white/20 backdrop-blur-md text-cyan-200 border border-cyan-400/40 text-xs font-bold flex items-center gap-1 active:scale-95 transition-all shadow-xs"
                              >
                                <ChevronLeft className="w-3.5 h-3.5" />
                                <span>31 Distritos</span>
                              </button>
                              <div className="flex items-center gap-1.5 min-w-0 flex-1 justify-center">
                                <MapPin className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                                <span className="text-xs font-bold tracking-tight truncate drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)]">{filterDistrito}</span>
                              </div>
                              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-black/40 text-cyan-300 border border-cyan-400/30 shrink-0">
                                {filteredMesas.length} {filteredMesas.length === 1 ? 'mesa' : 'mesas'}
                              </span>
                            </div>

                            {districtCoordinator && (
                              <div className="pt-2 border-t border-white/10 flex items-center justify-between gap-2">
                                <div className="min-w-0 flex-1">
                                  <span className="text-[9px] uppercase font-bold text-cyan-300 tracking-wider block drop-shadow-xs">
                                    ★ Coordinador Distrital
                                  </span>
                                  <p className="text-xs font-bold truncate drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)]">{districtCoordinator.nombre}</p>
                                  <p className="text-[11px] font-mono opacity-80 drop-shadow-xs">{districtCoordinator.telefono}</p>
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
                                    className="p-1 rounded-xl bg-emerald-600/30 hover:bg-emerald-600/40 border border-emerald-400/40 active:scale-95 transition-all flex items-center justify-center shadow-xs"
                                    title="WhatsApp al coordinador"
                                  >
                                    <WhatsAppAppIcon size={20} />
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
        <SupabaseBackupModal isOpen={showSupabaseModal} onClose={() => setShowSupabaseModal(false)} />
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
