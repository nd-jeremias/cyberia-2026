-- =========================================================================
-- USUARIOS DE LOS BOTONES DE ACCESO RÁPIDO
-- =========================================================================
-- Los botones de ingreso rápido (login-form.component.ts) usan direcciones
-- @restaurante.com con la contraseña '12345678', que NO son las que siembra
-- sql/usuarios.sql (ese usa @test.com con 'Password123!'). Sin este script los
-- botones cargan credenciales que no existen y el ingreso falla.
--
-- Se ejecuta DESPUÉS de sql/usuarios.sql, porque necesita los tipos ENUM y la
-- tabla public.usuarios ya creados.
--
-- Es idempotente: sólo da de alta las cuentas que falten, así que se puede
-- volver a correr sin borrar pedidos ni mesas ya asignadas.
--
-- Incluye los dos perfiles que faltaban para poder demostrar el enunciado:
--   * supervisor  → punto 7 y 8: puede aprobar y rechazar clientes, igual que
--                   el dueño. Sin esta cuenta sólo se podía probar con el dueño.
--   * rechazado   → cuenta en estado 'Rechazado'. Al intentar entrar con ella,
--                   AuthService.login() cierra la sesión recién abierta y la
--                   pantalla muestra el modal con el motivo. Es la única forma
--                   de demostrar ese modal sin tener que rechazar a alguien en
--                   el momento.
-- =========================================================================

DO $$
DECLARE
    fila     RECORD;
    nuevo_id UUID;
BEGIN
    FOR fila IN
        SELECT *
        FROM (VALUES
            ('duenio@restaurante.com',     'Mendoza',  'Carlos',    '20111222', NULL,          'dueño',              'Activo'),
            ('supervisor@restaurante.com', 'Luna',     'Beatriz',   '25333444', NULL,          'supervisor',         'Activo'),
            ('metre@restaurante.com',      'Gómez',    'Alejandro', '30555666', '20305556662', 'metre',              'Activo'),
            ('mozo@restaurante.com',       'Martínez', 'Diego',     '35777888', '20357778882', 'mozo',               'Activo'),
            ('cocinero@restaurante.com',   'Ríos',     'Elena',     '40111333', '27401113334', 'cocinero',           'Activo'),
            ('cantinero@restaurante.com',  'Sosa',     'Franco',    '42444555', '20424445552', 'cantinero',          'Activo'),
            ('cliente@restaurante.com',    'Paz',      'Gisela',    '45666777', NULL,          'cliente registrado', 'Activo'),
            ('rechazado@restaurante.com',  'Ferreyra', 'Rubén',     '46888999', NULL,          'cliente registrado', 'Rechazado')
        ) AS t(correo, apellidos, nombres, dni, cuil, perfil, estado)
    LOOP
        -- Si ya existe la credencial, no se toca: puede tener pedidos y mesas
        -- colgando de su id.
        IF EXISTS (SELECT 1 FROM auth.users WHERE email = fila.correo) THEN
            CONTINUE;
        END IF;

        nuevo_id := gen_random_uuid();

        INSERT INTO auth.users (
            id, instance_id, aud, role, email, encrypted_password,
            email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
            created_at, updated_at, confirmation_token
        )
        VALUES (
            nuevo_id,
            '00000000-0000-0000-0000-000000000000',
            'authenticated',
            'authenticated',
            fila.correo,
            extensions.crypt('12345678', extensions.gen_salt('bf')),
            NOW(),
            '{"provider":"email","providers":["email"]}',
            jsonb_build_object('nombres', fila.nombres, 'apellidos', fila.apellidos),
            NOW(), NOW(), ''
        );

        INSERT INTO public.usuarios (
            id, apellidos, nombres, dni, cuil, correo_electronico,
            perfil, foto_url, estado
        )
        VALUES (
            nuevo_id,
            fila.apellidos,
            fila.nombres,
            fila.dni,
            fila.cuil,
            fila.correo,
            fila.perfil::public.usuarios_rol,
            'https://supabase.co',
            fila.estado::public.usuarios_estado
        );
    END LOOP;
END $$;

-- Comprobación rápida: deberían figurar las ocho cuentas, y 'rechazado' es la
-- única con estado 'Rechazado'.
SELECT correo_electronico, perfil, estado
FROM public.usuarios
WHERE correo_electronico LIKE '%@restaurante.com'
ORDER BY estado, correo_electronico;
