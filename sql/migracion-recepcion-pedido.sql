-- =========================================================================
-- MIGRACIÓN: el cliente confirma la recepción de su pedido (punto 19)
-- =========================================================================
--
-- El punto 19 tiene dos pasos que el enunciado pide verificar por separado:
-- el mozo entrega el pedido y después el cliente confirma que lo recibió.
-- 'Entregado' registra el primero; faltaba un estado para el segundo, que es
-- el que le habilita al cliente la encuesta y el pedido de la cuenta.
--
-- Sin esta migración la aplicación sigue funcionando, pero al tocar
-- "Confirmar recepción" avisa que falta actualizar la base.
--
-- Correr sólo si NO se recrea la base con pedidos.sql, que ya lo incluye.
-- =========================================================================

ALTER TYPE public.estado_general_pedido ADD VALUE IF NOT EXISTS 'Recibido' AFTER 'Entregado';
