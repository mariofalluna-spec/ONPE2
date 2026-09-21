import React, { useState, useEffect } from 'react';
import { Smartphone, Download, X, ArrowRight } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface PWAInstallBannerProps {
  onOpenModal: () => void;
}

export const PWAInstallBanner: React.FC<PWAInstallBannerProps> = ({ onOpenModal }) => {
  const { isInstalled, isInstallable, install } = usePWAInstall();
  const [dismissed, setDismissed] = useState<boolean>(() => {
    try {
      return sessionStorage.getItem('pwa_banner_dismissed') === 'true';
    } catch {
      return false;
    }
  });

  // If already running as installed app or dismissed, hide
  if (isInstalled || dismissed) {
    return null;
  }

  const handleDismiss = () => {
    setDismissed(true);
    try {
      sessionStorage.setItem('pwa_banner_dismissed', 'true');
    } catch {
      // ignore
    }
  };

  const handleAction = async () => {
    if (isInstallable) {
      const res = await install();
      if (!res) {
        onOpenModal();
      }
    } else {
      onOpenModal();
    }
  };

  return (
    <div className="w-full px-4 pt-0.5 pb-2">
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-cyan-950/80 via-slate-900/85 to-blue-950/80 border border-cyan-400/30 p-3 shadow-lg backdrop-blur-md text-white flex items-center justify-between gap-3">
        {/* Glow accent */}
        <div className="absolute -left-6 -bottom-6 w-20 h-20 bg-cyan-400/20 rounded-full blur-xl pointer-events-none" />

        <div className="flex items-center gap-2.5 min-w-0 flex-1">
          <div className="w-9 h-9 rounded-xl p-0.5 bg-gradient-to-tr from-amber-400 to-cyan-400 shrink-0 shadow-md flex items-center justify-center">
            <img src="/pwa-192x192.png" alt="ODPE ICA Icon" className="w-full h-full object-cover rounded-[10px]" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-black tracking-tight leading-tight flex items-center gap-1">
              <span>Colocar icono en tu celular</span>
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
            </p>
            <p className="text-[10px] text-white/75 truncate mt-0.5">
              Ingreso directo a ODPE ICA desde tu pantalla
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <button
            id="btn-pwa-banner-action"
            type="button"
            onClick={handleAction}
            className="px-3 py-1.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-[11px] shadow-sm shadow-cyan-500/30 flex items-center gap-1 transition-all active:scale-95"
          >
            <span>Instalar</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={handleDismiss}
            aria-label="Ocultar aviso de instalación"
            className="p-1 text-white/50 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
