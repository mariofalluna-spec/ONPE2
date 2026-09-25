import { getSupabaseClient } from '../lib/supabase';
import { LISTA_31_DISTRITOS } from '../data/mockElectoralData';
import { LISTA_CLV } from '../data/clvData';
import { LISTA_RLV } from '../data/rlvData';
import { LISTA_CM } from '../data/cmData';

export interface SyncProgress {
  step: string;
  percent: number;
  totalItems: number;
  completedItems: number;
  error?: string;
}

export async function syncAllToSupabase(
  onProgress?: (progress: SyncProgress) => void
): Promise<{ success: boolean; message: string; details?: any }> {
  const client = getSupabaseClient();
  if (!client) {
    return {
      success: false,
      message: 'Supabase no está configurado. Por favor ingresa la URL y la Clave Anon en la configuración.',
    };
  }

  try {
    const totalCount = LISTA_31_DISTRITOS.length + LISTA_CLV.length + LISTA_RLV.length + LISTA_CM.length;
    let completed = 0;

    // 1. Sincronizar Distritos (31)
    onProgress?.({
      step: 'Sincronizando 31 Coordinadores Distritales...',
      percent: 5,
      totalItems: totalCount,
      completedItems: completed,
    });

    const distritosRows = LISTA_31_DISTRITOS.map((d) => ({
      id: d.id,
      nombre: d.nombre,
      provincia: d.provincia,
      local_principal: d.localPrincipal,
      direccion: d.direccion,
      coordinador_nombre: d.coordinadorNombre,
      coordinador_telefono: d.coordinadorTelefono,
      coordinador_email: d.coordinadorEmail,
      mesas_count: d.mesasCount,
      updated_at: new Date().toISOString(),
    }));

    const { error: distError } = await client.from('distritos').upsert(distritosRows, { onConflict: 'id' });
    if (distError) {
      throw new Error(`Error en tabla distritos: ${distError.message}`);
    }
    completed += LISTA_31_DISTRITOS.length;

    // 2. Sincronizar CLVs (53)
    onProgress?.({
      step: 'Sincronizando Coordinadores de Local (CLV)...',
      percent: 15,
      totalItems: totalCount,
      completedItems: completed,
    });

    const clvRows = LISTA_CLV.map((c) => ({
      id: c.id,
      apellido_paterno: c.apellidoPaterno || '',
      nombres: c.nombres || '',
      nombre_completo: c.nombreCompleto,
      telefono: c.telefono,
      telefono_raw: c.telefonoRaw,
      local_votacion: c.localVotacion || '',
      cargo: c.cargo || 'CLV',
      distrito: c.distrito,
      provincia: c.provincia,
      updated_at: new Date().toISOString(),
    }));

    const { error: clvError } = await client.from('clv').upsert(clvRows, { onConflict: 'id' });
    if (clvError) {
      throw new Error(`Error en tabla clv: ${clvError.message}`);
    }
    completed += LISTA_CLV.length;

    // 3. Sincronizar RLVs (95)
    onProgress?.({
      step: 'Sincronizando Responsables de Local (RLV)...',
      percent: 30,
      totalItems: totalCount,
      completedItems: completed,
    });

    const rlvRows = LISTA_RLV.map((r) => ({
      id: r.id,
      apellido_paterno: r.apellidoPaterno || '',
      nombres: r.nombres || '',
      nombre_completo: r.nombreCompleto,
      telefono: r.telefono,
      telefono_raw: r.telefonoRaw,
      local_votacion: r.localVotacion || '',
      cargo: r.cargo || 'RLV',
      distrito: r.distrito,
      provincia: r.provincia,
      updated_at: new Date().toISOString(),
    }));

    const { error: rlvError } = await client.from('rlv').upsert(rlvRows, { onConflict: 'id' });
    if (rlvError) {
      throw new Error(`Error en tabla rlv: ${rlvError.message}`);
    }
    completed += LISTA_RLV.length;

    // 4. Sincronizar CMs (en lotes de 100 para evitar límites de tamaño HTTP)
    onProgress?.({
      step: 'Sincronizando Coordinadores de Mesa (CM)...',
      percent: 50,
      totalItems: totalCount,
      completedItems: completed,
    });

    const cmRows = LISTA_CM.map((m) => ({
      id: m.id,
      apellido_paterno: m.apellidoPaterno || '',
      nombres: m.nombres || '',
      nombre_completo: m.nombreCompleto,
      telefono: m.telefono,
      telefono_raw: m.telefonoRaw,
      local_votacion: m.localVotacion || '',
      cargo: m.cargo || 'CM',
      distrito: m.distrito,
      provincia: m.provincia,
      updated_at: new Date().toISOString(),
    }));

    const batchSize = 100;
    for (let i = 0; i < cmRows.length; i += batchSize) {
      const batch = cmRows.slice(i, i + batchSize);
      const { error: cmError } = await client.from('cm').upsert(batch, { onConflict: 'id' });
      if (cmError) {
        throw new Error(`Error en lote CM (${i + 1}-${i + batch.length}): ${cmError.message}`);
      }
      completed += batch.length;
      const pct = Math.floor(50 + (completed / totalCount) * 40);
      onProgress?.({
        step: `Subiendo Coordinadores de Mesa (${completed}/${totalCount})...`,
        percent: pct,
        totalItems: totalCount,
        completedItems: completed,
      });
    }

    // 5. Guardar Snapshot Histórico en respaldos_electorales
    onProgress?.({
      step: 'Guardando snapshot completo de respaldo...',
      percent: 95,
      totalItems: totalCount,
      completedItems: totalCount,
    });

    const snapshot = {
      fecha: new Date().toISOString(),
      distritos: LISTA_31_DISTRITOS,
      clv: LISTA_CLV,
      rlv: LISTA_RLV,
      cm: LISTA_CM,
    };

    await client.from('respaldos_electorales').insert([
      {
        total_distritos: LISTA_31_DISTRITOS.length,
        total_clv: LISTA_CLV.length,
        total_rlv: LISTA_RLV.length,
        total_cm: LISTA_CM.length,
        snapshot_json: snapshot,
        notas: `Respaldo sincronizado desde la aplicación electoral ODPE Ica (${new Date().toLocaleString('es-PE')})`,
      },
    ]);

    onProgress?.({
      step: '¡Respaldo sincronizado con éxito en Supabase!',
      percent: 100,
      totalItems: totalCount,
      completedItems: totalCount,
    });

    return {
      success: true,
      message: `¡Respaldo completo! Se sincronizaron exitosamente ${LISTA_31_DISTRITOS.length} distritos, ${LISTA_CLV.length} CLVs, ${LISTA_RLV.length} RLVs y ${LISTA_CM.length} CMs en Supabase.`,
      details: {
        distritos: LISTA_31_DISTRITOS.length,
        clv: LISTA_CLV.length,
        rlv: LISTA_RLV.length,
        cm: LISTA_CM.length,
      },
    };
  } catch (err: any) {
    onProgress?.({
      step: 'Error al sincronizar',
      percent: 0,
      totalItems: 0,
      completedItems: 0,
      error: err.message,
    });
    return {
      success: false,
      message: err.message || 'Error desconocido al sincronizar con Supabase',
    };
  }
}

