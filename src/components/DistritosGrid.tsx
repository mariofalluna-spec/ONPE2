import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Phone, Wifi, WifiOff, Search, X, Users, Shield, PhoneCall, LayoutGrid, ChevronLeft, ChevronRight } from 'lucide-react';
import { useElectoral } from '../context/ElectoralContext';
import { LISTA_31_DISTRITOS, DistritoInfo } from '../data/mockElectoralData';
import { WhatsAppAppIcon } from './WhatsAppAppIcon';
import { getCLVsByDistrito, LISTA_CLV } from '../data/clvData';
import { getRLVsByDistrito, LISTA_RLV } from '../data/rlvData';
import { getCMsByDistrito, LISTA_CM } from '../data/cmData';

type RoleFilter = 'TODOS' | 'Coordinadores' | 'RLV' | 'CM';
type ProvinciaFilter = 'TODOS' | 'Ica' | 'Nasca' | 'Palpa';

interface PersonaSuggestion {
  id: string;
  nombre: string;
  rawNombre?: string;
  cargo: 'COORD' | 'CLV' | 'RLV' | 'CM';
  cargoLabel: string;
  distrito: string;
  provincia: string;
  telefono: string;
  distId?: number;
}

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
  const [roleFilter, setRoleFilter] = useState<RoleFilter>('TODOS');
  const [selectedProvincia, setSelectedProvincia] = useState<ProvinciaFilter>('TODOS');
  const [specificSearch, setSpecificSearch] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(-1);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const [activeRlvIndices, setActiveRlvIndices] = useState<Record<number, number>>({});
  const [activeCmIndices, setActiveCmIndices] = useState<Record<number, number>>({});

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

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelectDistrito = (dist: DistritoInfo) => {
    setFilterDistrito(dist.nombre);
    setViewMode('coordinadores');
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

  // Format: exactly one first name followed by the surname, in all uppercase (e.g. "ELMER ROJAS", "NANCY JURADO")
  const formatUnNombreLuegoApellido = (rawNombre: string): string => {
    if (!rawNombre) return '';
    const clean = rawNombre.replace(/^(Lic\.|Ing\.|Prof\.|Mag\.|Abog\.)\s*/i, '').trim();

    if (clean.includes(',')) {
      const [apellidosPart, nombresPart] = clean.split(',');
      const singleName = nombresPart ? nombresPart.trim().split(/\s+/)[0] : '';
      const apellido = apellidosPart ? apellidosPart.trim().split(/\s+/)[0] : '';
      return `${singleName} ${apellido}`.trim().toUpperCase();
    }

    const words = clean.split(/\s+/).filter(Boolean);
    if (words.length >= 2) {
      return `${words[0]} ${words[words.length - 1]}`.toUpperCase();
    }
    return clean.toUpperCase();
  };

  // Build unified searchable persona dataset for all electoral roles
  const allPersonas = useMemo<PersonaSuggestion[]>(() => {
    const list: PersonaSuggestion[] = [];

    // 1. Coordinadores Distritales (31)
    LISTA_31_DISTRITOS.forEach((d) => {
      list.push({
        id: `coord-${d.id}`,
        nombre: formatUnNombreLuegoApellido(d.coordinadorNombre),
        rawNombre: d.coordinadorNombre,
        cargo: 'COORD',
        cargoLabel: 'Coordinador Distrital',
        distrito: d.nombre,
        provincia: d.provincia,
        telefono: d.coordinadorTelefono,
        distId: d.id,
      });
    });

    // 2. Coordinadores de Local (CLV) (54)
    LISTA_CLV.forEach((c) => {
      list.push({
        id: c.id,
        nombre: c.nombreCompleto,
        cargo: 'CLV',
        cargoLabel: 'Coordinador de Local (CLV)',
        distrito: c.distrito,
        provincia: c.provincia,
        telefono: c.telefono,
      });
    });

    // 3. Responsables de Local (RLV) (94)
    LISTA_RLV.forEach((r) => {
      list.push({
        id: r.id,
        nombre: r.nombreCompleto,
        cargo: 'RLV',
        cargoLabel: 'Responsable de Local (RLV)',
        distrito: r.distrito,
        provincia: r.provincia,
        telefono: r.telefono,
      });
    });

    // 4. Coordinadores de Mesa (CM) (482)
    LISTA_CM.forEach((cm) => {
      list.push({
        id: cm.id,
        nombre: cm.nombreCompleto,
        cargo: 'CM',
        cargoLabel: 'Coordinador de Mesa (CM)',
        distrito: cm.distrito,
        provincia: cm.provincia,
        telefono: cm.telefono,
      });
    });

    return list;
  }, []);

  // Compute live name suggestions based on user input
  const personaSuggestions = useMemo<PersonaSuggestion[]>(() => {
    const q = specificSearch.trim().toLowerCase();
    if (!q || q.length < 2) return [];

    let pool = allPersonas;
    if (roleFilter === 'Coordinadores') {
      pool = allPersonas.filter((p) => p.cargo === 'COORD' || p.cargo === 'CLV');
    } else if (roleFilter === 'RLV') {
      // In RLV mode, permit searching RLV and also Coordinador Distrital as requested
      pool = allPersonas.filter((p) => p.cargo === 'RLV' || p.cargo === 'COORD');
    } else if (roleFilter === 'CM') {
      // In CM mode, permit searching CM and also Coordinador Distrital as requested
      pool = allPersonas.filter((p) => p.cargo === 'CM' || p.cargo === 'COORD');
    }

    const startsWithMatches: PersonaSuggestion[] = [];
    const wordStartsMatches: PersonaSuggestion[] = [];
    const containsMatches: PersonaSuggestion[] = [];

    for (const p of pool) {
      const lowerName = p.nombre.toLowerCase();
      const lowerRaw = (p.rawNombre || '').toLowerCase();
      const lowerDist = p.distrito.toLowerCase();
      const phone = p.telefono.replace(/\s+/g, '');

      if (lowerName.startsWith(q) || lowerRaw.startsWith(q)) {
        startsWithMatches.push(p);
      } else if (
        lowerName.split(/\s+/).some((w) => w.startsWith(q)) ||
        lowerRaw.split(/\s+/).some((w) => w.startsWith(q))
      ) {
        wordStartsMatches.push(p);
      } else if (lowerName.includes(q) || lowerRaw.includes(q) || lowerDist.includes(q) || phone.includes(q)) {
        containsMatches.push(p);
      }
    }

    const merged = [...startsWithMatches, ...wordStartsMatches, ...containsMatches];
    const unique = merged.filter((item, index, self) => index === self.findIndex((t) => t.id === item.id));
    return unique.slice(0, 8);
  }, [specificSearch, allPersonas, roleFilter]);

  const handleSelectSuggestion = (persona: PersonaSuggestion) => {
    setSpecificSearch(persona.nombre);
    setShowSuggestions(false);
    setSelectedSuggestionIndex(-1);

    // Switch role filter to match the selected persona
    if (persona.cargo === 'COORD' || persona.cargo === 'CLV') {
      setRoleFilter('Coordinadores');
    } else if (persona.cargo === 'RLV') {
      setRoleFilter('RLV');
    } else if (persona.cargo === 'CM') {
      setRoleFilter('CM');
    }

    // Ensure district is visible in province filter
    if (selectedProvincia !== 'TODOS' && selectedProvincia !== persona.provincia) {
      setSelectedProvincia('TODOS');
    }

    // If it's an RLV or CM, sync active stepper index
    const distMatch = LISTA_31_DISTRITOS.find((d) => d.nombre === persona.distrito);
    if (distMatch) {
      if (persona.cargo === 'RLV') {
        const rlvs = getRLVsByDistrito(persona.distrito);
        const idx = rlvs.findIndex((r) => r.nombreCompleto === persona.nombre || r.id === persona.id);
        if (idx !== -1) {
          setActiveRlvIndices((prev) => ({ ...prev, [distMatch.id]: idx }));
        }
      } else if (persona.cargo === 'CM') {
        const cms = getCMsByDistrito(persona.distrito);
        const idx = cms.findIndex((c) => c.nombreCompleto === persona.nombre || c.id === persona.id);
        if (idx !== -1) {
          setActiveCmIndices((prev) => ({ ...prev, [distMatch.id]: idx }));
        }
      }
    }
  };

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showSuggestions || personaSuggestions.length === 0) {
      if (e.key === 'ArrowDown' && personaSuggestions.length > 0) {
        setShowSuggestions(true);
        setSelectedSuggestionIndex(0);
        e.preventDefault();
      }
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedSuggestionIndex((prev) => (prev < personaSuggestions.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedSuggestionIndex((prev) => (prev > 0 ? prev - 1 : personaSuggestions.length - 1));
    } else if (e.key === 'Enter') {
      if (selectedSuggestionIndex >= 0 && selectedSuggestionIndex < personaSuggestions.length) {
        e.preventDefault();
        handleSelectSuggestion(personaSuggestions[selectedSuggestionIndex]);
      }
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
      setSelectedSuggestionIndex(-1);
    }
  };

  const handlePrevRlv = (e: React.MouseEvent, distId: number, maxCount: number) => {
    e.stopPropagation();
    setActiveRlvIndices((prev) => ({
      ...prev,
      [distId]: ((prev[distId] || 0) - 1 + maxCount) % maxCount,
    }));
  };

  const handleNextRlv = (e: React.MouseEvent, distId: number, maxCount: number) => {
    e.stopPropagation();
    setActiveRlvIndices((prev) => ({
      ...prev,
      [distId]: ((prev[distId] || 0) + 1) % maxCount,
    }));
  };

  const handlePrevCm = (e: React.MouseEvent, distId: number, maxCount: number) => {
    e.stopPropagation();
    setActiveCmIndices((prev) => ({
      ...prev,
      [distId]: ((prev[distId] || 0) - 1 + maxCount) % maxCount,
    }));
  };

  const handleNextCm = (e: React.MouseEvent, distId: number, maxCount: number) => {
    e.stopPropagation();
    setActiveCmIndices((prev) => ({
      ...prev,
      [distId]: ((prev[distId] || 0) + 1) % maxCount,
    }));
  };

  const getSearchPlaceholder = (role: RoleFilter) => {
    switch (role) {
      case 'Coordinadores':
        return 'Buscar Coordinador Distrital o CLV (ej: Carlos, Elmer, 956...)...';
      case 'RLV':
        return 'Buscar RLV o Coordinador Distrital (ej: Carlos, Nadia...)...';
      case 'CM':
        return 'Buscar CM o Coordinador Distrital (ej: Carlos, Indira...)...';
      default:
        return 'Buscar persona o distrito (ej: Carlos Carrera, Elmer Rojas, Los Aquijes)...';
    }
  };

  // Filtered districts list based on province, role filter, and specific search query
  const displayDistritosList = useMemo(() => {
    const query = specificSearch.toLowerCase().trim();

    // 1. Province filter
    const byProvincia = selectedProvincia === 'TODOS'
      ? LISTA_31_DISTRITOS
      : LISTA_31_DISTRITOS.filter(d => d.provincia === selectedProvincia);

    if (!query) {
      return byProvincia;
    }

    return byProvincia.filter((dist) => {
      const distNameMatches = dist.nombre.toLowerCase().includes(query) || dist.provincia.toLowerCase().includes(query);
      const coordName = formatUnNombreLuegoApellido(dist.coordinadorNombre).toLowerCase();
      const rawCoordName = (dist.coordinadorNombre || '').toLowerCase();
      const coordTel = (dist.coordinadorTelefono || '').toLowerCase();
      // Coordinator distrital matching: checks formatted name, raw name, and telephone
      const coordMatches = coordName.includes(query) || rawCoordName.includes(query) || coordTel.includes(query);

      const clvs = getCLVsByDistrito(dist.nombre);
      const clvMatches = clvs.some(c => c.nombreCompleto.toLowerCase().includes(query) || c.telefono.includes(query));

      const rlvs = getRLVsByDistrito(dist.nombre);
      const rlvMatches = rlvs.some(r => r.nombreCompleto.toLowerCase().includes(query) || r.telefono.includes(query));

      const cms = getCMsByDistrito(dist.nombre);
      const cmMatches = cms.some(c => c.nombreCompleto.toLowerCase().includes(query) || c.telefono.includes(query));

      // As requested: allow searching the Coordinador Distrital also in RLV and CM modes!
      if (roleFilter === 'Coordinadores') {
        return distNameMatches || coordMatches || clvMatches;
      }
      if (roleFilter === 'RLV') {
        return distNameMatches || rlvMatches || coordMatches;
      }
      if (roleFilter === 'CM') {
        return distNameMatches || cmMatches || coordMatches;
      }
      // TODOS
      return distNameMatches || coordMatches || clvMatches || rlvMatches || cmMatches;
    });
  }, [selectedProvincia, specificSearch, roleFilter]);

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

      {/* BARRA DE FILTROS RÁPIDOS Y BÚSQUEDA ESPECÍFICA */}
      <div
        id="distritos-quick-filters-bar"
        className="p-2 rounded-2xl bg-slate-950/45 border border-white/20 backdrop-blur-md space-y-1.5 shadow-md"
      >
        {/* Row 1: Role Segments + Province Quick Filter Chips */}
        <div className="flex items-center justify-between gap-1 flex-wrap">
          {/* Role Segment Pills: 'Todos', 'Coordinadores', 'RLV', 'CM' */}
          <div className="flex items-center gap-1 flex-wrap">
            <button
              type="button"
              id="filter-segment-todos"
              onClick={() => setRoleFilter('TODOS')}
              className={`px-2.5 py-1 rounded-lg text-[10px] font-black transition-all flex items-center gap-1 ${
                roleFilter === 'TODOS'
                  ? 'bg-white/30 text-white border border-white/50 shadow-xs'
                  : 'bg-white/5 text-white/70 hover:bg-white/15 hover:text-white'
              }`}
            >
              <LayoutGrid className="w-3 h-3" />
              <span>Todos</span>
            </button>

            <button
              type="button"
              id="filter-segment-coordinadores"
              onClick={() => setRoleFilter('Coordinadores')}
              className={`px-2.5 py-1 rounded-lg text-[10px] font-black transition-all flex items-center gap-1 ${
                roleFilter === 'Coordinadores'
                  ? 'bg-cyan-500 text-slate-950 shadow-xs ring-1 ring-cyan-300'
                  : 'bg-cyan-950/40 text-cyan-300 border border-cyan-500/30 hover:bg-cyan-900/40'
              }`}
            >
              <PhoneCall className="w-3 h-3" />
              <span>Coordinadores</span>
              <span className="text-[8.5px] px-1 py-0.2 rounded bg-black/30 opacity-90">31 + 54 CLV</span>
            </button>

            <button
              type="button"
              id="filter-segment-rlv"
              onClick={() => setRoleFilter('RLV')}
              className={`px-2.5 py-1 rounded-lg text-[10px] font-black transition-all flex items-center gap-1 ${
                roleFilter === 'RLV'
                  ? 'bg-indigo-500 text-white shadow-xs ring-1 ring-indigo-300'
                  : 'bg-indigo-950/40 text-indigo-300 border border-indigo-500/30 hover:bg-indigo-900/40'
              }`}
            >
              <Shield className="w-3 h-3" />
              <span>RLV</span>
              <span className="text-[8.5px] px-1 py-0.2 rounded bg-black/30 opacity-90">94</span>
            </button>

            <button
              type="button"
              id="filter-segment-cm"
              onClick={() => setRoleFilter('CM')}
              className={`px-2.5 py-1 rounded-lg text-[10px] font-black transition-all flex items-center gap-1 ${
                roleFilter === 'CM'
                  ? 'bg-amber-500 text-slate-950 shadow-xs ring-1 ring-amber-300 font-black'
                  : 'bg-amber-950/40 text-amber-300 border border-amber-500/30 hover:bg-amber-900/40'
              }`}
            >
              <Users className="w-3 h-3" />
              <span>CM</span>
              <span className="text-[8.5px] px-1 py-0.2 rounded bg-black/30 opacity-90">482</span>
            </button>
          </div>

          {/* Province Quick Filter Chips (Ica, Nasca, Palpa) */}
          <div className="flex items-center gap-0.5 bg-black/40 p-0.5 rounded-lg border border-white/15">
            <button
              type="button"
              onClick={() => setSelectedProvincia('TODOS')}
              className={`px-2 py-0.5 rounded-md text-[9px] font-black transition-all ${
                selectedProvincia === 'TODOS'
                  ? 'bg-cyan-500 text-slate-950 shadow-xs'
                  : 'text-slate-300 hover:text-white hover:bg-white/10'
              }`}
            >
              TODOS
            </button>
            <button
              type="button"
              onClick={() => setSelectedProvincia('Ica')}
              className={`px-1.5 py-0.5 rounded-md text-[9px] font-black transition-all ${
                selectedProvincia === 'Ica'
                  ? 'bg-sky-500 text-white shadow-xs'
                  : 'text-slate-300 hover:text-white hover:bg-white/10'
              }`}
            >
              ICA ({icaCount})
            </button>
            <button
              type="button"
              onClick={() => setSelectedProvincia('Nasca')}
              className={`px-1.5 py-0.5 rounded-md text-[9px] font-black transition-all ${
                selectedProvincia === 'Nasca'
                  ? 'bg-amber-500 text-slate-950 shadow-xs'
                  : 'text-slate-300 hover:text-white hover:bg-white/10'
              }`}
            >
              NASCA ({nascaCount})
            </button>
            <button
              type="button"
              onClick={() => setSelectedProvincia('Palpa')}
              className={`px-1.5 py-0.5 rounded-md text-[9px] font-black transition-all ${
                selectedProvincia === 'Palpa'
                  ? 'bg-emerald-500 text-slate-950 shadow-xs'
                  : 'text-slate-300 hover:text-white hover:bg-white/10'
              }`}
            >
              PALPA ({palpaCount})
            </button>
          </div>
        </div>

        {/* Row 2: Specific Search Input with Autocomplete Suggestions */}
        <div ref={searchContainerRef} className="relative">
          <div className="relative flex items-center">
            <Search className="w-3.5 h-3.5 absolute left-2.5 text-cyan-300 pointer-events-none" />
            <input
              type="text"
              id="distritos-specific-search-input"
              value={specificSearch}
              onFocus={() => setShowSuggestions(true)}
              onChange={(e) => {
                setSpecificSearch(e.target.value);
                setShowSuggestions(true);
                setSelectedSuggestionIndex(-1);
              }}
              onKeyDown={handleSearchKeyDown}
              placeholder={getSearchPlaceholder(roleFilter)}
              className="w-full pl-8 pr-20 py-1 text-xs rounded-lg bg-slate-900/90 border border-white/20 text-white placeholder-white/50 focus:outline-hidden focus:border-cyan-400"
            />
            <div className="absolute right-2 flex items-center gap-1.5">
              {specificSearch && (
                <button
                  type="button"
                  onClick={() => {
                    setSpecificSearch('');
                    setShowSuggestions(false);
                    setSelectedSuggestionIndex(-1);
                  }}
                  className="text-white/60 hover:text-white p-0.5"
                  title="Limpiar búsqueda específica"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
              <span className="text-[9.5px] font-mono font-bold text-cyan-300 bg-black/40 px-1.5 py-0.2 rounded border border-cyan-500/20">
                {displayDistritosList.length} dist
              </span>
            </div>
          </div>

          {/* Floating Auto-complete Suggestions Dropdown */}
          {showSuggestions && personaSuggestions.length > 0 && (
            <div
              id="search-suggestions-dropdown"
              className="absolute top-full left-0 right-0 mt-1 z-50 max-h-64 overflow-y-auto rounded-xl bg-slate-950/95 border border-cyan-400/50 shadow-2xl backdrop-blur-xl p-1 divide-y divide-white/10"
            >
              <div className="px-2 py-1 text-[9px] font-black uppercase text-cyan-300 flex items-center justify-between">
                <span>Personas encontradas ({personaSuggestions.length})</span>
                <span className="text-[8px] text-white/50 font-normal">Navega con ↑ ↓ y Enter</span>
              </div>

              {personaSuggestions.map((persona, index) => {
                const isHighlighted = index === selectedSuggestionIndex;
                const cargoBadge =
                  persona.cargo === 'COORD'
                    ? 'bg-cyan-500/25 text-cyan-300 border-cyan-400/50'
                    : persona.cargo === 'CLV'
                    ? 'bg-emerald-500/25 text-emerald-300 border-emerald-400/50'
                    : persona.cargo === 'RLV'
                    ? 'bg-indigo-500/25 text-indigo-300 border-indigo-400/50'
                    : 'bg-amber-500/25 text-amber-300 border-amber-400/50';

                return (
                  <div
                    key={persona.id}
                    onClick={() => handleSelectSuggestion(persona)}
                    className={`px-2 py-1.5 rounded-lg flex items-center justify-between gap-2 transition-all cursor-pointer select-none ${
                      isHighlighted
                        ? 'bg-cyan-500/25 border border-cyan-400/60'
                        : 'hover:bg-white/10 border border-transparent'
                    }`}
                  >
                    {/* Left: Persona name & district */}
                    <div className="min-w-0 flex-1 flex flex-col text-left">
                      <div className="flex items-center gap-1.5">
                        <span className={`text-[8px] font-black px-1.5 py-0.2 rounded border ${cargoBadge}`}>
                          {persona.cargo}
                        </span>
                        <span className="text-xs font-black text-white truncate tracking-wide">
                          {persona.nombre}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 text-[9.5px] text-white/70 mt-0.5">
                        <span className="text-cyan-200 font-semibold">{persona.distrito}</span>
                        <span>•</span>
                        <span className="text-white/50 font-mono text-[9px]">{persona.telefono}</span>
                      </div>
                    </div>

                    {/* Right: Instant Contact Buttons in Suggestion */}
                    <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
                      <button
                        type="button"
                        title={`Enviar WhatsApp a ${persona.nombre} (${persona.cargoLabel})`}
                        onClick={() => sendWhatsApp(persona.telefono, persona.nombre, persona.cargoLabel, persona.distrito)}
                        className="p-0.5 rounded-[6px] hover:scale-115 active:scale-95 transition-transform"
                      >
                        <WhatsAppAppIcon size={18} />
                      </button>
                      <button
                        type="button"
                        title={`Llamar a ${persona.nombre} (${persona.cargoLabel})`}
                        onClick={() => callContact(persona.telefono, persona.nombre, persona.cargoLabel, persona.distrito)}
                        className="w-[18px] h-[18px] rounded-[5px] bg-gradient-to-b from-sky-400 to-blue-600 hover:from-sky-300 hover:to-blue-500 flex items-center justify-center text-white hover:scale-115 active:scale-95 transition-transform"
                      >
                        <Phone className="w-2.5 h-2.5 fill-white text-white" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* 31 DISTRICTS IN EXACT PROVINCIAL ORDER (ICA -> NASCA -> PALPA) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-1">
        {displayDistritosList.map((dist) => {
          const liveMesasCount = mesas.filter((m) => m.distrito === dist.nombre).length || dist.mesasCount;
          const isSelected = filterDistrito === dist.nombre;
          const shortName = getShortName(dist.nombre);
          const encargadoNombre = formatUnNombreLuegoApellido(dist.coordinadorNombre);
          const clvs = getCLVsByDistrito(dist.nombre);
          const rlvs = getRLVsByDistrito(dist.nombre);
          const cms = getCMsByDistrito(dist.nombre);

          // Provincial badge styling
          const provBadgeColor = dist.provincia === 'Ica'
            ? 'border-sky-400/40 text-sky-200'
            : dist.provincia === 'Nasca'
            ? 'border-amber-400/50 text-amber-200'
            : 'border-emerald-400/50 text-emerald-200';

          // Selection of active contact based on role filter and specific search
          const query = specificSearch.toLowerCase().trim();

          // For RLV: find matching RLV or use stepper index
          const searchRlvIdx = query ? rlvs.findIndex(r => r.nombreCompleto.toLowerCase().includes(query) || r.telefono.includes(query)) : -1;
          const currentRlvIdx = searchRlvIdx !== -1 ? searchRlvIdx : ((activeRlvIndices[dist.id] || 0) % (rlvs.length || 1));
          const currentRlv = rlvs[currentRlvIdx];

          // For CM: find matching CM or use stepper index
          const searchCmIdx = query ? cms.findIndex(c => c.nombreCompleto.toLowerCase().includes(query) || c.telefono.includes(query)) : -1;
          const currentCmIdx = searchCmIdx !== -1 ? searchCmIdx : ((activeCmIndices[dist.id] || 0) % (cms.length || 1));
          const currentCm = cms[currentCmIdx];

          // Determine who gets contacted via the buttons
          let contactNombre = encargadoNombre;
          let contactTelefono = dist.coordinadorTelefono;
          let contactRoleLabel = 'Coordinador Distrital';

          if (roleFilter === 'RLV' && currentRlv) {
            contactNombre = currentRlv.nombreCompleto;
            contactTelefono = currentRlv.telefono;
            contactRoleLabel = 'RLV';
          } else if (roleFilter === 'CM' && currentCm) {
            contactNombre = currentCm.nombreCompleto;
            contactTelefono = currentCm.telefono;
            contactRoleLabel = 'CM';
          }

          return (
            <div
              key={dist.id}
              id={`distrito-card-${dist.id}`}
              role="button"
              tabIndex={0}
              title={`Ver personal de ${dist.nombre} (${clvs.length} CLV, ${rlvs.length} RLV, ${cms.length} CM y Coordinador)`}
              onClick={() => handleSelectDistrito(dist)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  handleSelectDistrito(dist);
                }
              }}
              className={`group relative min-h-[38px] px-2 py-1 rounded-lg border flex items-center justify-between gap-1.5 transition-all duration-150 active:scale-95 cursor-pointer select-none shadow-sm ${
                isSelected
                  ? 'bg-cyan-500/25 border-cyan-300 ring-1.5 ring-cyan-300/80 text-white shadow-cyan-500/20 shadow-md backdrop-blur-md'
                  : 'bg-slate-950/35 hover:bg-slate-950/50 border-white/20 hover:border-cyan-300/80 text-white hover:shadow-md backdrop-blur-md'
              }`}
            >
              {/* Left Column: District Info + Specific Role Personnel */}
              <div className="min-w-0 flex-1 flex flex-col justify-center text-left leading-tight">
                {/* Top Row: Mesas badge, District Name, and Province or Role Badge */}
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

                  {/* Segment-specific Header Badges */}
                  {roleFilter === 'TODOS' && (
                    <span
                      title={`Provincia de ${dist.provincia}`}
                      className={`text-[7.5px] font-bold uppercase px-1 py-0 rounded bg-black/35 border ${provBadgeColor} shrink-0 hidden sm:inline-block`}
                    >
                      {dist.provincia.slice(0, 3)}
                    </span>
                  )}
                  {roleFilter === 'Coordinadores' && clvs.length > 0 && (
                    <span
                      title={`${clvs.length} Coordinadores de Local (CLV)`}
                      className="text-[7.5px] font-black text-emerald-300 bg-emerald-950/60 px-1 py-0.2 rounded border border-emerald-500/40 shrink-0"
                    >
                      {clvs.length} CLV
                    </span>
                  )}
                  {roleFilter === 'RLV' && (
                    <span
                      title={`${rlvs.length} Responsables de Local (RLV)`}
                      className="text-[7.5px] font-black text-indigo-300 bg-indigo-950/60 px-1 py-0.2 rounded border border-indigo-500/40 shrink-0"
                    >
                      {rlvs.length} RLV
                    </span>
                  )}
                  {roleFilter === 'CM' && (
                    <span
                      title={`${cms.length} Coordinadores de Mesa (CM)`}
                      className="text-[7.5px] font-black text-amber-300 bg-amber-950/60 px-1 py-0.2 rounded border border-amber-500/40 shrink-0"
                    >
                      {cms.length} CM
                    </span>
                  )}
                </div>

                {/* Bottom Row: Role Persona with Single Name + Uppercase Surname & Stepper if multiple */}
                <div className="flex items-center gap-1 leading-none mt-0.5 min-w-0">
                  {/* CASE 1: TODOS or COORDINADORES */}
                  {(roleFilter === 'TODOS' || roleFilter === 'Coordinadores') && (
                    <>
                      <span className="text-[8.5px] font-bold uppercase tracking-wider text-amber-200 truncate drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)]">
                        {encargadoNombre}
                      </span>
                      {roleFilter === 'TODOS' && clvs.length > 0 && (
                        <span
                          title={`${clvs.length} CLV asignados`}
                          className="text-[7.5px] font-black text-emerald-300 bg-emerald-950/60 px-1 py-0.2 rounded border border-emerald-500/40 shrink-0"
                        >
                          {clvs.length} CLV
                        </span>
                      )}
                    </>
                  )}

                  {/* CASE 2: RLV SEGMENT */}
                  {roleFilter === 'RLV' && (
                    <div className="flex items-center gap-1 min-w-0 flex-1">
                      {currentRlv ? (
                        <>
                          <span className="text-[8.5px] font-bold uppercase tracking-wider text-indigo-200 truncate drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)]">
                            {currentRlv.nombreCompleto}
                          </span>
                          {rlvs.length > 1 && (
                            <div
                              onClick={(e) => e.stopPropagation()}
                              className="flex items-center gap-0.5 shrink-0 bg-black/40 px-1 py-0 rounded border border-indigo-500/30 text-[7px] text-indigo-300"
                            >
                              <button
                                type="button"
                                title="RLV anterior"
                                onClick={(e) => handlePrevRlv(e, dist.id, rlvs.length)}
                                className="hover:text-white p-0.5"
                              >
                                <ChevronLeft className="w-2.5 h-2.5" />
                              </button>
                              <span className="font-mono font-bold">
                                {currentRlvIdx + 1}/{rlvs.length}
                              </span>
                              <button
                                type="button"
                                title="Siguiente RLV"
                                onClick={(e) => handleNextRlv(e, dist.id, rlvs.length)}
                                className="hover:text-white p-0.5"
                              >
                                <ChevronRight className="w-2.5 h-2.5" />
                              </button>
                            </div>
                          )}
                        </>
                      ) : (
                        <span className="text-[8px] text-white/50 italic">
                          Sin RLV asignado
                        </span>
                      )}
                    </div>
                  )}

                  {/* CASE 3: CM SEGMENT */}
                  {roleFilter === 'CM' && (
                    <div className="flex items-center gap-1 min-w-0 flex-1">
                      {currentCm ? (
                        <>
                          <span className="text-[8.5px] font-bold uppercase tracking-wider text-amber-200 truncate drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)]">
                            {currentCm.nombreCompleto}
                          </span>
                          {cms.length > 1 && (
                            <div
                              onClick={(e) => e.stopPropagation()}
                              className="flex items-center gap-0.5 shrink-0 bg-black/40 px-1 py-0 rounded border border-amber-500/30 text-[7px] text-amber-300"
                            >
                              <button
                                type="button"
                                title="CM anterior"
                                onClick={(e) => handlePrevCm(e, dist.id, cms.length)}
                                className="hover:text-white p-0.5"
                              >
                                <ChevronLeft className="w-2.5 h-2.5" />
                              </button>
                              <span className="font-mono font-bold">
                                {currentCmIdx + 1}/{cms.length}
                              </span>
                              <button
                                type="button"
                                title="Siguiente CM"
                                onClick={(e) => handleNextCm(e, dist.id, cms.length)}
                                className="hover:text-white p-0.5"
                              >
                                <ChevronRight className="w-2.5 h-2.5" />
                              </button>
                            </div>
                          )}
                        </>
                      ) : (
                        <span className="text-[8px] text-white/50 italic">
                          Sin CM asignado
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Right Column: Direct 1-Touch WhatsApp & Phone Call for the active person in this segment */}
              <div className="flex items-center gap-1 shrink-0">
                {/* WhatsApp Button */}
                <button
                  type="button"
                  title={`Enviar WhatsApp a ${contactNombre} (${contactRoleLabel})`}
                  aria-label={`Enviar WhatsApp a ${contactNombre}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    sendWhatsApp(contactTelefono, contactNombre, contactRoleLabel, dist.nombre);
                  }}
                  className="p-0.5 rounded-[7px] hover:scale-115 active:scale-95 transition-transform"
                >
                  <WhatsAppAppIcon size={19} />
                </button>

                {/* Direct Call Button */}
                <button
                  type="button"
                  title={`Llamar a ${contactNombre} (${contactRoleLabel})`}
                  aria-label={`Llamar a ${contactNombre}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    callContact(contactTelefono, contactNombre, contactRoleLabel, dist.nombre);
                  }}
                  className={`w-[19px] h-[19px] rounded-[6px] flex items-center justify-center shadow-xs text-white hover:scale-115 active:scale-95 transition-transform shrink-0 ${
                    roleFilter === 'RLV'
                      ? 'bg-gradient-to-b from-indigo-400 to-purple-600 hover:from-indigo-300 hover:to-purple-500'
                      : roleFilter === 'CM'
                      ? 'bg-gradient-to-b from-amber-400 to-orange-600 hover:from-amber-300 hover:to-orange-500'
                      : 'bg-gradient-to-b from-sky-400 to-blue-600 hover:from-sky-300 hover:to-blue-500'
                  }`}
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
