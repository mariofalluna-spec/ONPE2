import React, { useState, useRef } from 'react';
import { X, Upload, Download, FileText, Database, Check, AlertCircle, RefreshCw, Copy, CheckCircle2, FileSpreadsheet } from 'lucide-react';
import { useElectoral } from '../context/ElectoralContext';
import { MesaElectoral } from '../types';
import { LISTA_CM } from '../data/cmData';
import { exportarCoordinadoresMesaExcel } from '../utils/exportExcel';

export const DatabaseModal: React.FC = () => {
  const {
    showDbModal,
    setShowDbModal,
    darkMode,
    mesas,
    importData,
    resetToDefaultData,
    showToast,
  } = useElectoral();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [jsonText, setJsonText] = useState('');
  const [importStatus, setImportStatus] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'upload' | 'template' | 'paste' | 'export'>('upload');
  const [copied, setCopied] = useState(false);

  if (!showDbModal) return null;

  // Handle file selection (JSON or CSV)
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        if (file.name.endsWith('.json') || content.trim().startsWith('[')) {
          const parsed = JSON.parse(content);
          if (Array.isArray(parsed) && parsed.length > 0) {
            importData(parsed);
            setImportStatus(`¡Éxito! Se cargaron ${parsed.length} mesas con sus coordinadores y miembros.`);
            setTimeout(() => setShowDbModal(false), 1300);
            return;
          }
        } else {
          // Parse CSV
          const parsedTables = parseCsv(content);
          if (parsedTables.length > 0) {
            importData(parsedTables);
            setImportStatus(`¡Éxito! Se importaron ${parsedTables.length} mesas y asignados desde CSV.`);
            setTimeout(() => setShowDbModal(false), 1300);
            return;
          }
        }
        setImportStatus('Formato no reconocido. Asegúrate de que incluya los datos de mesa y celulares.');
      } catch {
        setImportStatus('Error al procesar el archivo. Revisa que sea un JSON o CSV válido.');
      }
    };
    reader.readAsText(file);
  };

  // CSV parser for electoral communication directory
  const parseCsv = (csvText: string): MesaElectoral[] => {
    const lines = csvText.split(/\r?\n/).filter(line => line.trim().length > 0);
    if (lines.length < 2) return [];

    const result: MesaElectoral[] = [];

    for (let i = 1; i < lines.length; i++) {
      const cols = lines[i].split(',').map(c => c.trim().replace(/^["']|["']$/g, ''));
      if (cols.length < 2) continue;

      const mesaNum = cols[0] || `048${200 + i}`;
      const distrito = cols[1] || 'Huacachina / Balneario';
      const localVotacion = cols[2] || 'Local de Votación';
      const aula = cols[3] || `Aula ${i}`;

      const coordNombre = cols[4] || 'Coordinador Distrital';
      const coordTel = cols[5] || '+51956000000';

      const presNombre = cols[6] || 'Presidente de Mesa';
      const presTel = cols[7] || '+51956111111';

      const secNombre = cols[8] || 'Secretario';
      const secTel = cols[9] || '+51956222222';

      const terNombre = cols[10] || 'Tercer Miembro';
      const terTel = cols[11] || '+51956333333';

      const asigNombre = cols[12];
      const asigCargo = cols[13] || 'Fiscalizador / Asignado';
      const asigTel = cols[14];

      const mesa: MesaElectoral = {
        id: `mesa-${mesaNum}`,
        numeroMesa: mesaNum,
        departamento: 'Ica',
        provincia: 'Ica',
        distrito: distrito,
        localVotacion: localVotacion,
        direccion: `Dirección ${distrito}`,
        aula: aula,
        pabellon: 'Pabellón Central',
        piso: 'Piso 1',
        coordinadorDistrital: {
          id: `coord-${mesaNum}`,
          nombre: coordNombre,
          cargo: 'Coordinador Distrital',
          telefono: coordTel,
          distrito: distrito,
          disponible: true,
        },
        miembrosMesa: [
          {
            id: `mb-${mesaNum}-1`,
            nombre: presNombre,
            cargo: 'Presidente de Mesa',
            telefono: presTel,
            disponible: true,
          },
          {
            id: `mb-${mesaNum}-2`,
            nombre: secNombre,
            cargo: 'Secretario',
            telefono: secTel,
            disponible: true,
          },
          {
            id: `mb-${mesaNum}-3`,
            nombre: terNombre,
            cargo: 'Tercer Miembro',
            telefono: terTel,
            disponible: true,
          }
        ],
        otrosAsignados: asigNombre && asigTel ? [
          {
            id: `asig-${mesaNum}-1`,
            nombre: asigNombre,
            cargo: asigCargo,
            telefono: asigTel,
            disponible: true,
          }
        ] : [],
      };

      result.push(mesa);
    }

    return result;
  };

  const handlePasteImport = () => {
    try {
      const trimmed = jsonText.trim();
      if (trimmed.startsWith('[')) {
        const parsed = JSON.parse(trimmed);
        if (Array.isArray(parsed) && parsed.length > 0) {
          importData(parsed);
          setImportStatus(`¡Éxito! Se importaron ${parsed.length} mesas con sus números de celular.`);
          setTimeout(() => setShowDbModal(false), 1200);
          return;
        }
      } else {
        const parsedTables = parseCsv(trimmed);
        if (parsedTables.length > 0) {
          importData(parsedTables);
          setImportStatus(`¡Éxito! Se importaron ${parsedTables.length} mesas desde texto CSV.`);
          setTimeout(() => setShowDbModal(false), 1200);
          return;
        }
      }
      setImportStatus('Formato no válido. Comprueba el texto ingresado.');
    } catch {
      setImportStatus('Error de sintaxis al procesar el texto.');
    }
  };

  // Download sample CSV template
  const downloadSampleCsv = () => {
    const csvContent =
      'numeroMesa,distrito,localVotacion,aula,coordinador_nombre,coordinador_telefono,presidente_nombre,presidente_telefono,secretario_nombre,secretario_telefono,tercer_miembro_nombre,tercer_miembro_telefono,asignado_nombre,asignado_cargo,asignado_telefono\n' +
      '048201,Huacachina / Balneario,C.E. Las Dunas,Aula 101,Renzo Huaman,+51956345678,Carlos Mendoza,+51956123456,Maria Elena Quispe,+51956234567,Juan Pablo Arcos,+51956778899,Roberto Salazar,Fiscalizador,+51956567890\n' +
      '048202,Huacachina / Balneario,C.E. Las Dunas,Aula 102,Renzo Huaman,+51956345678,Vanessa Carrizales,+51956678901,Gabriel Espinoza,+51956991122,Carmen Rosa Bernaola,+51956334411,Mariela Cornejo,Coordinador de Local,+51956228833\n' +
      '048203,Ica Cercado,I.E. San Luis Gonzaga,Aula 201,Patricia Levano,+51956890123,Julia Benavides,+51956456789,Diego Alonso Vasquez,+51956339900,Rosa Maria Chavez,+51956551188,Marco Antonio Prado,Personero / Asignado,+51956994433';

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'plantilla_directorio_mesas_electoral.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Plantilla CSV descargada.');
  };

  // Export current directory as JSON
  const exportCurrentJson = () => {
    const blob = new Blob([JSON.stringify(mesas, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `directorio_electoral_${Date.now()}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Directorio completo exportado.');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/40 backdrop-blur-md transition-all">
      <div
        className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-t-3xl sm:rounded-3xl p-5 shadow-2xl border bg-slate-950/45 backdrop-blur-md text-white border-white/25 shadow-black/70"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/20 mb-4">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-400">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base tracking-tight leading-tight">
                Gestión de Base de Datos
              </h3>
              <p className="text-[11px] opacity-75">
                Carga coordinadores, miembros de mesa y celulares
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setShowDbModal(false)}
            className="p-2 rounded-full hover:bg-white/10 text-white/80 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selector */}
        <div className="grid grid-cols-4 gap-1 p-1 bg-white/10 backdrop-blur-md border border-white/15 rounded-xl mb-4 text-xs font-semibold">
          <button
            type="button"
            onClick={() => setActiveTab('upload')}
            className={`py-1.5 rounded-lg transition-all text-center ${
              activeTab === 'upload' ? 'bg-cyan-500 text-white shadow-xs' : 'opacity-70 hover:opacity-100'
            }`}
          >
            Subir
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('template')}
            className={`py-1.5 rounded-lg transition-all text-center ${
              activeTab === 'template' ? 'bg-cyan-500 text-white shadow-xs' : 'opacity-70 hover:opacity-100'
            }`}
          >
            Plantilla
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('paste')}
            className={`py-1.5 rounded-lg transition-all text-center ${
              activeTab === 'paste' ? 'bg-cyan-500 text-white shadow-xs' : 'opacity-70 hover:opacity-100'
            }`}
          >
            Pegar
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('export')}
            className={`py-1.5 rounded-lg transition-all text-center ${
              activeTab === 'export' ? 'bg-cyan-500 text-white shadow-xs' : 'opacity-70 hover:opacity-100'
            }`}
          >
            Exportar
          </button>
        </div>

        {/* TAB: UPLOAD FILE */}
        {activeTab === 'upload' && (
          <div className="space-y-3 text-xs">
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-cyan-500/40 hover:border-cyan-400 rounded-2xl p-6 text-center cursor-pointer bg-cyan-950/25 backdrop-blur-md hover:bg-cyan-950/40 transition-colors"
            >
              <Upload className="w-8 h-8 text-cyan-400 mx-auto mb-2" />
              <p className="font-bold text-sm">Toca para seleccionar archivo</p>
              <p className="text-[11px] opacity-70 mt-1">
                Soporta formato .CSV o .JSON con listas de mesas, coordinadores y miembros
              </p>
              <span className="inline-block mt-3 px-3 py-1 rounded-full bg-cyan-500 text-white text-[11px] font-bold">
                Examinar archivos
              </span>
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv,.json,text/csv,application/json"
                onChange={handleFileUpload}
                className="hidden"
              />
            </div>

            <div className="p-3 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 space-y-1">
              <span className="font-bold block text-cyan-300">Formato automático:</span>
              <p className="opacity-80">
                Puedes subir directamente la base de datos de tu organización con los teléfonos de los coordinadores y miembros de mesa.
              </p>
            </div>
          </div>
        )}

        {/* TAB: TEMPLATE */}
        {activeTab === 'template' && (
          <div className="space-y-3 text-xs">
            <p className="opacity-80">
              Descarga la plantilla CSV oficial para rellenar en Excel o Google Sheets con los celulares de los coordinadores distritales, miembros de mesa y asignados:
            </p>

            <button
              type="button"
              onClick={downloadSampleCsv}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/25 active:scale-95 transition-all"
            >
              <Download className="w-4 h-4" />
              <span>Descargar Plantilla CSV para Excel</span>
            </button>

            <div className="p-3 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 font-mono text-[10px] space-y-1 overflow-x-auto">
              <span className="font-bold text-cyan-300 block">Columnas requeridas:</span>
              <p>numeroMesa, distrito, localVotacion, aula,</p>
              <p>coordinador_nombre, coordinador_telefono,</p>
              <p>presidente_nombre, presidente_telefono,</p>
              <p>secretario_nombre, secretario_telefono,</p>
              <p>tercer_miembro_nombre, tercer_miembro_telefono,</p>
              <p>asignado_nombre, asignado_cargo, asignado_telefono</p>
            </div>
          </div>
        )}

        {/* TAB: PASTE TEXT */}
        {activeTab === 'paste' && (
          <div className="space-y-3 text-xs">
            <p className="opacity-80">
              Pega aquí el contenido CSV o JSON con los datos de mesas y teléfonos:
            </p>
            <textarea
              rows={6}
              value={jsonText}
              onChange={(e) => setJsonText(e.target.value)}
              placeholder="048201,Huacachina / Balneario,C.E. Las Dunas,Aula 101,Renzo Huaman,+51956345678,Carlos Mendoza,+51956123456..."
              className="w-full p-3 rounded-xl bg-slate-950/60 backdrop-blur-md border border-white/20 text-white font-mono text-xs outline-none focus:border-cyan-400"
            />
            <button
              type="button"
              onClick={handlePasteImport}
              className="w-full py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-white font-bold text-xs shadow-md shadow-cyan-500/25"
            >
              Importar Contenido
            </button>
          </div>
        )}

        {/* TAB: EXPORT */}
        {activeTab === 'export' && (
          <div className="space-y-3 text-xs">
            {/* Exportar Coordinadores de Mesa a Excel */}
            <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-400/35 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-emerald-300 flex items-center gap-1.5 text-xs">
                  <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
                  Coordinadores de Mesa (31 Distritos)
                </span>
                <span className="text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-200 px-2 py-0.5 rounded-full border border-emerald-400/30">
                  {LISTA_CM.length} CMs
                </span>
              </div>
              <p className="text-[11px] opacity-80 leading-relaxed">
                Descarga la relación oficial de los {LISTA_CM.length} coordinadores de mesa con nombres completos, distritos, celulares y enlaces a WhatsApp, formateado para abrir en Microsoft Excel o Google Sheets.
              </p>
              <div className="grid grid-cols-2 gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    exportarCoordinadoresMesaExcel(LISTA_CM, 'coordinadores_de_mesa_31_distritos', 'xls');
                    showToast('Descargando archivo Excel (.xls)...');
                  }}
                  className="py-2 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] flex items-center justify-center gap-1.5 active:scale-95 shadow-sm transition-colors cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Excel (.XLS)</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    exportarCoordinadoresMesaExcel(LISTA_CM, 'coordinadores_de_mesa_31_distritos', 'csv');
                    showToast('Descargando archivo CSV (.csv)...');
                  }}
                  className="py-2 px-3 rounded-lg bg-white/10 hover:bg-white/20 text-white font-bold text-[11px] flex items-center justify-center gap-1.5 active:scale-95 border border-white/20 transition-colors cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>CSV (.CSV)</span>
                </button>
              </div>
            </div>

            <p className="opacity-80 pt-1">
              Descarga una copia de seguridad del directorio completo actualmente cargado ({mesas.length} mesas):
            </p>
            <button
              type="button"
              onClick={exportCurrentJson}
              className="w-full py-2.5 px-4 rounded-xl bg-white/10 hover:bg-white/20 backdrop-blur-md text-white border border-white/20 font-bold flex items-center justify-center gap-2 active:scale-95"
            >
              <Download className="w-4 h-4 text-cyan-300" />
              <span>Exportar Mesas (JSON)</span>
            </button>

            <button
              type="button"
              onClick={resetToDefaultData}
              className="w-full py-2 px-4 rounded-xl bg-rose-950/40 hover:bg-rose-950/60 backdrop-blur-md text-rose-300 border border-rose-500/30 font-bold flex items-center justify-center gap-1.5 active:scale-95 text-xs"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Restablecer a Directorio Inicial (Huacachina / Ica)</span>
            </button>
          </div>
        )}

        {/* Status Message */}
        {importStatus && (
          <div className="mt-3 p-3 rounded-xl bg-cyan-500/20 backdrop-blur-md border border-cyan-500/40 text-cyan-300 text-xs flex items-center gap-2">
            <Check className="w-4 h-4 shrink-0" />
            <span>{importStatus}</span>
          </div>
        )}
      </div>
    </div>
  );
};
