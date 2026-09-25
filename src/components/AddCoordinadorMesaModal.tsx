import React, { useState, useMemo } from 'react';
import { X, UserPlus, FileText, CheckCircle2, Phone, Sparkles, AlertCircle, Trash2 } from 'lucide-react';
import { useElectoral } from '../context/ElectoralContext';
import { LISTA_31_DISTRITOS } from '../data/mockElectoralData';
import { parsePersonaPrimerNombrePrimerApellido, parseTelefonoCelularPeruano, parseLineaContacto } from '../utils/nameParser';
import { WhatsAppAppIcon } from './WhatsAppAppIcon';

interface AddCoordinadorMesaModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultDistrito?: string;
}

export const AddCoordinadorMesaModal: React.FC<AddCoordinadorMesaModalProps> = ({
  isOpen,
  onClose,
  defaultDistrito = 'Nasca',
}) => {
  const { addCoordinadorMesa, addCoordinadoresMesaBatch, showToast } = useElectoral();

  const [activeTab, setActiveTab] = useState<'individual' | 'batch'>('individual');
  const [distrito, setDistrito] = useState(defaultDistrito || 'Nasca');

  // Individual Form State
  const [nombres, setNombres] = useState('');
  const [apellidoPaterno, setApellidoPaterno] = useState('');
  const [telefono, setTelefono] = useState('');

  // Batch Form State
  const [batchText, setBatchText] = useState('');

  // Preview of individual person according to strict rule: PRIMER NOMBRE + APELLIDO PATERNO
  const individualPreview = useMemo(() => {
    const { primerNombre, primerApellido, nombreCompleto } = parsePersonaPrimerNombrePrimerApellido(
      nombres,
      apellidoPaterno
    );
    const { telefono: telFormatted, telefonoRaw } = parseTelefonoCelularPeruano(telefono);

    const isValido = Boolean(primerNombre && primerApellido && telefonoRaw.length === 9);

    return {
      primerNombre,
      primerApellido,
      nombreCompleto: nombreCompleto || 'NOMBRE APELLIDO',
      telefono: telFormatted || '+519XXXXXXXX',
      telefonoRaw,
      isValido,
    };
  }, [nombres, apellidoPaterno, telefono]);

  // Preview of batch contacts
  const parsedBatchItems = useMemo(() => {
    if (!batchText.trim()) return [];
    const lines = batchText.split(/\r?\n/).filter(line => line.trim().length > 0);
    return lines.map((line, idx) => {
      const parsed = parseLineaContacto(line);
      return {
        id: `batch-${idx}`,
        original: line,
        ...parsed,
      };
    });
  }, [batchText]);

  const validBatchCount = parsedBatchItems.filter(item => item.valido).length;

  if (!isOpen) return null;

  const handleSaveIndividual = (e: React.FormEvent) => {
    e.preventDefault();
    if (!individualPreview.isValido) {
      if (!individualPreview.primerNombre) {
        showToast('Ingresa al menos el primer nombre');
        return;
      }
      if (!individualPreview.primerApellido) {
        showToast('Ingresa el apellido paterno');
        return;
      }
      if (individualPreview.telefonoRaw.length !== 9) {
        showToast('El celular debe tener exactamente 9 dígitos');
        return;
      }
      return;
    }

    addCoordinadorMesa({
      nombres: individualPreview.primerNombre,
      apellidoPaterno: individualPreview.primerApellido,
      telefono: individualPreview.telefono,
      distrito,
    });

    setNombres('');
    setApellidoPaterno('');
    setTelefono('');
    onClose();
  };

  const handleSaveBatch = () => {
    const validItems = parsedBatchItems.filter(item => item.valido);
    if (validItems.length === 0) {
      showToast('No se detectaron contactos válidos con nombre, apellido y celular.');
      return;
    }

    addCoordinadoresMesaBatch(
      validItems.map(item => ({
        nombres: item.primerNombre,
        apellidoPaterno: item.primerApellido,
        telefono: item.telefono,
        distrito,
      }))
    );

    setBatchText('');
    onClose();
  };

  return (
    <div
      id="modal-add-cm-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-md transition-all animate-fadeIn"
      onClick={onClose}
    >
      <div
        id="modal-add-cm-card"
        className="w-full max-w-lg max-h-[92vh] flex flex-col rounded-3xl border border-white/20 bg-slate-950/90 text-white backdrop-blur-xl shadow-2xl shadow-black/80 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header */}
        <div className="px-4 py-3 bg-gradient-to-r from-amber-950/50 via-slate-900 to-amber-950/40 border-b border-white/10 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-amber-300 shrink-0">
              <UserPlus className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <h3 className="text-sm font-black uppercase tracking-tight text-white flex items-center gap-1.5 truncate">
                <span>Agregar Coordinador de Mesa (CM)</span>
              </h3>
              <p className="text-[10px] text-amber-300 font-semibold truncate">
                Regla: Primer Nombre + Apellido Paterno + Celular
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-7 h-7 rounded-lg bg-white/10 hover:bg-white/20 text-white/70 hover:text-white flex items-center justify-center transition-all cursor-pointer"
            title="Cerrar ventana"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* District Selector & Mode Tabs */}
        <div className="p-3 bg-black/30 border-b border-white/10 space-y-2 shrink-0">
          {/* District Select */}
          <div className="flex items-center gap-2">
            <label htmlFor="distrito-select" className="text-[10.5px] font-bold text-cyan-300 uppercase shrink-0">
              Distrito:
            </label>
            <select
              id="distrito-select"
              value={distrito}
              onChange={(e) => setDistrito(e.target.value)}
              className="flex-1 py-1 px-2.5 rounded-lg bg-slate-900 border border-white/20 text-xs font-bold text-white focus:outline-hidden focus:border-cyan-400"
            >
              {LISTA_31_DISTRITOS.map((d) => (
                <option key={d.id} value={d.nombre}>
                  {d.nombre} ({d.provincia})
                </option>
              ))}
            </select>
          </div>

          {/* Mode Switcher */}
          <div className="flex rounded-lg bg-slate-900/90 p-0.5 border border-white/10 text-xs">
            <button
              type="button"
              onClick={() => setActiveTab('individual')}
              className={`flex-1 py-1.5 px-3 rounded-md font-bold transition-all flex items-center justify-center gap-1.5 ${
                activeTab === 'individual'
                  ? 'bg-amber-500 text-slate-950 shadow-sm'
                  : 'text-white/70 hover:text-white'
              }`}
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Registro Individual</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('batch')}
              className={`flex-1 py-1.5 px-3 rounded-md font-bold transition-all flex items-center justify-center gap-1.5 ${
                activeTab === 'batch'
                  ? 'bg-amber-500 text-slate-950 shadow-sm'
                  : 'text-white/70 hover:text-white'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Pegar Lista (Masivo)</span>
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-4 overflow-y-auto space-y-3.5 flex-1">
          {/* TAB 1: INDIVIDUAL */}
          {activeTab === 'individual' && (
            <form onSubmit={handleSaveIndividual} className="space-y-3">
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-white/90 flex items-center justify-between">
                  <span>Primer Nombre</span>
                  <span className="text-[9px] text-amber-300 font-normal">
                    Solo se tomará el 1er nombre
                  </span>
                </label>
                <input
                  type="text"
                  value={nombres}
                  onChange={(e) => setNombres(e.target.value)}
                  placeholder="Ej: JUAN (o Juan Carlos)"
                  className="w-full px-3 py-1.5 text-xs rounded-xl bg-slate-900/90 border border-white/20 text-white placeholder-white/40 focus:outline-hidden focus:border-amber-400 font-medium uppercase"
                  autoFocus
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-white/90 flex items-center justify-between">
                  <span>Apellido Paterno / Primer Apellido</span>
                  <span className="text-[9px] text-amber-300 font-normal">
                    Solo se tomará el 1er apellido
                  </span>
                </label>
                <input
                  type="text"
                  value={apellidoPaterno}
                  onChange={(e) => setApellidoPaterno(e.target.value)}
                  placeholder="Ej: PEREZ (o Perez Gomez)"
                  className="w-full px-3 py-1.5 text-xs rounded-xl bg-slate-900/90 border border-white/20 text-white placeholder-white/40 focus:outline-hidden focus:border-amber-400 font-medium uppercase"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-white/90 flex items-center justify-between">
                  <span>Celular (9 dígitos)</span>
                  <span className="text-[9px] text-cyan-300 font-mono">
                    Prefijo +51 automático
                  </span>
                </label>
                <div className="relative flex items-center">
                  <span className="absolute left-3 font-mono text-xs font-bold text-cyan-400 select-none">
                    +51
                  </span>
                  <input
                    type="tel"
                    value={telefono}
                    onChange={(e) => setTelefono(e.target.value)}
                    placeholder="987654321"
                    maxLength={12}
                    className="w-full pl-12 pr-3 py-1.5 text-xs rounded-xl bg-slate-900/90 border border-white/20 text-white placeholder-white/40 focus:outline-hidden focus:border-amber-400 font-mono font-bold tracking-wider"
                  />
                </div>
              </div>

              {/* Live Preview Card */}
              <div className="pt-2">
                <div className="text-[10px] font-bold uppercase tracking-wider text-amber-300 mb-1 flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-amber-400" />
                  <span>Vista previa de cómo se mostrará en {distrito}:</span>
                </div>

                <div className="p-2.5 rounded-xl bg-amber-950/25 border border-amber-400/40 flex items-center justify-between gap-2 shadow-inner">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <span className="px-1.5 py-0.2 rounded text-[7.5px] font-black uppercase bg-amber-500/30 text-amber-200 border border-amber-400/40">
                        CM
                      </span>
                      <span className="text-xs font-bold uppercase tracking-wider text-white truncate drop-shadow-sm">
                        {individualPreview.nombreCompleto}
                      </span>
                    </div>
                    <div className="mt-0.5 text-[10px] font-mono font-bold text-amber-200 pl-6">
                      {individualPreview.telefono}
                    </div>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <div className="w-6 h-6 rounded-md bg-gradient-to-b from-amber-500 to-orange-600 flex items-center justify-center text-white shadow-xs opacity-75">
                      <Phone className="w-2.5 h-2.5 fill-current" />
                    </div>
                    <div className="w-6 h-6 rounded-md bg-emerald-600/30 border border-emerald-400/30 flex items-center justify-center opacity-75">
                      <WhatsAppAppIcon size={14} />
                    </div>
                  </div>
                </div>

                {!individualPreview.isValido && (
                  <p className="mt-1 text-[9.5px] text-amber-300/80 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3 text-amber-400 shrink-0" />
                    <span>Completa el nombre, apellido y celular de 9 dígitos para guardar.</span>
                  </p>
                )}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={!individualPreview.isValido}
                className={`w-full py-2.5 px-4 rounded-xl font-black text-xs flex items-center justify-center gap-1.5 transition-all shadow-md ${
                  individualPreview.isValido
                    ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 active:scale-95 cursor-pointer'
                    : 'bg-white/10 text-white/40 cursor-not-allowed border border-white/10'
                }`}
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Guardar Coordinador de Mesa en {distrito}</span>
              </button>
            </form>
          )}

          {/* TAB 2: BATCH LIST PASTE */}
          {activeTab === 'batch' && (
            <div className="space-y-3">
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-white/90 flex items-center justify-between">
                  <span>Pega aquí la lista de personas y celulares</span>
                  <span className="text-[9.5px] font-mono text-cyan-300">
                    1 persona por línea
                  </span>
                </label>
                <textarea
                  rows={5}
                  value={batchText}
                  onChange={(e) => setBatchText(e.target.value)}
                  placeholder={`Ejemplo:\nCarlos Gomez 987654321\nPEREZ GOMEZ, JUAN ALBERTO 912345678\nAna Lopez - 955667788`}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-slate-900/90 border border-white/20 text-white placeholder-white/35 focus:outline-hidden focus:border-amber-400 font-mono"
                  autoFocus
                />
              </div>

              {/* Parsed summary and preview */}
              {parsedBatchItems.length > 0 && (
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-[10px] font-bold uppercase text-white/80">
                    <span>Contactos procesados automáticamente:</span>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                      {validBatchCount} válidos de {parsedBatchItems.length}
                    </span>
                  </div>

                  <div className="max-h-40 overflow-y-auto rounded-xl border border-white/15 bg-black/40 p-1.5 space-y-1">
                    {parsedBatchItems.map((item, idx) => (
                      <div
                        key={item.id}
                        className={`p-1.5 rounded-lg flex items-center justify-between gap-2 text-[10px] border ${
                          item.valido
                            ? 'bg-emerald-950/20 border-emerald-500/30 text-white'
                            : 'bg-rose-950/20 border-rose-500/30 text-rose-300'
                        }`}
                      >
                        <div className="min-w-0 flex items-center gap-1.5">
                          <span className="w-4 h-4 rounded-full bg-white/10 text-white/70 text-[9px] font-mono flex items-center justify-center shrink-0">
                            {idx + 1}
                          </span>
                          <div className="truncate">
                            <span className="font-bold uppercase">
                              {item.nombreCompleto || '(Sin nombre)'}
                            </span>
                            <span className="font-mono text-cyan-300 ml-1.5">
                              {item.telefono || '(Sin celular)'}
                            </span>
                          </div>
                        </div>

                        {item.valido ? (
                          <span className="text-[8.5px] px-1.5 py-0.2 rounded bg-emerald-500/30 text-emerald-300 font-bold shrink-0">
                            Listo
                          </span>
                        ) : (
                          <span className="text-[8.5px] px-1.5 py-0.2 rounded bg-rose-500/30 text-rose-300 font-bold shrink-0">
                            Incompleto
                          </span>
                        )}
                      </div>
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={handleSaveBatch}
                    disabled={validBatchCount === 0}
                    className={`w-full py-2.5 px-4 rounded-xl font-black text-xs flex items-center justify-center gap-1.5 transition-all shadow-md ${
                      validBatchCount > 0
                        ? 'bg-gradient-to-r from-amber-500 to-emerald-400 hover:from-amber-400 hover:to-emerald-300 text-slate-950 active:scale-95 cursor-pointer'
                        : 'bg-white/10 text-white/40 cursor-not-allowed border border-white/10'
                    }`}
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Agregar {validBatchCount} Coordinadores a {distrito}</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
