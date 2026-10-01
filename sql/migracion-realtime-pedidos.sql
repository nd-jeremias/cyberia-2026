-- =========================================================================
-- MIGRACIÓN: avisos en vivo de los pedidos (punto 14)
-- =========================================================================
--
-- El mozo confirma o rechaza el pedido desde su teléfono. Para que la pantalla
-- del cliente reaccione en el momento —y no cuando toque "Actualizar"— la
-- tabla `pedidos` tiene que estar publicada para Realtime.
--
-- Es lo mismo que activarla en el panel: Database -> Publications ->
-- supabase_realtime. Correr una sola vez; se puede repetir sin problema.
-- =========================================================================

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables
        WHERE pubname = 'supabase_realtime'
          AND schemaname = 'public'
          AND tablename = 'pedidos'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.pedidos;
    END IF;
END $$;
