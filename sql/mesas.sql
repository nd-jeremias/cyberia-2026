-- =========================================================================
-- 1. LIMPIEZA DE DATOS PREVIOS (Orden estricto de dependencias)
-- =========================================================================
DROP TABLE IF EXISTS public.mesas;
DROP TYPE IF EXISTS public.disponibilidad_mesa;
DROP TYPE IF EXISTS public.tipo_mesa;

-- =========================================================================
-- 2. CREACIÓN DE TIPOS ENUM PARA MESAS Y PEDIDOS
-- =========================================================================
CREATE TYPE public.disponibilidad_mesa AS ENUM (
    'disponible', 
    'Reservada', 
    'ocupada'
);

CREATE TYPE public.tipo_mesa AS ENUM (
    'estándar', 
    'VIP', 
    'movilidad reducida'
);

-- =========================================================================
-- 3. CREACIÓN DE LA TABLA DE MESAS
-- =========================================================================
CREATE TABLE public.mesas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    numero_mesa INTEGER NOT NULL UNIQUE CHECK (numero_mesa > 0), -- N° físico de mesa
    cantidad_lugares INTEGER NOT NULL CHECK (cantidad_lugares > 0),
    tipo public.tipo_mesa NOT NULL DEFAULT 'estándar',
    disponibilidad public.disponibilidad_mesa NOT NULL DEFAULT 'disponible',
    
    -- Cliente que ocupa la mesa ahora mismo, registrado o anónimo: los dos son
    -- filas de `usuarios`, así que alcanza con una sola columna.
    -- NULL = mesa libre.
    cliente_id UUID NULL REFERENCES public.usuarios(id) ON DELETE SET NULL,
    
    -- URLs de recursos multimedia almacenados en tu bucket manual de Supabase
    qr_url TEXT NOT NULL,
    foto_url TEXT NOT NULL,
    fecha_creacion TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);


-- Habilitar Seguridad RLS
ALTER TABLE public.mesas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Permitir select total mesas" ON public.mesas FOR ALL USING (true);

-- =========================================================================
-- 5. INSERCIÓN DE DATOS DE PRUEBA (5 Mesas Obligatorias - Página 5)
-- =========================================================================
INSERT INTO public.mesas (numero_mesa, cantidad_lugares, tipo, disponibilidad, qr_url, foto_url)
VALUES 
(1, 2, 'estándar',          'disponible', 'https://supabase.co', 'https://supabase.co'),
(2, 4, 'estándar',          'disponible', 'https://supabase.co', 'https://supabase.co'),
(3, 4, 'movilidad reducida', 'ocupada',    'https://supabase.co', 'https://supabase.co'),
(4, 6, 'VIP',                'Reservada',  'https://supabase.co', 'https://supabase.co'),
(5, 2, 'estándar',          'disponible', 'https://supabase.co', 'https://supabase.co');

-- =========================================================================
-- 6. CLAVE FORÁNEA DIFERIDA
-- =========================================================================
-- `usuarios.mesa_id` apunta acá, pero no puede declararse en usuarios.sql
-- porque ese script corre antes y `mesas` todavía no existe. Se agrega al
-- final: si se borra una mesa, el cliente queda sin mesa pero no se pierde.
ALTER TABLE public.usuarios
    ADD CONSTRAINT usuarios_mesa_id_fkey
    FOREIGN KEY (mesa_id) REFERENCES public.mesas(id) ON DELETE SET NULL;