export function exportBackupJSON(): void {
  const fullBackup = {
    metadata: {
      sistema: 'Directorio Electoral ODPE Región Ica',
      fechaExportacion: new Date().toISOString(),
      version: '1.0.0',
      totales: {
        distritos: LISTA_31_DISTRITOS.length,
        clv: LISTA_CLV.length,
        rlv: LISTA_RLV.length,
        cm: LISTA_CM.length,
        totalGeneral: LISTA_31_DISTRITOS.length + LISTA_CLV.length + LISTA_RLV.length + LISTA_CM.length,
      },
    },
    distritos: LISTA_31_DISTRITOS,
    clv: LISTA_CLV,
    rlv: LISTA_RLV,
    cm: LISTA_CM,
  };

  const jsonStr = JSON.stringify(fullBackup, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `RESPALDO_ODPE_ICA_${new Date().toISOString().slice(0, 10)}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function generateSQLScript(): string {
  const escapeSql = (str: string | undefined | null) => {
    if (!str) return "''";
    return `'${str.replace(/'/g, "''")}'`;
  };

  let sql = `-- ==============================================================================
-- RESPALDO SQL DIRECTO - ODPE REGIÓN ICA
-- Generado el: ${new Date().toLocaleString('es-PE')}
-- ==============================================================================

-- 1. Insertar 31 Distritos
`;

  LISTA_31_DISTRITOS.forEach((d) => {
    sql += `INSERT INTO public.distritos (id, nombre, provincia, local_principal, direccion, coordinador_nombre, coordinador_telefono, coordinador_email, mesas_count)
VALUES (${d.id}, ${escapeSql(d.nombre)}, ${escapeSql(d.provincia)}, ${escapeSql(d.localPrincipal)}, ${escapeSql(d.direccion)}, ${escapeSql(d.coordinadorNombre)}, ${escapeSql(d.coordinadorTelefono)}, ${escapeSql(d.coordinadorEmail)}, ${d.mesasCount})
ON CONFLICT (id) DO UPDATE SET coordinador_nombre = EXCLUDED.coordinador_nombre, coordinador_telefono = EXCLUDED.coordinador_telefono;\n`;
  });

  sql += `\n-- 2. Insertar Coordinadores de Local (CLV - ${LISTA_CLV.length} registros)\n`;
  LISTA_CLV.forEach((c) => {
    sql += `INSERT INTO public.clv (id, apellido_paterno, nombres, nombre_completo, telefono, telefono_raw, local_votacion, cargo, distrito, provincia)
VALUES (${escapeSql(c.id)}, ${escapeSql(c.apellidoPaterno)}, ${escapeSql(c.nombres)}, ${escapeSql(c.nombreCompleto)}, ${escapeSql(c.telefono)}, ${escapeSql(c.telefonoRaw)}, ${escapeSql(c.localVotacion)}, 'CLV', ${escapeSql(c.distrito)}, ${escapeSql(c.provincia)})
ON CONFLICT (id) DO UPDATE SET local_votacion = EXCLUDED.local_votacion, telefono = EXCLUDED.telefono;\n`;
  });

  sql += `\n-- 3. Insertar Responsables de Local (RLV - ${LISTA_RLV.length} registros)\n`;
  LISTA_RLV.forEach((r) => {
    sql += `INSERT INTO public.rlv (id, apellido_paterno, nombres, nombre_completo, telefono, telefono_raw, local_votacion, cargo, distrito, provincia)
VALUES (${escapeSql(r.id)}, ${escapeSql(r.apellidoPaterno)}, ${escapeSql(r.nombres)}, ${escapeSql(r.nombreCompleto)}, ${escapeSql(r.telefono)}, ${escapeSql(r.telefonoRaw)}, ${escapeSql(r.localVotacion)}, 'RLV', ${escapeSql(r.distrito)}, ${escapeSql(r.provincia)})
ON CONFLICT (id) DO UPDATE SET local_votacion = EXCLUDED.local_votacion, telefono = EXCLUDED.telefono;\n`;
  });

  sql += `\n-- 4. Insertar Coordinadores de Mesa (CM - ${LISTA_CM.length} registros)\n`;
  LISTA_CM.forEach((m) => {
    sql += `INSERT INTO public.cm (id, apellido_paterno, nombres, nombre_completo, telefono, telefono_raw, local_votacion, cargo, distrito, provincia)
VALUES (${escapeSql(m.id)}, ${escapeSql(m.apellidoPaterno)}, ${escapeSql(m.nombres)}, ${escapeSql(m.nombreCompleto)}, ${escapeSql(m.telefono)}, ${escapeSql(m.telefonoRaw)}, ${escapeSql(m.localVotacion)}, 'CM', ${escapeSql(m.distrito)}, ${escapeSql(m.provincia)})
ON CONFLICT (id) DO UPDATE SET local_votacion = EXCLUDED.local_votacion, telefono = EXCLUDED.telefono;\n`;
  });

  return sql;
}
