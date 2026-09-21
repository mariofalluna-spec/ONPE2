import React from 'react';
import { X, Download, Share2, PlusSquare, Smartphone, CheckCircle, ExternalLink } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface PWAInstallModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PWAInstallModal: React.FC<PWAInstallModalProps> = ({ isOpen, onClose }) => {
  const { isInstallable, isIOS, install, isInstalled } = usePWAInstall();

  if (!isOpen) return null;

  const handleInstallClick = async () => {
    const success = await install();
    if (success) {
      onClose();
    }
  };

  return (
    <div
      id="modal-install-pwa"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md transition-all select-none animate-fadeIn"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-sm rounded-3xl bg-slate-900/95 text-white border border-white/20 p-6 shadow-2xl relative overflow-hidden backdrop-blur-xl">
        {/* Header decoration glow */}
        <div className="absolute -top-12 -right-12 w-32 h-32 bg-cyan-500/20 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-12 -left-12 w-32 h-32 bg-amber-500/20 rounded-full blur-2xl pointer-events-none" />

        {/* Close button */}
        <button
          id="btn-close-install-modal"
          type="button"
          onClick={onClose}
          aria-label="Cerrar ventana de instalación"
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-white/10 text-white/70 hover:text-white transition-all active:scale-95"
        >
          <X className="w-5 h-5" />
        </button>

        {/* App Icon preview */}
        <div className="flex flex-col items-center text-center mt-2 mb-4">
          <div className="relative w-20 h-20 rounded-2xl p-1 bg-gradient-to-tr from-cyan-500 to-amber-400 shadow-xl shadow-cyan-500/20 mb-3 flex items-center justify-center">
            <img
              src="/pwa-192x192.png"
              alt="Icono ODPE ICA"
              className="w-full h-full object-cover rounded-xl shadow-inner"
            />
          </div>
          <h3 className="text-lg font-black tracking-tight text-white flex items-center gap-1.5">
            <span>odpe</span>
            <span className="text-amber-300">ICA</span>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-400/30">
              App
            </span>
          </h3>
          <p className="text-xs text-white/70 mt-1 max-w-[260px]">
            Coloca el icono en la pantalla de tu celular para acceder directamente con un solo toque.
          </p>
        </div>

        {/* Status: If already installed */}
        {isInstalled ? (
          <div className="p-4 rounded-2xl bg-emerald-500/15 border border-emerald-400/30 text-center my-4">
            <CheckCircle className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
            <p className="text-xs font-bold text-emerald-300">¡La aplicación ya está instalada!</p>
            <p className="text-[11px] text-white/70 mt-1">
              Ya cuentas con el acceso directo en tu celular.
            </p>
          </div>
        ) : isInstallable ? (
          /* Android / Chrome One-Tap Install */
          <div className="space-y-3 my-4">
            <div className="p-3.5 rounded-2xl bg-cyan-500/10 border border-cyan-400/25 flex items-start gap-3 text-left">
              <Smartphone className="w-5 h-5 text-cyan-300 shrink-0 mt-0.5" />
              <div className="text-xs text-white/85">
                <span className="font-bold text-white block">Instalación automática</span>
                Toca el botón de abajo para añadir el icono a tu pantalla de inicio de forma instantánea.
              </div>
            </div>

            <button
              id="btn-confirm-pwa-install"
              type="button"
              onClick={handleInstallClick}
              className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-black text-sm tracking-wide shadow-lg shadow-cyan-500/30 flex items-center justify-center gap-2 active:scale-95 transition-all"
            >
              <Download className="w-5 h-5" />
              <span>Instalar en la pantalla de inicio</span>
            </button>
          </div>
        ) : isIOS ? (
          /* iOS / iPhone / Safari instructions */
          <div className="space-y-3 my-4 text-left">
            <div className="p-3 rounded-2xl bg-white/10 border border-white/15 space-y-2.5 text-xs text-white/90">
              <div className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-cyan-500 text-slate-950 font-black flex items-center justify-center shrink-0 text-[11px] mt-0.5">
                  1
                </span>
                <p>
                  En la barra inferior de <strong>Safari</strong>, toca el botón{' '}
                  <span className="inline-flex items-center gap-1 font-bold text-amber-300 bg-black/30 px-1.5 py-0.5 rounded border border-white/20">
                    <Share2 className="w-3.5 h-3.5 inline" /> Compartir
                  </span>.
                </p>
              </div>

              <div className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-cyan-500 text-slate-950 font-black flex items-center justify-center shrink-0 text-[11px] mt-0.5">
                  2
                </span>
                <p>
                  Desliza hacia abajo y presiona{' '}
                  <span className="inline-flex items-center gap-1 font-bold text-cyan-300 bg-black/30 px-1.5 py-0.5 rounded border border-white/20">
                    <PlusSquare className="w-3.5 h-3.5 inline" /> Agregar al inicio
                  </span>.
                </p>
              </div>

              <div className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-cyan-500 text-slate-950 font-black flex items-center justify-center shrink-0 text-[11px] mt-0.5">
                  3
                </span>
                <p>
                  Pulsa <strong>"Agregar"</strong> en la esquina superior derecha. ¡Y listo!
                </p>
              </div>
            </div>
          </div>
        ) : (
          /* General / Other browsers instructions */
          <div className="space-y-3 my-4 text-left">
            <div className="p-3 rounded-2xl bg-white/10 border border-white/15 space-y-2 text-xs text-white/90">
              <p className="font-bold text-amber-300">Para agregar el icono a tu celular:</p>
              <p>
                1. Abre el menú de opciones de tu navegador (los <strong>tres puntos ⋮</strong> arriba a la derecha).
              </p>
              <p>
                2. Selecciona <strong>"Instalar aplicación"</strong> o <strong>"Añadir a la pantalla principal"</strong>.
              </p>
              <p>
                3. Confirma la instalación.
              </p>
            </div>
          </div>
        )}

        {/* Benefits list */}
        <div className="pt-2 border-t border-white/10 grid grid-cols-2 gap-2 text-[11px] text-white/70 text-center">
          <div className="p-2 rounded-xl bg-white/5">
            ⚡ <strong>Acceso directo</strong> sin abrir navegador
          </div>
          <div className="p-2 rounded-xl bg-white/5">
            📱 <strong>Pantalla completa</strong> como app nativa
          </div>
        </div>

        {/* Close action */}
        <button
          type="button"
          onClick={onClose}
          className="w-full mt-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-semibold text-white/80 hover:text-white transition-all active:scale-95"
        >
          Entendido / Cerrar
        </button>
      </div>
    </div>
  );
};
