import React, { useState } from 'react';
import { X, Phone, MapPin, Building, ShieldCheck, UserPlus, Users, Plus, Shield, Check, PhoneCall } from 'lucide-react';
import { useElectoral } from '../context/ElectoralContext';
import { ContactoElectoral } from '../types';
import { WhatsAppAppIcon } from './WhatsAppAppIcon';
import { getCLVsByDistrito } from '../data/clvData';
import { getRLVsByDistrito } from '../data/rlvData';
import { getCMsByDistrito } from '../data/cmData';

export const TableDetailModal: React.FC = () => {
  const {
    selectedMesa,
    setSelectedMesa,
    darkMode,
    callContact,
    sendWhatsApp,
    addAsignadoToMesa,
    layoutMode,
  } = useElectoral();

  const [showAddForm, setShowAddForm] = useState(false);
  const [nuevoNombre, setNuevoNombre] = useState('');
  const [nuevoCargo, setNuevoCargo] = useState('Personero / Asignado');
  const [nuevoTelefono, setNuevoTelefono] = useState('');
  const [nuevoDni, setNuevoDni] = useState('');
  const [nuevaNota, setNuevaNota] = useState('');

  if (!selectedMesa) return null;

  const coord = selectedMesa.coordinadorDistrital;

  const handleSaveAsignado = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nuevoNombre.trim() || !nuevoTelefono.trim()) return;

    const contact: ContactoElectoral = {
      id: `asig-${Date.now()}`,
      nombre: nuevoNombre.trim(),
      cargo: nuevoCargo.trim(),
      telefono: nuevoTelefono.trim(),
      dni: nuevoDni.trim() || undefined,
      nota: nuevaNota.trim() || undefined,
      disponible: true,
      mesaAsignada: selectedMesa.numeroMesa,
      distrito: selectedMesa.distrito,
    };

    addAsignadoToMesa(selectedMesa.id, contact);

    // Update locally in selectedMesa so user sees it right away
    setSelectedMesa({
      ...selectedMesa,
      otrosAsignados: [...(selectedMesa.otrosAsignados || []), contact],
    });

    // Reset form
    setNuevoNombre('');
    setNuevoTelefono('');
    setNuevoDni('');
    setNuevaNota('');
    setShowAddForm(false);
  };

  return (
    <div
      id="modal-table-detail-backdrop"
      onClick={(e) => {
        if (e.target === e.currentTarget) setSelectedMesa(null);
      }}
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/10 backdrop-blur-sm transition-all duration-200"
    >
      <div
        id="modal-table-detail-container"
        className={`w-full max-h-[92vh] overflow-y-auto rounded-t-3xl sm:rounded-3xl p-5 shadow-2xl transition-all border border-white/20 bg-slate-950/95 backdrop-blur-2xl text-white shadow-black/80 ${
          layoutMode === 'pc' ? 'max-w-5xl' : 'max-w-lg'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/20 mb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase tracking-wider font-semibold opacity-90 drop-shadow-sm">
                Directorio Mesa
              </span>
              <span className="font-mono text-xl font-black text-cyan-300 drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]">
                {selectedMesa.numeroMesa}
              </span>
            </div>
            <p className="text-xs text-white/95 drop-shadow-[0_1px_3px_rgba(0,0,0,0.9)]">
              {selectedMesa.distrito}, {selectedMesa.provincia} • {selectedMesa.departamento}
            </p>
          </div>

          <button
            id="btn-close-mesa-modal"
            type="button"
            onClick={() => setSelectedMesa(null)}
            aria-label="Cerrar ficha"
            className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white/80 hover:text-white transition-colors border border-white/15 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Responsive Grid for PC vs Mobile */}
        <div className={layoutMode === 'pc' ? 'grid grid-cols-1 lg:grid-cols-2 gap-4' : 'space-y-4'}>
          {/* Column 1: Local & Coordinadores */}
          <div className="space-y-4">
            {/* Local de Votación & Room Info */}
        <div className="space-y-1.5 mb-4 p-3.5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 text-xs text-white shadow-xs">
          <div className="flex items-center gap-2">
            <Building className="w-4 h-4 text-cyan-300 shrink-0 drop-shadow-sm" />
            <div>
              <span className="opacity-85 block text-[10px]">Local de Votación:</span>
              <span className="font-bold text-sm text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)]">{selectedMesa.localVotacion}</span>
            </div>
          </div>
          <div className="flex items-center gap-2 pt-1 border-t border-white/15">
            <MapPin className="w-4 h-4 text-rose-300 shrink-0 drop-shadow-sm" />
            <div>
              <span className="opacity-85 block text-[10px]">Ubicación del Aula:</span>
              <span className="font-medium text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)]">
                {selectedMesa.aula} • {selectedMesa.pabellon} ({selectedMesa.piso || '1er Piso'})
              </span>
            </div>
          </div>
          <div className="text-[11px] opacity-90 pl-6 text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)]">
            {selectedMesa.direccion}
          </div>
        </div>

        {/* 1. COORDINADOR DISTRITAL DOSSIER */}
        <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-cyan-400/30 mb-4 shadow-md text-white">
          <div className="flex items-start justify-between gap-3 mb-2">
            <div>
              <div className="flex items-center gap-1.5 text-xs text-cyan-300 font-bold mb-0.5 drop-shadow-sm">
                <ShieldCheck className="w-4 h-4 text-cyan-300" />
                <span>COORDINADOR DISTRITAL ASIGNADO</span>
              </div>
              <h3 className="text-base font-bold tracking-tight text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)]">
                {coord.nombre}
              </h3>
              <p className="text-xs font-mono text-cyan-200 mt-0.5 drop-shadow-sm">
                {coord.telefono}
              </p>
              {coord.telefonoSecundario && (
                <p className="text-[11px] font-mono opacity-85 text-white/90 drop-shadow-sm">
                  Telf. Respaldo: {coord.telefonoSecundario}
                </p>
              )}
              {coord.email && (
                <p className="text-[11px] opacity-80 truncate mt-0.5 text-white/80 drop-shadow-sm">
                  Email: {coord.email}
                </p>
              )}
            </div>

            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/25 text-emerald-200 border border-emerald-400/40 drop-shadow-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
              Disponible
            </span>
          </div>

          {coord.nota && (
            <p className="text-[11px] opacity-85 mb-3 bg-white/10 backdrop-blur-md p-2 rounded-lg border border-white/15 text-white drop-shadow-sm">
              Nota: {coord.nota}
            </p>
          )}

          {/* Large 1-Tap Action Buttons for Coordinator */}
          <div className="grid grid-cols-2 gap-2 mt-2">
            <button
              type="button"
              onClick={() => callContact(coord.telefono, coord.nombre, 'Coordinador Distrital', selectedMesa.distrito)}
              className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-400 hover:to-green-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 active:scale-95 transition-all"
            >
              <Phone className="w-4 h-4 fill-current" />
              <span>Llamar al Coordinador</span>
            </button>

            <button
              type="button"
              onClick={() => sendWhatsApp(coord.telefono, coord.nombre, 'Coordinador Distrital', selectedMesa.distrito)}
              className="w-full py-2.5 px-3 rounded-xl bg-emerald-500/25 hover:bg-emerald-500/35 text-emerald-200 border border-emerald-400/40 font-bold text-xs flex items-center justify-center gap-2 active:scale-95 transition-all shadow-xs"
            >
              <WhatsAppAppIcon size={18} />
              <span>WhatsApp Directo</span>
            </button>
          </div>
        </div>

        {/* 1.5 COORDINADORES DE LOCAL (CLV) DEL DISTRITO */}
        {(() => {
          const districtCLVs = getCLVsByDistrito(selectedMesa.distrito);
          if (districtCLVs.length === 0) return null;
          return (
            <div className="p-3.5 rounded-2xl bg-emerald-950/25 backdrop-blur-md border border-emerald-500/30 mb-4 shadow-sm text-white">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-1.5 text-xs text-emerald-300 font-bold drop-shadow-sm">
                  <Shield className="w-3.5 h-3.5 text-emerald-400" />
                  <span>COORDINADORES DE LOCAL (CLV)</span>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                  {districtCLVs.length} {districtCLVs.length === 1 ? 'asignado' : 'asignados'}
                </span>
              </div>

              <div className="space-y-1.5">
                {districtCLVs.map((clv, clvIdx) => (
                  <div
                    key={clv.id}
                    className="p-2 rounded-xl bg-white/5 border border-emerald-500/20 flex items-center justify-between gap-2"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <span className="w-4 h-4 rounded-full bg-emerald-500/25 text-emerald-300 text-[9px] font-black flex items-center justify-center shrink-0">
                          {clvIdx + 1}
                        </span>
                        <span className="px-1 py-0.2 rounded text-[8px] font-bold bg-emerald-500/30 text-emerald-200 border border-emerald-400/30">
                          CLV
                        </span>
                        <span className="text-xs font-bold uppercase tracking-wide text-white truncate drop-shadow-sm">
                          {clv.nombreCompleto}
                        </span>
                      </div>
                      <p className="font-mono text-xs font-bold text-cyan-300 pl-5 mt-0.5">
                        {clv.telefonoRaw || clv.telefono}
                      </p>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        type="button"
                        onClick={() => callContact(clv.telefono, clv.nombreCompleto, 'CLV', selectedMesa.distrito)}
                        className="p-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-white active:scale-95 shadow-xs"
                        title={`Llamar a ${clv.nombreCompleto}`}
                      >
                        <Phone className="w-3.5 h-3.5 fill-current" />
                      </button>
                      <button
                        type="button"
                        onClick={() => sendWhatsApp(clv.telefono, clv.nombreCompleto, 'CLV', selectedMesa.distrito)}
                        className="p-2 rounded-lg bg-emerald-600/30 hover:bg-emerald-600/40 border border-emerald-400/30 text-emerald-300 active:scale-95 shadow-xs flex items-center justify-center"
                        title={`WhatsApp a ${clv.nombreCompleto}`}
                      >
                        <WhatsAppAppIcon size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })()}

        {/* 1.3 COORDINADORES RLV DEL DISTRITO */}
        {(() => {
          const districtRLVs = getRLVsByDistrito(selectedMesa.distrito);
          if (!districtRLVs || districtRLVs.length === 0) return null;

          return (
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-300 flex items-center gap-1.5 drop-shadow-sm">
                  <Shield className="w-4 h-4 text-indigo-400" />
                  Responsables de Local (RLV) del Distrito ({districtRLVs.length})
                </h4>
                <span className="text-[10px] opacity-80 text-white/80">
                  {selectedMesa.distrito}
                </span>
              </div>

              <div className="space-y-1.5">
                {districtRLVs.map((rlv, rlvIdx) => (
                  <div
                    key={rlv.id}
                    className="p-2 rounded-xl bg-white/5 border border-indigo-500/20 flex items-center justify-between gap-2"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <span className="w-4 h-4 rounded-full bg-indigo-500/25 text-indigo-300 text-[9px] font-black flex items-center justify-center shrink-0">
                          {rlvIdx + 1}
                        </span>
                        <span className="px-1 py-0.2 rounded text-[8px] font-bold bg-indigo-500/30 text-indigo-200 border border-indigo-400/30">
                          RLV
                        </span>
                        <span className="text-xs font-bold uppercase tracking-wide text-white truncate drop-shadow-sm">
                          {rlv.nombreCompleto}
                        </span>
                      </div>
                      <p className="font-mono text-xs font-bold text-indigo-300 pl-5 mt-0.5">
                        {rlv.telefonoRaw || rlv.telefono}
                      </p>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        type="button"
                        onClick={() => callContact(rlv.telefono, rlv.nombreCompleto, 'RLV', selectedMesa.distrito)}
                        className="p-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white active:scale-95 shadow-xs"
                        title={`Llamar a ${rlv.nombreCompleto}`}
                      >
                        <Phone className="w-3.5 h-3.5 fill-current" />
                      </button>
                      <button
                        type="button"
                        onClick={() => sendWhatsApp(rlv.telefono, rlv.nombreCompleto, 'RLV', selectedMesa.distrito)}
                        className="p-2 rounded-lg bg-emerald-600/30 hover:bg-emerald-600/40 border border-emerald-400/30 text-emerald-300 active:scale-95 shadow-xs flex items-center justify-center"
                        title={`WhatsApp a ${rlv.nombreCompleto}`}
                      >
                        <WhatsAppAppIcon size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })()}
          </div>

          {/* Column 2: CMs, Miembros de Mesa, Otros Asignados */}
          <div className="space-y-4">
            {/* 1.4 COORDINADORES DE MESA (CM) DEL DISTRITO */}
            {(() => {
          const districtCMs = getCMsByDistrito(selectedMesa.distrito);
          if (!districtCMs || districtCMs.length === 0) return null;

          return (
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-amber-300 flex items-center gap-1.5 drop-shadow-sm">
                  <Check className="w-4 h-4 text-amber-400" />
                  Coordinadores de Mesa (CM) del Distrito ({districtCMs.length})
                </h4>
                <span className="text-[10px] opacity-80 text-white/80">
                  {selectedMesa.distrito}
                </span>
              </div>

              <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
                {districtCMs.map((cm, cmIdx) => (
                  <div
                    key={cm.id}
                    className="p-2 rounded-xl bg-white/5 border border-amber-500/20 flex items-center justify-between gap-2"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <span className="w-4 h-4 rounded-full bg-amber-500/25 text-amber-300 text-[9px] font-black flex items-center justify-center shrink-0">
                          {cmIdx + 1}
                        </span>
                        <span className="px-1 py-0.2 rounded text-[8px] font-bold bg-amber-500/30 text-amber-200 border border-amber-400/30">
                          CM
                        </span>
                        <span className="text-xs font-bold uppercase tracking-wide text-white truncate drop-shadow-sm">
                          {cm.nombreCompleto}
                        </span>
                      </div>
                      <p className="font-mono text-xs font-bold text-amber-300 pl-5 mt-0.5">
                        {cm.telefonoRaw || cm.telefono}
                      </p>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        type="button"
                        onClick={() => callContact(cm.telefono, cm.nombreCompleto, 'CM', selectedMesa.distrito)}
                        className="p-2 rounded-lg bg-amber-600 hover:bg-amber-500 text-white active:scale-95 shadow-xs"
                        title={`Llamar a ${cm.nombreCompleto}`}
                      >
                        <Phone className="w-3.5 h-3.5 fill-current" />
                      </button>
                      <button
                        type="button"
                        onClick={() => sendWhatsApp(cm.telefono, cm.nombreCompleto, 'CM', selectedMesa.distrito)}
                        className="p-2 rounded-lg bg-emerald-600/30 hover:bg-emerald-600/40 border border-emerald-400/30 text-emerald-300 active:scale-95 shadow-xs flex items-center justify-center"
                        title={`WhatsApp a ${cm.nombreCompleto}`}
                      >
                        <WhatsAppAppIcon size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })()}

        {/* 2. MIEMBROS DE MESA LIST */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-amber-300 flex items-center gap-1.5 drop-shadow-sm">
              <Users className="w-4 h-4" />
              Miembros de Mesa ({selectedMesa.miembrosMesa?.length || 0})
            </h4>
            <span className="text-[10px] opacity-80 text-white/80 drop-shadow-sm">
              Marcación directa a sus celulares
            </span>
          </div>

          <div className="space-y-2">
            {selectedMesa.miembrosMesa?.map((mb) => (
              <div
                key={mb.id}
                className="flex items-center justify-between p-3 rounded-xl bg-white/10 hover:bg-white/15 backdrop-blur-md border border-white/20 text-xs text-white shadow-xs transition-colors"
              >
                <div className="min-w-0 flex-1 pr-2">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-amber-300 text-xs truncate">
                      {mb.cargo}
                    </span>
                    {mb.dni && (
                      <span className="text-[10px] opacity-70 font-mono">
                        DNI: {mb.dni}
                      </span>
                    )}
                  </div>
                  <p className="font-bold text-sm tracking-tight truncate mt-0.5">
                    {mb.nombre}
                  </p>
                  <p className="font-mono text-xs text-cyan-300 font-semibold mt-0.5">
                    {mb.telefono}
                  </p>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    type="button"
                    onClick={() => callContact(mb.telefono, mb.nombre, mb.cargo, `Mesa ${selectedMesa.numeroMesa}`)}
                    className="px-2.5 py-2 rounded-xl bg-emerald-600/30 hover:bg-emerald-600/50 text-emerald-300 border border-emerald-500/40 font-bold text-xs flex items-center gap-1 active:scale-95 transition-all"
                    title={`Llamar a ${mb.nombre}`}
                  >
                    <Phone className="w-3.5 h-3.5 fill-current" />
                    <span>Llamar</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => sendWhatsApp(mb.telefono, mb.nombre, mb.cargo, `Mesa ${selectedMesa.numeroMesa}`)}
                    className="p-1.5 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/40 border border-emerald-500/30 active:scale-95 flex items-center justify-center transition-all shadow-xs"
                    title={`WhatsApp a ${mb.nombre}`}
                  >
                    <WhatsAppAppIcon size={18} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 3. OTROS ASIGNADOS (Fiscalizadores, Personeros, etc.) */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
              <Shield className="w-4 h-4" />
              Otros Asignados ({selectedMesa.otrosAsignados?.length || 0})
            </h4>

            <button
              type="button"
              onClick={() => setShowAddForm(prev => !prev)}
              className="text-xs text-cyan-400 hover:text-cyan-300 font-bold flex items-center gap-1"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>{showAddForm ? 'Cancelar' : '+ Agregar Asignado'}</span>
            </button>
          </div>

          {/* Form to add new assignee */}
          {showAddForm && (
            <form
              onSubmit={handleSaveAsignado}
              className="p-3.5 mb-3 rounded-2xl bg-white/10 backdrop-blur-md border border-white/25 text-xs space-y-2.5 text-white"
            >
              <h5 className="font-bold text-cyan-200 text-xs drop-shadow-sm">
                Registrar nuevo asignado a la Mesa {selectedMesa.numeroMesa}
              </h5>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] opacity-85 block mb-0.5 text-white">Nombre completo:</label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. Juan Pérez"
                    value={nuevoNombre}
                    onChange={(e) => setNuevoNombre(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-lg bg-white/15 border border-white/30 text-white placeholder-white/60 text-xs outline-none focus:bg-white/25 focus:border-cyan-300"
                  />
                </div>

                <div>
                  <label className="text-[10px] opacity-85 block mb-0.5 text-white">Cargo / Rol:</label>
                  <select
                    value={nuevoCargo}
                    onChange={(e) => setNuevoCargo(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900/80 border border-white/30 text-white text-xs outline-none focus:border-cyan-300"
                  >
                    <option value="Fiscalizador" className="bg-slate-900 text-white">Fiscalizador</option>
                    <option value="Personero / Asignado" className="bg-slate-900 text-white">Personero / Asignado</option>
                    <option value="Coordinador de Local" className="bg-slate-900 text-white">Coordinador de Local</option>
                    <option value="Seguridad / Apoyo" className="bg-slate-900 text-white">Seguridad / Apoyo</option>
                    <option value="Delegado Especial" className="bg-slate-900 text-white">Delegado Especial</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] opacity-85 block mb-0.5 text-white">Celular directo:</label>
                  <input
                    type="tel"
                    required
                    placeholder="+51 956 123 456"
                    value={nuevoTelefono}
                    onChange={(e) => setNuevoTelefono(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-lg bg-white/15 border border-white/30 text-white placeholder-white/60 text-xs font-mono outline-none focus:bg-white/25 focus:border-cyan-300"
                  />
                </div>

                <div>
                  <label className="text-[10px] opacity-85 block mb-0.5 text-white">DNI (opcional):</label>
                  <input
                    type="text"
                    placeholder="8 dígitos"
                    value={nuevoDni}
                    onChange={(e) => setNuevoDni(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-lg bg-white/15 border border-white/30 text-white placeholder-white/60 text-xs font-mono outline-none focus:bg-white/25 focus:border-cyan-300"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] opacity-85 block mb-0.5 text-white">Nota o tarea asignada:</label>
                <input
                  type="text"
                  placeholder="Ej. Resguardo de actas o fiscalización de mesa"
                  value={nuevaNota}
                  onChange={(e) => setNuevaNota(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded-lg bg-white/15 border border-white/30 text-white placeholder-white/60 text-xs outline-none focus:bg-white/25 focus:border-cyan-300"
                />
              </div>

              <div className="flex justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white font-semibold text-xs border border-white/20"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-white font-bold text-xs shadow-md shadow-cyan-500/30"
                >
                  Guardar Asignado
                </button>
              </div>
            </form>
          )}

          {/* List of assignees */}
          {selectedMesa.otrosAsignados && selectedMesa.otrosAsignados.length > 0 ? (
            <div className="space-y-2">
              {selectedMesa.otrosAsignados.map((asig) => (
                <div
                  key={asig.id}
                  className="flex items-center justify-between p-3 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 text-xs text-white shadow-xs"
                >
                  <div className="min-w-0 flex-1 pr-2">
                    <span className="text-[10px] uppercase font-bold text-cyan-300 block truncate drop-shadow-sm">
                      {asig.cargo}
                    </span>
                    <p className="font-bold text-xs truncate mt-0.5 drop-shadow-sm">{asig.nombre}</p>
                    <p className="font-mono text-xs text-white/90 mt-0.5 drop-shadow-sm">{asig.telefono}</p>
                    {asig.nota && (
                      <p className="text-[10px] opacity-80 italic truncate mt-0.5 text-white/80">{asig.nota}</p>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      type="button"
                      onClick={() => callContact(asig.telefono, asig.nombre, asig.cargo, `Mesa ${selectedMesa.numeroMesa}`)}
                      className="px-2.5 py-1.5 rounded-lg bg-emerald-500/25 hover:bg-emerald-500/40 text-emerald-200 border border-emerald-400/40 font-bold text-xs flex items-center gap-1 active:scale-95 drop-shadow-sm"
                    >
                      <Phone className="w-3.5 h-3.5 fill-current" />
                      <span>Llamar</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => sendWhatsApp(asig.telefono, asig.nombre, asig.cargo, `Mesa ${selectedMesa.numeroMesa}`)}
                      className="p-1.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/40 text-emerald-300 border border-emerald-400/30 active:scale-95 flex items-center justify-center transition-all shadow-xs"
                    >
                      <WhatsAppAppIcon size={18} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs opacity-80 p-3 rounded-xl bg-white/10 border border-white/15 text-center text-white drop-shadow-sm">
              No hay otros asignados registrados para esta mesa aún. Puedes agregar uno con el botón "+ Agregar Asignado".
            </p>
          )}
        </div>
          </div>
        </div>
      </div>
    </div>
  );
};
