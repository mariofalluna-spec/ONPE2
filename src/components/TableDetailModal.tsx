import React, { useState } from 'react';
import { X, Phone, MessageCircle, MapPin, Building, ShieldCheck, UserPlus, Users, Plus, Shield, Check, PhoneCall } from 'lucide-react';
import { useElectoral } from '../context/ElectoralContext';
import { ContactoElectoral } from '../types';

export const TableDetailModal: React.FC = () => {
  const {
    selectedMesa,
    setSelectedMesa,
    darkMode,
    callContact,
    sendWhatsApp,
    addAsignadoToMesa,
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
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/40 backdrop-blur-xs transition-all duration-300">
      <div
        className={`w-full max-w-lg max-h-[92vh] overflow-y-auto rounded-t-3xl sm:rounded-3xl p-5 shadow-2xl transition-all border ${
          darkMode
            ? 'bg-slate-950/75 backdrop-blur-xl text-white border-white/20'
            : 'bg-white/85 backdrop-blur-xl text-slate-900 border-white/60 shadow-slate-900/10'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase tracking-wider font-semibold opacity-70">
                Directorio Mesa
              </span>
              <span className="font-mono text-xl font-black text-cyan-400">
                {selectedMesa.numeroMesa}
              </span>
            </div>
            <p className="text-xs opacity-75">
              {selectedMesa.distrito}, {selectedMesa.provincia} • {selectedMesa.departamento}
            </p>
          </div>

          <button
            id="btn-close-mesa-modal"
            type="button"
            onClick={() => setSelectedMesa(null)}
            aria-label="Cerrar ficha"
            className="p-2 rounded-full hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Local de Votación & Room Info */}
        <div className="space-y-1.5 mb-4 p-3 rounded-2xl bg-black/25 border border-white/10 text-xs">
          <div className="flex items-center gap-2">
            <Building className="w-4 h-4 text-cyan-400 shrink-0" />
            <div>
              <span className="opacity-70 block text-[10px]">Local de Votación:</span>
              <span className="font-bold text-sm">{selectedMesa.localVotacion}</span>
            </div>
          </div>
          <div className="flex items-center gap-2 pt-1 border-t border-white/5">
            <MapPin className="w-4 h-4 text-rose-400 shrink-0" />
            <div>
              <span className="opacity-70 block text-[10px]">Ubicación del Aula:</span>
              <span className="font-medium">
                {selectedMesa.aula} • {selectedMesa.pabellon} ({selectedMesa.piso || '1er Piso'})
              </span>
            </div>
          </div>
          <div className="text-[11px] opacity-75 pl-6">
            {selectedMesa.direccion}
          </div>
        </div>

        {/* 1. COORDINADOR DISTRITAL DOSSIER */}
        <div className="p-4 rounded-2xl bg-gradient-to-br from-cyan-950/70 to-blue-950/70 border border-cyan-500/40 mb-4 shadow-inner">
          <div className="flex items-start justify-between gap-3 mb-2">
            <div>
              <div className="flex items-center gap-1.5 text-xs text-cyan-300 font-bold mb-0.5">
                <ShieldCheck className="w-4 h-4 text-cyan-400" />
                <span>COORDINADOR DISTRITAL ASIGNADO</span>
              </div>
              <h3 className="text-base font-bold tracking-tight">
                {coord.nombre}
              </h3>
              <p className="text-xs font-mono text-cyan-200 mt-0.5">
                {coord.telefono}
              </p>
              {coord.telefonoSecundario && (
                <p className="text-[11px] font-mono opacity-75">
                  Telf. Respaldo: {coord.telefonoSecundario}
                </p>
              )}
              {coord.email && (
                <p className="text-[11px] opacity-70 truncate mt-0.5">
                  Email: {coord.email}
                </p>
              )}
            </div>

            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
              Disponible
            </span>
          </div>

          {coord.nota && (
            <p className="text-[11px] opacity-80 mb-3 bg-black/20 p-2 rounded-lg border border-white/5">
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
              className="w-full py-2.5 px-3 rounded-xl bg-emerald-600/25 hover:bg-emerald-600/35 text-emerald-300 border border-emerald-500/35 font-bold text-xs flex items-center justify-center gap-2 active:scale-95 transition-all"
            >
              <MessageCircle className="w-4 h-4" />
              <span>WhatsApp Directo</span>
            </button>
          </div>
        </div>

        {/* 2. MIEMBROS DE MESA LIST */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
              <Users className="w-4 h-4" />
              Miembros de Mesa ({selectedMesa.miembrosMesa?.length || 0})
            </h4>
            <span className="text-[10px] opacity-75">
              Marcación directa a sus celulares
            </span>
          </div>

          <div className="space-y-2">
            {selectedMesa.miembrosMesa?.map((mb) => (
              <div
                key={mb.id}
                className="flex items-center justify-between p-3 rounded-xl bg-black/25 border border-white/10 text-xs"
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
                    className="p-2 rounded-xl bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 active:scale-95"
                    title={`WhatsApp a ${mb.nombre}`}
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
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
              className="p-3 mb-3 rounded-2xl bg-cyan-950/40 border border-cyan-500/40 text-xs space-y-2.5"
            >
              <h5 className="font-bold text-cyan-300 text-xs">
                Registrar nuevo asignado a la Mesa {selectedMesa.numeroMesa}
              </h5>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] opacity-80 block mb-0.5">Nombre completo:</label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. Juan Pérez"
                    value={nuevoNombre}
                    onChange={(e) => setNuevoNombre(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-lg bg-black/40 border border-white/20 text-white text-xs outline-none focus:border-cyan-400"
                  />
                </div>

                <div>
                  <label className="text-[10px] opacity-80 block mb-0.5">Cargo / Rol:</label>
                  <select
                    value={nuevoCargo}
                    onChange={(e) => setNuevoCargo(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-lg bg-slate-800 border border-white/20 text-white text-xs outline-none focus:border-cyan-400"
                  >
                    <option value="Fiscalizador">Fiscalizador</option>
                    <option value="Personero / Asignado">Personero / Asignado</option>
                    <option value="Coordinador de Local">Coordinador de Local</option>
                    <option value="Seguridad / Apoyo">Seguridad / Apoyo</option>
                    <option value="Delegado Especial">Delegado Especial</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] opacity-80 block mb-0.5">Celular directo:</label>
                  <input
                    type="tel"
                    required
                    placeholder="+51 956 123 456"
                    value={nuevoTelefono}
                    onChange={(e) => setNuevoTelefono(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-lg bg-black/40 border border-white/20 text-white text-xs font-mono outline-none focus:border-cyan-400"
                  />
                </div>

                <div>
                  <label className="text-[10px] opacity-80 block mb-0.5">DNI (opcional):</label>
                  <input
                    type="text"
                    placeholder="8 dígitos"
                    value={nuevoDni}
                    onChange={(e) => setNuevoDni(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-lg bg-black/40 border border-white/20 text-white text-xs font-mono outline-none focus:border-cyan-400"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] opacity-80 block mb-0.5">Nota o tarea asignada:</label>
                <input
                  type="text"
                  placeholder="Ej. Resguardo de actas o fiscalización de mesa"
                  value={nuevaNota}
                  onChange={(e) => setNuevaNota(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded-lg bg-black/40 border border-white/20 text-white text-xs outline-none focus:border-cyan-400"
                />
              </div>

              <div className="flex justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="px-3 py-1.5 rounded-lg bg-black/30 hover:bg-black/50 text-slate-300 font-semibold text-xs"
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
                  className="flex items-center justify-between p-3 rounded-xl bg-black/25 border border-white/10 text-xs"
                >
                  <div className="min-w-0 flex-1 pr-2">
                    <span className="text-[10px] uppercase font-bold text-cyan-300 block truncate">
                      {asig.cargo}
                    </span>
                    <p className="font-bold text-xs truncate mt-0.5">{asig.nombre}</p>
                    <p className="font-mono text-xs text-slate-300 mt-0.5">{asig.telefono}</p>
                    {asig.nota && (
                      <p className="text-[10px] opacity-70 italic truncate mt-0.5">{asig.nota}</p>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      type="button"
                      onClick={() => callContact(asig.telefono, asig.nombre, asig.cargo, `Mesa ${selectedMesa.numeroMesa}`)}
                      className="px-2.5 py-1.5 rounded-lg bg-emerald-600/30 hover:bg-emerald-600/50 text-emerald-300 border border-emerald-500/40 font-bold text-xs flex items-center gap-1 active:scale-95"
                    >
                      <Phone className="w-3.5 h-3.5 fill-current" />
                      <span>Llamar</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => sendWhatsApp(asig.telefono, asig.nombre, asig.cargo, `Mesa ${selectedMesa.numeroMesa}`)}
                      className="p-1.5 rounded-lg bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 active:scale-95"
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs opacity-70 p-3 rounded-xl bg-black/15 text-center">
              No hay otros asignados registrados para esta mesa aún. Puedes agregar uno con el botón "+ Agregar Asignado".
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
