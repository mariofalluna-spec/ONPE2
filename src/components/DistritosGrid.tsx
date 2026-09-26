import React, { useState, useEffect, useMemo } from 'react';
import {
  Phone,
  Wifi,
  WifiOff,
  Search,
  X,
  Users,
  Shield,
  PhoneCall,
  LayoutGrid,
  ChevronLeft,
  ChevronRight,
  UserCheck,
  Building,
  User,
  MapPin,
  Sparkles,
  RotateCcw,
} from 'lucide-react';
import { useElectoral } from '../context/ElectoralContext';
import { LISTA_31_DISTRITOS, DistritoInfo } from '../data/mockElectoralData';
import { WhatsAppAppIcon } from './WhatsAppAppIcon';
import { getCLVsByDistrito, LISTA_CLV } from '../data/clvData';
import { getRLVsByDistrito, LISTA_RLV } from '../data/rlvData';
import { getCMsByDistrito, LISTA_CM } from '../data/cmData';
import { getARAsByDistrito, LISTA_ARA } from '../data/araData';

type RoleFilter = 'TODOS' | 'CD' | 'CLV' | 'RLV' | 'CM' | 'ARA';
type ProvinciaFilter = 'TODOS' | 'Ica' | 'Nasca' | 'Palpa';
type SearchResultsTab = 'personas' | 'distritos';

interface PersonaSuggestion {
  id: string;
  nombre: string;
  rawNombre?: string;
  cargo: 'COORD' | 'CLV' | 'RLV' | 'CM' | 'ARA';
  cargoLabel: string;
  distrito: string;
  provincia: string;
  telefono: string;
  localVotacion?: string;
  distId?: number;
}

