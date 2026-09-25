import huacachinaNocheMobile from '../assets/images/huacachina_milky_way_1790104324367.jpg';
import huacachinaNocheWide from '../assets/images/huacachina_milky_way_wide_1790104336513.jpg';
import huacachinaDiaMobile from '../assets/images/huacachina_day_mobile_1790377363382.jpg';
import huacachinaDiaWide from '../assets/images/huacachina_day_wide_1790377374397.jpg';

export interface WallpaperItem {
  id: string;
  title: string;
  location: string;
  imageUrl: string;
  wideImageUrl?: string;
  districtTag?: string;
  periodo?: 'dia' | 'noche';
}

// 1. Fondo de Día (Antes de las 6:10 PM): Laguna de Huacachina soleada con palmeras y dunas
export const HUACACHINA_DIA_WALLPAPER: WallpaperItem = {
  id: 'huacachina_dia',
  title: 'Laguna de Huacachina (Día)',
  location: 'Oasis de Huacachina, Ica',
  imageUrl: huacachinaDiaMobile,
  wideImageUrl: huacachinaDiaWide,
  districtTag: 'Huacachina / Ica',
  periodo: 'dia',
};

// 2. Fondo de Noche (A partir de las 6:10 PM): Laguna de Huacachina bajo la Vía Láctea
export const HUACACHINA_NOCHE_WALLPAPER: WallpaperItem = {
  id: 'huacachina_noche_via_lactea',
  title: 'Laguna de Huacachina bajo la Vía Láctea (Noche)',
  location: 'Oasis de Huacachina, Ica',
  imageUrl: huacachinaNocheMobile,
  wideImageUrl: huacachinaNocheWide,
  districtTag: 'Huacachina / Ica',
  periodo: 'noche',
};

// Alias para compatibilidad
export const HUACACHINA_WALLPAPER = HUACACHINA_NOCHE_WALLPAPER;

/**
 * Determina si según la hora actual corresponde el fondo de noche (después de las 6:10 PM / 18:10)
 * o el fondo de día (antes de las 6:10 PM).
 */
export function isNightTimeBySchedule(): boolean {
  const now = new Date();
  const hours = now.getHours();
  const minutes = now.getMinutes();
  const currentTotalMinutes = hours * 60 + minutes;
  const switchTotalMinutes = 18 * 60 + 10; // 18:10 (6:10 PM) = 1090 minutos

  // Noche: desde las 18:10 (6:10 PM) hasta las 05:59 AM
  // Día: desde las 06:00 AM hasta las 18:09 (6:09 PM)
  return currentTotalMinutes >= switchTotalMinutes || currentTotalMinutes < 6 * 60;
}

/**
 * Retorna el fondo correspondiente según el horario
 */
export function getCurrentScheduledWallpaper(): WallpaperItem {
  return isNightTimeBySchedule() ? HUACACHINA_NOCHE_WALLPAPER : HUACACHINA_DIA_WALLPAPER;
}

// Lista de fondos disponibles
export const HD_WALLPAPERS: WallpaperItem[] = [
  HUACACHINA_DIA_WALLPAPER,
  HUACACHINA_NOCHE_WALLPAPER,
];

