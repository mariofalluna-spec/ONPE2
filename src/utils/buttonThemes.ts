export interface ButtonTheme {
  id: string;
  label: string;
  previewClass: string;
  whatsAppButton: string;
  callButtonLarge: (variant?: 'emerald' | 'cyan' | 'amber') => string;
  navTabContainer: string;
  navTabActive: string;
  navTabInactive: string;
}

export const BUTTON_THEMES: Record<string, ButtonTheme> = {
  'cristal-neon': {
    id: 'cristal-neon',
    label: 'Cristal Neón',
    previewClass: 'bg-cyan-500/20 text-cyan-300 border-cyan-400/50',
    whatsAppButton: 'w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-gradient-to-b from-emerald-500 to-green-600 hover:from-emerald-400 hover:to-green-500 border border-emerald-400/60 flex items-center justify-center text-white shadow-md active:scale-90 transition-transform',
    callButtonLarge: (variant = 'cyan') => {
      if (variant === 'emerald') return 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black shadow-md';
      if (variant === 'amber') return 'bg-amber-500 hover:bg-amber-400 text-slate-950 font-black shadow-md';
      return 'bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-black shadow-md';
    },
    navTabContainer: 'bg-slate-950/60 p-1 rounded-2xl border border-white/20 backdrop-blur-md',
    navTabActive: 'bg-cyan-500 text-slate-950 font-black shadow-md',
    navTabInactive: 'text-white/70 hover:text-white hover:bg-white/10 font-bold',
  },
  'esmeralda-pro': {
    id: 'esmeralda-pro',
    label: 'Esmeralda Pro',
    previewClass: 'bg-emerald-500/20 text-emerald-300 border-emerald-400/50',
    whatsAppButton: 'w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-gradient-to-b from-emerald-500 to-green-600 hover:from-emerald-400 hover:to-green-500 border border-emerald-400/60 flex items-center justify-center text-white shadow-md active:scale-90 transition-transform',
    callButtonLarge: () => 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black shadow-md',
    navTabContainer: 'bg-slate-950/60 p-1 rounded-2xl border border-emerald-500/30 backdrop-blur-md',
    navTabActive: 'bg-emerald-500 text-slate-950 font-black shadow-md',
    navTabInactive: 'text-white/70 hover:text-white hover:bg-white/10 font-bold',
  },
  'sol-ica': {
    id: 'sol-ica',
    label: 'Sol de Ica',
    previewClass: 'bg-amber-500/20 text-amber-300 border-amber-400/50',
    whatsAppButton: 'w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-gradient-to-b from-emerald-500 to-green-600 hover:from-emerald-400 hover:to-green-500 border border-emerald-400/60 flex items-center justify-center text-white shadow-md active:scale-90 transition-transform',
    callButtonLarge: () => 'bg-amber-500 hover:bg-amber-400 text-slate-950 font-black shadow-md',
    navTabContainer: 'bg-slate-950/60 p-1 rounded-2xl border border-amber-500/30 backdrop-blur-md',
    navTabActive: 'bg-amber-500 text-slate-950 font-black shadow-md',
    navTabInactive: 'text-white/70 hover:text-white hover:bg-white/10 font-bold',
  },
};