// Format short name for district display matching mobile overview
const getDistrictDisplayName = (nombre: string) => {
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
  const [searchResultsTab, setSearchResultsTab] = useState<SearchResultsTab>('personas');
  const [clvViewMode, setClvViewMode] = useState<'desplegado' | 'tarjetas'>('desplegado');
  const [activeClvIndices, setActiveClvIndices] = useState<Record<number, number>>({});
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

  const handleSelectDistrito = (dist: DistritoInfo) => {
    setFilterDistrito(dist.nombre);
    setViewMode('coordinadores');
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
        localVotacion: d.localPrincipal,
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
        localVotacion: c.localVotacion,
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
        localVotacion: r.localVotacion,
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
        localVotacion: cm.localVotacion,
      });
    });

    // 5. Auxiliares para Repliegue de Actas (ARA) (116)
    LISTA_ARA.forEach((ara) => {
      list.push({
        id: ara.id,
        nombre: ara.nombreCompleto,
        cargo: 'ARA',
        cargoLabel: 'Auxiliar Repliegue de Actas (ARA)',
        distrito: ara.distrito,
        provincia: ara.provincia,
        telefono: ara.telefono,
        localVotacion: ara.lugar || ara.distrito,
      });
    });

    const PROVINCIA_ORDER: Record<string, number> = {
      'Ica': 1,
      'Nasca': 2,
      'Palpa': 3,
    };

    // Sort by official Province order (Ica -> Nasca -> Palpa), then District
    list.sort((a, b) => {
      const pA = PROVINCIA_ORDER[a.provincia] || 99;
      const pB = PROVINCIA_ORDER[b.provincia] || 99;
      if (pA !== pB) return pA - pB;
      const dA = LISTA_31_DISTRITOS.find((d) => d.nombre === a.distrito)?.id || 999;
      const dB = LISTA_31_DISTRITOS.find((d) => d.nombre === b.distrito)?.id || 999;
      return dA - dB;
    });

    return list;
  }, []);

  // Filtered Personas when searching
  const matchedPersonas = useMemo<PersonaSuggestion[]>(() => {
    const query = specificSearch.toLowerCase().trim();
    if (!query) return [];

    return allPersonas.filter((p) => {
      // Role filter
      if (roleFilter === 'CD' && p.cargo !== 'COORD') return false;
      if (roleFilter === 'CLV' && p.cargo !== 'CLV') return false;
      if (roleFilter === 'RLV' && p.cargo !== 'RLV') return false;
      if (roleFilter === 'CM' && p.cargo !== 'CM') return false;
      if (roleFilter === 'ARA' && p.cargo !== 'ARA') return false;

      // Province filter
      if (selectedProvincia !== 'TODOS' && p.provincia !== selectedProvincia) return false;

      const lowerName = p.nombre.toLowerCase();
      const lowerRaw = (p.rawNombre || '').toLowerCase();
      const lowerDist = p.distrito.toLowerCase();
      const lowerProv = p.provincia.toLowerCase();
      const lowerLocal = (p.localVotacion || '').toLowerCase();
      const phone = p.telefono.replace(/\s+/g, '');

      return (
        lowerName.includes(query) ||
        lowerRaw.includes(query) ||
        lowerDist.includes(query) ||
        lowerProv.includes(query) ||
        lowerLocal.includes(query) ||
        phone.includes(query)
      );
    });
  }, [allPersonas, specificSearch, roleFilter, selectedProvincia]);

  const handlePrevClv = (e: React.MouseEvent, distId: number, maxCount: number) => {
    e.stopPropagation();
    setActiveClvIndices((prev) => ({
      ...prev,
      [distId]: ((prev[distId] || 0) - 1 + maxCount) % maxCount,
    }));
  };

  const handleNextClv = (e: React.MouseEvent, distId: number, maxCount: number) => {
    e.stopPropagation();
    setActiveClvIndices((prev) => ({
      ...prev,
      [distId]: ((prev[distId] || 0) + 1) % maxCount,
    }));
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
      case 'CD':
        return 'Buscar Coordinador Distrital (ej: Elmer Rojas, 953...)...';
      case 'CLV':
        return 'Buscar CLV o local (ej: Alex Alfaro, San Miguel...)...';
      case 'RLV':
        return 'Buscar RLV o local (ej: Daniel Echegaray...)...';
      case 'CM':
        return 'Buscar CM o coordinador (ej: Nayeli Flores, Carlos...)...';
      default:
        return 'Buscar persona por nombre, cargo, colegio o teléfono...';
    }
  };

  // Filtered districts list based on province, role filter, and specific search query
  const displayDistritosList = useMemo(() => {
    const query = specificSearch.toLowerCase().trim();

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
      const coordMatches = coordName.includes(query) || rawCoordName.includes(query) || coordTel.includes(query);

      const clvs = getCLVsByDistrito(dist.nombre);
      const clvMatches = clvs.some(c => c.nombreCompleto.toLowerCase().includes(query) || c.telefono.includes(query) || (c.localVotacion && c.localVotacion.toLowerCase().includes(query)));

      const rlvs = getRLVsByDistrito(dist.nombre);
      const rlvMatches = rlvs.some(r => r.nombreCompleto.toLowerCase().includes(query) || r.telefono.includes(query) || (r.localVotacion && r.localVotacion.toLowerCase().includes(query)));

      const cms = getCMsByDistrito(dist.nombre);
      const cmMatches = cms.some(c => c.nombreCompleto.toLowerCase().includes(query) || c.telefono.includes(query));

      if (roleFilter === 'CD') {
        return distNameMatches || coordMatches;
      }
      if (roleFilter === 'CLV') {
        return distNameMatches || clvMatches || coordMatches;
      }
      if (roleFilter === 'RLV') {
        return distNameMatches || rlvMatches || coordMatches;
      }
      if (roleFilter === 'CM') {
        return distNameMatches || cmMatches || coordMatches;
      }
      return distNameMatches || coordMatches || clvMatches || rlvMatches || cmMatches;
    });
  }, [selectedProvincia, specificSearch, roleFilter]);

  const icaCount = LISTA_31_DISTRITOS.filter(d => d.provincia === 'Ica').length;
  const nascaCount = LISTA_31_DISTRITOS.filter(d => d.provincia === 'Nasca').length;
  const palpaCount = LISTA_31_DISTRITOS.filter(d => d.provincia === 'Palpa').length;

  const isSearchActive = specificSearch.trim().length > 0;

  return (
    <div className="w-full px-2 sm:px-3 space-y-1 pb-2">
      {/* Search Input with micro filter chips */}
      <div
        id="distritos-quick-filters-bar"
        className="p-1.5 rounded-2xl bg-slate-950/75 border border-white/20 backdrop-blur-md shadow-md space-y-1"
      >
        <div className="relative flex items-center">
          <Search className="w-3.5 h-3.5 absolute left-2.5 text-cyan-300 pointer-events-none" />
          <input
            type="text"
            id="distritos-specific-search-input"
            value={specificSearch}
            onChange={(e) => setSpecificSearch(e.target.value)}
            placeholder="Buscar por distrito, coordinador, local o teléfono..."
            className="w-full pl-8 pr-20 py-1.5 text-xs sm:text-sm rounded-xl bg-slate-900/95 border border-white/20 text-white placeholder-white/50 focus:outline-hidden focus:border-cyan-400 shadow-inner"
          />
          <div className="absolute right-2 flex items-center gap-1.5">
            {isSearchActive && (
              <button
                type="button"
                onClick={() => setSpecificSearch('')}
                className="text-white/70 hover:text-white p-1 rounded-md hover:bg-white/15 active:scale-95 transition-all"
                title="Limpiar búsqueda"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Unified & Compact Micro Filter Toolbar - Always fully visible */}
        <div className="flex flex-wrap items-center justify-between gap-1.5 px-1.5 py-1 rounded-xl bg-slate-950/80 border border-white/15 backdrop-blur-md text-[8.5px] sm:text-[9px]">
          {/* Left Group: Strong RED 'TODOS' Reset & Roles */}
          <div className="flex items-center gap-1 flex-wrap">
            <button
              type="button"
              id="filter-btn-todos-rojo"
              onClick={() => {
                setRoleFilter('TODOS');
                setSelectedProvincia('TODOS');
                setSpecificSearch('');
              }}
              className={`px-2 py-0.5 rounded-md font-black tracking-wider uppercase transition-all flex items-center gap-1 active:scale-95 cursor-pointer select-none shadow-sm ${
                roleFilter === 'TODOS' && selectedProvincia === 'TODOS' && !isSearchActive
                  ? 'bg-gradient-to-r from-red-600 via-rose-600 to-red-600 text-white ring-1.5 ring-red-400 shadow-red-600/60'
                  : 'bg-red-600/90 hover:bg-red-500 text-white ring-1 ring-red-400/80'
              }`}
              title="Mostrar todos los 31 distritos sin filtros"
            >
              <span>TODOS</span>
              <span className="text-[7px] bg-black/40 px-1 py-0.1 rounded font-mono font-bold">31</span>
            </button>

            {/* Roles Micro Chips: Clean text & numbers */}
            <button
              type="button"
              id="micro-filter-clv"
              onClick={() => setRoleFilter(prev => prev === 'CLV' ? 'TODOS' : 'CLV')}
              className={`px-1.5 py-0.5 rounded text-[8px] sm:text-[8.5px] font-black transition-all flex items-center gap-1 active:scale-95 cursor-pointer ${
                roleFilter === 'CLV'
                  ? 'bg-emerald-500 text-slate-950 ring-1 ring-emerald-300 font-black shadow-xs'
                  : 'bg-emerald-950/60 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-900/60'
              }`}
              title={`${LISTA_CLV.length} Coordinadores de Local de Votación (CLV)`}
            >
              <span>CLV</span>
              <span className="text-[7px] px-0.5 rounded bg-black/40 font-mono font-bold opacity-90">{LISTA_CLV.length}</span>
            </button>

            <button
              type="button"
              id="micro-filter-rlv"
              onClick={() => setRoleFilter(prev => prev === 'RLV' ? 'TODOS' : 'RLV')}
              className={`px-1.5 py-0.5 rounded text-[8px] sm:text-[8.5px] font-black transition-all flex items-center gap-1 active:scale-95 cursor-pointer ${
                roleFilter === 'RLV'
                  ? 'bg-indigo-500 text-white ring-1 ring-indigo-300 font-black shadow-xs'
                  : 'bg-indigo-950/60 text-indigo-300 border border-indigo-500/40 hover:bg-indigo-900/60'
              }`}
              title={`${LISTA_RLV.length} Responsables de Local de Votación (RLV)`}
            >
              <span>RLV</span>
              <span className="text-[7px] px-0.5 rounded bg-black/40 font-mono font-bold opacity-90">{LISTA_RLV.length}</span>
            </button>

            <button
              type="button"
              id="micro-filter-cm"
              onClick={() => setRoleFilter(prev => prev === 'CM' ? 'TODOS' : 'CM')}
              className={`px-1.5 py-0.5 rounded text-[8px] sm:text-[8.5px] font-black transition-all flex items-center gap-1 active:scale-95 cursor-pointer ${
                roleFilter === 'CM'
                  ? 'bg-amber-500 text-slate-950 ring-1 ring-amber-300 font-black shadow-xs'
                  : 'bg-amber-950/60 text-amber-300 border border-amber-500/40 hover:bg-amber-900/60'
              }`}
              title={`${LISTA_CM.length} Coordinadores de Mesa (CM)`}
            >
              <span>CM</span>
              <span className="text-[7px] px-0.5 rounded bg-black/40 font-mono font-bold opacity-90">{LISTA_CM.length}</span>
            </button>

            <button
              type="button"
              id="micro-filter-ara"
              onClick={() => setRoleFilter(prev => prev === 'ARA' ? 'TODOS' : 'ARA')}
              className={`px-1.5 py-0.5 rounded text-[8px] sm:text-[8.5px] font-black transition-all flex items-center gap-1 active:scale-95 cursor-pointer ${
                roleFilter === 'ARA'
                  ? 'bg-rose-500 text-white ring-1 ring-rose-300 font-black shadow-xs'
                  : 'bg-rose-950/60 text-rose-300 border border-rose-500/40 hover:bg-rose-900/60'
              }`}
              title={`${LISTA_ARA.length} Auxiliares para Repliegue de Actas (ARA)`}
            >
              <span>ARA</span>
              <span className="text-[7px] px-0.5 rounded bg-black/40 font-mono font-bold opacity-90">{LISTA_ARA.length}</span>
            </button>
          </div>

          {/* Right Group: Provinces Micro Chips (ICA, NASCA, PALPA) */}
          <div className="flex items-center gap-1 bg-black/50 p-0.5 rounded-lg border border-white/15 shrink-0">
            <button
              type="button"
              onClick={() => setSelectedProvincia(prev => prev === 'Ica' ? 'TODOS' : 'Ica')}
              className={`px-2 py-0.5 rounded text-[8.5px] font-black transition-all active:scale-95 cursor-pointer ${
                selectedProvincia === 'Ica'
                  ? 'bg-sky-500 text-white ring-1.5 ring-sky-300 shadow-xs'
                  : 'text-sky-300 hover:text-white hover:bg-white/10'
              }`}
              title="Filtrar provincia de Ica (20 distritos)"
            >
              ICA ({icaCount})
            </button>
            <button
              type="button"
              onClick={() => setSelectedProvincia(prev => prev === 'Nasca' ? 'TODOS' : 'Nasca')}
              className={`px-2 py-0.5 rounded text-[8.5px] font-black transition-all active:scale-95 cursor-pointer ${
                selectedProvincia === 'Nasca'
                  ? 'bg-amber-500 text-slate-950 ring-1.5 ring-amber-300 shadow-xs'
                  : 'text-amber-300 hover:text-white hover:bg-white/10'
              }`}
              title="Filtrar provincia de Nasca (6 distritos)"
            >
              NASCA ({nascaCount})
            </button>
            <button
              type="button"
              onClick={() => setSelectedProvincia(prev => prev === 'Palpa' ? 'TODOS' : 'Palpa')}
              className={`px-2 py-0.5 rounded text-[8.5px] font-black transition-all active:scale-95 cursor-pointer ${
                selectedProvincia === 'Palpa'
                  ? 'bg-emerald-500 text-slate-950 ring-1.5 ring-emerald-300 shadow-xs'
                  : 'text-emerald-300 hover:text-white hover:bg-white/10'
              }`}
              title="Filtrar provincia de Palpa (5 distritos)"
            >
              PALPA ({palpaCount})
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* CASE A: SEARCH ACTIVE -> DEDICATED, UNIFIED NATURAL SCROLL RESULTS VIEW   */}
      {/* (NO background distritos showing through, NO floating popup, NO double scroll) */}
      {/* ========================================================================= */}
      {isSearchActive ? (
        <div className="space-y-2 pt-0.5">
          {/* Results Summary Bar & Clean Mode Switcher */}
          <div className="flex items-center justify-between gap-2 p-2.5 rounded-xl bg-slate-950/80 border border-cyan-400/50 backdrop-blur-md text-white shadow-md">
            <div className="flex items-center gap-2 min-w-0">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse shrink-0" />
              <div className="min-w-0">
                <h3 className="text-xs sm:text-sm font-black truncate text-cyan-200">
                  Resultados: "{specificSearch}"
                </h3>
                <p className="text-[10px] text-white/80 truncate">
                  {matchedPersonas.length} {matchedPersonas.length === 1 ? 'persona encontrada' : 'personas encontradas'} en el directorio
                </p>
              </div>
            </div>

            {/* View Tab Switcher */}
            <div className="flex items-center gap-1 bg-black/50 p-0.5 rounded-lg border border-white/15 shrink-0">
              <button
                type="button"
                onClick={() => setSearchResultsTab('personas')}
                className={`px-2.5 py-1 rounded-md text-[10px] font-black transition-all flex items-center gap-1 ${
                  searchResultsTab === 'personas'
                    ? 'bg-cyan-500 text-slate-950 shadow-xs'
                    : 'text-white/70 hover:text-white'
                }`}
              >
                <User className="w-3 h-3" />
                <span>Personas ({matchedPersonas.length})</span>
              </button>
              <button
                type="button"
                onClick={() => setSearchResultsTab('distritos')}
                className={`px-2.5 py-1 rounded-md text-[10px] font-black transition-all flex items-center gap-1 ${
                  searchResultsTab === 'distritos'
                    ? 'bg-cyan-500 text-slate-950 shadow-xs'
                    : 'text-white/70 hover:text-white'
                }`}
              >
                <MapPin className="w-3 h-3" />
                <span>Distritos ({displayDistritosList.length})</span>
              </button>
            </div>
          </div>

          {/* TAB 1: PERSONAS DIRECT RESULTS LIST (CLEAR, FULL CARDS, NO BLOCKING) */}
          {searchResultsTab === 'personas' && (
            <div className="space-y-1.5">
              {matchedPersonas.length > 0 ? (
                matchedPersonas.map((persona) => {
                  const cargoBadge =
                    persona.cargo === 'COORD'
                      ? 'bg-cyan-500/25 text-cyan-300 border-cyan-400/50'
                      : persona.cargo === 'CLV'
                      ? 'bg-emerald-500/25 text-emerald-300 border-emerald-400/50'
                      : persona.cargo === 'RLV'
                      ? 'bg-indigo-500/25 text-indigo-300 border-indigo-400/50'
                      : 'bg-amber-500/25 text-amber-300 border-amber-400/50';

                  const provBadgeColor =
                    persona.provincia === 'Ica'
                      ? 'border-sky-400/40 text-sky-200'
                      : persona.provincia === 'Nasca'
                      ? 'border-amber-400/50 text-amber-200'
                      : 'border-emerald-400/50 text-emerald-200';

                  return (
                    <div
                      key={persona.id}
                      className="fast-list-item p-2.5 sm:p-3 rounded-2xl border border-white/20 hover:border-cyan-300/80 bg-slate-950/80 hover:bg-slate-950/95 text-white backdrop-blur-md shadow-md transition-all flex items-center justify-between gap-3"
                    >
                      {/* Left: Persona Details */}
                      <div className="min-w-0 flex-1 space-y-1 text-left">
                        {/* Cargo & District Tags */}
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-md border ${cargoBadge}`}>
                            {persona.cargoLabel}
                          </span>
                          <span className={`text-[8.5px] font-bold uppercase px-1.5 py-0.5 rounded bg-black/50 border ${provBadgeColor}`}>
                            {persona.distrito} ({persona.provincia})
                          </span>
                        </div>

                        {/* Full Name in Large Prominent Text */}
                        <h4 className="text-xs sm:text-sm font-black text-white truncate tracking-wide drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)]">
                          {persona.nombre}
                        </h4>

                        {/* Voting Location (I.E.) if applicable */}
                        {persona.localVotacion && (
                          <div className="flex items-center gap-1 text-[10.5px] text-cyan-200/90 truncate">
                            <Building className="w-3 h-3 text-cyan-300 shrink-0" />
                            <span className="truncate">{persona.localVotacion}</span>
                          </div>
                        )}

                        {/* Phone Number */}
                        <div className="font-mono text-xs font-bold text-emerald-300">
                          {persona.telefono}
                        </div>
                      </div>

                      {/* Right: Direct Instant Action Buttons */}
                      <div className="flex items-center gap-2 shrink-0">
                        {/* WhatsApp Button */}
                        <button
                          type="button"
                          onClick={() => sendWhatsApp(persona.telefono, persona.nombre, persona.cargoLabel, persona.distrito)}
                          className="min-h-[42px] px-3.5 py-2 rounded-xl bg-emerald-600/30 hover:bg-emerald-600/50 border border-emerald-400/50 text-emerald-300 font-bold text-xs flex items-center gap-2 active:scale-95 transition-all shadow-sm"
                          title={`Enviar WhatsApp a ${persona.nombre}`}
                        >
                          <WhatsAppAppIcon size={22} />
                          <span className="hidden sm:inline">WhatsApp</span>
                        </button>

                        {/* Direct Call Button */}
                        <button
                          type="button"
                          onClick={() => callContact(persona.telefono, persona.nombre, persona.cargoLabel, persona.distrito)}
                          className="min-h-[42px] px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-400 hover:to-green-500 text-white font-black text-xs flex items-center gap-2 active:scale-95 transition-all shadow-md ring-1 ring-emerald-300/50"
                          title={`Llamar a ${persona.nombre}`}
                        >
                          <Phone className="w-4 h-4 fill-current" />
                          <span>Llamar</span>
                        </button>
                      </div>
                    </div>
                  );
                })
              ) : (
                /* Empty state when no person matches */
                <div className="p-6 rounded-2xl text-center border border-white/20 bg-slate-950/70 backdrop-blur-md text-white shadow-lg space-y-2">
                  <User className="w-8 h-8 text-cyan-400 mx-auto opacity-80" />
                  <h4 className="font-bold text-xs sm:text-sm">No se encontró a nadie con "{specificSearch}"</h4>
                  <p className="text-[11px] opacity-75">
                    Prueba buscando por apellido, nombre de colegio o número de celular.
                  </p>
                  <button
                    type="button"
                    onClick={() => setSpecificSearch('')}
                    className="px-3.5 py-1.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs shadow-md"
                  >
                    Mostrar todos los 31 Distritos
                  </button>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: DISTRITOS COINCIDENTES */}
          {searchResultsTab === 'distritos' && (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5 gap-0.5 sm:gap-1">
              {displayDistritosList.map((dist) => {
                const liveMesasCount = mesas.filter((m) => m.distrito === dist.nombre).length || dist.mesasCount;
                const isSelected = filterDistrito === dist.nombre;
                const displayName = getDistrictDisplayName(dist.nombre);
                const encargadoNombre = formatUnNombreLuegoApellido(dist.coordinadorNombre);

                return (
                  <div
                    key={dist.id}
                    id={`distrito-search-card-${dist.id}`}
                    role="button"
                    tabIndex={0}
                    onClick={() => handleSelectDistrito(dist)}
                    className={`fast-list-item group relative h-[34px] sm:h-[36px] px-2 py-0.5 rounded-lg border flex items-center justify-between gap-1 transition-all active:scale-95 cursor-pointer select-none shadow-sm ${
                      isSelected
                        ? 'bg-cyan-500/30 border-cyan-300 ring-1 ring-cyan-300 text-white'
                        : 'bg-slate-900/75 hover:bg-slate-900/95 border-white/20 text-white backdrop-blur-md'
                    }`}
                  >
                    <div className="min-w-0 flex-1 flex flex-col justify-center text-left leading-tight py-0.5">
                      {/* Top Row: 1st District in Uppercase, 2nd small number badge */}
                      <div className="flex items-center gap-1 min-w-0">
                        <span className="text-[9.5px] sm:text-[10px] font-black uppercase text-white truncate drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)]">
                          {displayName.toUpperCase()}
                        </span>
                        <span className="text-[6.5px] sm:text-[7px] font-mono font-bold text-cyan-300 shrink-0 bg-slate-950/80 px-1 py-0 rounded border border-cyan-400/40 shadow-xs">
                          {liveMesasCount}
                        </span>
                      </div>
                      {/* Bottom Row: Coordinator Name */}
                      <div className="flex items-center gap-1 leading-none mt-0.5 min-w-0">
                        <span className="text-[8.5px] sm:text-[9px] font-bold uppercase tracking-tight text-amber-300 truncate drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)]">
                          {encargadoNombre}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          sendWhatsApp(dist.coordinadorTelefono, encargadoNombre, 'Coordinador Distrital', dist.nombre);
                        }}
                        className="w-6 h-6 sm:w-6.5 sm:h-6.5 rounded-md bg-gradient-to-b from-emerald-500 to-green-600 hover:from-emerald-400 hover:to-green-500 border border-emerald-400/60 flex items-center justify-center text-white shadow-md active:scale-90 transition-transform"
                        title={`WhatsApp a ${encargadoNombre}`}
                      >
                        <WhatsAppAppIcon size={14} className="fill-white text-white" />
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          callContact(dist.coordinadorTelefono, encargadoNombre, 'Coordinador Distrital', dist.nombre);
                        }}
                        className="w-6 h-6 sm:w-6.5 sm:h-6.5 rounded-md bg-gradient-to-b from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 border border-sky-400/60 flex items-center justify-center text-white shadow-md active:scale-90 transition-transform"
                        title={`Llamar a ${encargadoNombre}`}
                      >
                        <Phone className="w-3 h-3 fill-white text-white" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ) : (
        /* ========================================================================= */
        /* CASE B: DEFAULT STATE -> 31 DISTRICTS OR EXPANDED CLV DIRECTORY VIEW      */
        /* ========================================================================= */
        roleFilter === 'CLV' && (clvViewMode as string) === 'desplegado' ? (
          <div className="space-y-3">
            {/* Top Sub-Bar for CLV Options: CLV DE ICA, NASCA, PALPA */}
            <div className="p-1.5 rounded-xl bg-slate-950/90 border border-emerald-500/40 backdrop-blur-md shadow-md">
              <div className="grid grid-cols-3 gap-1.5 w-full">
                <button
                  type="button"
                  id="clv-subfilter-ica"
                  onClick={() => setSelectedProvincia(prev => prev === 'Ica' ? 'TODOS' : 'Ica')}
                  className={`px-2 sm:px-3 py-1.5 rounded-lg text-[9.5px] sm:text-[10.5px] font-black uppercase tracking-wider transition-all cursor-pointer text-center ${
                    selectedProvincia === 'Ica' || selectedProvincia === 'TODOS'
                      ? 'bg-gradient-to-r from-sky-500 to-blue-600 text-white ring-1.5 ring-sky-300 shadow-md font-black'
                      : 'bg-sky-950/40 text-sky-300 hover:bg-sky-900/60 border border-sky-500/30'
                  }`}
                >
                  CLV DE ICA (38)
                </button>

                <button
                  type="button"
                  id="clv-subfilter-nasca"
                  onClick={() => setSelectedProvincia(prev => prev === 'Nasca' ? 'TODOS' : 'Nasca')}
                  className={`px-2 sm:px-3 py-1.5 rounded-lg text-[9.5px] sm:text-[10.5px] font-black uppercase tracking-wider transition-all cursor-pointer text-center ${
                    selectedProvincia === 'Nasca' || selectedProvincia === 'TODOS'
                      ? 'bg-gradient-to-r from-amber-500 to-orange-600 text-slate-950 ring-1.5 ring-amber-300 shadow-md font-black'
                      : 'bg-amber-950/40 text-amber-300 hover:bg-amber-900/60 border border-amber-500/30'
                  }`}
                >
                  CLV DE NASCA (16)
                </button>

                <button
                  type="button"
                  id="clv-subfilter-palpa"
                  onClick={() => setSelectedProvincia(prev => prev === 'Palpa' ? 'TODOS' : 'Palpa')}
                  className={`px-2 sm:px-3 py-1.5 rounded-lg text-[9.5px] sm:text-[10.5px] font-black uppercase tracking-wider transition-all cursor-pointer text-center ${
                    selectedProvincia === 'Palpa' || selectedProvincia === 'TODOS'
                      ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-slate-950 ring-1.5 ring-emerald-300 shadow-md font-black'
                      : 'bg-emerald-950/40 text-emerald-300 hover:bg-emerald-900/60 border border-emerald-500/30'
                  }`}
                >
                  CLV DE PALPA (5)
                </button>
              </div>
            </div>

            {/* Render CLVs Separated by Province Sections */}
            {(['Ica', 'Nasca', 'Palpa'] as const)
              .filter((prov) => selectedProvincia === 'TODOS' || selectedProvincia === prov)
              .map((prov) => {
                const provClvs = LISTA_CLV.filter((c) => c.provincia === prov);
                if (provClvs.length === 0) return null;

                const headerColor =
                  prov === 'Ica'
                    ? 'border-sky-400/50 text-sky-200 bg-sky-950/60'
                    : prov === 'Nasca'
                    ? 'border-amber-400/50 text-amber-200 bg-amber-950/60'
                    : 'border-emerald-400/50 text-emerald-200 bg-emerald-950/60';

                return (
                  <div key={prov} className="space-y-1.5">
                    {/* Section Header */}
                    <div className={`flex items-center justify-between px-3 py-1.5 rounded-xl border backdrop-blur-md shadow-sm ${headerColor}`}>
                      <h3 className="text-xs font-black uppercase tracking-wider flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-current animate-pulse" />
                        CLV DE {prov.toUpperCase()}
                      </h3>
                      <span className="text-[10px] font-bold font-mono px-2 py-0.5 rounded bg-black/40 border border-white/20">
                        {provClvs.length} {provClvs.length === 1 ? 'coordinador' : 'coordinadores'}
                      </span>
                    </div>

                    {/* Cards Grid for this Province */}
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-1.5">
                      {provClvs.map((clv) => (
                        <div
                          key={clv.id}
                          className="fast-list-item p-2.5 rounded-xl bg-slate-950/85 border border-emerald-500/30 hover:border-emerald-400/70 text-white backdrop-blur-md shadow-md transition-all flex items-center justify-between gap-2.5"
                        >
                          <div className="min-w-0 flex-1 text-left space-y-1">
                            {/* Top row: District + Province badge */}
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-emerald-500/25 text-emerald-200 border border-emerald-400/50 shadow-xs">
                                {clv.distrito.toUpperCase()}
                              </span>
                              <span className="text-[8px] font-bold uppercase px-1.5 py-0.2 rounded bg-black/50 border border-white/20 text-white/80">
                                {clv.provincia}
                              </span>
                            </div>

                            {/* Voting center */}
                            <div className="flex items-center gap-1 text-[11px] font-bold text-white truncate">
                              <Building className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                              <span className="truncate">{clv.localVotacion}</span>
                            </div>

                            {/* Person Name & Phone */}
                            <div className="flex items-center justify-between gap-1 pt-0.5">
                              <span className="text-[11px] font-black uppercase text-amber-300 truncate drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)]">
                                {clv.nombreCompleto}
                              </span>
                              <span className="font-mono text-[10px] font-bold text-emerald-300 shrink-0">
                                {clv.telefonoRaw || clv.telefono}
                              </span>
                            </div>
                          </div>

                          {/* Actions */}
                          <div className="flex items-center gap-1 shrink-0">
                            <button
                              type="button"
                              onClick={() => sendWhatsApp(clv.telefono, clv.nombreCompleto, 'CLV', clv.distrito)}
                              className="w-8 h-8 rounded-lg bg-emerald-600/30 hover:bg-emerald-600/50 border border-emerald-400/50 text-emerald-300 flex items-center justify-center active:scale-90 transition-all shadow-sm"
                              title={`WhatsApp a ${clv.nombreCompleto}`}
                            >
                              <WhatsAppAppIcon size={18} />
                            </button>
                            <button
                              type="button"
                              onClick={() => callContact(clv.telefono, clv.nombreCompleto, 'CLV', clv.distrito)}
                              className="w-8 h-8 rounded-lg bg-gradient-to-b from-sky-400 to-blue-600 hover:from-sky-300 hover:to-blue-500 text-white flex items-center justify-center active:scale-90 transition-all shadow-sm"
                              title={`Llamar a ${clv.nombreCompleto}`}
                            >
                              <Phone className="w-3.5 h-3.5 fill-current" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
          </div>
        ) : roleFilter === 'RLV' ? (
          <div className="space-y-3">
            {/* Sub-Bar for RLV Options: RLV DE ICA, NASCA, PALPA */}
            <div className="p-1.5 rounded-xl bg-slate-950/90 border border-indigo-500/40 backdrop-blur-md shadow-md">
              <div className="grid grid-cols-3 gap-1.5 w-full">
                <button
                  type="button"
                  id="rlv-subfilter-ica"
                  onClick={() => setSelectedProvincia(prev => prev === 'Ica' ? 'TODOS' : 'Ica')}
                  className={`px-2 sm:px-3 py-1.5 rounded-lg text-[9.5px] sm:text-[10.5px] font-black uppercase tracking-wider transition-all cursor-pointer text-center ${
                    selectedProvincia === 'Ica' || selectedProvincia === 'TODOS'
                      ? 'bg-gradient-to-r from-sky-500 to-blue-600 text-white ring-1.5 ring-sky-300 shadow-md font-black'
                      : 'bg-sky-950/40 text-sky-300 hover:bg-sky-900/60 border border-sky-500/30'
                  }`}
                >
                  RLV DE ICA ({LISTA_RLV.filter(r => r.provincia === 'Ica').length})
                </button>

                <button
                  type="button"
                  id="rlv-subfilter-nasca"
                  onClick={() => setSelectedProvincia(prev => prev === 'Nasca' ? 'TODOS' : 'Nasca')}
                  className={`px-2 sm:px-3 py-1.5 rounded-lg text-[9.5px] sm:text-[10.5px] font-black uppercase tracking-wider transition-all cursor-pointer text-center ${
                    selectedProvincia === 'Nasca' || selectedProvincia === 'TODOS'
                      ? 'bg-gradient-to-r from-amber-500 to-orange-600 text-slate-950 ring-1.5 ring-amber-300 shadow-md font-black'
                      : 'bg-amber-950/40 text-amber-300 hover:bg-amber-900/60 border border-amber-500/30'
                  }`}
                >
                  RLV DE NASCA ({LISTA_RLV.filter(r => r.provincia === 'Nasca').length})
                </button>

                <button
                  type="button"
                  id="rlv-subfilter-palpa"
                  onClick={() => setSelectedProvincia(prev => prev === 'Palpa' ? 'TODOS' : 'Palpa')}
                  className={`px-2 sm:px-3 py-1.5 rounded-lg text-[9.5px] sm:text-[10.5px] font-black uppercase tracking-wider transition-all cursor-pointer text-center ${
                    selectedProvincia === 'Palpa' || selectedProvincia === 'TODOS'
                      ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white ring-1.5 ring-indigo-300 shadow-md font-black'
                      : 'bg-indigo-950/40 text-indigo-300 hover:bg-indigo-900/60 border border-indigo-500/30'
                  }`}
                >
                  RLV DE PALPA ({LISTA_RLV.filter(r => r.provincia === 'Palpa').length})
                </button>
              </div>
            </div>

            {/* Render RLVs Separated by Province Sections */}
            {(['Ica', 'Nasca', 'Palpa'] as const)
              .filter((prov) => selectedProvincia === 'TODOS' || selectedProvincia === prov)
              .map((prov) => {
                const provRlvs = LISTA_RLV.filter((r) => r.provincia === prov);
                if (provRlvs.length === 0) return null;

                const headerColor =
                  prov === 'Ica'
                    ? 'border-sky-400/50 text-sky-200 bg-sky-950/60'
                    : prov === 'Nasca'
                    ? 'border-amber-400/50 text-amber-200 bg-amber-950/60'
                    : 'border-indigo-400/50 text-indigo-200 bg-indigo-950/60';

                return (
                  <div key={prov} className="space-y-1.5">
                    {/* Section Header */}
                    <div className={`flex items-center justify-between px-3 py-1.5 rounded-xl border backdrop-blur-md shadow-sm ${headerColor}`}>
                      <h3 className="text-xs font-black uppercase tracking-wider flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-current animate-pulse" />
                        RLV DE {prov.toUpperCase()}
                      </h3>
                      <span className="text-[10px] font-bold font-mono px-2 py-0.5 rounded bg-black/40 border border-white/20">
                        {provRlvs.length} {provRlvs.length === 1 ? 'responsable' : 'responsables'}
                      </span>
                    </div>

                    {/* Cards Grid for this Province */}
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-1.5">
                      {provRlvs.map((rlv) => (
                        <div
                          key={rlv.id}
                          className="fast-list-item p-2.5 rounded-xl bg-slate-950/85 border border-indigo-500/30 hover:border-indigo-400/70 text-white backdrop-blur-md shadow-md transition-all flex items-center justify-between gap-2.5"
                        >
                          <div className="min-w-0 flex-1 text-left space-y-1">
                            {/* Top row: District + Province badge */}
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-indigo-500/25 text-indigo-200 border border-indigo-400/50 shadow-xs">
                                {rlv.distrito.toUpperCase()}
                              </span>
                              <span className="text-[8px] font-bold uppercase px-1.5 py-0.2 rounded bg-black/50 border border-white/20 text-white/80">
                                {rlv.provincia}
                              </span>
                            </div>

                            {/* Voting center */}
                            <div className="flex items-center gap-1 text-[11px] font-bold text-white truncate">
                              <Building className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                              <span className="truncate">{rlv.localVotacion}</span>
                            </div>

                            {/* Person Name & Phone */}
                            <div className="flex items-center justify-between gap-1 pt-0.5">
                              <span className="text-[11px] font-black uppercase text-amber-300 truncate drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)]">
                                {rlv.nombreCompleto}
                              </span>
                              <span className="font-mono text-[10px] font-bold text-indigo-300 shrink-0">
                                {rlv.telefonoRaw || rlv.telefono}
                              </span>
                            </div>
                          </div>

                          {/* Actions */}
                          <div className="flex items-center gap-1 shrink-0">
                            <button
                              type="button"
                              onClick={() => sendWhatsApp(rlv.telefono, rlv.nombreCompleto, 'RLV', rlv.distrito)}
                              className="w-8 h-8 rounded-lg bg-emerald-600/30 hover:bg-emerald-600/50 border border-emerald-400/50 text-emerald-300 flex items-center justify-center active:scale-90 transition-all shadow-sm"
                              title={`WhatsApp a ${rlv.nombreCompleto}`}
                            >
                              <WhatsAppAppIcon size={18} />
                            </button>
                            <button
                              type="button"
                              onClick={() => callContact(rlv.telefono, rlv.nombreCompleto, 'RLV', rlv.distrito)}
                              className="w-8 h-8 rounded-lg bg-gradient-to-b from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 text-white flex items-center justify-center active:scale-90 transition-all shadow-sm"
                              title={`Llamar a ${rlv.nombreCompleto}`}
                            >
                              <Phone className="w-3.5 h-3.5 fill-current" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
          </div>
        ) : roleFilter === 'CM' ? (
          <div className="space-y-3">
            {/* Sub-Bar for CM Options: CM DE ICA, NASCA, PALPA */}
            <div className="p-1.5 rounded-xl bg-slate-950/90 border border-amber-500/40 backdrop-blur-md shadow-md">
              <div className="grid grid-cols-3 gap-1.5 w-full">
                <button
                  type="button"
                  id="cm-subfilter-ica"
                  onClick={() => setSelectedProvincia(prev => prev === 'Ica' ? 'TODOS' : 'Ica')}
                  className={`px-2 sm:px-3 py-1.5 rounded-lg text-[9.5px] sm:text-[10.5px] font-black uppercase tracking-wider transition-all cursor-pointer text-center ${
                    selectedProvincia === 'Ica' || selectedProvincia === 'TODOS'
                      ? 'bg-gradient-to-r from-sky-500 to-blue-600 text-white ring-1.5 ring-sky-300 shadow-md font-black'
                      : 'bg-sky-950/40 text-sky-300 hover:bg-sky-900/60 border border-sky-500/30'
                  }`}
                >
                  CM DE ICA ({LISTA_CM.filter(c => c.provincia === 'Ica').length})
                </button>

                <button
                  type="button"
                  id="cm-subfilter-nasca"
                  onClick={() => setSelectedProvincia(prev => prev === 'Nasca' ? 'TODOS' : 'Nasca')}
                  className={`px-2 sm:px-3 py-1.5 rounded-lg text-[9.5px] sm:text-[10.5px] font-black uppercase tracking-wider transition-all cursor-pointer text-center ${
                    selectedProvincia === 'Nasca' || selectedProvincia === 'TODOS'
                      ? 'bg-gradient-to-r from-amber-500 to-orange-600 text-slate-950 ring-1.5 ring-amber-300 shadow-md font-black'
                      : 'bg-amber-950/40 text-amber-300 hover:bg-amber-900/60 border border-amber-500/30'
                  }`}
                >
                  CM DE NASCA ({LISTA_CM.filter(c => c.provincia === 'Nasca').length})
                </button>

                <button
                  type="button"
                  id="cm-subfilter-palpa"
                  onClick={() => setSelectedProvincia(prev => prev === 'Palpa' ? 'TODOS' : 'Palpa')}
                  className={`px-2 sm:px-3 py-1.5 rounded-lg text-[9.5px] sm:text-[10.5px] font-black uppercase tracking-wider transition-all cursor-pointer text-center ${
                    selectedProvincia === 'Palpa' || selectedProvincia === 'TODOS'
                      ? 'bg-gradient-to-r from-amber-500 to-yellow-600 text-slate-950 ring-1.5 ring-amber-300 shadow-md font-black'
                      : 'bg-amber-950/40 text-amber-300 hover:bg-amber-900/60 border border-amber-500/30'
                  }`}
                >
                  CM DE PALPA ({LISTA_CM.filter(c => c.provincia === 'Palpa').length})
                </button>
              </div>
            </div>

            {/* Render CMs Separated by Province Sections */}
            {(['Ica', 'Nasca', 'Palpa'] as const)
              .filter((prov) => selectedProvincia === 'TODOS' || selectedProvincia === prov)
              .map((prov) => {
                const provCms = LISTA_CM.filter((c) => c.provincia === prov);
                if (provCms.length === 0) return null;

                const headerColor =
                  prov === 'Ica'
                    ? 'border-sky-400/50 text-sky-200 bg-sky-950/60'
                    : prov === 'Nasca'
                    ? 'border-amber-400/50 text-amber-200 bg-amber-950/60'
                    : 'border-yellow-400/50 text-yellow-200 bg-amber-950/60';

                return (
                  <div key={prov} className="space-y-1.5">
                    {/* Section Header */}
                    <div className={`flex items-center justify-between px-3 py-1.5 rounded-xl border backdrop-blur-md shadow-sm ${headerColor}`}>
                      <h3 className="text-xs font-black uppercase tracking-wider flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-current animate-pulse" />
                        CM DE {prov.toUpperCase()}
                      </h3>
                      <span className="text-[10px] font-bold font-mono px-2 py-0.5 rounded bg-black/40 border border-white/20">
                        {provCms.length} {provCms.length === 1 ? 'coordinador' : 'coordinadores'}
                      </span>
                    </div>

                    {/* Cards Grid for this Province */}
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-1.5">
                      {provCms.map((cm) => (
                        <div
                          key={cm.id}
                          className="fast-list-item p-2.5 rounded-xl bg-slate-950/85 border border-amber-500/30 hover:border-amber-400/70 text-white backdrop-blur-md shadow-md transition-all flex items-center justify-between gap-2.5"
                        >
                          <div className="min-w-0 flex-1 text-left space-y-1">
                            {/* Top row: District + Province badge */}
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-amber-500/25 text-amber-200 border border-amber-400/50 shadow-xs">
                                {cm.distrito.toUpperCase()}
                              </span>
                              <span className="text-[8px] font-bold uppercase px-1.5 py-0.2 rounded bg-black/50 border border-white/20 text-white/80">
                                {cm.provincia}
                              </span>
                            </div>

                            {/* Voting center */}
                            <div className="flex items-center gap-1 text-[11px] font-bold text-white truncate">
                              <Building className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                              <span className="truncate">{cm.localVotacion}</span>
                            </div>

                            {/* Person Name & Phone */}
                            <div className="flex items-center justify-between gap-1 pt-0.5">
                              <span className="text-[11px] font-black uppercase text-amber-300 truncate drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)]">
                                {cm.nombreCompleto}
                              </span>
                              <span className="font-mono text-[10px] font-bold text-amber-300 shrink-0">
                                {cm.telefonoRaw || cm.telefono}
                              </span>
                            </div>
                          </div>

                          {/* Actions */}
                          <div className="flex items-center gap-1 shrink-0">
                            <button
                              type="button"
                              onClick={() => sendWhatsApp(cm.telefono, cm.nombreCompleto, 'CM', cm.distrito)}
                              className="w-8 h-8 rounded-lg bg-emerald-600/30 hover:bg-emerald-600/50 border border-emerald-400/50 text-emerald-300 flex items-center justify-center active:scale-90 transition-all shadow-sm"
                              title={`WhatsApp a ${cm.nombreCompleto}`}
                            >
                              <WhatsAppAppIcon size={18} />
                            </button>
                            <button
                              type="button"
                              onClick={() => callContact(cm.telefono, cm.nombreCompleto, 'CM', cm.distrito)}
                              className="w-8 h-8 rounded-lg bg-gradient-to-b from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-slate-950 flex items-center justify-center active:scale-90 transition-all shadow-sm"
                              title={`Llamar a ${cm.nombreCompleto}`}
                            >
                              <Phone className="w-3.5 h-3.5 fill-current" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
          </div>
        ) : (roleFilter as string) === 'ARA' ? (
          <div className="space-y-3">
            {/* Sub-Bar for ARA Options: ARA DE ICA, NASCA, PALPA */}
            <div className="p-1.5 rounded-xl bg-slate-950/90 border border-rose-500/40 backdrop-blur-md shadow-md">
              <div className="grid grid-cols-3 gap-1.5 w-full">
                <button
                  type="button"
                  id="ara-subfilter-ica"
                  onClick={() => setSelectedProvincia(prev => prev === 'Ica' ? 'TODOS' : 'Ica')}
                  className={`px-2 sm:px-3 py-1.5 rounded-lg text-[9.5px] sm:text-[10.5px] font-black uppercase tracking-wider transition-all cursor-pointer text-center ${
                    selectedProvincia === 'Ica' || selectedProvincia === 'TODOS'
                      ? 'bg-gradient-to-r from-rose-500 to-pink-600 text-white ring-1.5 ring-rose-300 shadow-md font-black'
                      : 'bg-rose-950/40 text-rose-300 hover:bg-rose-900/60 border border-rose-500/30'
                  }`}
                >
                  ARA DE ICA ({LISTA_ARA.filter(a => a.provincia === 'Ica').length})
                </button>

                <button
                  type="button"
                  id="ara-subfilter-nasca"
                  onClick={() => setSelectedProvincia(prev => prev === 'Nasca' ? 'TODOS' : 'Nasca')}
                  className={`px-2 sm:px-3 py-1.5 rounded-lg text-[9.5px] sm:text-[10.5px] font-black uppercase tracking-wider transition-all cursor-pointer text-center ${
                    selectedProvincia === 'Nasca' || selectedProvincia === 'TODOS'
                      ? 'bg-gradient-to-r from-amber-500 to-orange-600 text-slate-950 ring-1.5 ring-amber-300 shadow-md font-black'
                      : 'bg-amber-950/40 text-amber-300 hover:bg-amber-900/60 border border-amber-500/30'
                  }`}
                >
                  ARA DE NASCA ({LISTA_ARA.filter(a => a.provincia === 'Nasca').length})
                </button>

                <button
                  type="button"
                  id="ara-subfilter-palpa"
                  onClick={() => setSelectedProvincia(prev => prev === 'Palpa' ? 'TODOS' : 'Palpa')}
                  className={`px-2 sm:px-3 py-1.5 rounded-lg text-[9.5px] sm:text-[10.5px] font-black uppercase tracking-wider transition-all cursor-pointer text-center ${
                    selectedProvincia === 'Palpa' || selectedProvincia === 'TODOS'
                      ? 'bg-gradient-to-r from-rose-500 to-pink-600 text-white ring-1.5 ring-rose-300 shadow-md font-black'
                      : 'bg-rose-950/40 text-rose-300 hover:bg-rose-900/60 border border-rose-500/30'
                  }`}
                >
                  ARA DE PALPA ({LISTA_ARA.filter(a => a.provincia === 'Palpa').length})
                </button>
              </div>
            </div>

            {/* Render ARAs Separated by Province Sections */}
            {(['Ica', 'Nasca', 'Palpa'] as const)
              .filter((prov) => selectedProvincia === 'TODOS' || selectedProvincia === prov)
              .map((prov) => {
                const provAras = LISTA_ARA.filter((a) => a.provincia === prov);
                if (provAras.length === 0) return null;

                const headerColor =
                  prov === 'Ica'
                    ? 'border-rose-400/50 text-rose-200 bg-rose-950/60'
                    : prov === 'Nasca'
                    ? 'border-amber-400/50 text-amber-200 bg-amber-950/60'
                    : 'border-rose-400/50 text-rose-200 bg-rose-950/60';

                return (
                  <div key={prov} className="space-y-1.5">
                    {/* Section Header */}
                    <div className={`flex items-center justify-between px-3 py-1.5 rounded-xl border backdrop-blur-md shadow-sm ${headerColor}`}>
                      <h3 className="text-xs font-black uppercase tracking-wider flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-current animate-pulse" />
                        ARA DE {prov.toUpperCase()} (AUXILIARES PARA REPLIEGUE DE ACTAS)
                      </h3>
                      <span className="text-[10px] font-bold font-mono px-2 py-0.5 rounded bg-black/40 border border-white/20">
                        {provAras.length} {provAras.length === 1 ? 'auxiliar' : 'auxiliares'}
                      </span>
                    </div>

                    {/* Cards Grid for this Province */}
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-1.5">
                      {provAras.map((ara) => (
                        <div
                          key={ara.id}
                          className="fast-list-item p-2.5 rounded-xl bg-slate-950/85 border border-rose-500/30 hover:border-rose-400/70 text-white backdrop-blur-md shadow-md transition-all flex items-center justify-between gap-2.5"
                        >
                          <div className="min-w-0 flex-1 text-left space-y-1">
                            {/* Top row: District + Province badge */}
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-rose-500/25 text-rose-200 border border-rose-400/50 shadow-xs">
                                {ara.distrito.toUpperCase()}
                              </span>
                              <span className="text-[8px] font-bold uppercase px-1.5 py-0.2 rounded bg-black/50 border border-white/20 text-white/80">
                                {ara.provincia}
                              </span>
                            </div>

                            {/* Lugar / Zone */}
                            <div className="flex items-center gap-1 text-[11px] font-bold text-white truncate">
                              <Building className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                              <span className="truncate">Lugar: {ara.lugar || ara.distrito}</span>
                            </div>

                            {/* Person Name & Phone */}
                            <div className="flex items-center justify-between gap-1 pt-0.5">
                              <span className="text-[11px] font-black uppercase text-amber-300 truncate drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)]">
                                {ara.nombreCompleto}
                              </span>
                              <span className="font-mono text-[10px] font-bold text-rose-300 shrink-0">
                                {ara.telefonoRaw || ara.telefono}
                              </span>
                            </div>
                          </div>

                          {/* Actions */}
                          <div className="flex items-center gap-1 shrink-0">
                            <button
                              type="button"
                              onClick={() => sendWhatsApp(ara.telefono, ara.nombreCompleto, 'ARA', ara.distrito)}
                              className="w-8 h-8 rounded-lg bg-emerald-600/30 hover:bg-emerald-600/50 border border-emerald-400/50 text-emerald-300 flex items-center justify-center active:scale-90 transition-all shadow-sm"
                              title={`WhatsApp a ${ara.nombreCompleto}`}
                            >
                              <WhatsAppAppIcon size={18} />
                            </button>
                            <button
                              type="button"
                              onClick={() => callContact(ara.telefono, ara.nombreCompleto, 'ARA', ara.distrito)}
                              className="w-8 h-8 rounded-lg bg-gradient-to-b from-rose-500 to-red-600 hover:from-rose-400 hover:to-red-500 text-white flex items-center justify-center active:scale-90 transition-all shadow-sm"
                              title={`Llamar a ${ara.nombreCompleto}`}
                            >
                              <Phone className="w-3.5 h-3.5 fill-current" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5 gap-0.5 sm:gap-1">
          {displayDistritosList.map((dist) => {
            const liveMesasCount = mesas.filter((m) => m.distrito === dist.nombre).length || dist.mesasCount;
            const isSelected = filterDistrito === dist.nombre;
            const displayName = getDistrictDisplayName(dist.nombre);
            const encargadoNombre = formatUnNombreLuegoApellido(dist.coordinadorNombre);
            const clvs = getCLVsByDistrito(dist.nombre);
            const rlvs = getRLVsByDistrito(dist.nombre);
            const cms = getCMsByDistrito(dist.nombre);

            const currentClvIdx = (activeClvIndices[dist.id] || 0) % (clvs.length || 1);
            const currentClv = clvs[currentClvIdx];

            const currentRlvIdx = (activeRlvIndices[dist.id] || 0) % (rlvs.length || 1);
            const currentRlv = rlvs[currentRlvIdx];

            const currentCmIdx = (activeCmIndices[dist.id] || 0) % (cms.length || 1);
            const currentCm = cms[currentCmIdx];

            let contactNombre = encargadoNombre;
            let contactTelefono = dist.coordinadorTelefono;
            let contactRoleLabel = 'Coordinador Distrital';

            if (roleFilter === 'CD') {
              contactNombre = encargadoNombre;
              contactTelefono = dist.coordinadorTelefono;
              contactRoleLabel = 'CD';
            } else if ((roleFilter as string) === 'CLV' && currentClv) {
              contactNombre = formatUnNombreLuegoApellido(currentClv.nombreCompleto);
              contactTelefono = currentClv.telefono;
              contactRoleLabel = 'CLV';
            } else if ((roleFilter as string) === 'RLV' && currentRlv) {
              contactNombre = formatUnNombreLuegoApellido(currentRlv.nombreCompleto);
              contactTelefono = currentRlv.telefono;
              contactRoleLabel = 'RLV';
            } else if ((roleFilter as string) === 'CM' && currentCm) {
              contactNombre = formatUnNombreLuegoApellido(currentCm.nombreCompleto);
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
                className={`fast-list-item group relative h-[34px] sm:h-[36px] px-2 py-0.5 rounded-lg border flex items-center justify-between gap-1 transition-all duration-150 active:scale-95 cursor-pointer select-none shadow-sm ${
                  isSelected
                    ? 'bg-cyan-500/25 border-cyan-300 ring-1.5 ring-cyan-300/80 text-white shadow-cyan-500/20 shadow-md backdrop-blur-sm'
                    : 'bg-slate-900/75 hover:bg-slate-900/95 border-white/20 hover:border-cyan-300/80 text-white hover:shadow-md backdrop-blur-md'
                }`}
              >
                {/* Left Column: District Info + Specific Role Personnel */}
                <div className="min-w-0 flex-1 flex flex-col justify-center text-left leading-tight py-0.5">
                  {/* Top Row: 1st District Name (ALL CAPS), 2nd Small Number Badge */}
                  <div className="flex items-center gap-1 min-w-0">
                    <span className="text-[9.5px] sm:text-[10px] font-black uppercase text-white truncate leading-tight drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)]">
                      {displayName.toUpperCase()}
                    </span>
                    <span
                      title={`${liveMesasCount} mesas`}
                      className="text-[6.5px] sm:text-[7px] font-mono font-bold text-cyan-300 shrink-0 bg-slate-950/80 px-1 py-0 rounded border border-cyan-400/40 shadow-xs"
                    >
                      {liveMesasCount}
                    </span>
                  </div>

                  {/* Bottom Row: Coordinator / Contact Name */}
                  <div className="flex items-center gap-1.5 leading-none mt-0.5 min-w-0">
                    {/* CASE 1: TODOS or CD */}
                    {(roleFilter === 'TODOS' || roleFilter === 'CD') && (
                      <span className="text-[8.5px] sm:text-[9px] font-bold uppercase tracking-tight text-amber-300 truncate drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)]">
                        {encargadoNombre}
                      </span>
                    )}

                    {/* CASE 2: CLV SEGMENT */}
                    {roleFilter === 'CLV' && (
                      <div className="flex items-center justify-between gap-1 min-w-0 flex-1">
                        {currentClv ? (
                          <>
                            <span className="text-[8.5px] sm:text-[9px] font-bold uppercase tracking-tight text-emerald-300 truncate drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)]">
                              {contactNombre}
                            </span>
                            {clvs.length > 1 && (
                              <div
                                onClick={(e) => e.stopPropagation()}
                                className="flex items-center gap-0.5 shrink-0 bg-black/50 px-1 py-0 rounded border border-emerald-500/40 text-[6.5px] sm:text-[7px] text-emerald-300"
                              >
                                <button
                                  type="button"
                                  title="CLV anterior"
                                  onClick={(e) => handlePrevClv(e, dist.id, clvs.length)}
                                  className="hover:text-white p-0.5"
                                >
                                  <ChevronLeft className="w-2 h-2" />
                                </button>
                                <span className="font-mono font-bold">
                                  {currentClvIdx + 1}/{clvs.length}
                                </span>
                                <button
                                  type="button"
                                  title="Siguiente CLV"
                                  onClick={(e) => handleNextClv(e, dist.id, clvs.length)}
                                  className="hover:text-white p-0.5"
                                >
                                  <ChevronRight className="w-2 h-2" />
                                </button>
                              </div>
                            )}
                          </>
                        ) : (
                          <span className="text-[8px] text-white/50 italic">
                            Sin CLV
                          </span>
                        )}
                      </div>
                    )}

                    {/* CASE 3: RLV SEGMENT */}
                    {(roleFilter as string) === 'RLV' && (
                      <div className="flex items-center justify-between gap-1 min-w-0 flex-1">
                        {currentRlv ? (
                          <>
                            <span className="text-[8.5px] sm:text-[9px] font-bold uppercase tracking-tight text-indigo-300 truncate drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)]">
                              {contactNombre}
                            </span>
                            {rlvs.length > 1 && (
                              <div
                                onClick={(e) => e.stopPropagation()}
                                className="flex items-center gap-0.5 shrink-0 bg-black/50 px-1 py-0 rounded border border-indigo-500/40 text-[6.5px] sm:text-[7px] text-indigo-300"
                              >
                                <button
                                  type="button"
                                  title="RLV anterior"
                                  onClick={(e) => handlePrevRlv(e, dist.id, rlvs.length)}
                                  className="hover:text-white p-0.5"
                                >
                                  <ChevronLeft className="w-2 h-2" />
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
                                  <ChevronRight className="w-2 h-2" />
                                </button>
                              </div>
                            )}
                          </>
                        ) : (
                          <span className="text-[8px] text-white/50 italic">
                            Sin RLV
                          </span>
                        )}
                      </div>
                    )}

                    {/* CASE 4: CM SEGMENT */}
                    {(roleFilter as string) === 'CM' && (
                      <div className="flex items-center justify-between gap-1 min-w-0 flex-1">
                        {currentCm ? (
                          <>
                            <span className="text-[8.5px] sm:text-[9px] font-bold uppercase tracking-tight text-amber-300 truncate drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)]">
                              {contactNombre}
                            </span>
                            {cms.length > 1 && (
                              <div
                                onClick={(e) => e.stopPropagation()}
                                className="flex items-center gap-0.5 shrink-0 bg-black/50 px-1 py-0 rounded border border-amber-500/40 text-[6.5px] sm:text-[7px] text-amber-300"
                              >
                                <button
                                  type="button"
                                  title="CM anterior"
                                  onClick={(e) => handlePrevCm(e, dist.id, cms.length)}
                                  className="hover:text-white p-0.5"
                                >
                                  <ChevronLeft className="w-2 h-2" />
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
                                  <ChevronRight className="w-2 h-2" />
                                </button>
                              </div>
                            )}
                          </>
                        ) : (
                          <span className="text-[8px] text-white/50 italic">
                            Sin CM
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Right Column: Direct 1-Touch WhatsApp & Phone Call */}
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    type="button"
                    title={`Enviar WhatsApp a ${contactNombre} (${contactRoleLabel})`}
                    aria-label={`Enviar WhatsApp a ${contactNombre}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      sendWhatsApp(contactTelefono, contactNombre, contactRoleLabel, dist.nombre);
                    }}
                    className="w-6 h-6 sm:w-6.5 sm:h-6.5 rounded-md bg-gradient-to-b from-emerald-500 to-green-600 hover:from-emerald-400 hover:to-green-500 border border-emerald-400/60 flex items-center justify-center text-white shadow-md active:scale-90 transition-transform"
                  >
                    <WhatsAppAppIcon size={14} className="fill-white text-white" />
                  </button>

                  <button
                    type="button"
                    title={`Llamar a ${contactNombre} (${contactRoleLabel})`}
                    aria-label={`Llamar a ${contactNombre}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      callContact(contactTelefono, contactNombre, contactRoleLabel, dist.nombre);
                    }}
                    className={`w-6 h-6 sm:w-6.5 sm:h-6.5 rounded-md flex items-center justify-center shadow-md text-white active:scale-90 transition-transform shrink-0 ${
                      (roleFilter as string) === 'CLV'
                        ? 'bg-gradient-to-b from-emerald-500 to-teal-700 hover:from-emerald-400 hover:to-teal-600 border border-emerald-400/60'
                        : (roleFilter as string) === 'RLV'
                        ? 'bg-gradient-to-b from-indigo-500 to-purple-700 hover:from-indigo-400 hover:to-purple-600 border border-indigo-400/60'
                        : (roleFilter as string) === 'CM'
                        ? 'bg-gradient-to-b from-amber-500 to-orange-700 hover:from-amber-400 hover:to-orange-600 border border-amber-400/60'
                        : 'bg-gradient-to-b from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 border border-sky-400/60'
                    }`}
                  >
                    <Phone className="w-3 h-3 fill-white text-white" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
        )
      )}
    </div>
  );
};
