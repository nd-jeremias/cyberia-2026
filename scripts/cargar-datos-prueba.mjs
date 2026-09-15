/**
 * Carga en Supabase pedidos de prueba descritos en un JSON.
 *
 * Uso:
 *   npm run datos:prueba           sql/datos-prueba/pedidos.json          (puntos 13 y 14)
 *   npm run datos:prueba:entrega   sql/datos-prueba/pedido-listo.json     (punto 19)
 *   npm run datos:prueba:pago      sql/datos-prueba/pedido-por-cobrar.json (punto 22)
 *   node scripts/cargar-datos-prueba.mjs <otro-archivo.json>
 *
 * El JSON nombra cada cosa por su dato natural (correo del cliente, número de
 * mesa, nombre del producto) y este script resuelve los IDs consultando la
 * base. Así el archivo se lee y se edita sin copiar UUIDs.
 *
 * Es idempotente: si el cliente ya tiene un pedido sin pagar en esa mesa, se lo
 * reemplaza por el del JSON en lugar de crear otro. Sirve para volver a dejar el
 * pedido en el estado de partida y repetir la prueba.
 *
 * Además deja el circuito coherente: la mesa queda 'ocupada' por el cliente, y
 * el cliente en esa mesa, 'sentado' o en el `estadoCliente` que indique el JSON
 * ('pagando' para probar la confirmación del pago).
 */
import { createClient } from '@supabase/supabase-js';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const URL_SUPABASE = process.env.SUPABASE_URL ?? 'https://uwmptccyleznngdazgrp.supabase.co';
// Clave publicable: es la misma que ya viaja dentro de la aplicación.
const CLAVE_SUPABASE = process.env.SUPABASE_KEY ?? 'sb_publishable_Rergl078Rb0RVfq5uNPlIw_byzVZGEK';

const RUTA_DATOS = process.argv[2]
    ? resolve(process.argv[2])
    : new URL('../sql/datos-prueba/pedidos.json', import.meta.url);

// Con cocina y barra ya terminadas, las líneas del pedido van en 'Listo'.
const PEDIDO_TERMINADO = new Set(['Listo para Entregar', 'Entregado', 'Recibido']);

// Estados del cliente que tienen sentido con un pedido servido en la mesa.
const ESTADOS_CLIENTE = new Set(['sentado', 'pagando']);

// Postgres rechazó un valor de ENUM.
const VALOR_FUERA_DEL_ENUM = '22P02';

const supabase = createClient(URL_SUPABASE, CLAVE_SUPABASE, {
    auth: { persistSession: false },
});

/** Falla con un mensaje claro en vez de un error genérico de la base. */
function exigir(valor, mensaje) {
    if (valor === null || valor === undefined) throw new Error(mensaje);
    return valor;
}

async function buscarUno(tabla, columnas, columnaFiltro, valor) {
    const { data, error } = await supabase
        .from(tabla)
        .select(columnas)
        .eq(columnaFiltro, valor)
        .maybeSingle();

    if (error) throw error;

    return data;
}

