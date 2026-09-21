import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { MesaElectoral, ContactoElectoral, ViewMode } from '../types';
import { INITIAL_MESAS } from '../data/mockElectoralData';
import { HD_WALLPAPERS, WallpaperItem } from '../data/wallpapers';

interface WallpaperConfig {
  imageUrl: string;
  isCustom: boolean;
  dimOpacity: number; // 0 to 90%
  blurAmount: number; // 0 to 12px
}

interface ElectoralContextType {
  mesas: MesaElectoral[];
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  filterDistrito: string;
  setFilterDistrito: (distrito: string) => void;
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
  selectedMesa: MesaElectoral | null;
  setSelectedMesa: (mesa: MesaElectoral | null) => void;
  darkMode: boolean;
  setDarkMode: (val: boolean | ((prev: boolean) => boolean)) => void;
  wallpaper: WallpaperConfig;
  setWallpaper: React.Dispatch<React.SetStateAction<WallpaperConfig>>;
  hdWallpapers: WallpaperItem[];
  wallpaperIndex: number;
  autoRotateWallpapers: boolean;
  setAutoRotateWallpapers: React.Dispatch<React.SetStateAction<boolean>>;
  rotationInterval: number;
  setRotationInterval: (seconds: number) => void;
  nextWallpaper: () => void;
  prevWallpaper: () => void;
  selectWallpaperByIndex: (index: number) => void;
  currentWallpaperItem: WallpaperItem;
  isListening: boolean;
  speechTranscript: string;
  speechError: string | null;
  startVoiceSearch: () => void;
  stopVoiceSearch: () => void;
  showVoiceModal: boolean;
  setShowVoiceModal: (val: boolean) => void;
  showDbModal: boolean;
  setShowDbModal: (val: boolean) => void;
  showWallpaperModal: boolean;
  setShowWallpaperModal: (val: boolean) => void;
  showInstallModal: boolean;
  setShowInstallModal: (val: boolean) => void;
  immersiveMode: boolean;
  setImmersiveMode: (val: boolean | ((prev: boolean) => boolean)) => void;
  filteredMesas: MesaElectoral[];
  distritosDisponibles: string[];
  totalContactos: number;
  importData: (newMesas: MesaElectoral[]) => void;
  resetToDefaultData: () => void;
  addAsignadoToMesa: (mesaId: string, nuevoAsignado: ContactoElectoral) => void;
  callContact: (phone: string, nombre: string, cargo?: string, mesaOdistrito?: string) => void;
  sendWhatsApp: (phone: string, nombre: string, cargo?: string, mesaOdistrito?: string) => void;
  toastMessage: string | null;
  showToast: (msg: string) => void;
}

const ElectoralContext = createContext<ElectoralContextType | undefined>(undefined);

const STORAGE_KEY_MESAS = 'electoral_bing_directorio_mesas_v2';
const STORAGE_KEY_DARK_MODE = 'electoral_bing_dark_mode';
const STORAGE_KEY_WALLPAPER = 'electoral_bing_wallpaper_v1';

