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

export type ViewMode = 'todas' | 'coordinadores' | 'miembros' | 'asignados';
