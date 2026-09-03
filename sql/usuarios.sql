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
-- El cliente anónimo es un perfil más: entra con signInAnonymously(), que le
-- crea su usuario en auth.users igual que a cualquier otro. Por eso ya no
-- necesita una tabla aparte y vive en `usuarios` como el resto.
CREATE TYPE public.usuarios_rol AS ENUM (
    'dueño',
    'supervisor',
    'metre',
    'mozo',
    'cocinero',
    'cantinero',
    'cliente registrado',
    'cliente anónimo'
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
    -- Apellidos, DNI y correo son NULL sólo por el cliente anónimo, que entra
    -- con nombre y foto y nada más (punto 9). El resto de los perfiles los
    -- exige el formulario de registro.
    apellidos TEXT NULL,
    nombres TEXT NOT NULL,
    dni TEXT NULL,
    cuil TEXT NULL, -- Sigue siendo opcional por si el perfil es Cliente Registrado
    -- UNIQUE tolera varios NULL, así que los anónimos conviven sin chocar.
    correo_electronico TEXT NULL UNIQUE,
    perfil public.usuarios_rol NOT NULL,
    foto_url TEXT NULL, 
    estado public.usuarios_estado NOT NULL DEFAULT 'Activo',
    token_push TEXT NULL, -- Token de FCM del dispositivo, para notificaciones push
    fecha_registro TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Habilitar Seguridad a Nivel de Fila (RLS)
ALTER TABLE public.usuarios ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Permitir acceso público usuarios" ON public.usuarios FOR ALL USING (true);

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

    -- Los clientes anónimos no se siembran acá: los crea la propia aplicación
    -- con signInAnonymously() cuando alguien entra desde el celular.

END $$;
