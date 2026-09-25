import React, { useState, useEffect, useMemo } from 'react';
import { Phone, Building, Users, Shield, PhoneCall, Search, X, CheckCircle2, UserCheck, MapPin, ChevronLeft, Download } from 'lucide-react';
import { useElectoral } from '../context/ElectoralContext';
import { ContactoElectoral, CLVInfo, RLVInfo, CMInfo } from '../types';
import { WhatsAppAppIcon } from './WhatsAppAppIcon';
import { LISTA_31_DISTRITOS, DistritoInfo } from '../data/mockElectoralData';
import { LISTA_CLV, getCLVsByDistrito } from '../data/clvData';
import { LISTA_RLV, getRLVsByDistrito } from '../data/rlvData';
import { LISTA_CM, getCMsByDistrito } from '../data/cmData';
import { exportarCoordinadoresMesaExcel } from '../utils/exportExcel';

/**
 * Helper to ensure strictly: UN SOLO NOMBRE + APELLIDO (all uppercase)
 */
function formatNombreApellidoMayusculas(fullName: string): string {
  if (!fullName) return '';
  const clean = fullName.replace(/^(Lic\.|Ing\.|Prof\.|Mag\.|Abog\.)\s*/i, '').trim();

  if (clean.includes(',')) {
    const [apellidosPart, nombresPart] = clean.split(',');
    const primerNombre = (nombresPart || '').trim().split(/\s+/)[0] || '';
    const primerApellido = (apellidosPart || '').trim().split(/\s+/)[0] || '';
    return `${primerNombre} ${primerApellido}`.toUpperCase().trim();
  }

  const parts = clean.split(/\s+/).filter(Boolean);
  if (parts.length <= 2) {
    return clean.toUpperCase();
  }
  return `${parts[0]} ${parts[1]}`.toUpperCase();
}

