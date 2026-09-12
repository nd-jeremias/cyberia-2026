/**
 * Carga en Supabase los pedidos de prueba de sql/datos-prueba/pedidos.json.
 *
 * Uso:  npm run datos:prueba
 *
 * El JSON nombra cada cosa por su dato natural (correo del cliente, número de
 * mesa, nombre del producto) y este script resuelve los IDs consultando la
 * base. Así el archivo se lee y se edita sin copiar UUIDs.
 *
 * Es idempotente: si el cliente ya tiene un pedido sin pagar en esa mesa, se lo
 * reemplaza por el del JSON en lugar de crear otro. Sirve para volver a dejar el
 * pedido "Pendiente de Confirmación" y repetir la prueba de los puntos 13 y 14.
 *
 * Además deja el circuito coherente: el cliente queda 'sentado' en la mesa y la
 * mesa 'ocupada' por él, como cuando un cliente real hace su pedido.
 */
import { createClient } from '@supabase/supabase-js';
import { readFile } from 'node:fs/promises';

const URL_SUPABASE = process.env.SUPABASE_URL ?? 'https://uwmptccyleznngdazgrp.supabase.co';
// Clave publicable: es la misma que ya viaja dentro de la aplicación.
const CLAVE_SUPABASE = process.env.SUPABASE_KEY ?? 'sb_publishable_Rergl078Rb0RVfq5uNPlIw_byzVZGEK';

const RUTA_DATOS = new URL('../sql/datos-prueba/pedidos.json', import.meta.url);

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

        const { error: errorBorrado } = await supabase.from('pedido_detalles').delete().eq('pedido_id', pedidoId);
        if (errorBorrado) throw errorBorrado;

        const { error } = await supabase
            .from('pedidos')
            .update({ estado: definicion.estado, precio_total_neto: total })
            .eq('id', pedidoId);
        if (error) throw error;
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
        .update({ estado_en_resto: 'sentado', mesa_id: mesa.id })
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
                'pedido_detalles ( cantidad, precio_unitario, precio_total_parcial, productos ( nombre ) )'
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
    process.exitCode = 1;
}
