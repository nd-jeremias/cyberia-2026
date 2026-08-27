-- =========================================================================
-- 1. LIMPIEZA DE DATOS PREVIOS
-- =========================================================================
DELETE FROM auth.users WHERE email LIKE '%@test.com';
DROP TABLE IF EXISTS public.usuarios;
DROP TABLE IF EXISTS public.clientes_anonimos;
DROP TYPE IF EXISTS public.usuarios_rol;
DROP TYPE IF EXISTS public.usuarios_estado;

-- =========================================================================
-- 2. CREACIÓN DE TIPOS ENUM
-- =========================================================================
-- Eliminamos 'anónimo' de aquí, ya que tendrá su propia tabla
CREATE TYPE public.usuarios_rol AS ENUM (
    'dueño', 
    'supervisor', 
    'metre', 
    'mozo', 
    'cocinero', 
    'cantinero', 
    'cliente registrado'
);

CREATE TYPE public.usuarios_estado AS ENUM (
    'Pendiente', 
    'Activo', 
    'Rechazado'
);

-- =========================================================================
-- 3. CREACIÓN DE TABLAS SEPARADAS
-- =========================================================================

-- Tabla de Usuarios Autenticados (El ID es DIRECTAMENTE el de Supabase Auth)
CREATE TABLE public.usuarios (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE, 
    apellidos TEXT NOT NULL, 
    nombres TEXT NOT NULL,
    dni TEXT NOT NULL,
    cuil TEXT NULL, -- Sigue siendo opcional por si el perfil es Cliente Registrado
    correo_electronico TEXT NOT NULL UNIQUE,
    perfil public.usuarios_rol NOT NULL,
    foto_url TEXT NULL, 
    estado public.usuarios_estado NOT NULL DEFAULT 'Activo',
    token_push TEXT NULL, -- Token de FCM del dispositivo, para notificaciones push
    fecha_registro TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Tabla Exclusiva para Clientes Anónimos (Según Funcionalidad 9: solo nombre y foto)
CREATE TABLE public.clientes_anonimos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nombres TEXT NOT NULL,
    foto_url TEXT NULL,
    token_push TEXT NULL, -- Token de FCM del dispositivo, para notificaciones push
    fecha_ingreso TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Habilitar Seguridad a Nivel de Fila (RLS) en ambas tablas
ALTER TABLE public.usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clientes_anonimos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Permitir acceso público usuarios" ON public.usuarios FOR ALL USING (true);
CREATE POLICY "Permitir acceso público anónimos" ON public.clientes_anonimos FOR ALL USING (true);

-- =========================================================================
-- 4. INSERCIÓN DE DATOS DE PRUEBA
-- =========================================================================
DO $$
DECLARE
    id_dueno UUID := gen_random_uuid();
    id_super UUID := gen_random_uuid();
    id_metre UUID := gen_random_uuid();
    id_mozo  UUID := gen_random_uuid();
    id_cocin UUID := gen_random_uuid();
    id_canti UUID := gen_random_uuid();
    id_clireg UUID := gen_random_uuid();
BEGIN

    -- A. Registro de credenciales en el esquema nativo auth.users
    INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, confirmation_token)
    VALUES 
    (id_dueno, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'dueno@test.com',      extensions.crypt('Password123!', extensions.gen_salt('bf')), NOW(), '{"provider":"email","providers":["email"]}', '{}', NOW(), NOW(), ''),
    (id_super, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'supervisor@test.com', extensions.crypt('Password123!', extensions.gen_salt('bf')), NOW(), '{"provider":"email","providers":["email"]}', '{}', NOW(), NOW(), ''),
    (id_metre, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'metre@test.com',      extensions.crypt('Password123!', extensions.gen_salt('bf')), NOW(), '{"provider":"email","providers":["email"]}', '{}', NOW(), NOW(), ''),
    (id_mozo,  '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'mozo@test.com',       extensions.crypt('Password123!', extensions.gen_salt('bf')), NOW(), '{"provider":"email","providers":["email"]}', '{}', NOW(), NOW(), ''),
    (id_cocin, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'cocinero@test.com',   extensions.crypt('Password123!', extensions.gen_salt('bf')), NOW(), '{"provider":"email","providers":["email"]}', '{}', NOW(), NOW(), ''),
    (id_canti, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'cantinero@test.com',  extensions.crypt('Password123!', extensions.gen_salt('bf')), NOW(), '{"provider":"email","providers":["email"]}', '{}', NOW(), NOW(), ''),
    (id_clireg, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'cliente@test.com',    extensions.crypt('Password123!', extensions.gen_salt('bf')), NOW(), '{"provider":"email","providers":["email"]}', '{}', NOW(), NOW(), '');

    -- B. Inserción en la tabla de perfiles (Utilizando el ID exacto asignado por Auth)
    INSERT INTO public.usuarios (id, apellidos, nombres, dni, cuil, correo_electronico, perfil, foto_url, estado)
    VALUES 
    (id_dueno,  'Mendoza',  'Carlos',    '20111222', NULL,          'dueno@test.com',      'dueño',              'https://supabase.co',      'Activo'),
    (id_super,  'Luna',     'Beatriz',   '25333444', NULL,          'supervisor@test.com', 'supervisor',         'https://supabase.co', 'Activo'),
    (id_metre,  'Gómez',    'Alejandro', '30555666', '20305556662', 'metre@test.com',      'metre',              'https://supabase.co',      'Activo'),
    (id_mozo,   'Martínez', 'Diego',     '35777888', '20357778882', 'mozo@test.com',       'mozo',               'https://supabase.co',       'Activo'),
    (id_cocin,  'Ríos',     'Elena',     '40111333', '27401113334', 'cocinero@test.com',   'cocinero',           'https://supabase.co',   'Activo'),
    (id_canti,  'Sosa',     'Franco',    '42444555', '20424445552', 'cantinero@test.com',  'cantinero',          'https://supabase.co',  'Activo'),
    (id_clireg, 'Paz',      'Gisela',    '45666777', NULL,          'cliente@test.com',    'cliente registrado', 'https://supabase.co',    'Activo');

    -- C. Inserción en la tabla independiente de Clientes Anónimos
    INSERT INTO public.clientes_anonimos (nombres, foto_url)
    VALUES 
    ('JuanAnonimo', 'https://supabase.co');

END $$;
