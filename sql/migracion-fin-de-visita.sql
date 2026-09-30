-- =========================================================================
-- MIGRACIÓN: fin de la visita del cliente (punto 22)
-- =========================================================================
--
-- Cuando el mozo confirma el pago, el cliente queda libre y la mesa vuelve a
-- estar disponible. Pero el cliente todavía no se fue: si escanea un QR en ese
-- momento no está pidiendo una mesa nueva, y el enunciado espera que vea las
-- encuestas.
--
-- Esta columna guarda cuándo terminó su última visita. La aplicación la
-- compara contra una ventana de horas (src/app/utils/visita.ts): mientras no
-- pase, escanear el QR de ingreso o el de la mesa lo lleva a las encuestas.
--
-- Sin esta migración la aplicación sigue funcionando: el pago se confirma y
-- la mesa se libera igual, sólo que el escaneo posterior no se desvía a las
-- encuestas. La consola avisa que falta correr este archivo.
--
-- Correr sólo si NO se recrea la base con usuarios.sql, que ya la incluye.
-- =========================================================================

ALTER TABLE public.usuarios
    ADD COLUMN IF NOT EXISTS fecha_ultima_visita TIMESTAMP WITH TIME ZONE NULL;

COMMENT ON COLUMN public.usuarios.fecha_ultima_visita IS
    'Cuándo terminó la última visita del cliente (el mozo confirmó el pago). NULL si nunca vino.';
