-- =========================================================================
-- MIGRACIÓN: circuito del cliente en el local y lista de espera
-- =========================================================================
--
-- El cliente escanea el QR de la puerta y queda anotado en la lista de espera
-- del metre (punto 9). Esa lista no es una tabla: son los usuarios cuyo
-- `estado_en_resto` está en 'esperando_mesa'. Modelarlo como un estado impide
-- que alguien figure a la vez en la lista y sentado en una mesa.
--
-- Correr sólo si NO se recrea la base con los scripts de esta carpeta: ellos
-- ya vienen al día.
-- =========================================================================

-- El tipo, sólo si todavía no existe.
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'estado_en_resto') THEN
        CREATE TYPE public.estado_en_resto AS ENUM (
            'libre',
            'esperando_mesa',
            'mesa_asignada',
            'sentado',
            'pagando'
        );
    END IF;
END $$;

-- Las filas que ya existen arrancan en 'libre' por el DEFAULT.
ALTER TABLE public.usuarios
    ADD COLUMN IF NOT EXISTS estado_en_resto public.estado_en_resto NOT NULL DEFAULT 'libre';

ALTER TABLE public.usuarios
    ADD COLUMN IF NOT EXISTS mesa_id UUID NULL;

-- Si se borra una mesa, el cliente queda sin mesa pero no se pierde.
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'usuarios_mesa_id_fkey'
    ) THEN
        ALTER TABLE public.usuarios
            ADD CONSTRAINT usuarios_mesa_id_fkey
            FOREIGN KEY (mesa_id) REFERENCES public.mesas(id) ON DELETE SET NULL;
    END IF;
END $$;

-- -------------------------------------------------------------------------
-- Ojo con los QR de mesa que ya estén impresos
-- -------------------------------------------------------------------------
-- Antes el QR de la mesa llevaba adentro { numeroMesa, cantidadLugares, tipo }.
-- Ahora lleva { "tipo": "mesa", "id": "<uuid de la mesa>" }, para que editar la
-- mesa no deje el papel mintiendo. Los códigos generados con el formato viejo
-- ya no se reconocen: hay que volver a dar de alta esas mesas (o regenerarles
-- el QR) y reimprimirlos.
