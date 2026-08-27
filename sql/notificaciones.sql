-- =========================================================================
-- NOTIFICACIONES PUSH: disparadores de la base hacia la Edge Function
-- =========================================================================
-- Requiere la extension pg_net (Database > Extensions en el panel de Supabase)
-- y la funcion 'enviar-notificacion' desplegada.
--
--   supabase functions deploy enviar-notificacion
--   supabase secrets set FCM_SERVER_KEY=...
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
