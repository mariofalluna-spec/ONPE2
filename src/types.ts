export type CargoType =
  | 'Coordinador Distrital'
  | 'Presidente de Mesa'
  | 'Secretario'
  | 'Tercer Miembro'
  | 'Primer Suplente'
  | 'Segundo Suplente'
  | 'Coordinador de Local'
  | 'Fiscalizador'
  | 'Personero / Asignado'
  | 'Seguridad / Apoyo';

export interface ContactoElectoral {
  id: string;
  nombre: string;
  cargo: CargoType | string;
  telefono: string;
  telefonoSecundario?: string;
  email?: string;
  dni?: string;
  mesaAsignada?: string;
  distrito?: string;
  localVotacion?: string;
  nota?: string;
  disponible?: boolean;
}

export interface CLVInfo {
  id: string;
  apellidoPaterno: string;
  nombres: string;
  nombreCompleto: string; // UN SOLO NOMBRE + APELLIDO (e.g. "ALEX ALFARO")
  telefono: string; // "+51991059634"
  telefonoRaw: string; // "991059634"
  cargo: 'CLV';
  distrito: string; // e.g. "Ica 1"
  provincia: string; // "Ica" | "Nasca" | "Palpa"
  localVotacion?: string; // e.g. "AEP JUAN VALER SANDOVAL"
}

export interface RLVInfo {
  id: string;
  apellidoPaterno: string;
  nombres: string;
  nombreCompleto: string; // UN SOLO NOMBRE + APELLIDO (e.g. "LIKEY ALVARADO")
  telefono: string; // "+51914825947"
  telefonoRaw: string; // "914825947"
  cargo: 'RLV';
  distrito: string; // e.g. "La Tinguiña 1"
  provincia: string; // "Ica" | "Nasca" | "Palpa"
  localVotacion?: string; // e.g. "IE 137"
}

export interface CMInfo {
  id: string;
  apellidoPaterno: string;
  nombres: string;
  nombreCompleto: string; // UN SOLO NOMBRE + APELLIDO (e.g. "INDIRA ABARCA")
  telefono: string; // "+51971277262"
  telefonoRaw: string; // "971277262"
  cargo: 'CM';
  distrito: string; // e.g. "Vista Alegre"
  provincia: string; // "Ica" | "Nasca" | "Palpa"
  localVotacion?: string;
}

export interface MesaElectoral {
  id: string;
  numeroMesa: string; // e.g. "048201"
  departamento: string;
  provincia: string;
  distrito: string;
  localVotacion: string;
  direccion: string;
  pabellon?: string;
  aula?: string;
  piso?: string;
  // Coordinador distrital asignado a esta zona/mesa
  coordinadorDistrital: ContactoElectoral;
  // Miembros de mesa titulares y suplentes con sus teléfonos
  miembrosMesa: ContactoElectoral[];
  // Otros asignados (fiscalizadores, personeros, delegados, coordinadores de local)
  otrosAsignados: ContactoElectoral[];
  observacionContacto?: string;
}

export type ViewMode = 'distritos' | 'todas' | 'coordinadores' | 'miembros' | 'asignados';
