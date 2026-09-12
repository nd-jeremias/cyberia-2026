-- =========================================================================
-- 1. LIMPIEZA DE DATOS PREVIOS
-- =========================================================================
DROP TABLE IF EXISTS public.pedido_detalles;
DROP TABLE IF EXISTS public.pedidos;
DROP TYPE IF EXISTS public.estado_general_pedido;
DROP TYPE IF EXISTS public.estado_item_producto;

-- =========================================================================
-- 2. CREACIÓN DE TIPOS ENUM (Estados del Flujo del PDF)
-- =========================================================================

-- Estados globales del pedido según las funcionalidades 12, 13, 14, 19 y 21
CREATE TYPE public.estado_general_pedido AS ENUM (
    'Pendiente de Confirmación', -- Cliente terminó el pedido, espera al mozo (F12)
    'Rechazado',                 -- Mozo rechazó el pedido para corrección (F13)
    'Confirmado',               -- Mozo confirmó y se derivó a los sectores (F14)
    'En Preparación',            -- Los sectores están cocinando/armando
    'Listo para Entregar',       -- Cocina y bar terminaron todo (F18)
    'Entregado',                 -- El mozo llevó el pedido a la mesa (F19)
    'Pagado'                     -- Mozo confirmó el pago y libera mesa (F22)
);

-- Estados individuales por producto para los sectores Cocina y Bar (F16 y F17)
CREATE TYPE public.estado_item_producto AS ENUM (
    'Pendiente',
    'En Preparación',
    'Listo'
);

-- =========================================================================
-- 3. CREACIÓN DE TABLAS (Estructura Dividida)
-- =========================================================================

-- TABLA 1: Cabecera del Pedido
CREATE TABLE public.pedidos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    numero_pedido SERIAL NOT NULL, -- Genera un N° autoincremental fácil de leer para el cliente
    mesa_id UUID NOT NULL REFERENCES public.mesas(id) ON DELETE RESTRICT, -- Enlace relacional robusto
    -- Registrados y anónimos son filas de `usuarios`, así que el pedido apunta
    -- a una sola columna. RESTRICT: no se borra un cliente con pedidos hechos,
    -- porque la factura y el historial lo necesitan.
    cliente_id UUID NOT NULL REFERENCES public.usuarios(id) ON DELETE RESTRICT,
    estado public.estado_general_pedido NOT NULL DEFAULT 'Pendiente de Confirmación',
    precio_total_neto NUMERIC(10, 2) NOT NULL DEFAULT 0.00, -- Sumatoria total acumulada (F12)
    descuento_juego NUMERIC(5, 2) NOT NULL DEFAULT 0.00,    -- % Descuento obtenido en juegos (F14/F15)
    propina_porcentaje NUMERIC(5, 2) NOT NULL DEFAULT 0.00, -- % Propina por QR (F21)
    fecha TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- TABLA 2: Detalles/Líneas del Pedido
CREATE TABLE public.pedido_detalles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pedido_id UUID NOT NULL REFERENCES public.pedidos(id) ON DELETE CASCADE,
    producto_id UUID NOT NULL REFERENCES public.productos(id) ON DELETE RESTRICT,
    cantidad INTEGER NOT NULL CHECK (cantidad > 0),
    precio_unitario NUMERIC(10, 2) NOT NULL,      -- Se congela el precio al momento de pedir
    precio_total_parcial NUMERIC(10, 2) GENERATED ALWAYS AS (cantidad * precio_unitario) STORED, -- Se calcula automático
    estado_producto public.estado_item_producto NOT NULL DEFAULT 'Pendiente'
);

-- Habilitar Seguridad a Nivel de Fila (RLS)
ALTER TABLE public.pedidos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pedido_detalles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Permitir acceso público a pedidos" ON public.pedidos FOR ALL USING (true);
CREATE POLICY "Permitir acceso público a detalles" ON public.pedido_detalles FOR ALL USING (true);

-- =========================================================================
-- 4. DATOS DE PRUEBA
-- =========================================================================
-- Un pedido esperando la confirmación del mozo, para poder probar los puntos
-- 13 (rechazo) y 14 (confirmación) apenas se crea la base.
--
-- Sobre una base que ya está en uso, sin recrear las tablas, conviene
-- `npm run datos:prueba`, que carga sql/datos-prueba/pedidos.json.
--
-- Correcciones respecto de la versión anterior de este bloque:
--  - Buscaba sólo 'cliente@test.com', que existe si se corrió usuarios.sql
--    pero no en la base de Supabase en uso ('cliente@restaurante.com'). Con el
--    cliente en NULL el INSERT fallaba y no se cargaba nada.
--  - El pedido nacía 'Confirmado', un estado que la pantalla del mozo no
--    lista: no quedaba nada para confirmar ni para rechazar.
--  - No sentaba al cliente ni ocupaba la mesa, así que el pedido colgaba de una
--    mesa libre y de un cliente que figuraba sin mesa.
DO $$
DECLARE
    v_mesa_id UUID;
    v_cliente_id UUID;
    v_prod_mila UUID;
    v_prod_fernet UUID;
    v_pedido_id UUID;
BEGIN
    SELECT id INTO v_mesa_id FROM public.mesas WHERE numero_mesa = 1 LIMIT 1;

    SELECT id INTO v_cliente_id
    FROM public.usuarios
    WHERE correo_electronico IN ('cliente@test.com', 'cliente@restaurante.com')
    ORDER BY correo_electronico = 'cliente@test.com' DESC
    LIMIT 1;

    SELECT id INTO v_prod_mila FROM public.productos WHERE nombre = 'Milanesa con Papas Fritas' LIMIT 1;
    SELECT id INTO v_prod_fernet FROM public.productos WHERE nombre = 'Fernet con Coca XL' LIMIT 1;

    IF v_mesa_id IS NULL OR v_cliente_id IS NULL OR v_prod_mila IS NULL OR v_prod_fernet IS NULL THEN
        RAISE NOTICE 'Datos de prueba de pedidos omitidos: falta la mesa 1, el cliente de prueba o algún producto. Corré antes mesas.sql, usuarios.sql y productos.sql.';
        RETURN;
    END IF;

    -- Cliente sentado en la mesa y mesa ocupada por él: el mismo estado en el
    -- que queda el circuito cuando un cliente real hace su pedido.
    UPDATE public.usuarios
    SET estado_en_resto = 'sentado', mesa_id = v_mesa_id
    WHERE id = v_cliente_id;

    UPDATE public.mesas
    SET disponibilidad = 'ocupada', cliente_id = v_cliente_id
    WHERE id = v_mesa_id;

    -- 2 × 4500 + 1 × 1800 = 10800
    INSERT INTO public.pedidos (mesa_id, cliente_id, estado, precio_total_neto)
    VALUES (v_mesa_id, v_cliente_id, 'Pendiente de Confirmación', 10800.00)
    RETURNING id INTO v_pedido_id;

    -- Hasta que el mozo confirma, ningún ítem baja a los sectores.
    INSERT INTO public.pedido_detalles (pedido_id, producto_id, cantidad, precio_unitario, estado_producto)
    VALUES
        (v_pedido_id, v_prod_mila,   2, 4500.00, 'Pendiente'),
        (v_pedido_id, v_prod_fernet, 1, 1800.00, 'Pendiente');
END $$;
