-- ==============================================================================
-- SCRIPT DE RESPALDO Y CONFIGURACIÓN SUPABASE - ODPE REGIÓN ICA
-- Base de Datos PostgreSQL para Directorio Electoral (31 Distritos, CLV, RLV, CM)
-- ==============================================================================

-- 1. TABLA: DISTRITOS (31 Distritos Electorales)
CREATE TABLE IF NOT EXISTS public.distritos (
    id INTEGER PRIMARY KEY,
    nombre TEXT NOT NULL,
    provincia TEXT NOT NULL,
    local_principal TEXT,
    direccion TEXT,
    coordinador_nombre TEXT,
    coordinador_telefono TEXT,
    coordinador_email TEXT,
    mesas_count INTEGER DEFAULT 0,
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 2. TABLA: CLV (Coordinadores de Local de Votación)
CREATE TABLE IF NOT EXISTS public.clv (
    id TEXT PRIMARY KEY,
    apellido_paterno TEXT,
    nombres TEXT,
    nombre_completo TEXT NOT NULL,
    telefono TEXT,
    telefono_raw TEXT,
    local_votacion TEXT,
    cargo TEXT DEFAULT 'CLV' NOT NULL,
    distrito TEXT NOT NULL,
    provincia TEXT NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 3. TABLA: RLV (Responsables de Local de Votación)
CREATE TABLE IF NOT EXISTS public.rlv (
    id TEXT PRIMARY KEY,
    apellido_paterno TEXT,
    nombres TEXT,
    nombre_completo TEXT NOT NULL,
    telefono TEXT,
    telefono_raw TEXT,
    local_votacion TEXT,
    cargo TEXT DEFAULT 'RLV' NOT NULL,
    distrito TEXT NOT NULL,
    provincia TEXT NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 4. TABLA: CM (Coordinadores de Mesa)
CREATE TABLE IF NOT EXISTS public.cm (
    id TEXT PRIMARY KEY,
    apellido_paterno TEXT,
    nombres TEXT,
    nombre_completo TEXT NOT NULL,
    telefono TEXT,
    telefono_raw TEXT,
    local_votacion TEXT,
    cargo TEXT DEFAULT 'CM' NOT NULL,
    distrito TEXT NOT NULL,
    provincia TEXT NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 5. TABLA: RESPALDOS HISTÓRICOS (Snapshots completos JSON de seguridad)
CREATE TABLE IF NOT EXISTS public.respaldos_electorales (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    fecha TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    total_distritos INTEGER NOT NULL,
    total_clv INTEGER NOT NULL,
    total_rlv INTEGER NOT NULL,
    total_cm INTEGER NOT NULL,
    snapshot_json JSONB NOT NULL,
    notas TEXT
);

-- ==============================================================================
-- SEGURIDAD Y POLÍTICAS ROW LEVEL SECURITY (RLS)
-- ==============================================================================

ALTER TABLE public.distritos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clv ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rlv ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cm ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.respaldos_electorales ENABLE ROW LEVEL SECURITY;

-- Políticas de acceso para clave anónima / autenticada
DROP POLICY IF EXISTS "Acceso publico distritos" ON public.distritos;
CREATE POLICY "Acceso publico distritos" ON public.distritos FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Acceso publico clv" ON public.clv;
CREATE POLICY "Acceso publico clv" ON public.clv FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Acceso publico rlv" ON public.rlv;
CREATE POLICY "Acceso publico rlv" ON public.rlv FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Acceso publico cm" ON public.cm;
CREATE POLICY "Acceso publico cm" ON public.cm FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Acceso publico respaldos" ON public.respaldos_electorales;
CREATE POLICY "Acceso publico respaldos" ON public.respaldos_electorales FOR ALL USING (true) WITH CHECK (true);

-- Índices de consulta rápida
CREATE INDEX IF NOT EXISTS idx_clv_distrito ON public.clv(distrito);
CREATE INDEX IF NOT EXISTS idx_rlv_distrito ON public.rlv(distrito);
CREATE INDEX IF NOT EXISTS idx_cm_distrito ON public.cm(distrito);
CREATE INDEX IF NOT EXISTS idx_distritos_provincia ON public.distritos(provincia);

-- ==============================================================================
-- INSTRUCCIONES:
-- 1. Ve a tu proyecto en Supabase (https://supabase.com).
-- 2. Entra en el panel 'SQL Editor' -> 'New query'.
-- 3. Pega todo este contenido y presiona 'Run'.
-- 4. Copia tu 'Project URL' y 'anon key' desde Project Settings -> API.
-- 5. Pégalas en la app en el botón 'Respaldo Supabase' para sincronizar datos.
-- ==============================================================================
