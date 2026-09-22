import huacachinaMobile from '../assets/images/huacachina_milky_way_1790104324367.jpg';
import huacachinaWide from '../assets/images/huacachina_milky_way_wide_1790104336513.jpg';

export interface WallpaperItem {
  id: string;
  title: string;
  location: string;
  imageUrl: string;
  wideImageUrl?: string;
  districtTag?: string;
}

// Fondo único oficial: Laguna de Huacachina bajo la Vía Láctea (Oasis de Ica)
export const HUACACHINA_WALLPAPER: WallpaperItem = {
  id: 'huacachina_via_lactea',
  title: 'Laguna de Huacachina bajo la Vía Láctea',
  location: 'Oasis de Huacachina, Ica',
  imageUrl: huacachinaMobile,
  wideImageUrl: huacachinaWide,
  districtTag: 'Huacachina / Ica',
};

// Configuración de un solo fondo de pantalla 100% optimizado para PC y Celulares
export const HD_WALLPAPERS: WallpaperItem[] = [
  HUACACHINA_WALLPAPER,
];