async function cargarPedido(definicion) {
    const estadoCliente = definicion.estadoCliente ?? 'sentado';

    if (!ESTADOS_CLIENTE.has(estadoCliente)) {
        throw new Error(`estadoCliente "${estadoCliente}" no válido: usar 'sentado' o 'pagando'.`);
    }

    const cliente = exigir(
        await buscarUno('usuarios', 'id, estado', 'correo_electronico', definicion.cliente),
        `No existe el cliente ${definicion.cliente}.`
    );

    // Un cliente sin aprobar no puede ingresar a la aplicación (punto 5).
    if (cliente.estado !== 'Activo') {
        throw new Error(`El cliente ${definicion.cliente} no está aprobado (estado: ${cliente.estado}).`);
    }

    const mesa = exigir(
        await buscarUno('mesas', 'id, cliente_id', 'numero_mesa', definicion.mesa),
        `No existe la mesa ${definicion.mesa}.`
    );

    if (mesa.cliente_id && mesa.cliente_id !== cliente.id) {
        throw new Error(`La mesa ${definicion.mesa} está ocupada por otro cliente.`);
    }

    const estadoLineas = PEDIDO_TERMINADO.has(definicion.estado) ? 'Listo' : 'Pendiente';

    // Cada línea toma el precio actual del producto: queda congelado en el
    // pedido aunque después cambie en la carta.
    const lineas = [];

    for (const detalle of definicion.detalles) {
        const producto = exigir(
            await buscarUno('productos', 'id, precio', 'nombre', detalle.producto),
            `No existe el producto "${detalle.producto}".`
        );

        lineas.push({
            producto_id: producto.id,
            cantidad: detalle.cantidad,
            precio_unitario: Number(producto.precio),
            estado_producto: estadoLineas,
        });
    }

    const total = lineas.reduce((suma, linea) => suma + linea.cantidad * linea.precio_unitario, 0);

    const { data: abierto, error: errorAbierto } = await supabase
        .from('pedidos')
        .select('id')
        .eq('cliente_id', cliente.id)
        .eq('mesa_id', mesa.id)
        .neq('estado', 'Pagado')
        .order('fecha', { ascending: false })
        .limit(1)
        .maybeSingle();

    if (errorAbierto) throw errorAbierto;

    let pedidoId;

    if (abierto) {
        pedidoId = abierto.id;

        // Primero el estado: si la base lo rechaza, el pedido queda intacto en
        // vez de quedarse sin líneas.
        const { error } = await supabase
            .from('pedidos')
            .update({ estado: definicion.estado, precio_total_neto: total })
            .eq('id', pedidoId);
        if (error) throw error;

        const { error: errorBorrado } = await supabase.from('pedido_detalles').delete().eq('pedido_id', pedidoId);
        if (errorBorrado) throw errorBorrado;
    } else {
        const { data, error } = await supabase
            .from('pedidos')
            .insert({
                mesa_id: mesa.id,
                cliente_id: cliente.id,
                estado: definicion.estado,
                precio_total_neto: total,
            })
            .select('id')
            .single();
        if (error) throw error;

        pedidoId = data.id;
    }

    const { error: errorLineas } = await supabase
        .from('pedido_detalles')
        .insert(lineas.map((linea) => ({ ...linea, pedido_id: pedidoId })));
    if (errorLineas) throw errorLineas;

    const { error: errorCliente } = await supabase
        .from('usuarios')
        .update({ estado_en_resto: estadoCliente, mesa_id: mesa.id })
        .eq('id', cliente.id);
    if (errorCliente) throw errorCliente;

    const { error: errorMesa } = await supabase
        .from('mesas')
        .update({ disponibilidad: 'ocupada', cliente_id: cliente.id })
        .eq('id', mesa.id);
    if (errorMesa) throw errorMesa;

    return { pedidoId, accion: abierto ? 'actualizado' : 'creado' };
}

/** Relee el pedido con el mismo join que usa la aplicación. */
async function leerPedido(pedidoId) {
    const { data, error } = await supabase
        .from('pedidos')
        .select(
            'numero_pedido, estado, precio_total_neto, ' +
                'mesas ( numero_mesa ), ' +
                'usuarios ( correo_electronico, estado_en_resto ), ' +
                'pedido_detalles ( cantidad, precio_unitario, precio_total_parcial, estado_producto, productos ( nombre ) )'
        )
        .eq('id', pedidoId)
        .single();

    if (error) throw error;

    return data;
}

try {
    const { pedidos } = JSON.parse(await readFile(RUTA_DATOS, 'utf8'));

    for (const definicion of pedidos) {
        const { pedidoId, accion } = await cargarPedido(definicion);

        console.log(`\nPedido ${accion} para ${definicion.cliente} en la mesa ${definicion.mesa}:`);
        console.dir(await leerPedido(pedidoId), { depth: null });
    }
} catch (error) {
    console.error('\nNo se pudieron cargar los datos de prueba:', error.message ?? error);

    if (error.code === VALOR_FUERA_DEL_ENUM) {
        console.error('Si el estado es "Recibido", falta correr sql/migracion-recepcion-pedido.sql en Supabase.');
    }

    process.exitCode = 1;
}
