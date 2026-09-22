import React, { useState, useEffect } from 'react';
import { Phone, Wifi, WifiOff } from 'lucide-react';
import { useElectoral } from '../context/ElectoralContext';
import { LISTA_31_DISTRITOS, DistritoInfo } from '../data/mockElectoralData';
import { WhatsAppAppIcon } from './WhatsAppAppIcon';

type ProvinciaFilter = 'TODOS' | 'Ica' | 'Nasca' | 'Palpa';

export const DistritosGrid: React.FC = () => {
  const {
    filterDistrito,
    setFilterDistrito,
    setViewMode,
    callContact,
    sendWhatsApp,
    mesas,
  } = useElectoral();

  const [isOnline, setIsOnline] = useState(typeof navigator !== 'undefined' ? navigator.onLine : true);
  const [selectedProvincia, setSelectedProvincia] = useState<ProvinciaFilter>('TODOS');

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

  const handleSelectDistrito = (dist: DistritoInfo) => {
    setFilterDistrito(dist.nombre);
    setViewMode('todas');
  };

  // Concise district name for ultra-slim display
  const getShortName = (nombre: string) => {
    return nombre
      .replace(' (Cercado)', '')
      .replace('San José de los Molinos', 'Los Molinos')
      .replace('San José de Los Molinos', 'Los Molinos')
      .replace('San Juan Bautista', 'San Juan B.')
      .replace('Yauca del Rosario', 'Yauca Rosario');
  };

  const filteredDistritos = selectedProvincia === 'TODOS'
    ? LISTA_31_DISTRITOS
    : LISTA_31_DISTRITOS.filter(d => d.provincia === selectedProvincia);

  const icaCount = LISTA_31_DISTRITOS.filter(d => d.provincia === 'Ica').length;
  const nascaCount = LISTA_31_DISTRITOS.filter(d => d.provincia === 'Nasca').length;
  const palpaCount = LISTA_31_DISTRITOS.filter(d => d.provincia === 'Palpa').length;

  return (
    <div className="w-full px-2 sm:px-3 space-y-1.5 pb-1">
      {/* Executive Header - Refined, Polished & Offline-Ready */}
      <div className="flex items-center justify-between px-1 py-0.5 text-white leading-none">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 px-2.5 py-1 rounded-lg bg-slate-950/35 border border-white/25 shadow-xs backdrop-blur-md">
            <span className="relative flex h-2 w-2">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${isOnline ? 'bg-emerald-400' : 'bg-amber-400'}`} />
              <span className={`relative inline-flex rounded-full h-2 w-2 ${isOnline ? 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,1)]' : 'bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,1)]'}`} />
            </span>
            <h2 className="text-[11px] font-black tracking-wide uppercase text-white flex items-center gap-1.5 drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">
              <span className="text-white font-black">31 Distritos a Cargo</span>
              <span className="text-cyan-400 font-black">•</span>
              <span className="text-cyan-300 font-extrabold tracking-wider">ODPE ICA</span>
            </h2>
          </div>
        </div>

        {/* Province Quick Filter Chips (Ica, Nasca, Palpa) */}
        <div className="flex items-center gap-1 bg-slate-950/40 p-0.5 rounded-lg border border-white/20 backdrop-blur-md">
          <button
            type="button"
            onClick={() => setSelectedProvincia('TODOS')}
            className={`px-2 py-0.5 rounded-md text-[9.5px] font-black transition-all ${
              selectedProvincia === 'TODOS'
                ? 'bg-cyan-500 text-slate-950 shadow-sm'
                : 'text-slate-300 hover:text-white hover:bg-white/10'
            }`}
          >
            TODOS (31)
          </button>
          <button
            type="button"
            onClick={() => setSelectedProvincia('Ica')}
            className={`px-2 py-0.5 rounded-md text-[9.5px] font-black transition-all ${
              selectedProvincia === 'Ica'
                ? 'bg-blue-500 text-white shadow-sm'
                : 'text-slate-300 hover:text-white hover:bg-white/10'
            }`}
          >
            ICA ({icaCount})
          </button>
          <button
            type="button"
            onClick={() => setSelectedProvincia('Nasca')}
            className={`px-2 py-0.5 rounded-md text-[9.5px] font-black transition-all ${
              selectedProvincia === 'Nasca'
                ? 'bg-amber-500 text-slate-950 shadow-sm'
                : 'text-slate-300 hover:text-white hover:bg-white/10'
            }`}
          >
            NASCA ({nascaCount})
          </button>
          <button
            type="button"
            onClick={() => setSelectedProvincia('Palpa')}
            className={`px-2 py-0.5 rounded-md text-[9.5px] font-black transition-all ${
              selectedProvincia === 'Palpa'
                ? 'bg-emerald-500 text-slate-950 shadow-sm'
                : 'text-slate-300 hover:text-white hover:bg-white/10'
            }`}
          >
            PALPA ({palpaCount})
          </button>
        </div>

        {/* Offline / Sin Señal Status Indicator */}
        <div
          title={isOnline ? 'Directorio 100% guardado localmente: funciona con o sin señal' : 'Modo sin señal activo: todos los distritos y teléfonos disponibles'}
          className={`flex items-center gap-1.5 px-2 py-1 rounded-lg text-[9px] font-bold border shadow-xs transition-all backdrop-blur-md ${
            isOnline
              ? 'bg-emerald-950/50 text-emerald-200 border-emerald-500/40'
              : 'bg-amber-950/60 text-amber-200 border-amber-500/50 animate-pulse'
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
              <span className="font-extrabold tracking-tight">Sin Señal (Activo)</span>
            </>
          )}
        </div>
      </div>

      {/* 31 DISTRICTS IN EXACT PROVINCIAL ORDER (ICA -> NASCA -> PALPA) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-1">
        {filteredDistritos.map((dist) => {
          const liveMesasCount = mesas.filter((m) => m.distrito === dist.nombre).length || dist.mesasCount;
          const isSelected = filterDistrito === dist.nombre;
          const shortName = getShortName(dist.nombre);
          const encargadoNombre = dist.coordinadorNombre.replace(/^(Lic\.|Ing\.|Prof\.|Mag\.|Abog\.)\s*/, '');

          // Provincial badge styling
          const provBadgeColor = dist.provincia === 'Ica'
            ? 'border-sky-400/40 text-sky-200'
            : dist.provincia === 'Nasca'
            ? 'border-amber-400/50 text-amber-200'
            : 'border-emerald-400/50 text-emerald-200';

          return (
            <div
              key={dist.id}
              id={`distrito-card-${dist.id}`}
              role="button"
              tabIndex={0}
              title={`${dist.nombre} (Provincia ${dist.provincia}) - ${liveMesasCount} mesas - Coordinador: ${dist.coordinadorNombre}`}
              onClick={() => handleSelectDistrito(dist)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  handleSelectDistrito(dist);
                }
              }}
              className={`group relative h-[34px] px-2 py-0.5 rounded-lg border flex items-center justify-between gap-1.5 transition-all duration-150 active:scale-95 cursor-pointer select-none shadow-sm ${
                isSelected
                  ? 'bg-cyan-500/25 border-cyan-300 ring-1.5 ring-cyan-300/80 text-white shadow-cyan-500/20 shadow-md backdrop-blur-md'
                  : 'bg-slate-950/35 hover:bg-slate-950/50 border-white/20 hover:border-cyan-300/80 text-white hover:shadow-md backdrop-blur-md'
              }`}
            >
              {/* Left Column: Mesas count (Cyan badge), District Name (Pure White) & Encargado (Warm Amber) */}
              <div className="min-w-0 flex-1 flex flex-col justify-center text-left leading-tight">
                <div className="flex items-center gap-1 min-w-0">
                  <span
                    title={`${liveMesasCount} mesas`}
                    className="text-[9px] font-mono font-black text-cyan-200 shrink-0 bg-black/40 px-1 py-0.2 rounded border border-cyan-400/40 shadow-xs"
                  >
                    {liveMesasCount}
                  </span>
                  <span className="text-[10.5px] font-black text-white truncate leading-tight drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)]">
                    {shortName}
                  </span>
                  <span
                    title={`Provincia de ${dist.provincia}`}
                    className={`text-[7.5px] font-bold uppercase px-1 py-0 rounded bg-black/35 border ${provBadgeColor} shrink-0 hidden sm:inline-block`}
                  >
                    {dist.provincia.slice(0, 3)}
                  </span>
                </div>
                <div className="text-[8.5px] font-semibold text-amber-200 truncate leading-none mt-0.5 drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)]">
                  {encargadoNombre}
                </div>
              </div>

              {/* Right Column: WhatsApp predeterminado (App icon exacto) & Llamada directa (Botón Azul vibrante) */}
              <div className="flex items-center gap-1 shrink-0">
                {/* Botón WhatsApp con icono oficial adjunto por el usuario */}
                <button
                  type="button"
                  title={`Enviar WhatsApp a ${dist.coordinadorNombre}`}
                  aria-label={`Enviar WhatsApp a ${dist.coordinadorNombre}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    sendWhatsApp(dist.coordinadorTelefono, dist.coordinadorNombre, 'Coordinador Distrital', dist.nombre);
                  }}
                  className="p-0.5 rounded-[7px] hover:scale-115 active:scale-95 transition-transform"
                >
                  <WhatsAppAppIcon size={19} />
                </button>

                {/* Botón de Llamada telefónica directa en azul/cian vibrante */}
                <button
                  type="button"
                  title={`Llamar a ${dist.coordinadorNombre}`}
                  aria-label={`Llamar a ${dist.coordinadorNombre}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    callContact(dist.coordinadorTelefono, dist.coordinadorNombre, 'Coordinador Distrital', dist.nombre);
                  }}
                  className="w-[19px] h-[19px] rounded-[6px] bg-gradient-to-b from-sky-400 to-blue-600 hover:from-sky-300 hover:to-blue-500 flex items-center justify-center shadow-xs text-white hover:scale-115 active:scale-95 transition-transform shrink-0"
                >
                  <Phone className="w-2.5 h-2.5 fill-white text-white" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
