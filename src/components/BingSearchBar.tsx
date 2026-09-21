import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Search, Mic, X, MapPin, User, Users, Vote, Building, ArrowUpRight } from 'lucide-react';
import { useElectoral } from '../context/ElectoralContext';
import { LISTA_31_DISTRITOS } from '../data/mockElectoralData';

interface SuggestionItem {
  id: string;
  name: string;
  type: 'distrito' | 'coordinador' | 'miembro' | 'mesa' | 'local';
  meta: string;
  targetQuery: string;
}

export const BingSearchBar: React.FC = () => {
  const {
    searchQuery,
    setSearchQuery,
    startVoiceSearch,
    isListening,
    darkMode,
    mesas,
    setFilterDistrito,
    setViewMode,
  } = useElectoral();

  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState<number>(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Build comprehensive searchable dataset
  const allSearchables = useMemo<SuggestionItem[]>(() => {
    const items: SuggestionItem[] = [];
    const seenNames = new Set<string>();

    // 1. Distritos
    LISTA_31_DISTRITOS.forEach((d) => {
      const key = `distrito-${d.nombre}`;
      if (!seenNames.has(key)) {
        seenNames.add(key);
        items.push({
          id: key,
          name: d.nombre,
          type: 'distrito',
          meta: `${d.provincia} • ${d.mesasCount} mesas`,
          targetQuery: d.nombre,
        });
      }

      // Coordinadores distritales
      const cleanCoord = d.coordinadorNombre.replace(/^(Lic\.|Ing\.|Prof\.|Mag\.|Abog\.)\s*/, '');
      const coordKey = `coord-${cleanCoord}`;
      if (!seenNames.has(coordKey)) {
        seenNames.add(coordKey);
        items.push({
          id: coordKey,
          name: cleanCoord,
          type: 'coordinador',
          meta: `Encargado(a) Distrital de ${d.nombre}`,
          targetQuery: cleanCoord,
        });
      }
    });

    // 2. Mesas, Locales, Miembros y Asignados
    mesas.forEach((m) => {
      // Mesa
      const mesaKey = `mesa-${m.numeroMesa}`;
      if (!seenNames.has(mesaKey)) {
        seenNames.add(mesaKey);
        items.push({
          id: mesaKey,
          name: `Mesa ${m.numeroMesa}`,
          type: 'mesa',
          meta: `${m.distrito} • ${m.localVotacion}`,
          targetQuery: m.numeroMesa,
        });
      }

      // Local de votación
      if (m.localVotacion) {
        const localKey = `local-${m.localVotacion}`;
        if (!seenNames.has(localKey)) {
          seenNames.add(localKey);
          items.push({
            id: localKey,
            name: m.localVotacion,
            type: 'local',
            meta: `Local en ${m.distrito}`,
            targetQuery: m.localVotacion,
          });
        }
      }

      // Coordinador distrital asignado a la mesa
      if (m.coordinadorDistrital?.nombre) {
        const coordMesaKey = `coord-dist-${m.coordinadorDistrital.nombre}`;
        if (!seenNames.has(coordMesaKey)) {
          seenNames.add(coordMesaKey);
          items.push({
            id: coordMesaKey,
            name: m.coordinadorDistrital.nombre,
            type: 'coordinador',
            meta: `Coordinador en ${m.distrito} (Mesa ${m.numeroMesa})`,
            targetQuery: m.coordinadorDistrital.nombre,
          });
        }
      }

      // Miembros de mesa
      m.miembrosMesa?.forEach((mb) => {
        if (mb.nombre) {
          const mbKey = `miembro-${mb.nombre}`;
          if (!seenNames.has(mbKey)) {
            seenNames.add(mbKey);
            items.push({
              id: mbKey,
              name: mb.nombre,
              type: 'miembro',
              meta: `${mb.cargo || 'Miembro de mesa'} • Mesa ${m.numeroMesa} (${m.distrito})`,
              targetQuery: mb.nombre,
            });
          }
        }
      });

      // Otros asignados
      m.otrosAsignados?.forEach((asg) => {
        if (asg.nombre) {
          const asgKey = `asg-${asg.nombre}`;
          if (!seenNames.has(asgKey)) {
            seenNames.add(asgKey);
            items.push({
              id: asgKey,
              name: asg.nombre,
              type: 'miembro',
              meta: `${asg.cargo || 'Asignado'} • Mesa ${m.numeroMesa} (${m.distrito})`,
              targetQuery: asg.nombre,
            });
          }
        }
      });
    });

    return items;
  }, [mesas]);

  // Compute predictive suggestions based on user input
  const suggestions = useMemo<SuggestionItem[]>(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return [];

    const startsWithMatches: SuggestionItem[] = [];
    const wordStartsMatches: SuggestionItem[] = [];
    const containsMatches: SuggestionItem[] = [];

    allSearchables.forEach((item) => {
      const lowerName = item.name.toLowerCase();
      const lowerMeta = item.meta.toLowerCase();

      if (lowerName.startsWith(q)) {
        startsWithMatches.push(item);
      } else if (lowerName.split(/\s+/).some((word) => word.startsWith(q))) {
        wordStartsMatches.push(item);
      } else if (lowerName.includes(q) || lowerMeta.includes(q)) {
        containsMatches.push(item);
      }
    });

    return [...startsWithMatches, ...wordStartsMatches, ...containsMatches].slice(0, 7);
  }, [searchQuery, allSearchables]);

  // Ghost text autocompletion (the predicted remainder of the top match)
  const ghostTextSuffix = useMemo<string>(() => {
    const q = searchQuery;
    if (!q || suggestions.length === 0) return '';
    const topName = suggestions[0].name;
    if (topName.toLowerCase().startsWith(q.toLowerCase())) {
      return topName.slice(q.length);
    }
    return '';
  }, [searchQuery, suggestions]);

  // Handle selecting a suggestion
  const handleSelectSuggestion = (item: SuggestionItem) => {
    setSearchQuery(item.targetQuery);
    if (item.type === 'distrito') {
      setFilterDistrito(item.name);
      setViewMode('todas');
    }
    setIsOpen(false);
    setSelectedIndex(-1);
  };

  // Keyboard navigation for suggestions
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Tab' || (e.key === 'ArrowRight' && inputRef.current?.selectionStart === searchQuery.length)) {
      if (ghostTextSuffix) {
        e.preventDefault();
        setSearchQuery(searchQuery + ghostTextSuffix);
        return;
      }
      if (suggestions.length > 0 && selectedIndex >= 0) {
        e.preventDefault();
        handleSelectSuggestion(suggestions[selectedIndex]);
        return;
      }
    }

    if (suggestions.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setIsOpen(true);
      setSelectedIndex((prev) => (prev < suggestions.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setIsOpen(true);
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : suggestions.length - 1));
    } else if (e.key === 'Enter') {
      if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
        e.preventDefault();
        handleSelectSuggestion(suggestions[selectedIndex]);
      } else if (ghostTextSuffix) {
        e.preventDefault();
        setSearchQuery(searchQuery + ghostTextSuffix);
        setIsOpen(false);
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false);
      setSelectedIndex(-1);
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getBadge = (type: SuggestionItem['type']) => {
    switch (type) {
      case 'distrito':
        return (
          <span className="flex items-center gap-1 text-[9px] font-bold text-cyan-300 bg-cyan-950/80 border border-cyan-400/40 px-1.5 py-0.2 rounded shrink-0">
            <MapPin className="w-2.5 h-2.5" />
            Distrito
          </span>
        );
      case 'coordinador':
        return (
          <span className="flex items-center gap-1 text-[9px] font-bold text-emerald-300 bg-emerald-950/80 border border-emerald-400/40 px-1.5 py-0.2 rounded shrink-0">
            <User className="w-2.5 h-2.5" />
            Encargado
          </span>
        );
      case 'miembro':
        return (
          <span className="flex items-center gap-1 text-[9px] font-bold text-amber-300 bg-amber-950/80 border border-amber-400/40 px-1.5 py-0.2 rounded shrink-0">
            <Users className="w-2.5 h-2.5" />
            Miembro
          </span>
        );
      case 'mesa':
        return (
          <span className="flex items-center gap-1 text-[9px] font-bold text-purple-300 bg-purple-950/80 border border-purple-400/40 px-1.5 py-0.2 rounded shrink-0">
            <Vote className="w-2.5 h-2.5" />
            Mesa
          </span>
        );
      case 'local':
        return (
          <span className="flex items-center gap-1 text-[9px] font-bold text-sky-300 bg-sky-950/80 border border-sky-400/40 px-1.5 py-0.2 rounded shrink-0">
            <Building className="w-2.5 h-2.5" />
            Local
          </span>
        );
    }
  };

  return (
    <div ref={containerRef} className="relative w-full px-3 py-0.5">
      {/* Slim Floating Glass Search Capsule */}
      <div
        className={`relative flex items-center w-full h-8.5 rounded-xl shadow-xs transition-all duration-150 backdrop-blur-md border ${
          darkMode
            ? 'bg-slate-950/75 text-white border-white/20 focus-within:border-cyan-400 focus-within:bg-slate-950/90'
            : 'bg-white/25 text-white border-white/40 focus-within:border-cyan-300 focus-within:bg-white/40'
        }`}
      >
        {/* Voice Search Button */}
        <button
          id="btn-voice-search"
          type="button"
          onClick={startVoiceSearch}
          title="Búsqueda por voz"
          aria-label="Buscar por voz"
          className={`relative ml-1 px-2 py-0.5 rounded-lg transition-all active:scale-95 flex items-center gap-1 shrink-0 select-none ${
            isListening
              ? 'bg-rose-500 text-white animate-pulse'
              : 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold shadow-xs'
          }`}
        >
          <Mic className={`w-3 h-3 ${isListening ? 'animate-bounce text-white' : 'text-slate-950'}`} />
          <span className="text-[10px] font-black">{isListening ? '...' : 'Voz'}</span>
        </button>

        <div className="h-4 w-px mx-1 bg-white/20 shrink-0" />

        {/* Search Input Container with Predictive Ghost Text */}
        <div className="relative flex-1 h-full flex items-center min-w-0">
          {/* Ghost Completion Text overlay */}
          {ghostTextSuffix && (
            <div className="absolute inset-0 flex items-center px-1 pointer-events-none text-xs font-medium overflow-hidden whitespace-nowrap">
              <span className="opacity-0">{searchQuery}</span>
              <span className="text-cyan-300/70 font-semibold">{ghostTextSuffix}</span>
              <span className="ml-2 text-[8.5px] uppercase tracking-wider text-cyan-200/60 bg-cyan-950/60 px-1 py-0.2 rounded border border-cyan-400/30">
                Tab ⇥
              </span>
            </div>
          )}

          {/* Text Input Field */}
          <input
            ref={inputRef}
            id="odpe-search-input"
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setIsOpen(true);
              setSelectedIndex(-1);
            }}
            onFocus={() => {
              if (searchQuery.trim().length > 0) {
                setIsOpen(true);
              }
            }}
            onKeyDown={handleKeyDown}
            placeholder="Buscar distrito, persona, mesa..."
            className="w-full h-full bg-transparent outline-none text-xs font-medium placeholder:text-white/70 text-white px-1 relative z-10"
            autoComplete="off"
            spellCheck="false"
          />
        </div>

        {/* Clear Button */}
        {searchQuery ? (
          <button
            type="button"
            onClick={() => {
              setSearchQuery('');
              setIsOpen(false);
              inputRef.current?.focus();
            }}
            className="p-1 mr-1 text-white/80 hover:text-white rounded-lg active:scale-90 relative z-10"
            title="Borrar búsqueda"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        ) : (
          <div className="p-1 mr-1 text-white/60 relative z-10">
            <Search className="w-3 h-3" />
          </div>
        )}
      </div>

      {/* Predictive Autocomplete Dropdown Panel */}
      {isOpen && suggestions.length > 0 && (
        <div className="absolute left-3 right-3 top-full mt-1 z-50 rounded-xl bg-slate-950/95 border border-cyan-400/50 shadow-2xl backdrop-blur-xl overflow-hidden animate-in fade-in slide-in-from-top-1 duration-150">
          {/* Header hint */}
          <div className="flex items-center justify-between px-2.5 py-1 bg-white/5 border-b border-white/10 text-[9px] font-semibold text-white/70">
            <span className="flex items-center gap-1 text-cyan-300">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
              Nombres anticipados ({suggestions.length})
            </span>
            <span className="text-white/50 text-[8.5px]">
              Toca o presiona <kbd className="px-1 py-0.5 rounded bg-black/40 border border-white/10 font-mono">Tab</kbd> / <kbd className="px-1 py-0.5 rounded bg-black/40 border border-white/10 font-mono">↵</kbd>
            </span>
          </div>

          {/* Suggestions List */}
          <div className="max-h-60 overflow-y-auto divide-y divide-white/5">
            {suggestions.map((item, idx) => {
              const isHighlighted = idx === selectedIndex;
              const q = searchQuery.toLowerCase();
              const lowerName = item.name.toLowerCase();
              const matchPos = lowerName.indexOf(q);

              return (
                <div
                  key={item.id}
                  role="button"
                  tabIndex={0}
                  onClick={() => handleSelectSuggestion(item)}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`w-full px-2.5 py-1.5 flex items-center justify-between gap-2 text-left transition-colors cursor-pointer select-none ${
                    isHighlighted
                      ? 'bg-cyan-500/25 text-white'
                      : 'hover:bg-white/10 text-white/90'
                  }`}
                >
                  <div className="min-w-0 flex-1 flex flex-col leading-tight">
                    {/* Highlight matching letters */}
                    <div className="text-xs font-bold text-white flex items-center gap-1 truncate">
                      {matchPos >= 0 ? (
                        <span>
                          {item.name.slice(0, matchPos)}
                          <span className="text-cyan-300 underline underline-offset-2 decoration-cyan-400 font-extrabold">
                            {item.name.slice(matchPos, matchPos + q.length)}
                          </span>
                          {item.name.slice(matchPos + q.length)}
                        </span>
                      ) : (
                        item.name
                      )}
                    </div>
                    <span className="text-[9.5px] text-white/70 truncate mt-0.5">
                      {item.meta}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    {getBadge(item.type)}
                    <ArrowUpRight className="w-3 h-3 text-white/40" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
