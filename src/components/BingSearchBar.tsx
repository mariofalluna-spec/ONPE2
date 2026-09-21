import React, { useRef } from 'react';
import { Search, Mic, X } from 'lucide-react';
import { useElectoral } from '../context/ElectoralContext';

export const BingSearchBar: React.FC = () => {
  const {
    searchQuery,
    setSearchQuery,
    startVoiceSearch,
    isListening,
    darkMode,
  } = useElectoral();

  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="w-full px-4 pt-1 pb-2">
      {/* Floating Glass Search Capsule with Voice Search as Option #1 */}
      <div
        className={`relative flex items-center w-full h-12 rounded-2xl shadow-lg transition-all duration-200 backdrop-blur-md border ${
          darkMode
            ? 'bg-black/15 text-white border-white/20 shadow-black/20 focus-within:border-cyan-400 focus-within:bg-black/30'
            : 'bg-white/25 text-white border-white/40 shadow-black/10 focus-within:border-cyan-300 focus-within:bg-white/40'
        }`}
      >
        {/* Option #1 (First Priority): Voice Search Button */}
        <button
          id="btn-voice-search"
          type="button"
          onClick={startVoiceSearch}
          title="Búsqueda por voz (Opción principal)"
          aria-label="Buscar por voz"
          className={`relative ml-1.5 px-3 py-1.5 rounded-xl transition-all duration-150 active:scale-95 flex items-center gap-1.5 shrink-0 select-none ${
            isListening
              ? 'bg-rose-500 text-white animate-pulse shadow-md shadow-rose-500/50 ring-2 ring-rose-300'
              : 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold shadow-sm shadow-cyan-500/30'
          }`}
        >
          <Mic className={`w-4 h-4 ${isListening ? 'animate-bounce text-white' : 'text-slate-950'}`} />
          <span className="text-xs font-black tracking-tight">{isListening ? 'Escuchando...' : 'Voz'}</span>
        </button>

        {/* Vertical Separator */}
        <div className="h-5 w-px mx-1.5 bg-white/25 shrink-0" />

        {/* Option #2: Text Input Field */}
        <input
          ref={inputRef}
          id="odpe-search-input"
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="O escribe coordinador, mesa, celular..."
          className="w-full h-full bg-transparent outline-none text-xs sm:text-sm font-medium placeholder:text-white/70 text-white drop-shadow-xs px-1"
          autoComplete="off"
          spellCheck="false"
        />

        {/* Clear Button or Subtle Search Glyph */}
        {searchQuery ? (
          <button
            type="button"
            onClick={() => {
              setSearchQuery('');
              inputRef.current?.focus();
            }}
            aria-label="Limpiar búsqueda"
            className="p-1.5 mr-1.5 rounded-full text-white/80 hover:text-white hover:bg-white/10 active:scale-95 shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        ) : (
          <div className="pr-3 pl-1 text-white/50 pointer-events-none shrink-0">
            <Search className="w-4 h-4" />
          </div>
        )}
      </div>
    </div>
  );
};
