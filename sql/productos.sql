-- =========================================================================
-- 1. LIMPIEZA DE DATOS PREVIOS
-- =========================================================================
DROP TABLE IF EXISTS public.productos;
DROP TYPE IF EXISTS public.tipo_producto;

-- =========================================================================
-- 2. CREACIÓN DE TIPOS Y TABLA
-- =========================================================================

-- Creamos el tipo ENUM para clasificar el producto según el enunciado
CREATE TYPE public.tipo_producto AS ENUM (
    'Comida', 
    'Bebida', 
    'Postre'
);

-- Creación de la tabla de productos
CREATE TABLE public.productos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre TEXT NOT NULL UNIQUE,
    descripcion TEXT NOT NULL,
    tiempo_elaboracion_minutos INTEGER NOT NULL, -- Tiempo en minutos
    precio NUMERIC(10, 2) NOT NULL,              -- Formato monetario (ej: 1500.50)
    fotos_urls TEXT[] NOT NULL,                  -- Arreglo de 3 URLs para el Bucket
    tipo public.tipo_producto NOT NULL,
    fecha_creacion TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    
    -- Restricción para asegurar que siempre se carguen exactamente 3 fotos (Requisito Excluyente)
    CONSTRAINT chk_cantidad_fotos CHECK (cardinality(fotos_urls) = 3)
);

-- Habilitar Seguridad a Nivel de Fila (RLS)
ALTER TABLE public.productos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Permitir acceso público a productos" ON public.productos FOR ALL USING (true);

-- =========================================================================
-- 3. INSERCIÓN DE DATOS DE PRUEBA (5 Platos y 5 Bebidas)
-- =========================================================================

INSERT INTO public.productos (nombre, descripcion, tiempo_elaboracion_minutos, precio, fotos_urls, tipo)
VALUES 
-- ----------- 5 PLATOS DE PRUEBA -----------
('Milanesa con Papas Fritas', 'Milanesa de nalga rebozada acompañada de papas fritas bastón crujientes.', 20, 4500.00, 
 ARRAY['https://supabase.co', 'https://supabase.co', 'https://supabase.co'], 'Comida'),

('Bife de Lomo con Puré', 'Bife de lomo a la parilla en su punto justo con puré de papas casero.', 25, 6800.00, 
 ARRAY['https://supabase.co', 'https://supabase.co', 'https://supabase.co'], 'Comida'),

('Sorrentinos de Jamón y Queso', 'Pasta rellena artesanal con salsa fileto o crema a elección.', 15, 3900.00, 
 ARRAY['https://supabase.co', 'https://supabase.co', 'https://supabase.co'], 'Comida'),

('Hamburguesa Completa', 'Medallón de carne vacuna con queso, lechuga, tomate y huevo en pan de papa.', 15, 3500.00, 
 ARRAY['https://supabase.co', 'https://supabase.co', 'https://supabase.co'], 'Comida'),

('Pizza Mozzarella XL', 'Pizza artesanal a la piedra con salsa de tomate de la casa y abundante mozzarella.', 18, 4800.00, 
 ARRAY['https://supabase.co', 'https://supabase.co', 'https://supabase.co'], 'Comida'),

-- ----------- 5 BEBIDAS DE PRUEBA -----------
('Cerveza Patagónica Amber', 'Cerveza tirada de 500ml con toques de caramelo y lúpulo fino.', 5, 1200.00, 
 ARRAY['https://supabase.co', 'https://supabase.co', 'https://supabase.co'], 'Bebida'),

('Fernet con Coca XL', 'Trago clásico preparado con Fernet Branca y Coca-Cola en vaso de 750ml.', 5, 1800.00, 
 ARRAY['https://supabase.co', 'https://supabase.co', 'https://supabase.co'], 'Bebida'),

('Limonada con Menta y Jengibre', 'Bebida refrescante natural licuada en el momento, endulzada a gusto.', 8, 950.00, 
 ARRAY['https://supabase.co', 'https://supabase.co', 'https://supabase.co'], 'Bebida'),

('Gaseosa Línea Coca 500ml', 'Botella individual fría (Opción común, Zero o Light).', 2, 700.00, 
 ARRAY['https://supabase.co', 'https://supabase.co', 'https://supabase.co'], 'Bebida'),

('Agua Mineral Villavicencio', 'Agua mineral de manantial de 500ml (Con o sin gas).', 2, 600.00, 
 ARRAY['https://supabase.co', 'https://supabase.co', 'https://supabase.co'], 'Bebida');
