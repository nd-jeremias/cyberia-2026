-- =========================================================================
-- SALA DE CONVERSACIÓN ENTRE CLIENTES Y MOZOS (punto 11 del enunciado)
-- =========================================================================
--
-- Un chat por visita: se abre la primera vez que el cliente consulta desde su
-- mesa y queda asociado a esa mesa. Todos los mozos ven y responden todos los
-- chats abiertos ("todos los mozos y todos los clientes", dice el enunciado).
--
-- Correr DESPUÉS de usuarios.sql y mesas.sql. Todo es idempotente: se puede
-- volver a correr sobre una base que ya tenga las tablas.
-- =========================================================================

CREATE TABLE IF NOT EXISTS public.chats (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    mesa_id UUID NOT NULL REFERENCES public.mesas(id) ON DELETE CASCADE,
    cliente_id UUID NOT NULL REFERENCES public.usuarios(id) ON DELETE CASCADE,
    fecha_apertura TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    -- NULL mientras la visita sigue. Se completa al cambiar de mesa.
    fecha_cierre TIMESTAMP WITH TIME ZONE NULL
);

CREATE TABLE IF NOT EXISTS public.mensajes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    chat_id UUID NOT NULL REFERENCES public.chats(id) ON DELETE CASCADE,
    -- El cliente o el mozo que escribió: los dos son filas de `usuarios`.
    autor_id UUID NOT NULL REFERENCES public.usuarios(id) ON DELETE CASCADE,
    cuerpo TEXT NOT NULL,
    fecha TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Un solo chat abierto por cliente. Si dos pantallas intentan abrirlo a la vez,
-- la segunda choca contra este índice y la aplicación toma el que ya existe,
-- en lugar de quedar dos conversaciones partidas.
CREATE UNIQUE INDEX IF NOT EXISTS chats_uno_abierto_por_cliente
    ON public.chats (cliente_id)
    WHERE fecha_cierre IS NULL;

-- Los mensajes siempre se leen por chat y en orden de llegada.
CREATE INDEX IF NOT EXISTS mensajes_por_chat_y_fecha
    ON public.mensajes (chat_id, fecha);

-- -------------------------------------------------------------------------
-- Seguridad: mismo criterio abierto que el resto de las tablas del proyecto.
-- -------------------------------------------------------------------------
ALTER TABLE public.chats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mensajes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Permitir acceso público chats" ON public.chats;
CREATE POLICY "Permitir acceso público chats" ON public.chats FOR ALL USING (true);

DROP POLICY IF EXISTS "Permitir acceso público mensajes" ON public.mensajes;
CREATE POLICY "Permitir acceso público mensajes" ON public.mensajes FOR ALL USING (true);

-- -------------------------------------------------------------------------
-- Realtime: sin esto los mensajes no aparecen solos en la otra pantalla.
-- Equivale a activar la tabla en Database -> Publications -> supabase_realtime.
-- -------------------------------------------------------------------------
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables
        WHERE pubname = 'supabase_realtime'
          AND schemaname = 'public'
          AND tablename = 'mensajes'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.mensajes;
    END IF;
END $$;

-- -------------------------------------------------------------------------
-- Push: NO se mandan desde la base.
-- La app los manda al guardar cada mensaje con NotificacionesService
-- (enviarAvisos / enviarAvisoAUsuario), que es el camino ya probado del
-- proyecto. El disparador de abajo queda comentado como alternativa: sólo
-- andaría con app.edge_url y app.service_key configurados, y si se activa
-- junto con la app los avisos llegarían duplicados.
-- -------------------------------------------------------------------------

-- -------------------------------------------------------------------------
-- Push (punto 11): la consulta del cliente llega a TODOS los mozos, y la
-- respuesta de un mozo llega al cliente de ese chat.
-- -------------------------------------------------------------------------
-- CREATE OR REPLACE FUNCTION public.avisar_mensaje_chat()
-- RETURNS TRIGGER
-- LANGUAGE plpgsql
-- SECURITY DEFINER
-- AS $$
-- DECLARE
--     v_cliente_id  UUID;
--     v_numero_mesa INTEGER;
--     v_nombre_mozo TEXT;
--     v_tokens      TEXT[];
-- BEGIN
--     SELECT c.cliente_id, m.numero_mesa
--     INTO v_cliente_id, v_numero_mesa
--     FROM public.chats c
--     JOIN public.mesas m ON m.id = c.mesa_id
--     WHERE c.id = NEW.chat_id;
--
--     -- Un aviso que no sale no puede impedir que el mensaje se guarde: si el
--     -- push todavía no está configurado, el chat tiene que andar igual.
--     BEGIN
--         IF NEW.autor_id = v_cliente_id THEN
--             SELECT ARRAY_AGG(token_push) INTO v_tokens
--             FROM public.usuarios
--             WHERE perfil = 'mozo' AND estado = 'Activo' AND token_push IS NOT NULL;
--
--             PERFORM public.enviar_push(
--                 v_tokens,
--                 'Consulta de la mesa ' || v_numero_mesa,
--                 LEFT(NEW.cuerpo, 120),
--                 'consulta-mozo',
--                 jsonb_build_object('chatId', NEW.chat_id::text)
--             );
--         ELSE
--             SELECT nombres INTO v_nombre_mozo
--             FROM public.usuarios
--             WHERE id = NEW.autor_id;
--
--             SELECT ARRAY_AGG(token_push) INTO v_tokens
--             FROM public.usuarios
--             WHERE id = v_cliente_id AND token_push IS NOT NULL;
--
--             PERFORM public.enviar_push(
--                 v_tokens,
--                 'Respuesta de ' || COALESCE(v_nombre_mozo, 'el mozo'),
--                 LEFT(NEW.cuerpo, 120),
--                 'consulta-mozo',
--                 jsonb_build_object('chatId', NEW.chat_id::text)
--             );
--         END IF;
--     EXCEPTION WHEN OTHERS THEN
--         RAISE WARNING 'No se pudo enviar el aviso del chat: %', SQLERRM;
--     END;
--
--     RETURN NEW;
-- END;
-- $$;
--
-- DROP TRIGGER IF EXISTS trg_mensaje_chat ON public.mensajes;
--
-- CREATE TRIGGER trg_mensaje_chat
-- AFTER INSERT ON public.mensajes
-- FOR EACH ROW
-- EXECUTE FUNCTION public.avisar_mensaje_chat();
