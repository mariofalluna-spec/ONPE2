import React from 'react';
import { Phone, MessageCircle, MapPin, Building, ChevronRight, Users } from 'lucide-react';
import { MesaElectoral } from '../types';
import { useElectoral } from '../context/ElectoralContext';

interface VotingTableCardProps {
  mesa: MesaElectoral;
  showCoordinator?: boolean;
}

export const VotingTableCard: React.FC<VotingTableCardProps> = ({ mesa, showCoordinator = false }) => {
  const { darkMode, setSelectedMesa, callContact, sendWhatsApp } = useElectoral();

  const coord = mesa.coordinadorDistrital;
  const presidente = mesa.miembrosMesa?.find(m => m.cargo.toLowerCase().includes('presidente')) || mesa.miembrosMesa?.[0];

  return (
    <div
      id={`mesa-card-${mesa.numeroMesa}`}
      onClick={() => setSelectedMesa(mesa)}
      className={`group w-full rounded-2xl p-3.5 transition-all duration-200 cursor-pointer active:scale-[0.99] border backdrop-blur-md ${
        darkMode
          ? 'bg-black/15 hover:bg-black/25 text-white border-white/20 shadow-lg shadow-black/20 hover:border-cyan-400/50'
          : 'bg-white/25 hover:bg-white/35 text-white border-white/40 shadow-md shadow-black/10 hover:border-cyan-300'
      }`}
    >
      {/* Top Header: Mesa N° & Local */}
      <div className="flex items-start justify-between gap-2 mb-2">
        <div>
          <div className="flex items-baseline gap-2">
            <span className="text-[11px] uppercase tracking-wider font-semibold opacity-70">
              Mesa
            </span>
            <span className="text-base font-black tracking-tight font-mono text-cyan-400 drop-shadow-sm">
              {mesa.numeroMesa}
            </span>
            <span className="text-xs opacity-75 font-medium">
              • {mesa.distrito}
            </span>
          </div>

          <div className="flex items-center gap-1 text-xs opacity-85 mt-0.5">
            <Building className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
            <span className="font-semibold truncate max-w-[210px]">{mesa.localVotacion}</span>
            <span className="opacity-60 text-[10px]">({mesa.aula})</span>
          </div>
        </div>

        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-white/10 text-cyan-300 border border-white/15">
          <Users className="w-3 h-3" />
          {1 + (mesa.miembrosMesa?.length || 0) + (mesa.otrosAsignados?.length || 0)}
        </span>
      </div>

      {/* 1. COORDINADOR DISTRITAL (Shown when searching or requested, avoids redundancy in district list) */}
      {showCoordinator && coord && (
        <div
          className={`rounded-xl p-2.5 mb-2 border flex items-center justify-between gap-2 transition-colors ${
            darkMode
              ? 'bg-black/25 border-cyan-500/25'
              : 'bg-cyan-50/60 border-cyan-200'
          }`}
        >
          <div className="min-w-0 flex-1">
            <span className="text-[9px] uppercase font-bold tracking-wider text-cyan-400 block">
              ★ Coordinador Distrital
            </span>
            <p className="text-xs font-bold truncate">
              {coord.nombre}
            </p>
            <p className="text-[11px] font-mono opacity-75">
              {coord.telefono}
            </p>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                callContact(coord.telefono, coord.nombre, 'Coordinador Distrital', mesa.distrito);
              }}
              title={`Llamar a ${coord.nombre}`}
              className="px-2.5 py-1.5 rounded-xl bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-400 hover:to-green-500 text-white font-bold text-xs flex items-center gap-1 shadow-sm active:scale-95 transition-all"
            >
              <Phone className="w-3 h-3 fill-current" />
              <span>Llamar</span>
            </button>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                sendWhatsApp(coord.telefono, coord.nombre, 'Coordinador Distrital', mesa.distrito);
              }}
              title="WhatsApp al coordinador"
              className="p-1.5 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 border border-emerald-500/30 active:scale-95"
            >
              <MessageCircle className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* 2. PRESIDENTE DE MESA - DIRECT PHONE ROW */}
      {presidente && (
        <div className="flex items-center justify-between gap-2 px-1 py-1 text-xs">
          <div className="min-w-0 flex-1">
            <span className="text-[10px] text-amber-300 font-semibold block truncate">
              {presidente.cargo}: <span className="font-bold text-white">{presidente.nombre}</span>
            </span>
            <span className="font-mono text-[11px] opacity-75">{presidente.telefono}</span>
          </div>

          <div className="flex items-center gap-1 shrink-0">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                callContact(presidente.telefono, presidente.nombre, presidente.cargo, `Mesa ${mesa.numeroMesa}`);
              }}
              className="px-2 py-1 rounded-lg bg-emerald-600/30 hover:bg-emerald-600/50 text-emerald-300 border border-emerald-500/30 font-bold text-[11px] flex items-center gap-1 active:scale-95"
            >
              <Phone className="w-2.5 h-2.5 fill-current" />
              <span>Llamar</span>
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                sendWhatsApp(presidente.telefono, presidente.nombre, presidente.cargo, `Mesa ${mesa.numeroMesa}`);
              }}
              className="p-1 rounded-lg bg-emerald-600/20 text-emerald-400 border border-emerald-500/30"
            >
              <MessageCircle className="w-3 h-3" />
            </button>
          </div>
        </div>
      )}

      {/* Footer: View all other members & assignees */}
      <div className="flex items-center justify-between text-[11px] pt-1.5 mt-1 border-t border-white/10 opacity-80">
        <span className="truncate">
          Toca para ver miembros de mesa y otros asignados
        </span>
        <div className="flex items-center gap-0.5 font-bold text-cyan-400 shrink-0 group-hover:translate-x-0.5 transition-transform">
          <span>Ficha</span>
          <ChevronRight className="w-3 h-3" />
        </div>
      </div>
    </div>
  );
};
