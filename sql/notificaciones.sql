-- =========================================================================
-- NOTIFICACIONES PUSH: disparadores de la base hacia la Edge Function
-- =========================================================================
-- Requiere la extension pg_net (Database > Extensions en el panel de Supabase)
-- y la funcion 'enviar-notificacion' desplegada con la cuenta de servicio de
-- Firebase (ver supabase/functions/enviar-notificacion/index.ts):
--
--   supabase functions deploy enviar-notificacion
--   supabase secrets set FIREBASE_SERVICE_ACCOUNT="$(cat cuenta-servicio.json)"
-- =========================================================================

CREATE EXTENSION IF NOT EXISTS pg_net;

-- Reemplazar por la URL real del proyecto y la clave de servicio.
-- Se guardan como parametros de base para no repetirlos en cada funcion.
-- ALTER DATABASE postgres SET app.edge_url = 'https://<proyecto>.supabase.co/functions/v1/enviar-notificacion';
-- ALTER DATABASE postgres SET app.service_key = '<service_role_key>';

-- =========================================================================
-- Punto 6 del enunciado: al registrarse un cliente, se avisa a los perfiles
-- que pueden aprobarlo (dueño y supervisor).
-- =========================================================================
CREATE OR REPLACE FUNCTION public.avisar_cliente_pendiente()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    tokens_destino TEXT[];
BEGIN
    -- Solo interesa el alta de un cliente que queda esperando aprobacion.
    IF NEW.estado <> 'Pendiente' THEN
        RETURN NEW;
    END IF;

    SELECT ARRAY_AGG(token_push)
    INTO tokens_destino
    FROM public.usuarios
    WHERE perfil IN ('dueño', 'supervisor')
      AND token_push IS NOT NULL;

    IF tokens_destino IS NULL OR array_length(tokens_destino, 1) IS NULL THEN
        RETURN NEW;
    END IF;

    PERFORM net.http_post(
        url     := current_setting('app.edge_url', true),
        headers := jsonb_build_object(
            'Content-Type', 'application/json',
            'Authorization', 'Bearer ' || current_setting('app.service_key', true)
        ),
        body    := jsonb_build_object(
            'tokens', tokens_destino,
            'titulo', 'Nuevo cliente pendiente',
            'cuerpo', NEW.apellidos || ', ' || NEW.nombres || ' espera aprobación.',
            'tipo',   'cliente-pendiente',
            'datos',  jsonb_build_object('clienteId', NEW.id::text)
        )
    );

    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_cliente_pendiente ON public.usuarios;

CREATE TRIGGER trg_cliente_pendiente
AFTER INSERT ON public.usuarios
FOR EACH ROW
EXECUTE FUNCTION public.avisar_cliente_pendiente();

-- =========================================================================
-- Puntos 7 y 8: al aprobar o rechazar, se avisa al propio cliente.
-- =========================================================================
CREATE OR REPLACE FUNCTION public.avisar_estado_cliente()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    IF NEW.estado = OLD.estado OR NEW.token_push IS NULL THEN
        RETURN NEW;
    END IF;

    PERFORM net.http_post(
        url     := current_setting('app.edge_url', true),
        headers := jsonb_build_object(
            'Content-Type', 'application/json',
            'Authorization', 'Bearer ' || current_setting('app.service_key', true)
        ),
        body    := jsonb_build_object(
            'tokens', ARRAY[NEW.token_push],
            'titulo', CASE WHEN NEW.estado = 'Activo'
                           THEN 'Registro aprobado'
                           ELSE 'Registro rechazado' END,
            'cuerpo', CASE WHEN NEW.estado = 'Activo'
                           THEN 'Ya podés ingresar a la aplicación.'
                           ELSE 'Tu solicitud de registro fue rechazada.' END,
            'tipo',   'cliente-pendiente',
            'datos',  jsonb_build_object('estado', NEW.estado)
        )
    );

    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_estado_cliente ON public.usuarios;

CREATE TRIGGER trg_estado_cliente
AFTER UPDATE OF estado ON public.usuarios
FOR EACH ROW
EXECUTE FUNCTION public.avisar_estado_cliente();

