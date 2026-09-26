import React from 'react';
import { PhoneCall, Building2, Shield, LayoutGrid } from 'lucide-react';
import { useElectoral } from '../context/ElectoralContext';
import { ViewMode } from '../types';
import { BUTTON_THEMES } from '../utils/buttonThemes';

export const QuickActions: React.FC = () => {
  const {
    viewMode,
    setViewMode,
    mesas,
    buttonStyle,
  } = useElectoral();

  const totalAsignados = mesas.reduce((acc, m) => acc + (m.otrosAsignados?.length || 0), 0);
  const theme = BUTTON_THEMES[buttonStyle] || BUTTON_THEMES['cristal-neon'];

  const NAV_ITEMS: { id: ViewMode; label: string; icon: React.FC<{ className?: string }>; badge?: string | number }[] = [
    { id: 'distritos', label: '31 Distritos', icon: LayoutGrid, badge: '31' },
    { id: 'coordinadores', label: 'Responsables', icon: PhoneCall, badge: '661' },
    { id: 'todas', label: 'Mesas', icon: Building2 },
    { id: 'asignados', label: 'Asignados', icon: Shield, badge: totalAsignados > 0 ? totalAsignados : undefined },
  ];

  return (
    <div className="w-full px-3 py-0.5">
      {/* Dynamic Navigation Bar con estilo de botón seleccionado */}
      <div className={`grid grid-cols-4 gap-1 ${theme.navTabContainer}`}>
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = viewMode === item.id;
          return (
            <button
              key={item.id}
              id={`quick-nav-${item.id}`}
              type="button"
              onClick={() => setViewMode(item.id)}
              className={`relative flex items-center justify-center gap-1 py-1.5 px-1 rounded-xl transition-all duration-150 active:scale-95 text-center leading-none cursor-pointer ${
                isActive ? theme.navTabActive : theme.navTabInactive
              }`}
            >
              <Icon className="w-3 h-3 shrink-0" />
              <span className="text-[10px] sm:text-[11px] truncate">{item.label}</span>
              {item.badge !== undefined && (
                <span className={`text-[8px] font-black px-1 rounded-full leading-tight shrink-0 ${
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
