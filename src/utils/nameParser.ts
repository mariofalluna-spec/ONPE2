/**
 * Utilidades para normalizar nombres y celulares de personal electoral
 * Regla estricta: UN SOLO NOMBRE (primer nombre) + UN SOLO APELLIDO (apellido paterno o primer apellido)
 */

export interface ParsedPersona {
  primerNombre: string;
  primerApellido: string;
  nombreCompleto: string;
}

export interface ParsedTelefono {
  telefono: string;
  telefonoRaw: string;
}

/**
 * Extrae estrictamente UN SOLO NOMBRE y UN SOLO APELLIDO en mayúsculas
 */
export function parsePersonaPrimerNombrePrimerApellido(
  nombreInput: string,
  apellidoInput: string = ''
): ParsedPersona {
  let cleanNombre = (nombreInput || '')
    .replace(/^(Lic\.|Ing\.|Prof\.|Mag\.|Abog\.|Sr\.|Sra\.|Dr\.|Dra\.)\s*/i, '')
    .trim();
  let cleanApellido = (apellidoInput || '').trim();

  // Si el apellido viene vacío pero el nombre tiene coma (formato oficial: APELLIDOS, NOMBRES)
  if (!cleanApellido && cleanNombre.includes(',')) {
    const [apPart, nomPart] = cleanNombre.split(',');
    cleanApellido = apPart.trim();
    cleanNombre = nomPart.trim();
  } else if (!cleanApellido) {
    // Si viene todo junto en un solo string (ej: "CARLOS ALBERTO HUAMAN QUISPE")
    const parts = cleanNombre.split(/\s+/).filter(Boolean);
    if (parts.length >= 2) {
      cleanNombre = parts[0];
      cleanApellido = parts[1];
    }
  }

  // Extraer estrictamente la primera palabra como primer nombre
  const primerNombre = (cleanNombre.split(/\s+/)[0] || '').toUpperCase();
  // Extraer estrictamente la primera palabra como primer apellido / apellido paterno
  const primerApellido = (cleanApellido.split(/\s+/)[0] || '').toUpperCase();

  const nombreCompleto = `${primerNombre} ${primerApellido}`.trim();
  return { primerNombre, primerApellido, nombreCompleto };
}

/**
 * Extrae y formatea un celular peruano estándar (9 dígitos con prefijo +51)
 */
export function parseTelefonoCelularPeruano(telInput: string): ParsedTelefono {
  const digits = (telInput || '').replace(/\D/g, '');
  let raw = digits;

  // Si tiene 11 dígitos y empieza con 51 (ej: 51987654321), quitar el 51
  if (raw.length === 11 && raw.startsWith('51')) {
    raw = raw.substring(2);
  }

  // Los celulares en Perú tienen 9 dígitos y empiezan con 9
  const telefono = raw.length > 0 ? `+51${raw}` : '';
  return { telefono, telefonoRaw: raw };
}

/**
 * Parsea una línea de texto libre con formato nombre + celular
 * Ejemplos aceptados:
 * - "Carlos Gomez 987654321"
 * - "PEREZ GOMEZ, JUAN ALBERTO - 987654321"
 * - "Ana Rodriguez +51 912 345 678"
 */
export function parseLineaContacto(linea: string): {
  primerNombre: string;
  primerApellido: string;
  nombreCompleto: string;
  telefono: string;
  telefonoRaw: string;
  valido: boolean;
} {
  const clean = linea.trim();
  if (!clean) {
    return {
      primerNombre: '',
      primerApellido: '',
      nombreCompleto: '',
      telefono: '',
      telefonoRaw: '',
      valido: false,
    };
  }

  // Buscar dígitos del teléfono (secuencia de dígitos con posible +, espacios o guiones)
  const phoneMatch = clean.match(/(\+?51)?\s*(9\d{2}[\s.-]?\d{3}[\s.-]?\d{3}|\d{7,11})/);
  let phoneStr = '';
  let nameStr = clean;

  if (phoneMatch) {
    phoneStr = phoneMatch[0];
    nameStr = clean.replace(phoneMatch[0], '').replace(/[-–—:|]/g, ' ').trim();
  }

  const { primerNombre, primerApellido, nombreCompleto } = parsePersonaPrimerNombrePrimerApellido(nameStr);
  const { telefono, telefonoRaw } = parseTelefonoCelularPeruano(phoneStr);

  const valido = !!(primerNombre && primerApellido && telefonoRaw.length === 9);

  return {
    primerNombre,
    primerApellido,
    nombreCompleto,
    telefono,
    telefonoRaw,
    valido,
  };
}
