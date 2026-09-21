import React from 'react';
import { Phone, MessageCircle, Building, Users, Shield, PhoneCall } from 'lucide-react';
import { useElectoral } from '../context/ElectoralContext';
import { ContactoElectoral } from '../types';

export const GestoresView: React.FC = () => {
  const { filteredMesas, darkMode, callContact, sendWhatsApp, viewMode } = useElectoral();

  // 1. Unique Coordinadores Distritales
  const coordinadores = React.useMemo(() => {
    const map = new Map<string, { contacto: ContactoElectoral; distrito: string; mesas: string[] }>();
    filteredMesas.forEach(m => {
      const coord = m.coordinadorDistrital;
      if (!coord) return;
      const key = coord.telefono || coord.nombre;
      if (!map.has(key)) {
        map.set(key, { contacto: coord, distrito: m.distrito, mesas: [m.numeroMesa] });
      } else {
        map.get(key)!.mesas.push(m.numeroMesa);
      }
    });
    return Array.from(map.values());
  }, [filteredMesas]);

  // 2. All Miembros de Mesa from filtered tables
  const miembros = React.useMemo(() => {
    const list: { contacto: ContactoElectoral; mesaNumero: string; distrito: string; local: string }[] = [];
    filteredMesas.forEach(m => {
      m.miembrosMesa?.forEach(mb => {
        list.push({
          contacto: mb,
          mesaNumero: m.numeroMesa,
          distrito: m.distrito,
          local: m.localVotacion,
        });
      });
    });
    return list;
  }, [filteredMesas]);

  // 3. All Otros Asignados from filtered tables
  const asignados = React.useMemo(() => {
    const list: { contacto: ContactoElectoral; mesaNumero: string; distrito: string; local: string }[] = [];
    filteredMesas.forEach(m => {
      m.otrosAsignados?.forEach(asig => {
        list.push({
          contacto: asig,
          mesaNumero: m.numeroMesa,
          distrito: m.distrito,
          local: m.localVotacion,
        });
      });
    });
    return list;
  }, [filteredMesas]);

  return (
    <div className="w-full px-4 py-1.5 space-y-2.5">
      {/* Dynamic Header */}
      <div className="flex items-center justify-between text-xs px-1">
        <span className="font-bold uppercase tracking-wider text-cyan-300 drop-shadow-sm flex items-center gap-1.5">
          {viewMode === 'coordinadores' && (
            <>
              <PhoneCall className="w-3.5 h-3.5" />
              Coordinadores Distritales ({coordinadores.length})
            </>
          )}
          {viewMode === 'miembros' && (
            <>
              <Users className="w-3.5 h-3.5" />
              Miembros de Mesa ({miembros.length})
            </>
          )}
          {viewMode === 'asignados' && (
            <>
              <Shield className="w-3.5 h-3.5" />
              Personal Asignado ({asignados.length})
            </>
          )}
        </span>
        <span className="text-[11px] opacity-75">
          Llamada directa 1-toque
        </span>
      </div>

      {/* VIEW: COORDINADORES DISTRITALES */}
      {viewMode === 'coordinadores' && (
        <div className="space-y-2">
          {coordinadores.map(({ contacto, distrito, mesas }) => (
            <div
              key={contacto.id || contacto.telefono}
              className={`p-3 rounded-2xl border backdrop-blur-md transition-all ${
                darkMode
                  ? 'bg-black/15 hover:bg-black/25 border-white/20 text-white shadow-md'
                  : 'bg-white/25 hover:bg-white/35 border-white/40 text-white shadow-sm'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                      Coordinador Distrital
                    </span>
                    <span className="text-[11px] font-semibold opacity-85 truncate">
                      {distrito}
                    </span>
                  </div>

                  <h3 className="font-bold text-xs tracking-tight truncate">
                    {contacto.nombre}
                  </h3>

                  <p className="font-mono text-xs font-bold text-cyan-300">
                    {contacto.telefono}
                  </p>

                  <div className="flex items-center gap-1 text-[10px] opacity-75 mt-1 truncate">
                    <Building className="w-3 h-3 shrink-0 text-cyan-400" />
                    <span>Mesas: {mesas.join(', ')}</span>
                  </div>
                </div>

                {/* Direct Action Buttons */}
                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    type="button"
                    onClick={() => callContact(contacto.telefono, contacto.nombre, 'Coordinador Distrital', distrito)}
                    className="px-2.5 py-1.5 rounded-xl bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-400 hover:to-green-500 text-white font-bold text-xs flex items-center gap-1 shadow-sm active:scale-95 transition-all"
                  >
                    <Phone className="w-3 h-3 fill-current" />
                    <span>Llamar</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => sendWhatsApp(contacto.telefono, contacto.nombre, 'Coordinador Distrital', distrito)}
                    className="p-1.5 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 active:scale-95"
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* VIEW: MIEMBROS DE MESA */}
      {viewMode === 'miembros' && (
        <div className="space-y-1.5">
          {miembros.map(({ contacto, mesaNumero, distrito, local }, idx) => (
            <div
              key={`${contacto.id}-${idx}`}
              className={`p-2.5 rounded-2xl border backdrop-blur-md transition-all ${
                darkMode
                  ? 'bg-black/15 hover:bg-black/25 border-white/20 text-white shadow-xs'
                  : 'bg-white/25 hover:bg-white/35 border-white/40 text-white shadow-xs'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                      Mesa {mesaNumero}
                    </span>
                    <span className="text-[10px] font-bold text-amber-300">
                      {contacto.cargo}
                    </span>
                  </div>

                  <h3 className="font-bold text-xs truncate">
                    {contacto.nombre}
                  </h3>

                  <p className="font-mono text-xs font-semibold text-cyan-300">
                    {contacto.telefono}
                  </p>

                  <p className="text-[10px] opacity-70 truncate">
                    {local} • {distrito}
                  </p>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    type="button"
                    onClick={() => callContact(contacto.telefono, contacto.nombre, contacto.cargo, `Mesa ${mesaNumero}`)}
                    className="px-2.5 py-1.5 rounded-xl bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-400 hover:to-green-500 text-white font-bold text-xs flex items-center gap-1 active:scale-95 shadow-sm"
                  >
                    <Phone className="w-3 h-3 fill-current" />
                    <span>Llamar</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => sendWhatsApp(contacto.telefono, contacto.nombre, contacto.cargo, `Mesa ${mesaNumero}`)}
                    className="p-1.5 rounded-xl bg-emerald-600/20 text-emerald-300 border border-emerald-500/30 active:scale-95"
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* VIEW: OTROS ASIGNADOS */}
      {viewMode === 'asignados' && (
        <div className="space-y-1.5">
          {asignados.length > 0 ? (
            asignados.map(({ contacto, mesaNumero, distrito, local }, idx) => (
              <div
                key={`${contacto.id}-${idx}`}
                className={`p-2.5 rounded-2xl border backdrop-blur-md transition-all ${
                  darkMode
                    ? 'bg-black/15 hover:bg-black/25 border-white/20 text-white shadow-xs'
                    : 'bg-white/25 hover:bg-white/35 border-white/40 text-white shadow-xs'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                        Mesa {mesaNumero}
                      </span>
                      <span className="text-[10px] font-bold text-cyan-300">
                        {contacto.cargo}
                      </span>
                    </div>

                    <h3 className="font-bold text-xs truncate">
                      {contacto.nombre}
                    </h3>

                    <p className="font-mono text-xs font-semibold text-slate-300">
                      {contacto.telefono}
                    </p>

                    <p className="text-[10px] opacity-70 truncate">
                      {local} • {distrito}
                    </p>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      type="button"
                      onClick={() => callContact(contacto.telefono, contacto.nombre, contacto.cargo, `Mesa ${mesaNumero}`)}
                      className="px-2.5 py-1.5 rounded-xl bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-400 hover:to-green-500 text-white font-bold text-xs flex items-center gap-1 active:scale-95 shadow-sm"
                    >
                      <Phone className="w-3 h-3 fill-current" />
                      <span>Llamar</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => sendWhatsApp(contacto.telefono, contacto.nombre, contacto.cargo, `Mesa ${mesaNumero}`)}
                      className="p-1.5 rounded-xl bg-emerald-600/20 text-emerald-300 border border-emerald-500/30 active:scale-95"
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="p-6 rounded-2xl text-center border border-white/10 bg-black/30 backdrop-blur-md">
              <Shield className="w-7 h-7 text-cyan-400 mx-auto mb-2 opacity-80" />
              <p className="font-bold text-xs">No hay asignados registrados aún</p>
              <p className="text-[11px] opacity-70 mt-1">
                Puedes registrar asignados directamente desde la ficha de cada mesa.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
