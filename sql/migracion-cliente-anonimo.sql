-- =========================================================================
-- MIGRACIÓN: el cliente anónimo pasa a ser un usuario más
-- =========================================================================
--
-- Antes: los anónimos vivían en `clientes_anonimos`, y `mesas` y `pedidos`
-- tenían dos columnas de cliente (una para registrados y otra para anónimos).
--
-- Ahora: el anónimo entra con supabase.auth.signInAnonymously(), que le crea
-- su usuario en auth.users igual que a cualquier otro, y su perfil va a
-- `usuarios` con perfil = 'cliente anónimo'. Con eso alcanza una sola columna
-- de cliente en `mesas` y `pedidos`.
--
-- Sólo hace falta correr esto si querés conservar los datos que ya tenés. Si
-- estás recreando la base con los scripts de esta carpeta, ya vienen al día.
--
-- ANTES DE CORRER: habilitar los ingresos anónimos en el dashboard, en
-- Authentication -> Sign In / Providers -> Anonymous sign-ins.
-- =========================================================================


-- -------------------------------------------------------------------------
-- PASO 1 (correr SOLO este bloque, y recién después el resto)
-- -------------------------------------------------------------------------
-- Postgres no permite usar un valor de enum recién agregado dentro de la
-- misma transacción en que se creó, así que este ALTER va aparte.

ALTER TYPE public.usuarios_rol ADD VALUE IF NOT EXISTS 'cliente anónimo';


-- -------------------------------------------------------------------------
-- PASO 2 (el resto, ya se puede correr todo junto)
-- -------------------------------------------------------------------------

-- Campos que el cliente anónimo no puede completar: entra sólo con nombre y
-- foto. UNIQUE sobre correo_electronico tolera varios NULL sin conflicto.
ALTER TABLE public.usuarios
    ALTER COLUMN apellidos DROP NOT NULL,
    ALTER COLUMN dni DROP NOT NULL,
    ALTER COLUMN correo_electronico DROP NOT NULL;

-- Mesas: una sola columna de cliente (NULL = mesa libre).
ALTER TABLE public.mesas DROP COLUMN IF EXISTS cliente_anonimo_id;
ALTER TABLE public.mesas RENAME COLUMN cliente_registrado_id TO cliente_id;

-- Pedidos: el CHECK que exigía "alguno de los dos clientes" se vuelve
-- innecesario, porque ahora la única columna es obligatoria.
ALTER TABLE public.pedidos DROP CONSTRAINT IF EXISTS chk_cliente_existente;
ALTER TABLE public.pedidos DROP COLUMN IF EXISTS cliente_anonimo_id;
ALTER TABLE public.pedidos RENAME COLUMN cliente_registrado_id TO cliente_id;

-- Ojo: si hay pedidos viejos que apuntaban a un anónimo, quedaron con
-- cliente_id en NULL y este ALTER va a fallar. En ese caso, borralos primero
-- (son datos de prueba) o asignales un cliente registrado.
ALTER TABLE public.pedidos ALTER COLUMN cliente_id SET NOT NULL;

-- La referencia al cliente del pedido pasa a RESTRICT: no se borra un usuario
-- que tenga pedidos, porque la factura y el historial lo necesitan.
ALTER TABLE public.pedidos DROP CONSTRAINT IF EXISTS pedidos_cliente_registrado_id_fkey;
ALTER TABLE public.pedidos
    ADD CONSTRAINT pedidos_cliente_id_fkey
    FOREIGN KEY (cliente_id) REFERENCES public.usuarios(id) ON DELETE RESTRICT;

-- Ya no hace falta la tabla separada.
DROP TABLE IF EXISTS public.clientes_anonimos;
