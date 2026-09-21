import React from 'react';
import { Mic, X, AlertCircle, Check } from 'lucide-react';
import { useElectoral } from '../context/ElectoralContext';

export const VoiceSearchModal: React.FC = () => {
  const {
    showVoiceModal,
    setShowVoiceModal,
    isListening,
    speechTranscript,
    speechError,
    startVoiceSearch,
    stopVoiceSearch,
    darkMode,
  } = useElectoral();

  if (!showVoiceModal) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/45 backdrop-blur-sm transition-all">
      <div
        className={`w-full max-w-sm rounded-3xl p-6 text-center shadow-2xl border transition-all ${
          darkMode
            ? 'bg-slate-950/80 backdrop-blur-xl text-white border-white/20'
            : 'bg-white/90 backdrop-blur-xl text-slate-900 border-white/40'
        }`}
      >
        {/* Close Button */}
        <div className="flex justify-end mb-2">
          <button
            type="button"
            onClick={() => setShowVoiceModal(false)}
            aria-label="Cerrar modal de voz"
            className="p-1.5 rounded-full hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Title */}
        <h3 className="text-lg font-bold tracking-tight mb-1">
          Búsqueda por Voz ODPE ICA
        </h3>
        <p className="text-xs opacity-75 mb-6">
          {isListening
            ? 'Escuchando... Di el nombre del coordinador, miembro de mesa o número.'
            : speechError
            ? 'Atención'
            : 'Listo para escuchar'}
        </p>

        {/* Animated Microphone Visualizer */}
        <div className="relative my-6 flex items-center justify-center">
          {isListening && (
            <>
              <div className="absolute w-28 h-28 rounded-full bg-cyan-500/20 animate-ping" />
              <div className="absolute w-24 h-24 rounded-full bg-cyan-500/30 animate-pulse" />
            </>
          )}

          <div
            className={`relative z-10 w-20 h-20 rounded-full flex items-center justify-center shadow-xl transition-all ${
              isListening
                ? 'bg-gradient-to-tr from-cyan-500 to-blue-600 text-white ring-4 ring-cyan-400/40 shadow-cyan-500/50'
                : speechError
                ? 'bg-rose-500 text-white'
                : 'bg-slate-800 text-cyan-400'
            }`}
          >
            <Mic className="w-9 h-9 animate-bounce" />
          </div>
        </div>

        {/* Simulated sound wave bars if listening */}
        {isListening && (
          <div className="flex items-center justify-center gap-1.5 h-8 my-4">
            {[40, 75, 55, 90, 60, 80, 45, 70, 95, 50].map((h, i) => (
              <span
                key={i}
                className="w-1 rounded-full bg-cyan-400 animate-pulse"
                style={{
                  height: `${h}%`,
                  animationDelay: `${i * 90}ms`,
                }}
              />
            ))}
          </div>
        )}

        {/* Live Transcription / Error */}
        <div className="min-h-[56px] px-3 py-2 rounded-xl bg-black/30 border border-white/10 mb-6 flex items-center justify-center text-sm font-medium">
          {speechError ? (
            <div className="text-rose-400 text-xs flex items-center gap-1.5 text-left">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{speechError}</span>
            </div>
          ) : speechTranscript ? (
            <p className="font-mono text-cyan-300 font-bold text-base">
              "{speechTranscript}"
            </p>
          ) : (
            <span className="opacity-50 text-xs italic">
              (Habla ahora, por ejemplo: "Coordinador Renzo Huamán" o "Mesa 048201")
            </span>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          {speechError ? (
            <button
              type="button"
              onClick={startVoiceSearch}
              className="w-full py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-white font-bold text-xs shadow-md transition-all active:scale-95"
            >
              Reintentar
            </button>
          ) : isListening ? (
            <button
              type="button"
              onClick={stopVoiceSearch}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-400 hover:to-green-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md active:scale-95 transition-all"
            >
              <Check className="w-4 h-4" />
              <span>Buscar texto detectado</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={startVoiceSearch}
              className="w-full py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-white font-bold text-xs shadow-md transition-all active:scale-95"
            >
              Comenzar a hablar
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
