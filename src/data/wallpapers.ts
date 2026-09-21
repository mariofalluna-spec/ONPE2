export interface WallpaperItem {
  id: string;
  title: string;
  location: string;
  imageUrl: string;
  districtTag?: string;
}

export const HD_WALLPAPERS: WallpaperItem[] = [
  {
    id: 'tubulares',
    title: 'Dunas y Tubulares al Atardecer',
    location: 'Desierto de Ica',
    imageUrl: '/wallpapers/tubulares_dunas.jpg',
    districtTag: 'Ica / Dunas',
  },
  {
    id: 'plaza_ica',
    title: 'Plaza de Armas de Ica',
    location: 'Centro Histórico de Ica',
    imageUrl: '/wallpapers/plaza_ica.jpg',
    districtTag: 'Ica Centro',
  },
  {
    id: 'palpa',
    title: 'Iglesia y Monumento a la Naranja',
    location: 'Plaza de Armas de Palpa, Ica',
    imageUrl: '/wallpapers/palpa.jpg',
    districtTag: 'Palpa',
  },
  {
    id: 'paracas',
    title: 'Roca El Elefante',
    location: 'Costa de Paracas, Ica',
    imageUrl: '/wallpapers/paracas.jpg',
    districtTag: 'Paracas / Pisco',
  },
  {
    id: 'canon',
    title: 'Cañón de los Perdidos',
    location: 'Desierto de Ocucaje, Ica',
    imageUrl: '/wallpapers/canon_perdidos.jpg',
    districtTag: 'Ocucaje / Ica',
  },
  {
    id: 'nazca',
    title: 'Líneas de Nazca (El Mono)',
    location: 'Pampas de Jumana, Nazca, Ica',
    imageUrl: '/wallpapers/nazca.jpg',
    districtTag: 'Nazca',
  },
  {
    id: 'vinedos',
    title: 'Viñedos y Botijas de Pisco',
    location: 'Valle Vitivinícola de Ica',
    imageUrl: '/wallpapers/vinedos_pisco.jpg',
    districtTag: 'Valle de Ica',
  },
  {
    id: 'huacachina',
    title: 'Laguna de Huacachina',
    location: 'Oasis de América, Ica',
    imageUrl: '/wallpapers/huacachina.jpg',
    districtTag: 'Huacachina',
  },
];
