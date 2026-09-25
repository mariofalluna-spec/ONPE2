import React, { useState, useEffect } from 'react';
import {
  X,
  Database,
  CloudUpload,
  CheckCircle2,
  AlertCircle,
  Copy,
  Download,
  Terminal,
  Server,
  RefreshCw,
  ExternalLink,
  ShieldCheck,
  FileCode,
} from 'lucide-react';
import {
  getSupabaseConfig,
  saveSupabaseConfig,
  testSupabaseConnection,
} from '../lib/supabase';
import {
  syncAllToSupabase,
  exportBackupJSON,
  generateSQLScript,
  SyncProgress,
} from '../utils/supabaseBackup';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const SupabaseBackupModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'sync' | 'sql' | 'json'>('sync');
  const [url, setUrl] = useState('');
  const [anonKey, setAnonKey] = useState('');
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string; latencyMs?: number } | null>(null);

  const [isSyncing, setIsSyncing] = useState(false);
  const [syncProgress, setSyncProgress] = useState<SyncProgress | null>(null);
  const [syncResult, setSyncResult] = useState<{ success: boolean; message: string } | null>(null);

  const [copiedSql, setCopiedSql] = useState(false);
  const [sqlText, setSqlText] = useState('');

  useEffect(() => {
    if (isOpen) {
      const cfg = getSupabaseConfig();
      setUrl(cfg.url);
      setAnonKey(cfg.anonKey);
      setTestResult(null);
      setSyncResult(null);
      setSyncProgress(null);
      setSqlText(generateSQLScript());
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSaveAndTest = async () => {
    saveSupabaseConfig(url, anonKey);
    setIsTesting(true);
    setTestResult(null);
    try {
      const res = await testSupabaseConnection({ url: url.trim(), anonKey: anonKey.trim() });
      setTestResult(res);
    } finally {
      setIsTesting(false);
    }
  };

  const handleStartSync = async () => {
    saveSupabaseConfig(url, anonKey);
    setIsSyncing(true);
    setSyncResult(null);
    try {
      const res = await syncAllToSupabase((p) => setSyncProgress(p));
      setSyncResult(res);
    } catch (err: any) {
      setSyncResult({ success: false, message: err.message || 'Error al sincronizar' });
    } finally {
      setIsSyncing(false);
    }
  };

  const handleCopySql = () => {
    navigator.clipboard.writeText(sqlText);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2500);
  };

  const handleDownloadSql = () => {
    const blob = new Blob([sqlText], { type: 'text/plain;charset=utf-8;' });
    const u = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = u;
    a.download = `SUPABASE_BACKUP_ODPE_ICA_${new Date().toISOString().slice(0, 10)}.sql`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(u);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/80 backdrop-blur-md animate-fade-in">
      <div
        className="w-full max-w-2xl bg-slate-900/95 border border-emerald-500/30 rounded-2xl shadow-2xl text-white overflow-hidden flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 border-b border-white/10 flex items-center justify-between bg-gradient-to-r from-emerald-950/70 via-slate-900 to-cyan-950/70">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-emerald-400 shadow-md">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-black tracking-wide flex items-center gap-1.5">
                Respaldo en la Nube con Supabase
                <span className="text-[10px] font-bold px-2 py-0.2 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                  PostgreSQL
                </span>
              </h3>
              <p className="text-[11px] text-white/70">
                Sincroniza y respalda todos los 31 Distritos, CLV, RLV y CM en tu base de datos
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white/70 hover:text-white transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-white/10 bg-slate-950/40 px-4 pt-2 gap-2 text-xs font-bold">
          <button
            type="button"
            onClick={() => setActiveTab('sync')}
            className={`pb-2 px-3 border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'sync'
                ? 'border-emerald-400 text-emerald-300'
                : 'border-transparent text-white/60 hover:text-white'
            }`}
          >
            <CloudUpload className="w-3.5 h-3.5" />
            <span>Conectar y Sincronizar</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('sql')}
            className={`pb-2 px-3 border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'sql'
                ? 'border-emerald-400 text-emerald-300'
                : 'border-transparent text-white/60 hover:text-white'
            }`}
          >
            <FileCode className="w-3.5 h-3.5" />
            <span>Código SQL Supabase</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('json')}
            className={`pb-2 px-3 border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'json'
                ? 'border-emerald-400 text-emerald-300'
                : 'border-transparent text-white/60 hover:text-white'
            }`}
          >
            <Download className="w-3.5 h-3.5" />
            <span>Descarga JSON / Copia Local</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 overflow-y-auto space-y-4 flex-1 text-xs">
          {activeTab === 'sync' && (
            <div className="space-y-4">
              {/* Credentials Box */}
              <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white flex items-center gap-1.5">
                    <Server className="w-3.5 h-3.5 text-cyan-400" />
                    Credenciales del Proyecto Supabase
                  </span>
                  <a
                    href="https://supabase.com/dashboard"
                    target="_blank"
                    rel="noreferrer"
                    className="text-[10.5px] text-cyan-300 hover:underline flex items-center gap-1"
                  >
                    <span>Ir a consola Supabase</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>

                <div className="space-y-2">
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-white/70 mb-1">
                      Project URL (URL del Proyecto)
                    </label>
                    <input
                      type="text"
                      value={url}
                      onChange={(e) => setUrl(e.target.value)}
                      placeholder="https://xyzcompany.supabase.co"
                      className="w-full px-3 py-1.5 rounded-lg bg-slate-950/80 border border-white/20 text-white placeholder-white/40 focus:outline-hidden focus:border-emerald-400 font-mono text-[11px]"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase font-bold text-white/70 mb-1">
                      Project API Key (anon / public)
                    </label>
                    <input
                      type="password"
                      value={anonKey}
                      onChange={(e) => setAnonKey(e.target.value)}
                      placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                      className="w-full px-3 py-1.5 rounded-lg bg-slate-950/80 border border-white/20 text-white placeholder-white/40 focus:outline-hidden focus:border-emerald-400 font-mono text-[11px]"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1 gap-2 flex-wrap">
                  <button
                    type="button"
                    onClick={handleSaveAndTest}
                    disabled={isTesting || !url || !anonKey}
                    className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white font-bold flex items-center gap-1.5 transition-all disabled:opacity-50"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isTesting ? 'animate-spin' : ''}`} />
                    <span>{isTesting ? 'Verificando...' : 'Probar Conexión'}</span>
                  </button>

                  <span className="text-[10px] text-white/50">
                    Las claves se guardan de forma segura en tu navegador.
                  </span>
                </div>

                {/* Test Result Message */}
                {testResult && (
                  <div
                    className={`p-2.5 rounded-lg border flex items-start gap-2 ${
                      testResult.success
                        ? 'bg-emerald-500/15 border-emerald-400/40 text-emerald-200'
                        : 'bg-rose-500/15 border-rose-400/40 text-rose-200'
                    }`}
                  >
                    {testResult.success ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                    )}
                    <div className="flex-1">
                      <p className="font-bold">{testResult.message}</p>
                      {testResult.latencyMs !== undefined && (
                        <p className="text-[10px] opacity-80">Latencia de respuesta: {testResult.latencyMs} ms</p>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Sync Action Area */}
              <div className="p-3.5 rounded-xl bg-gradient-to-br from-emerald-950/40 via-slate-900 to-cyan-950/40 border border-emerald-500/30 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-black text-white text-xs flex items-center gap-1.5">
                      <CloudUpload className="w-4 h-4 text-emerald-400" />
                      Subir y Sincronizar Directorio Completo
                    </h4>
                    <p className="text-[11px] text-white/70">
                      Crea o actualiza las tablas y guarda un snapshot con todos los números y cargos
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={handleStartSync}
                    disabled={isSyncing || !url || !anonKey}
                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-black flex items-center gap-1.5 shadow-lg active:scale-95 transition-all disabled:opacity-50"
                  >
                    <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
                    <span>{isSyncing ? 'Sincronizando...' : 'Iniciar Respaldo'}</span>
                  </button>
                </div>

                {/* Sync Progress Bar */}
                {syncProgress && (
                  <div className="space-y-1.5 pt-2 border-t border-white/10">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-white/80 font-medium">{syncProgress.step}</span>
                      <span className="font-mono font-bold text-emerald-300">{syncProgress.percent}%</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-black/50 overflow-hidden border border-white/10">
                      <div
                        className="h-full bg-gradient-to-r from-emerald-400 to-cyan-400 transition-all duration-300"
                        style={{ width: `${syncProgress.percent}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* Final Result Message */}
                {syncResult && (
                  <div
                    className={`p-3 rounded-xl border flex items-start gap-2 ${
                      syncResult.success
                        ? 'bg-emerald-500/20 border-emerald-400/50 text-emerald-100'
                        : 'bg-rose-500/20 border-rose-400/50 text-rose-100'
                    }`}
                  >
                    {syncResult.success ? (
                      <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
                    ) : (
                      <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
                    )}
                    <div>
                      <p className="font-bold">{syncResult.message}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'sql' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <div>
                  <h4 className="font-bold text-white flex items-center gap-1.5">
                    <Terminal className="w-4 h-4 text-emerald-400" />
                    Script SQL para el Editor de Supabase
                  </h4>
                  <p className="text-[11px] text-white/70">
                    Copia y ejecuta este script en el "SQL Editor" de Supabase para inicializar las tablas y datos
                  </p>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={handleCopySql}
                    className="px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black flex items-center gap-1 transition-all active:scale-95 shadow-xs"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>{copiedSql ? '¡Copiado!' : 'Copiar SQL'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleDownloadSql}
                    className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white font-bold flex items-center gap-1 transition-all"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Descargar .sql</span>
                  </button>
                </div>
              </div>

              {/* Code Preview Container */}
              <div className="relative rounded-xl border border-white/15 bg-slate-950 p-3 overflow-hidden font-mono text-[10.5px] max-h-72 overflow-y-auto text-emerald-300">
                <pre>{sqlText.slice(0, 3500)}...</pre>
              </div>

              <div className="p-3 rounded-xl bg-white/5 border border-white/10 space-y-1 text-white/80">
                <div className="font-bold text-white">Pasos rápidos para ejecutar en Supabase:</div>
                <ol className="list-decimal list-inside space-y-0.5 text-[11px]">
                  <li>Copia el script con el botón <strong>"Copiar SQL"</strong>.</li>
                  <li>Entra a tu proyecto en <strong>Supabase</strong> y abre la pestaña <strong>SQL Editor</strong>.</li>
                  <li>Crea una <strong>New Query</strong>, pega el código y presiona <strong>Run</strong>.</li>
                </ol>
              </div>
            </div>
          )}

          {activeTab === 'json' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-cyan-500/20 text-cyan-300 flex items-center justify-center">
                    <Download className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-bold text-white text-xs">Copia de Seguridad en Formato JSON</h4>
                    <p className="text-[11px] text-white/70">
                      Descarga instantánea con todos los distritos, CLV, RLV, CM y metadatos del directorio
                    </p>
                  </div>
                </div>

                <p className="text-[11px] text-white/80">
                  Este archivo contiene la base de datos completa serializada en JSON estándar, permitiendo restauración inmediata o importación en cualquier motor de base de datos relacional o NoSQL.
                </p>

                <button
                  type="button"
                  onClick={exportBackupJSON}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold flex items-center gap-2 active:scale-95 transition-all shadow-lg"
                >
                  <Download className="w-4 h-4" />
                  <span>Descargar Respaldo JSON Completo (.json)</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-white/10 bg-slate-950/70 flex items-center justify-between text-[11px]">
          <span className="text-white/60">ODPE Ica • Sistema de Respaldo y Continuidad Electoral</span>
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-white font-bold transition-all"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
