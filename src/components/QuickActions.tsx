import React from 'react';
import { PhoneCall, Users, Building2, Shield, LayoutGrid } from 'lucide-react';
import { useElectoral } from '../context/ElectoralContext';
import { ViewMode } from '../types';

export const QuickActions: React.FC = () => {
  const {
    viewMode,
    setViewMode,
    mesas,
  } = useElectoral();

  const totalAsignados = mesas.reduce((acc, m) => acc + (m.otrosAsignados?.length || 0), 0);

  const NAV_ITEMS: { id: ViewMode; label: string; icon: React.FC<{ className?: string }>; badge?: string | number }[] = [
    { id: 'distritos', label: '31 Dist.', icon: LayoutGrid, badge: '31' },
    { id: 'todas', label: 'Mesas', icon: Building2 },
    { id: 'coordinadores', label: 'Coord.', icon: PhoneCall, badge: '661' },
    { id: 'miembros', label: 'Miembros', icon: Users },
    { id: 'asignados', label: 'Asignados', icon: Shield, badge: totalAsignados > 0 ? totalAsignados : undefined },
  ];

  return (
    <div className="w-full px-3 py-0.5">
      {/* Ultra-Slim Navigation Bar */}
      <div className="grid grid-cols-5 gap-1 p-0.5 rounded-xl bg-black/20 backdrop-blur-md border border-white/20 shadow-xs">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = viewMode === item.id;
          return (
            <button
              key={item.id}
              id={`quick-nav-${item.id}`}
              type="button"
              onClick={() => setViewMode(item.id)}
              className={`relative flex items-center justify-center gap-1 py-1 px-0.5 rounded-lg transition-all duration-150 active:scale-95 text-center leading-none ${
                isActive
                  ? 'bg-cyan-500 text-slate-950 shadow-xs font-black'
                  : 'text-white/90 hover:text-white hover:bg-white/10 font-semibold'
              }`}
            >
              <Icon className="w-3 h-3 shrink-0" />
              <span className="text-[10px] truncate">{item.label}</span>
              {item.badge !== undefined && (
                <span className={`text-[8px] font-black px-1 rounded-full leading-tight ${
                  isActive ? 'bg-slate-950 text-cyan-300' : 'bg-cyan-400 text-slate-950'
                }`}>
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
