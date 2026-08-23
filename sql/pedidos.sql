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
    cliente_registrado_id UUID NULL REFERENCES public.usuarios(id) ON DELETE SET NULL,
    cliente_anonimo_id UUID NULL REFERENCES public.clientes_anonimos(id) ON DELETE SET NULL,
    estado public.estado_general_pedido NOT NULL DEFAULT 'Pendiente de Confirmación',
    precio_total_neto NUMERIC(10, 2) NOT NULL DEFAULT 0.00, -- Sumatoria total acumulada (F12)
    descuento_juego NUMERIC(5, 2) NOT NULL DEFAULT 0.00,    -- % Descuento obtenido en juegos (F14/F15)
    propina_porcentaje NUMERIC(5, 2) NOT NULL DEFAULT 0.00, -- % Propina por QR (F21)
    fecha TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    
    -- Validación para asegurar que al menos un tipo de cliente esté asociado al pedido
    CONSTRAINT chk_cliente_existente CHECK (cliente_registrado_id IS NOT NULL OR cliente_anonimo_id IS NOT NULL)
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
-- 4. INSERCIÓN DE DATOS DE PRUEBA (Pedido Simulado para la Mesa 3)
-- =========================================================================

DO $$
DECLARE
    v_mesa_id UUID;
    v_cliente_reg_id UUID;
    v_prod_mila UUID;
    v_prod_fernet UUID;
    v_pedido_id UUID;
BEGIN
    -- Obtenemos IDs reales de las tablas previas para simular la consistencia
    SELECT id INTO v_mesa_id FROM public.mesas WHERE numero_mesa = 1 LIMIT 1;
    SELECT id INTO v_cliente_reg_id FROM public.usuarios WHERE correo_electronico = 'cliente@test.com' LIMIT 1;
    SELECT id INTO v_prod_mila FROM public.productos WHERE nombre = 'Milanesa con Papas Fritas' LIMIT 1;
    SELECT id INTO v_prod_fernet FROM public.productos WHERE nombre = 'Fernet con Coca XL' LIMIT 1;

    -- 3. Insertamos el pedido utilizando la variable v_mesa_id que ahora sí tiene datos
    INSERT INTO public.pedidos (mesa_id, cliente_registrado_id, estado, precio_total_neto)
    VALUES (v_mesa_id, v_cliente_reg_id, 'Confirmado', 10800.00)
    RETURNING id INTO v_pedido_id;

    -- 4. Insertamos las líneas de detalle asociadas
    INSERT INTO public.pedido_detalles (pedido_id, producto_id, cantidad, precio_unitario, estado_producto)
    VALUES (v_pedido_id, v_prod_mila, 2, 4500.00, 'En Preparación');

    INSERT INTO public.pedido_detalles (pedido_id, producto_id, cantidad, precio_unitario, estado_producto)
    VALUES (v_pedido_id, v_prod_fernet, 1, 1800.00, 'Pendiente');

END $$;
