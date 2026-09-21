import React from 'react';
import { PhoneCall, Users, Building2, MapPin, Shield } from 'lucide-react';
import { useElectoral } from '../context/ElectoralContext';
import { ViewMode } from '../types';

export const QuickActions: React.FC = () => {
  const {
    viewMode,
    setViewMode,
    darkMode,
    filterDistrito,
    setFilterDistrito,
    distritosDisponibles,
    mesas,
  } = useElectoral();

  const totalAsignados = mesas.reduce((acc, m) => acc + (m.otrosAsignados?.length || 0), 0);

  const NAV_ITEMS: { id: ViewMode; label: string; icon: React.FC<{ className?: string }>; badge?: number }[] = [
    { id: 'todas', label: 'Mesas', icon: Building2 },
    { id: 'coordinadores', label: 'Coordinadores', icon: PhoneCall },
    { id: 'miembros', label: 'Miembros', icon: Users },
    { id: 'asignados', label: 'Asignados', icon: Shield, badge: totalAsignados > 0 ? totalAsignados : undefined },
  ];

  return (
    <div className="w-full px-4 py-1 space-y-1.5">
      {/* Sleek Ultra-Translucent Navigation Pills */}
      <div className="grid grid-cols-4 gap-1.5 p-1 rounded-2xl bg-black/15 backdrop-blur-md border border-white/20 shadow-xs">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = viewMode === item.id;
          return (
            <button
              key={item.id}
              id={`quick-nav-${item.id}`}
              type="button"
              onClick={() => setViewMode(item.id)}
              className={`relative flex items-center justify-center gap-1.5 py-1.5 px-1 rounded-xl transition-all duration-150 active:scale-95 text-center ${
                isActive
                  ? 'bg-cyan-500/85 backdrop-blur-md text-white shadow-xs font-bold'
                  : 'text-white/85 hover:text-white hover:bg-white/10 font-medium'
              }`}
            >
              <Icon className="w-3.5 h-3.5 shrink-0" />
              <span className="text-[11px] truncate">{item.label}</span>
              {item.badge !== undefined && (
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" />
              )}
            </button>
          );
        })}
      </div>

      {/* District Quick Filter Bar - Ultra-Translucent Glass Chips (Strictly Single-District) */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5 text-xs">
        <div className="flex items-center gap-1 text-[11px] font-semibold text-white/90 whitespace-nowrap pl-0.5">
          <MapPin className="w-3 h-3 text-rose-400" />
          <span>Distrito:</span>
        </div>
        {distritosDisponibles.map((dist) => {
          const isSelected = filterDistrito === dist;
          const count = mesas.filter(t => t.distrito === dist).length;
          // Short label for display
          const shortName = dist.split('/')[0].trim();
          return (
            <button
              key={dist}
              type="button"
              onClick={() => {
                setFilterDistrito(dist);
              }}
              title={`Ver mesas de ${dist}`}
              className={`px-2.5 py-0.5 rounded-full whitespace-nowrap font-medium text-[11px] transition-all backdrop-blur-md active:scale-95 ${
                isSelected
                  ? 'bg-cyan-500/85 text-white font-bold shadow-md shadow-cyan-500/20 ring-1 ring-cyan-300'
                  : 'bg-black/15 hover:bg-black/30 text-white/85 border border-white/20'
              }`}
            >
              {shortName} ({count})
            </button>
          );
        })}
      </div>
    </div>
  );
};