-- =========================================================================
-- Envío genérico hacia la Edge Function.
-- =========================================================================
-- Cada disparador sólo decide a quién y qué avisar; la llamada HTTP vive acá.
-- Si no hay destinatarios con token no hace nada.
CREATE OR REPLACE FUNCTION public.enviar_push(
    p_tokens TEXT[],
    p_titulo TEXT,
    p_cuerpo TEXT,
    p_tipo   TEXT,
    p_datos  JSONB DEFAULT '{}'::jsonb
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    IF p_tokens IS NULL OR array_length(p_tokens, 1) IS NULL THEN
        RETURN;
    END IF;

    PERFORM net.http_post(
        url     := current_setting('app.edge_url', true),
        headers := jsonb_build_object(
            'Content-Type', 'application/json',
            'Authorization', 'Bearer ' || current_setting('app.service_key', true)
        ),
        body    := jsonb_build_object(
            'tokens', p_tokens,
            'titulo', p_titulo,
            'cuerpo', p_cuerpo,
            'tipo',   p_tipo,
            'datos',  p_datos
        )
    );
END;
$$;

-- =========================================================================
-- Puntos 12, 13 y 14: avisos del circuito del pedido.
-- =========================================================================
--  - Pedido nuevo, o reenviado tras un rechazo  → a todos los mozos.
--  - Rechazado                                  → al cliente.
--  - Confirmado → al cliente, y a cocina y barra sólo si les toca preparar algo.
CREATE OR REPLACE FUNCTION public.avisar_cambio_pedido()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_mesa   INTEGER;
    v_datos  JSONB;
    v_tokens TEXT[];
BEGIN
    IF TG_OP = 'UPDATE' AND NEW.estado = OLD.estado THEN
        RETURN NEW;
    END IF;

    SELECT numero_mesa INTO v_mesa FROM public.mesas WHERE id = NEW.mesa_id;

    v_datos := jsonb_build_object('pedidoId', NEW.id::text, 'mesa', COALESCE(v_mesa::text, ''));

    IF NEW.estado = 'Pendiente de Confirmación' THEN
        SELECT ARRAY_AGG(token_push) INTO v_tokens
        FROM public.usuarios
        WHERE perfil = 'mozo' AND estado = 'Activo' AND token_push IS NOT NULL;

        PERFORM public.enviar_push(
            v_tokens, 'Pedido para confirmar',
            'La mesa ' || COALESCE(v_mesa::text, '?') || ' envió un pedido.',
            'pedido-nuevo', v_datos
        );

        RETURN NEW;
    END IF;

    -- Los demás cambios le interesan al cliente que hizo el pedido.
    SELECT ARRAY_AGG(token_push) INTO v_tokens
    FROM public.usuarios
    WHERE id = NEW.cliente_id AND token_push IS NOT NULL;

    IF NEW.estado = 'Rechazado' THEN
        PERFORM public.enviar_push(
            v_tokens, 'Pedido rechazado',
            'El mozo pidió cambios en tu pedido.',
            'pedido-estado', v_datos
        );
    ELSIF NEW.estado = 'Confirmado' THEN
        PERFORM public.enviar_push(
            v_tokens, 'Pedido confirmado',
            'Tu pedido pasó a cocina y barra.',
            'pedido-estado', v_datos
        );

        -- Cada sector se entera sólo si hay algo suyo en el pedido.
        SELECT ARRAY_AGG(u.token_push) INTO v_tokens
        FROM public.usuarios u
        WHERE u.estado = 'Activo'
          AND u.token_push IS NOT NULL
          AND (
                (u.perfil = 'cocinero' AND EXISTS (
                    SELECT 1
                    FROM public.pedido_detalles d
                    JOIN public.productos p ON p.id = d.producto_id
                    WHERE d.pedido_id = NEW.id AND p.tipo IN ('Comida', 'Postre')))
             OR (u.perfil = 'cantinero' AND EXISTS (
                    SELECT 1
                    FROM public.pedido_detalles d
                    JOIN public.productos p ON p.id = d.producto_id
                    WHERE d.pedido_id = NEW.id AND p.tipo = 'Bebida'))
          );

        PERFORM public.enviar_push(
            v_tokens, 'Nuevo pedido para preparar',
            'Mesa ' || COALESCE(v_mesa::text, '?') || ': revisá los pedidos pendientes.',
            'pedido-nuevo', v_datos
        );
    END IF;

    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_cambio_pedido ON public.pedidos;

CREATE TRIGGER trg_cambio_pedido
AFTER INSERT OR UPDATE OF estado ON public.pedidos
FOR EACH ROW
EXECUTE FUNCTION public.avisar_cambio_pedido();
