import { createClient, SupabaseClient } from '@supabase/supabase-js';

const STORAGE_URL_KEY = 'odpe_supabase_url';
const STORAGE_KEY_KEY = 'odpe_supabase_anon_key';

export interface SupabaseConfig {
  url: string;
  anonKey: string;
}

export function getSupabaseConfig(): SupabaseConfig {
  const envUrl = (import.meta as any).env?.VITE_SUPABASE_URL || '';
  const envKey = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || '';

  const storedUrl = typeof localStorage !== 'undefined' ? localStorage.getItem(STORAGE_URL_KEY) || '' : '';
  const storedKey = typeof localStorage !== 'undefined' ? localStorage.getItem(STORAGE_KEY_KEY) || '' : '';

  return {
    url: (storedUrl || envUrl).trim(),
    anonKey: (storedKey || envKey).trim(),
  };
}

export function saveSupabaseConfig(url: string, anonKey: string): void {
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem(STORAGE_URL_KEY, url.trim());
    localStorage.setItem(STORAGE_KEY_KEY, anonKey.trim());
  }
  cachedClient = null;
}

export function clearSupabaseConfig(): void {
  if (typeof localStorage !== 'undefined') {
    localStorage.removeItem(STORAGE_URL_KEY);
    localStorage.removeItem(STORAGE_KEY_KEY);
  }
  cachedClient = null;
}

let cachedClient: SupabaseClient | null = null;

export function getSupabaseClient(): SupabaseClient | null {
  if (cachedClient) return cachedClient;

  const { url, anonKey } = getSupabaseConfig();
  if (!url || !anonKey) return null;

  try {
    cachedClient = createClient(url, anonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    });
    return cachedClient;
  } catch (err) {
    console.error('Error al inicializar cliente Supabase:', err);
    return null;
  }
}

export async function testSupabaseConnection(overrideConfig?: SupabaseConfig): Promise<{ success: boolean; message: string; latencyMs?: number }> {
  const config = overrideConfig || getSupabaseConfig();
  if (!config.url || !config.anonKey) {
    return { success: false, message: 'Falta configurar URL y Clave Anon de Supabase' };
  }

  const start = Date.now();
  try {
    const client = createClient(config.url, config.anonKey);
    // Simple ping to check if Supabase REST endpoint responds
    const { error } = await client.from('distritos').select('count', { count: 'exact', head: true });
    const latencyMs = Date.now() - start;

    if (error && error.code !== 'PGRST116' && error.code !== '42P01') {
      // 42P01 means table doesn't exist yet, which still confirms valid Supabase authentication/connection!
      return {
        success: false,
        message: `Error de autenticación o acceso: ${error.message} (Código ${error.code})`,
        latencyMs,
      };
    }

    return {
      success: true,
      message: '¡Conexión exitosa con Supabase! Las credenciales son válidas.',
      latencyMs,
    };
  } catch (err: any) {
    return {
      success: false,
      message: `No se pudo conectar a Supabase: ${err.message || 'Error de red o URL inválida'}`,
    };
  }
}