export const GestoresView: React.FC = () => {
  const {
    filteredMesas,
    callContact,
    sendWhatsApp,
    viewMode,
    setViewMode,
    filterDistrito,
    setFilterDistrito,
    showToast,
  } = useElectoral();

  // Filters for Coordinadores & CLV view
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProvincia, setSelectedProvincia] = useState<'Todos' | 'Ica' | 'Nasca' | 'Palpa'>('Todos');
  const [filterTipo, setFilterTipo] = useState<'todos' | 'con_clv' | 'con_rlv' | 'con_cm'>('todos');
  const [expandedCmDistricts, setExpandedCmDistricts] = useState<Record<number, boolean>>({});

  // When a district is focused, auto-expand its CMs so the user immediately sees all personnel
  useEffect(() => {
    if (filterDistrito) {
      const match = LISTA_31_DISTRITOS.find(d => d.nombre.toLowerCase() === filterDistrito.toLowerCase());
      if (match) {
        setExpandedCmDistricts(prev => ({ ...prev, [match.id]: true }));
      }
    }
  }, [filterDistrito]);

  const toggleExpandCms = (distId: number) => {
    setExpandedCmDistricts(prev => ({ ...prev, [distId]: !prev[distId] }));
  };

  // 1. Grouped Coordinadores, CLVs, RLVs & CMs by District in exact official order
  const distritosConCoordinacion = useMemo(() => {
    return LISTA_31_DISTRITOS.map((dist) => {
      const clvs = getCLVsByDistrito(dist.nombre);
      const rlvs = getRLVsByDistrito(dist.nombre);
      const cms = getCMsByDistrito(dist.nombre);
      const mesasDelDistrito = filteredMesas.filter(m => m.distrito === dist.nombre);
      const mesasNumeros = mesasDelDistrito.map(m => m.numeroMesa);

      return {
        distrito: dist,
        coordinadorDistrital: {
          nombre: formatNombreApellidoMayusculas(dist.coordinadorNombre),
          telefono: dist.coordinadorTelefono,
          email: dist.coordinadorEmail,
          cargo: 'Coordinador Distrital',
        },
        clvs: clvs.map(c => ({
          ...c,
          nombreCompleto: formatNombreApellidoMayusculas(c.nombreCompleto),
        })),
        rlvs: rlvs.map(r => ({
          ...r,
          nombreCompleto: formatNombreApellidoMayusculas(r.nombreCompleto),
        })),
        cms: cms.map(cm => ({
          ...cm,
          nombreCompleto: formatNombreApellidoMayusculas(cm.nombreCompleto),
        })),
        mesasCount: mesasNumeros.length || dist.mesasCount,
        mesasNumeros,
      };
    });
  }, [filteredMesas]);

  // Filtered districts according to user search, province tabs, and specific district filter
  const filteredDistritosList = useMemo(() => {
    return distritosConCoordinacion.filter((item) => {
      // 0. Specific district filter from context (when navigated from 31 Distritos card)
      if (filterDistrito && item.distrito.nombre.toLowerCase() !== filterDistrito.toLowerCase()) {
        return false;
      }

      // 1. Province filter
      if (selectedProvincia !== 'Todos' && item.distrito.provincia !== selectedProvincia) {
        return false;
      }

      // 2. Type filter
      if (filterTipo === 'con_clv' && item.clvs.length === 0) {
        return false;
      }
      if (filterTipo === 'con_rlv' && item.rlvs.length === 0) {
        return false;
      }
      if (filterTipo === 'con_cm' && item.cms.length === 0) {
        return false;
      }

      // 3. Search term filter
      if (!searchTerm.trim()) return true;
      const term = searchTerm.toLowerCase().trim();

      const matchDistrito = item.distrito.nombre.toLowerCase().includes(term);
      const matchProvincia = item.distrito.provincia.toLowerCase().includes(term);
      const matchCoord = item.coordinadorDistrital.nombre.toLowerCase().includes(term) ||
        item.coordinadorDistrital.telefono.includes(term);
      const matchClv = item.clvs.some(
        c => c.nombreCompleto.toLowerCase().includes(term) ||
             c.telefono.includes(term) ||
             c.telefonoRaw.includes(term)
      );
      const matchRlv = item.rlvs.some(
        r => r.nombreCompleto.toLowerCase().includes(term) ||
             r.telefono.includes(term) ||
             r.telefonoRaw.includes(term)
      );
      const matchCm = item.cms.some(
        cm => cm.nombreCompleto.toLowerCase().includes(term) ||
              cm.telefono.includes(term) ||
              cm.telefonoRaw.includes(term)
      );

      return matchDistrito || matchProvincia || matchCoord || matchClv || matchRlv || matchCm;
    });
  }, [distritosConCoordinacion, selectedProvincia, filterTipo, searchTerm]);

  // Totals in current view
  const totalClvsCount = useMemo(() => {
    return filteredDistritosList.reduce((acc, d) => acc + d.clvs.length, 0);
  }, [filteredDistritosList]);

  const totalRlvsCount = useMemo(() => {
    return filteredDistritosList.reduce((acc, d) => acc + d.rlvs.length, 0);
  }, [filteredDistritosList]);

  const totalCmsCount = useMemo(() => {
    return filteredDistritosList.reduce((acc, d) => acc + d.cms.length, 0);
  }, [filteredDistritosList]);

  const totalPersonalCount = useMemo(() => {
    return filteredDistritosList.length + totalClvsCount + totalRlvsCount + totalCmsCount;
  }, [filteredDistritosList, totalClvsCount, totalRlvsCount, totalCmsCount]);

  // 2. All Miembros de Mesa from filtered tables
  const miembros = useMemo(() => {
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
  const asignados = useMemo(() => {
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
    <div id="gestores-view-container" className="w-full px-3 sm:px-4 py-1.5 space-y-2.5">
      {/* Dynamic Header */}
      <div className="flex items-center justify-between text-xs px-1">
        <div className="flex items-center gap-2">
          <button
            type="button"
            id="gestores-back-to-distritos-header-btn"
            onClick={() => {
              setFilterDistrito('');
              setViewMode('distritos');
            }}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-200 border border-cyan-400/40 text-[10.5px] font-black transition-all active:scale-95 shadow-xs"
            title="Volver a los 31 Distritos"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
            <span>31 Distritos</span>
          </button>

          <span className="font-bold uppercase tracking-wider text-cyan-300 drop-shadow-sm flex items-center gap-1.5">
            {viewMode === 'coordinadores' && (
              <>
                <PhoneCall className="w-3.5 h-3.5" />
                <span>Responsables Electorales ({filterDistrito ? filterDistrito : '31 Distritos'})</span>
              </>
            )}
            {viewMode === 'asignados' && (
              <>
                <Shield className="w-3.5 h-3.5" />
                Personal Asignado ({asignados.length})
              </>
            )}
          </span>
        </div>

        <span className="text-[10px] text-white/80 font-medium hidden sm:inline-block">
          Llamada directa 1-toque
        </span>
      </div>

      {/* ============================================================== */}
      {/* VIEW: COORDINADORES DISTRITALES, CLV, RLV Y CM POR DISTRITO    */}
      {/* ============================================================== */}
      {viewMode === 'coordinadores' && (
        <div className="space-y-2.5">
          {/* Focused District Banner when navigated from District Card */}
          {filterDistrito && (
            <div className="flex items-center justify-between p-2 rounded-xl bg-cyan-950/80 border border-cyan-400/50 backdrop-blur-md shadow-lg text-white">
              <div className="flex items-center gap-2 min-w-0">
                <button
                  type="button"
                  id="btn-back-to-distritos-card"
                  onClick={() => {
                    setFilterDistrito('');
                    setViewMode('distritos');
                  }}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-xs active:scale-95 transition-all shadow-md shrink-0"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                  <span>31 Distritos</span>
                </button>
                <div className="flex flex-col text-left min-w-0">
                  <span className="text-xs font-black uppercase text-cyan-200 tracking-wide truncate">
                    Personal de {filterDistrito}
                  </span>
                  <span className="text-[9.5px] text-white/80 truncate">
                    Coordinador Distrital • CLVs • RLVs • CMs
                  </span>
                </div>
              </div>

              <button
                type="button"
                id="btn-view-all-distritos"
                onClick={() => setFilterDistrito('')}
                className="px-2 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-white text-[10px] font-bold transition-all border border-white/20 shrink-0"
                title="Mostrar los 31 distritos juntos"
              >
                Ver los 31 distritos
              </button>
            </div>
          )}

          {/* Summary Metric Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5 p-1 rounded-xl bg-slate-950/40 border border-white/15 backdrop-blur-md text-center">
            <div className="p-1 rounded-lg bg-cyan-500/10 border border-cyan-400/20">
              <div className="text-[9px] font-bold text-cyan-200 uppercase tracking-tight">Coord. Distritales</div>
              <div className="text-sm font-black text-white">31</div>
            </div>
            <div className="p-1 rounded-lg bg-emerald-500/10 border border-emerald-400/20">
              <div className="text-[9px] font-bold text-emerald-200 uppercase tracking-tight">CLV Asignados</div>
              <div className="text-sm font-black text-emerald-300">{LISTA_CLV.length}</div>
            </div>
            <div className="p-1 rounded-lg bg-indigo-500/10 border border-indigo-400/20">
              <div className="text-[9px] font-bold text-indigo-200 uppercase tracking-tight">RLV Asignados</div>
              <div className="text-sm font-black text-indigo-300">{LISTA_RLV.length}</div>
            </div>
            <div className="p-1 rounded-lg bg-amber-500/10 border border-amber-400/20">
              <div className="text-[9px] font-bold text-amber-200 uppercase tracking-tight">CM Asignados</div>
              <div className="text-sm font-black text-amber-300">{LISTA_CM.length}</div>
            </div>
            <div className="col-span-2 sm:col-span-1 p-1 rounded-lg bg-rose-500/10 border border-rose-400/20">
              <div className="text-[9px] font-bold text-rose-200 uppercase tracking-tight">Total Directorio</div>
              <div className="text-sm font-black text-rose-300">{31 + LISTA_CLV.length + LISTA_RLV.length + LISTA_CM.length}</div>
            </div>
          </div>

          {/* Quick Search & Province Filter Bar */}
          <div className="space-y-1.5 p-2 rounded-xl bg-black/25 backdrop-blur-md border border-white/15">
            {/* Search input */}
            <div className="relative flex items-center">
              <Search className="w-3.5 h-3.5 absolute left-2.5 text-cyan-300 pointer-events-none" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar por nombre, celular o distrito (Coord, CLV, RLV, CM)..."
                className="w-full pl-8 pr-7 py-1 text-xs rounded-lg bg-slate-900/80 border border-white/20 text-white placeholder-white/50 focus:outline-hidden focus:border-cyan-400"
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm('')}
                  className="absolute right-2 text-white/60 hover:text-white p-0.5"
                  title="Limpiar búsqueda"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>

            {/* Filter pills: Province + Type */}
            <div className="flex items-center justify-between gap-1 flex-wrap text-[10px]">
              {/* Province filter pills */}
              <div className="flex items-center gap-1">
                {(['Todos', 'Ica', 'Nasca', 'Palpa'] as const).map((prov) => {
                  const isActive = selectedProvincia === prov;
                  return (
                    <button
                      key={prov}
                      type="button"
                      onClick={() => setSelectedProvincia(prov)}
                      className={`px-2 py-0.5 rounded-md font-bold transition-all ${
                        isActive
                          ? 'bg-cyan-500 text-slate-950 shadow-xs'
                          : 'bg-white/10 text-white/80 hover:bg-white/20 hover:text-white'
                      }`}
                    >
                      {prov}
                    </button>
                  );
                })}
              </div>

              {/* Type selector pills */}
              <div className="flex items-center gap-1 flex-wrap">
                <button
                  type="button"
                  onClick={() => setFilterTipo('todos')}
                  className={`px-2 py-0.5 rounded-md font-bold transition-all ${
                    filterTipo === 'todos'
                      ? 'bg-white/30 text-white border border-white/40'
                      : 'bg-white/5 text-white/70 hover:bg-white/15'
                  }`}
                >
                  Todos ({filteredDistritosList.length})
                </button>
                <button
                  type="button"
                  onClick={() => setFilterTipo('con_clv')}
                  className={`px-2 py-0.5 rounded-md font-bold transition-all ${
                    filterTipo === 'con_clv'
                      ? 'bg-emerald-500 text-slate-950 font-black shadow-xs'
                      : 'bg-emerald-950/40 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-900/40'
                  }`}
                >
                  Con CLV ({totalClvsCount})
                </button>
                <button
                  type="button"
                  onClick={() => setFilterTipo('con_rlv')}
                  className={`px-2 py-0.5 rounded-md font-bold transition-all ${
                    filterTipo === 'con_rlv'
                      ? 'bg-indigo-500 text-slate-950 font-black shadow-xs'
                      : 'bg-indigo-950/40 text-indigo-300 border border-indigo-500/30 hover:bg-indigo-900/40'
                  }`}
                >
                  Con RLV ({totalRlvsCount})
                </button>
                <button
                  type="button"
                  onClick={() => setFilterTipo('con_cm')}
                  className={`px-2 py-0.5 rounded-md font-bold transition-all ${
                    filterTipo === 'con_cm'
                      ? 'bg-amber-500 text-slate-950 font-black shadow-xs'
                      : 'bg-amber-950/40 text-amber-300 border border-amber-500/30 hover:bg-amber-900/40'
                  }`}
                >
                  Con CM ({totalCmsCount})
                </button>
              </div>
            </div>
          </div>

          {/* District Cards with Coordinador Distrital + Assigned CLVs + Assigned RLVs + Assigned CMs */}
          <div className="space-y-2">
            {filteredDistritosList.map(({ distrito, coordinadorDistrital, clvs, rlvs, cms, mesasCount }) => {
              const provColor = distrito.provincia === 'Ica'
                ? 'border-sky-400/40 text-sky-200'
                : distrito.provincia === 'Nasca'
                ? 'border-amber-400/50 text-amber-200'
                : 'border-emerald-400/50 text-emerald-200';

              return (
                <div
                  key={distrito.id}
                  id={`distrito-coordinacion-${distrito.id}`}
                  className="rounded-2xl border border-white/20 bg-slate-950/45 hover:border-cyan-300/60 text-white backdrop-blur-md shadow-sm transition-all overflow-hidden"
                >
                  {/* Top District Header */}
                  <div className="px-3 py-1.5 bg-black/40 border-b border-white/10 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-xs font-black text-white truncate drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)]">
                        {distrito.nombre}
                      </span>
                      <span className={`text-[8px] font-bold uppercase px-1.5 py-0.2 rounded bg-black/40 border ${provColor}`}>
                        {distrito.provincia}
                      </span>
                      <span className="text-[9px] font-mono font-bold text-cyan-300 bg-cyan-950/40 px-1.5 py-0.2 rounded border border-cyan-500/30">
                        {mesasCount} mesas
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0 flex-wrap">
                      {clvs.length > 0 && (
                        <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/40 shadow-xs">
                          {clvs.length} {clvs.length === 1 ? 'CLV' : 'CLVs'}
                        </span>
                      )}
                      {rlvs.length > 0 && (
                        <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-400/40 shadow-xs">
                          {rlvs.length} {rlvs.length === 1 ? 'RLV' : 'RLVs'}
                        </span>
                      )}
                      {cms.length > 0 && (
                        <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-400/40 shadow-xs">
                          {cms.length} {cms.length === 1 ? 'CM' : 'CMs'}
                        </span>
                      )}
                      {clvs.length === 0 && rlvs.length === 0 && cms.length === 0 && (
                        <span className="text-[8.5px] font-semibold opacity-60 text-white">
                          Sin asignados
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Body: Coordinador Distrital + CLV List + RLV List */}
                  <div className="p-2.5 space-y-2.5">
                    {/* 1. COORDINADOR DISTRITAL */}
                    <div className="p-2 rounded-xl bg-white/5 border border-cyan-500/25 flex items-center justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5 mb-0.5">
                          <span className="px-1.5 py-0.2 rounded text-[8.5px] font-bold bg-cyan-500/20 text-cyan-200 border border-cyan-400/40">
                            COORD. DISTRITAL
                          </span>
                        </div>
                        <h4 className="text-[11px] font-bold uppercase tracking-wider text-amber-200 truncate drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)]">
                          {coordinadorDistrital.nombre}
                        </h4>
                        <p className="font-mono text-[10.5px] font-bold text-cyan-300 drop-shadow-xs">
                          {coordinadorDistrital.telefono}
                        </p>
                      </div>

                      {/* Action buttons */}
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          type="button"
                          onClick={() => callContact(coordinadorDistrital.telefono, coordinadorDistrital.nombre, 'Coordinador Distrital', distrito.nombre)}
                          className="px-2 py-1 rounded-lg bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-400 hover:to-green-500 text-white font-bold text-[10px] flex items-center gap-1 shadow-xs active:scale-95 transition-all"
                          title={`Llamar a ${coordinadorDistrital.nombre}`}
                        >
                          <Phone className="w-2.5 h-2.5 fill-current" />
                          <span>Llamar</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => sendWhatsApp(coordinadorDistrital.telefono, coordinadorDistrital.nombre, 'Coordinador Distrital', distrito.nombre)}
                          className="p-1 rounded-lg bg-emerald-600/30 hover:bg-emerald-600/40 border border-emerald-400/30 active:scale-95 flex items-center justify-center transition-all shadow-xs"
                          title={`WhatsApp a ${coordinadorDistrital.nombre}`}
                        >
                          <WhatsAppAppIcon size={16} />
                        </button>
                      </div>
                    </div>

                    {/* 2. COORDINADORES DE LOCAL (CLV) ASIGNADOS */}
                    {clvs.length > 0 && (
                      <div className="space-y-1 pt-0.5">
                        <div className="flex items-center justify-between text-[9.5px] font-bold uppercase tracking-wider text-emerald-300 px-0.5">
                          <span className="flex items-center gap-1">
                            <UserCheck className="w-3 h-3 text-emerald-400" />
                            Coordinadores de Local (CLV)
                          </span>
                          <span className="text-white/70">
                            {clvs.length} {clvs.length === 1 ? 'asignado' : 'asignados'}
                          </span>
                        </div>

                        {/* List of CLVs */}
                        <div className="space-y-1">
                          {clvs.map((clv, clvIdx) => (
                            <div
                              key={clv.id}
                              className="px-2 py-1.5 rounded-lg bg-emerald-950/20 border border-emerald-500/20 hover:border-emerald-400/40 flex items-center justify-between gap-2 transition-all"
                            >
                              <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-1.5">
                                  <span className="w-3.5 h-3.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[8.5px] font-black flex items-center justify-center shrink-0">
                                    {clvIdx + 1}
                                  </span>
                                  <span className="px-1 py-0.2 rounded text-[7.5px] font-black uppercase bg-emerald-500/25 text-emerald-200 border border-emerald-400/30 shrink-0">
                                    CLV
                                  </span>
                                  <span className="text-[10.5px] font-bold uppercase tracking-wider text-white truncate drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)]">
                                    {clv.nombreCompleto}
                                  </span>
                                </div>
                                <div className="pl-5 mt-0.5 flex items-center gap-1.5 flex-wrap">
                                  <span className="font-mono text-[10px] font-semibold text-emerald-200 shrink-0">
                                    {clv.telefonoRaw || clv.telefono}
                                  </span>
                                  {clv.localVotacion && (
                                    <span
                                      className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[8.5px] font-medium text-emerald-100 bg-emerald-950/60 border border-emerald-400/35 max-w-full"
                                      title={`Local de Votación asignado (I.E): ${clv.localVotacion}`}
                                    >
                                      <Building className="w-2.5 h-2.5 text-emerald-400 shrink-0" />
                                      <span className="truncate">{clv.localVotacion}</span>
                                    </span>
                                  )}
                                </div>
                              </div>

                              {/* Direct action buttons for CLV */}
                              <div className="flex items-center gap-1 shrink-0">
                                <button
                                  type="button"
                                  onClick={() => callContact(clv.telefono, clv.nombreCompleto, 'CLV', distrito.nombre)}
                                  className="w-[26px] h-[26px] rounded-md bg-gradient-to-b from-sky-400 to-blue-600 hover:from-sky-300 hover:to-blue-500 flex items-center justify-center text-white active:scale-95 shadow-xs transition-transform"
                                  title={`Llamar a ${clv.nombreCompleto} (${clv.telefono})`}
                                >
                                  <Phone className="w-2.5 h-2.5 fill-current" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => sendWhatsApp(clv.telefono, clv.nombreCompleto, 'CLV', distrito.nombre)}
                                  className="w-[26px] h-[26px] rounded-md bg-emerald-600/30 hover:bg-emerald-600/40 border border-emerald-400/30 flex items-center justify-center active:scale-95 transition-transform shadow-xs"
                                  title={`WhatsApp a ${clv.nombreCompleto}`}
                                >
                                  <WhatsAppAppIcon size={16} />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* 3. RESPONSABLES DE LOCAL (RLV) ASIGNADOS */}
                    {rlvs.length > 0 && (
                      <div className="space-y-1 pt-0.5">
                        <div className="flex items-center justify-between text-[9.5px] font-bold uppercase tracking-wider text-indigo-300 px-0.5">
                          <span className="flex items-center gap-1">
                            <Shield className="w-3 h-3 text-indigo-400" />
                            Responsables de Local (RLV)
                          </span>
                          <span className="text-white/70">
                            {rlvs.length} {rlvs.length === 1 ? 'asignado' : 'asignados'}
                          </span>
                        </div>

                        {/* List of RLVs */}
                        <div className="space-y-1">
                          {rlvs.map((rlv, rlvIdx) => (
                            <div
                              key={rlv.id}
                              className="px-2 py-1.5 rounded-lg bg-indigo-950/25 border border-indigo-500/25 hover:border-indigo-400/45 flex items-center justify-between gap-2 transition-all"
                            >
                              <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-1.5">
                                  <span className="w-3.5 h-3.5 rounded-full bg-indigo-500/25 text-indigo-300 text-[8.5px] font-black flex items-center justify-center shrink-0">
                                    {rlvIdx + 1}
                                  </span>
                                  <span className="px-1 py-0.2 rounded text-[7.5px] font-black uppercase bg-indigo-500/30 text-indigo-200 border border-indigo-400/35 shrink-0">
                                    RLV
                                  </span>
                                  <span className="text-[10.5px] font-bold uppercase tracking-wider text-white truncate drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)]">
                                    {rlv.nombreCompleto}
                                  </span>
                                </div>
                                <div className="pl-5 mt-0.5 flex items-center gap-1.5 flex-wrap">
                                  <span className="font-mono text-[10px] font-semibold text-indigo-200 shrink-0">
                                    {rlv.telefonoRaw || rlv.telefono}
                                  </span>
                                  {rlv.localVotacion && (
                                    <span
                                      className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[8.5px] font-medium text-indigo-100 bg-indigo-950/60 border border-indigo-400/35 max-w-full"
                                      title={`Local de Votación asignado (I.E): ${rlv.localVotacion}`}
                                    >
                                      <Building className="w-2.5 h-2.5 text-indigo-400 shrink-0" />
                                      <span className="truncate">{rlv.localVotacion}</span>
                                    </span>
                                  )}
                                </div>
                              </div>

                              {/* Direct action buttons for RLV */}
                              <div className="flex items-center gap-1 shrink-0">
                                <button
                                  type="button"
                                  onClick={() => callContact(rlv.telefono, rlv.nombreCompleto, 'RLV', distrito.nombre)}
                                  className="w-[26px] h-[26px] rounded-md bg-gradient-to-b from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 flex items-center justify-center text-white active:scale-95 shadow-xs transition-transform"
                                  title={`Llamar a ${rlv.nombreCompleto} (${rlv.telefono})`}
                                >
                                  <Phone className="w-2.5 h-2.5 fill-current" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => sendWhatsApp(rlv.telefono, rlv.nombreCompleto, 'RLV', distrito.nombre)}
                                  className="w-[26px] h-[26px] rounded-md bg-emerald-600/30 hover:bg-emerald-600/40 border border-emerald-400/30 flex items-center justify-center active:scale-95 transition-transform shadow-xs"
                                  title={`WhatsApp a ${rlv.nombreCompleto}`}
                                >
                                  <WhatsAppAppIcon size={16} />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* 4. COORDINADORES DE MESA (CM) ASIGNADOS */}
                    {cms.length > 0 && (() => {
                      const isExpanded = !!expandedCmDistricts[distrito.id] || searchTerm.trim().length > 0;
                      const visibleCms = isExpanded ? cms : cms.slice(0, 5);
                      const hasMore = cms.length > 5;

                      return (
                        <div className="space-y-1 pt-0.5">
                          <div className="flex items-center justify-between text-[9.5px] font-bold uppercase tracking-wider text-amber-300 px-0.5">
                            <span className="flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3 text-amber-400" />
                              Coordinadores de Mesa (CM)
                            </span>
                            <div className="flex items-center gap-2">
                              <span className="text-white/70">
                                {cms.length} {cms.length === 1 ? 'asignado' : 'asignados'}
                              </span>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  exportarCoordinadoresMesaExcel(
                                    cms,
                                    `coordinadores_mesa_${distrito.nombre.toLowerCase().replace(/\s+/g, '_')}`,
                                    'xls'
                                  );
                                  showToast(`Descargando Excel de ${cms.length} CMs de ${distrito.nombre}...`);
                                }}
                                className="px-1.5 py-0.5 rounded bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-400/35 text-[8.5px] font-bold flex items-center gap-1 active:scale-95 transition-all cursor-pointer"
                                title={`Descargar Excel (.xls) de los ${cms.length} Coordinadores de Mesa de ${distrito.nombre}`}
                              >
                                <Download className="w-2.5 h-2.5" />
                                <span>Excel ({cms.length})</span>
                              </button>
                            </div>
                          </div>

                          {/* List of CMs */}
                          <div className="space-y-1">
                            {visibleCms.map((cm, cmIdx) => (
                              <div
                                key={cm.id}
                                className="px-2 py-1.5 rounded-lg bg-amber-950/20 border border-amber-500/20 hover:border-amber-400/40 flex items-center justify-between gap-2 transition-all"
                              >
                                <div className="min-w-0 flex-1">
                                  <div className="flex items-center gap-1.5">
                                    <span className="w-3.5 h-3.5 rounded-full bg-amber-500/20 text-amber-300 text-[8.5px] font-black flex items-center justify-center shrink-0">
                                      {cmIdx + 1}
                                    </span>
                                    <span className="px-1 py-0.2 rounded text-[7.5px] font-black uppercase bg-amber-500/30 text-amber-200 border border-amber-400/35 shrink-0">
                                      CM
                                    </span>
                                    <span className="text-[10.5px] font-bold uppercase tracking-wider text-white truncate drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)]">
                                      {cm.nombreCompleto}
                                    </span>
                                  </div>
                                  <div className="pl-5 mt-0.5 flex items-center gap-1.5 flex-wrap">
                                    <span className="font-mono text-[10px] font-semibold text-amber-200 shrink-0">
                                      {cm.telefonoRaw || cm.telefono}
                                    </span>
                                    {cm.localVotacion && (
                                      <span
                                        className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[8.5px] font-medium text-amber-100 bg-amber-950/60 border border-amber-400/35 max-w-full"
                                        title={`Local de Votación asignado (I.E): ${cm.localVotacion}`}
                                      >
                                        <Building className="w-2.5 h-2.5 text-amber-400 shrink-0" />
                                        <span className="truncate">{cm.localVotacion}</span>
                                      </span>
                                    )}
                                  </div>
                                </div>

                                {/* Direct action buttons for CM */}
                                <div className="flex items-center gap-1 shrink-0">
                                  <button
                                    type="button"
                                    onClick={() => callContact(cm.telefono, cm.nombreCompleto, 'CM', distrito.nombre)}
                                    className="w-[26px] h-[26px] rounded-md bg-gradient-to-b from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 flex items-center justify-center text-white active:scale-95 shadow-xs transition-transform"
                                    title={`Llamar a ${cm.nombreCompleto} (${cm.telefono})`}
                                  >
                                    <Phone className="w-2.5 h-2.5 fill-current" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => sendWhatsApp(cm.telefono, cm.nombreCompleto, 'CM', distrito.nombre)}
                                    className="w-[26px] h-[26px] rounded-md bg-emerald-600/30 hover:bg-emerald-600/40 border border-emerald-400/30 flex items-center justify-center active:scale-95 transition-transform shadow-xs"
                                    title={`WhatsApp a ${cm.nombreCompleto}`}
                                  >
                                    <WhatsAppAppIcon size={16} />
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>

                          {hasMore && !searchTerm.trim() && (
                            <button
                              type="button"
                              onClick={() => toggleExpandCms(distrito.id)}
                              className="w-full mt-1 py-1 rounded-md bg-amber-500/10 hover:bg-amber-500/20 border border-amber-400/30 text-[9.5px] font-bold text-amber-300 transition-all flex items-center justify-center gap-1"
                            >
                              {isExpanded
                                ? '▲ Mostrar menos CMs'
                                : `▼ Ver los ${cms.length} CMs de ${distrito.nombre}`}
                            </button>
                          )}
                        </div>
                      );
                    })()}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* VIEW: OTROS ASIGNADOS                                          */}
      {/* ============================================================== */}
      {viewMode === 'asignados' && (
        <div className="space-y-1.5">
          {asignados.length > 0 ? (
            asignados.map(({ contacto, mesaNumero, distrito, local }, idx) => (
              <div
                key={`${contacto.id}-${idx}`}
                className="p-2.5 rounded-2xl border border-white/20 hover:border-cyan-300/80 bg-white/10 hover:bg-white/15 text-white backdrop-blur-md shadow-xs transition-all"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-black/40 text-cyan-200 border border-cyan-400/40">
                        Mesa {mesaNumero}
                      </span>
                      <span className="text-[10px] font-bold text-cyan-300 drop-shadow-xs">
                        {contacto.cargo}
                      </span>
                    </div>

                    <h3 className="font-bold text-xs truncate text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)]">
                      {contacto.nombre}
                    </h3>

                    <p className="font-mono text-xs font-semibold text-slate-200 drop-shadow-xs">
                      {contacto.telefono}
                    </p>

                    <p className="text-[10px] text-white/80 truncate">
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
                      className="p-1.5 rounded-xl bg-emerald-600/30 hover:bg-emerald-600/40 border border-emerald-400/30 active:scale-95 flex items-center justify-center transition-all shadow-xs"
                      title={`WhatsApp a ${contacto.nombre}`}
                    >
                      <WhatsAppAppIcon size={18} />
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="p-6 rounded-2xl text-center border border-white/20 bg-white/10 backdrop-blur-md text-white shadow-lg">
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