export const ElectoralProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // 1. Mesas and directory state with localStorage
  const [mesas, setMesas] = useState<MesaElectoral[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_MESAS);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // ignore
    }
    return INITIAL_MESAS;
  });

  // 2. Filters & View mode
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterDistrito, setFilterDistrito] = useState<string>('Huacachina / Balneario');
  const [viewMode, setViewMode] = useState<ViewMode>('todas');
  const [selectedMesa, setSelectedMesa] = useState<MesaElectoral | null>(null);

  // 3. Dark mode state
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_DARK_MODE);
      if (saved !== null) return saved === 'true';
    } catch {
      // fallback
    }
    return true; // Default to dark mode for stunning contrast with Huacachina wallpaper
  });

  // 4. Wallpaper state
  const [wallpaperIndex, setWallpaperIndex] = useState<number>(0);
  const [autoRotateWallpapers, setAutoRotateWallpapers] = useState<boolean>(true);
  const [rotationInterval, setRotationIntervalState] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('odpe_wallpaper_interval');
      if (saved) {
        const parsed = parseInt(saved, 10);
        if (!isNaN(parsed) && parsed > 0) return parsed;
      }
    } catch {
      // ignore
    }
    return 600; // 10 minutes default (600 seconds)
  });

  const setRotationInterval = (seconds: number) => {
    setRotationIntervalState(seconds);
    try {
      localStorage.setItem('odpe_wallpaper_interval', seconds.toString());
    } catch {
      // ignore
    }
  };

  const [wallpaper, setWallpaper] = useState<WallpaperConfig>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_WALLPAPER);
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return {
      imageUrl: HD_WALLPAPERS[0].imageUrl,
      isCustom: false,
      dimOpacity: 20, // Clean, vivid background
      blurAmount: 0,
    };
  });

  // Current wallpaper metadata item
  const currentWallpaperItem = useMemo(() => {
    return HD_WALLPAPERS[wallpaperIndex] || HD_WALLPAPERS[0];
  }, [wallpaperIndex]);

  // Select wallpaper by index
  const selectWallpaperByIndex = (index: number) => {
    const validIndex = (index + HD_WALLPAPERS.length) % HD_WALLPAPERS.length;
    setWallpaperIndex(validIndex);
    setWallpaper(current => ({
      ...current,
      imageUrl: HD_WALLPAPERS[validIndex].imageUrl,
      isCustom: false,
    }));
  };

  const nextWallpaper = () => {
    selectWallpaperByIndex(wallpaperIndex + 1);
  };

  const prevWallpaper = () => {
    selectWallpaperByIndex(wallpaperIndex - 1);
  };

  // Auto rotation effect every 10 seconds (or configured interval)
  useEffect(() => {
    if (!autoRotateWallpapers || wallpaper.isCustom) return;

    const timer = setInterval(() => {
      setWallpaperIndex(prevIndex => {
        const nextIndex = (prevIndex + 1) % HD_WALLPAPERS.length;
        setWallpaper(current => {
          if (current.isCustom) return current;
          return {
            ...current,
            imageUrl: HD_WALLPAPERS[nextIndex].imageUrl,
          };
        });
        return nextIndex;
      });
    }, rotationInterval * 1000);

    return () => clearInterval(timer);
  }, [autoRotateWallpapers, rotationInterval, wallpaper.isCustom]);

  // 5. Immersive mode state to appreciate the wallpaper freely
  const [immersiveMode, setImmersiveMode] = useState<boolean>(false);

  // 6. Modals & Voice state
  const [showVoiceModal, setShowVoiceModal] = useState<boolean>(false);
  const [showDbModal, setShowDbModal] = useState<boolean>(false);
  const [showWallpaperModal, setShowWallpaperModal] = useState<boolean>(false);
  const [showInstallModal, setShowInstallModal] = useState<boolean>(false);
  const [isListening, setIsListening] = useState<boolean>(false);
  const [speechTranscript, setSpeechTranscript] = useState<string>('');
  const [speechError, setSpeechError] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Save changes to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_MESAS, JSON.stringify(mesas));
    } catch {
      // ignore
    }
  }, [mesas]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_DARK_MODE, String(darkMode));
    } catch {
      // ignore
    }
  }, [darkMode]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_WALLPAPER, JSON.stringify(wallpaper));
    } catch {
      // ignore
    }
  }, [wallpaper]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(prev => (prev === msg ? null : prev));
    }, 3500);
  };

  // Voice Search setup with Web Speech API
  const startVoiceSearch = () => {
    const SpeechRecognitionClass = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognitionClass) {
      setSpeechError('El reconocimiento de voz no está disponible en este navegador. Usa Chrome, Edge o Safari.');
      setShowVoiceModal(true);
      return;
    }

    try {
      const recognition = new SpeechRecognitionClass();
      recognition.lang = 'es-PE'; // Spanish Peru / Latin America
      recognition.continuous = false;
      recognition.interimResults = true;

      setSpeechTranscript('');
      setSpeechError(null);
      setIsListening(true);
      setShowVoiceModal(true);

      let capturedText = '';

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event: { resultIndex: number; results: { [key: number]: { [key: number]: { transcript: string } } } }) => {
        const current = event.results[event.resultIndex][0].transcript;
        capturedText = current;
        setSpeechTranscript(current);
      };

      recognition.onerror = (event: { error: string }) => {
        setIsListening(false);
        if (event.error === 'not-allowed') {
          setSpeechError('Permiso de micrófono denegado. Permite el acceso para buscar por voz.');
        } else if (event.error === 'no-speech') {
          setSpeechError('No se detectó voz. Habla cerca del micrófono para buscar.');
        } else {
          setSpeechError(`Error al reconocer voz: ${event.error}`);
        }
      };

      recognition.onend = () => {
        setIsListening(false);
        if (capturedText.trim()) {
          setSearchQuery(capturedText.trim());
          setTimeout(() => {
            setShowVoiceModal(false);
          }, 600);
        }
      };

      recognition.start();
    } catch {
      setIsListening(false);
      setSpeechError('No se pudo acceder al micrófono del dispositivo.');
    }
  };

  const stopVoiceSearch = () => {
    setIsListening(false);
    if (speechTranscript.trim()) {
      setSearchQuery(speechTranscript.trim());
    }
    setShowVoiceModal(false);
  };

  // Direct 1-Tap Phone Call to Coordinator, Table Member, or Assignee
  const callContact = (phone: string, nombre: string, cargo?: string, mesaOdistrito?: string) => {
    const cleanPhone = phone.replace(/[^0-9+]/g, '');
    const contextInfo = mesaOdistrito ? ` (${mesaOdistrito})` : '';
    const roleInfo = cargo ? `${cargo} ` : '';
    showToast(`Llamando a ${roleInfo}${nombre}${contextInfo}...`);
    window.location.href = `tel:${cleanPhone}`;
  };

  // Direct WhatsApp contact
  const sendWhatsApp = (phone: string, nombre: string, cargo?: string, mesaOdistrito?: string) => {
    const cleanPhone = phone.replace(/[^0-9]/g, '');
    const roleText = cargo ? ` como ${cargo}` : '';
    const contextText = mesaOdistrito ? ` de ${mesaOdistrito}` : '';
    const text = encodeURIComponent(`Hola ${nombre}, te contacto${roleText}${contextText}. Por favor confírmame tu disponibilidad y estado.`);
    window.open(`https://wa.me/${cleanPhone}?text=${text}`, '_blank');
  };

  // Add a newly assigned contact to a mesa
  const addAsignadoToMesa = (mesaId: string, nuevoAsignado: ContactoElectoral) => {
    setMesas(prev =>
      prev.map(m => {
        if (m.id !== mesaId && m.numeroMesa !== mesaId) return m;
        return {
          ...m,
          otrosAsignados: [...(m.otrosAsignados || []), nuevoAsignado],
        };
      })
    );
    showToast(`Asignado "${nuevoAsignado.nombre}" agregado exitosamente.`);
  };

  // Filtered mesas memoization
  const filteredMesas = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();

    // 1. If searching, find ONLY the exact matching mesas across the directory
    if (q) {
      return mesas.filter(mesa => {
        // Match mesa number (e.g. 048201 or 48201)
        if (mesa.numeroMesa.toLowerCase().includes(q)) return true;

        // Match voting location or address
        if (mesa.localVotacion.toLowerCase().includes(q)) return true;
        if (mesa.aula && mesa.aula.toLowerCase().includes(q)) return true;
        if (mesa.distrito.toLowerCase().includes(q)) return true;

        // Match Coordinador Distrital name, cargo, or phone
        const coord = mesa.coordinadorDistrital;
        if (
          coord.nombre.toLowerCase().includes(q) ||
          coord.cargo.toLowerCase().includes(q) ||
          coord.telefono.includes(q) ||
          (coord.telefonoSecundario && coord.telefonoSecundario.includes(q))
        ) {
          return true;
        }

        // Match table member
        if (
          mesa.miembrosMesa?.some(
            m =>
              m.nombre.toLowerCase().includes(q) ||
              m.cargo.toLowerCase().includes(q) ||
              m.telefono.includes(q) ||
              (m.dni && m.dni.includes(q)) ||
              (m.telefonoSecundario && m.telefonoSecundario.includes(q))
          )
        ) {
          return true;
        }

        // Match assigned personnel
        if (
          mesa.otrosAsignados?.some(
            a =>
              a.nombre.toLowerCase().includes(q) ||
              a.cargo.toLowerCase().includes(q) ||
              a.telefono.includes(q) ||
              (a.nota && a.nota.toLowerCase().includes(q))
          )
        ) {
          return true;
        }

        return false;
      });
    }

    // 2. If NOT searching: strictly return tables of the selected district only!
    // Never show tables from other districts.
    const activeDist = filterDistrito === 'all' ? (mesas[0]?.distrito || 'Huacachina / Balneario') : filterDistrito;
    return mesas.filter(mesa => mesa.distrito === activeDist);
  }, [mesas, searchQuery, filterDistrito]);

  // Total unique contacts across all loaded mesas
  const totalContactos = useMemo(() => {
    let count = 0;
    const phoneSet = new Set<string>();

    mesas.forEach(m => {
      if (m.coordinadorDistrital?.telefono && !phoneSet.has(m.coordinadorDistrital.telefono)) {
        phoneSet.add(m.coordinadorDistrital.telefono);
        count++;
      }
      m.miembrosMesa?.forEach(mb => {
        if (mb.telefono && !phoneSet.has(mb.telefono)) {
          phoneSet.add(mb.telefono);
          count++;
        }
      });
      m.otrosAsignados?.forEach(asig => {
        if (asig.telefono && !phoneSet.has(asig.telefono)) {
          phoneSet.add(asig.telefono);
          count++;
        }
      });
    });

    return count;
  }, [mesas]);

  // Unique list of districts for the quick selector
  const distritosDisponibles = useMemo(() => {
    const set = new Set<string>();
    mesas.forEach(m => {
      if (m.distrito) set.add(m.distrito);
    });
    return Array.from(set);
  }, [mesas]);

  // Import custom dataset (CSV or JSON parsed)
  const importData = (newMesas: MesaElectoral[]) => {
    setMesas(newMesas);
    showToast(`¡Directorio actualizado con ${newMesas.length} mesas electorales!`);
  };

  const resetToDefaultData = () => {
    setMesas(INITIAL_MESAS);
    localStorage.removeItem(STORAGE_KEY_MESAS);
    showToast('Directorio restablecido a los valores iniciales.');
  };

  return (
    <ElectoralContext.Provider
      value={{
        mesas,
        searchQuery,
        setSearchQuery,
        filterDistrito,
        setFilterDistrito,
        viewMode,
        setViewMode,
        selectedMesa,
        setSelectedMesa,
        darkMode,
        setDarkMode,
        wallpaper,
        setWallpaper,
        hdWallpapers: HD_WALLPAPERS,
        wallpaperIndex,
        autoRotateWallpapers,
        setAutoRotateWallpapers,
        rotationInterval,
        setRotationInterval,
        nextWallpaper,
        prevWallpaper,
        selectWallpaperByIndex,
        currentWallpaperItem,
        isListening,
        speechTranscript,
        speechError,
        startVoiceSearch,
        stopVoiceSearch,
        showVoiceModal,
        setShowVoiceModal,
        showDbModal,
        setShowDbModal,
        showWallpaperModal,
        setShowWallpaperModal,
        showInstallModal,
        setShowInstallModal,
        immersiveMode,
        setImmersiveMode,
        filteredMesas,
        distritosDisponibles,
        totalContactos,
        importData,
        resetToDefaultData,
        addAsignadoToMesa,
        callContact,
        sendWhatsApp,
        toastMessage,
        showToast,
      }}
    >
      {children}
    </ElectoralContext.Provider>
  );
};

export const useElectoral = () => {
  const context = useContext(ElectoralContext);
  if (!context) {
    throw new Error('useElectoral must be used within an ElectoralProvider');
  }
  return context;
};
