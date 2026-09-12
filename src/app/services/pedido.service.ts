import { Service, computed, inject, signal } from '@angular/core';
import {
    DetallePedidoInterface,
    EstadoItem,
    EstadoPedido,
    NuevoPedidoInterface,
    PedidoInterface,
} from '../interfaces/pedido.interface';
import { ModalService } from './modal.service';
import { supabase } from './supabase.service';

/**
 * Ciclo de vida completo de un pedido.
 *
 * Un pedido nace cuando el cliente termina de elegir (punto 12) y recorre
 * varios estados hasta el pago (punto 22):
 *
 *   Pendiente de Confirmación
 *        │  el mozo revisa
 *        ├── Rechazado ──► el cliente corrige y vuelve a enviar   (punto 13)
 *        └── Confirmado ──► baja a cocina y bar                    (punto 14)
 *                 │
 *          En Preparación ──► Listo para Entregar                  (punto 18)
 *                 │
 *             Entregado ──► Pagado, y se libera la mesa            (punto 22)
 *
 * El estado vive en la base; acá se mantiene una copia en signals para que las
 * pantallas se actualicen solas sin volver a consultar en cada cambio.
 */

// ---------------------------------------------------------------------------
// Formas crudas de Supabase
// ---------------------------------------------------------------------------
// La base usa snake_case y devuelve las relaciones anidadas. Estas interfaces
// describen ese formato para poder traducirlo a las del dominio en un solo
// lugar (`mapear`), en vez de esparcir `fila.precio_total_neto` por toda la
// aplicación.
interface FilaDetalle {
    id: string;
    pedido_id: string;
    producto_id: string;
    cantidad: number;
    precio_unitario: number;
    precio_total_parcial: number;
    estado_producto: EstadoItem;
    productos: {
        nombre: string;
        tiempo_elaboracion_minutos: number;
    } | null;
}

interface FilaPedido {
    id: string;
    mesa_id: string;
    cliente_id: string;
    estado: EstadoPedido;
    precio_total_neto: number;
    descuento_juego: number;
    propina_porcentaje: number;
    fecha: string;
    mesas: { numero_mesa: number } | null;
    pedido_detalles: FilaDetalle[] | null;
}

// Columnas que se piden en cada consulta. Se declara una sola vez para que
// todas las consultas devuelvan la misma forma y `mapear` siempre reciba lo
// que espera. Incluye el número de mesa y el nombre de cada producto, que
// viven en otras tablas.
const SELECT_PEDIDO =
    'id, mesa_id, cliente_id, estado, ' +
    'precio_total_neto, descuento_juego, propina_porcentaje, fecha, ' +
    'mesas ( numero_mesa ), ' +
    'pedido_detalles ( id, pedido_id, producto_id, cantidad, precio_unitario, ' +
    'precio_total_parcial, estado_producto, ' +
    'productos ( nombre, tiempo_elaboracion_minutos ) )';

@Service()
export class PedidoService {
    private modal = inject(ModalService);

    /** Pedidos cargados en memoria; las pantallas se enganchan a este signal. */
    pedidos = signal<PedidoInterface[]>([]);

    /** Bloquea los botones mientras hay una operación en curso. */
    cargando = signal<boolean>(false);

    // El mozo necesita ver primero lo que espera su confirmacion (punto 12).
    pendientesDeConfirmacion = computed(() =>
        this.pedidos().filter((p) => p.estado === 'Pendiente de Confirmación')
    );

    listosParaEntregar = computed(() =>
        this.pedidos().filter((p) => p.estado === 'Listo para Entregar')
    );

    /**
     * Traduce una fila de Supabase al modelo del dominio.
     *
     * Los importes llegan como texto porque Postgres usa NUMERIC para no
     * perder precisión en dinero; por eso cada uno pasa por `Number`.
     */
    private mapear(fila: FilaPedido): PedidoInterface {
        const detalles: DetallePedidoInterface[] = (
            fila.pedido_detalles ?? []
        ).map((d) => ({
            id: d.id,
            pedidoId: d.pedido_id,
            productoId: d.producto_id,
            nombreProducto: d.productos?.nombre ?? 'Producto',
            cantidad: d.cantidad,
            precioUnitario: Number(d.precio_unitario),
            precioTotalParcial: Number(d.precio_total_parcial),
            estadoProducto: d.estado_producto,
            tiempoElaboracionMinutos:
                d.productos?.tiempo_elaboracion_minutos ?? 0,
        }));

        return {
            id: fila.id,
            mesaId: fila.mesa_id,
            numeroMesa: fila.mesas?.numero_mesa ?? 0,
            clienteId: fila.cliente_id,
            estado: fila.estado,
            precioTotalNeto: Number(fila.precio_total_neto),
            descuentoJuego: Number(fila.descuento_juego),
            propinaPorcentaje: Number(fila.propina_porcentaje),
            fecha: fila.fecha,
            detalles,
        };
    }

    /**
     * Muestra el error en pantalla.
     *
     * Todo fallo se comunica con un control visible: el enunciado prohíbe los
     * alerts del navegador y exige que nada falle en silencio.
     */
    private avisarError(error: unknown, alternativa: string): void {
        const mensaje = error instanceof Error ? error.message : alternativa;

        this.modal.setOpen('Error', mensaje);
    }

    /**
     * Trae los pedidos, opcionalmente filtrados por estado.
     *
     * Cada pantalla pide sólo lo suyo: el mozo los que esperan confirmación,
     * cocina los confirmados. Así no se traen pedidos que no se van a mostrar.
     */
    async listar(estados?: EstadoPedido[]): Promise<void> {
        this.cargando.set(true);

        try {
            let consulta = supabase
                .from('pedidos')
                .select(SELECT_PEDIDO)
                .order('fecha', { ascending: true });

            if (estados && estados.length > 0) {
                consulta = consulta.in('estado', estados);
            }

            const { data, error } = await consulta;

            if (error) throw error;

            this.pedidos.set(
                ((data ?? []) as unknown as FilaPedido[]).map((f) =>
                    this.mapear(f)
                )
            );
        } catch (error) {
            this.avisarError(error, 'No se pudieron cargar los pedidos.');
        } finally {
            this.cargando.set(false);
        }
    }

    /**
     * Pedido en curso de un cliente, con sus líneas y productos.
     *
     * "En curso" es cualquiera que todavía no se pagó: el cliente sigue su
     * pedido desde que lo envía hasta que paga. Si hubiera más de uno, se toma
     * el último.
     */
    async pedidoActualDelCliente(clienteId: string): Promise<PedidoInterface | null> {
        const { data, error } = await supabase
            .from('pedidos')
            .select(SELECT_PEDIDO)
            .eq('cliente_id', clienteId)
            .neq('estado', 'Pagado')
            .order('fecha', { ascending: false })
            .limit(1)
            .maybeSingle();

        if (error) throw error;

        return data ? this.mapear(data as unknown as FilaPedido) : null;
    }

    // Punto 12: el cliente arma el pedido y queda esperando al mozo.
    async crear(nuevo: NuevoPedidoInterface): Promise<string | null> {
        if (nuevo.items.length === 0) {
            this.modal.setOpen(
                'Pedido vacío',
                'Debe elegir al menos un producto antes de confirmar.'
            );

            return null;
        }

        this.cargando.set(true);

        try {
            const total = nuevo.items.reduce(
                (suma, item) => suma + item.cantidad * item.precioUnitario,
                0
            );

            const { data, error } = await supabase
                .from('pedidos')
                .insert({
                    mesa_id: nuevo.mesaId,
                    cliente_id: nuevo.clienteId,
                    estado: 'Pendiente de Confirmación',
                    precio_total_neto: total,
                })
                .select('id')
                .single();

            if (error) throw error;

            const detalles = nuevo.items.map((item) => ({
                pedido_id: data.id,
                producto_id: item.productoId,
                cantidad: item.cantidad,
                precio_unitario: item.precioUnitario,
            }));

            const { error: errorDetalles } = await supabase
                .from('pedido_detalles')
                .insert(detalles);

            if (errorDetalles) throw errorDetalles;

            // Hacer el pedido es sentarse a la mesa: el cliente deja de estar
            // "con mesa asignada" y pasa a "sentado". El filtro evita pisar un
            // estado posterior, como el de quien ya pidió la cuenta.
            const { error: errorEstado } = await supabase
                .from('usuarios')
                .update({ estado_en_resto: 'sentado' })
                .eq('id', nuevo.clienteId)
                .eq('estado_en_resto', 'mesa_asignada');

            // El pedido ya quedó guardado: un fallo acá no debe anularlo.
            if (errorEstado) console.error('No se pudo actualizar el estado del cliente', errorEstado);

            return data.id;
        } catch (error) {
            this.avisarError(error, 'No se pudo registrar el pedido.');

            return null;
        } finally {
            this.cargando.set(false);
        }
    }

    /**
     * Cambia el estado de un pedido en la base y en la copia local.
     *
     * Actualizar el signal evita tener que recargar la lista entera: la
     * pantalla refleja el cambio de inmediato.
     *
     * @returns `true` si se guardó; `false` si falló (ya avisado al usuario).
     */
    private async cambiarEstado(
        pedidoId: string,
        estado: EstadoPedido
    ): Promise<boolean> {
        this.cargando.set(true);

        try {
            const { error } = await supabase
                .from('pedidos')
                .update({ estado })
                .eq('id', pedidoId);

            if (error) throw error;

            this.pedidos.update((actuales) =>
                actuales.map((p) => (p.id === pedidoId ? { ...p, estado } : p))
            );

            return true;
        } catch (error) {
            this.avisarError(error, 'No se pudo actualizar el pedido.');

            return false;
        } finally {
            this.cargando.set(false);
        }
    }

    // Punto 14: el mozo confirma y el pedido baja a cocina y bar.
    confirmar(pedidoId: string): Promise<boolean> {
        return this.cambiarEstado(pedidoId, 'Confirmado');
    }

    // Punto 13: el mozo rechaza para que el cliente lo corrija.
    rechazar(pedidoId: string): Promise<boolean> {
        return this.cambiarEstado(pedidoId, 'Rechazado');
    }

    // Punto 19: el mozo entrega el pedido completo.
    entregar(pedidoId: string): Promise<boolean> {
        return this.cambiarEstado(pedidoId, 'Entregado');
    }

    /**
     * Punto 22: el mozo confirma el pago y la mesa queda libre.
     *
     * Son dos escrituras, y la de la mesa es la que importa para el negocio:
     * si no se libera, esa mesa queda inutilizable para el resto del servicio.
     */
    async marcarPagado(pedidoId: string, mesaId: string): Promise<boolean> {
        const actualizado = await this.cambiarEstado(pedidoId, 'Pagado');

        if (!actualizado) return false;

        const { error } = await supabase
            .from('mesas')
            .update({
                disponibilidad: 'disponible',
                cliente_id: null,
            })
            .eq('id', mesaId);

        if (error) {
            this.avisarError(error, 'No se pudo liberar la mesa.');

            return false;
        }

        return true;
    }

    /**
     * Puntos 16 a 18: cocina y bar marcan el avance producto por producto.
     *
     * El estado va por ítem y no por pedido porque una mesa puede pedir comida
     * y bebida a la vez, y cada sector termina lo suyo por separado.
     */
    async cambiarEstadoItem(
        detalleId: string,
        estado: EstadoItem
    ): Promise<boolean> {
        try {
            const { error } = await supabase
                .from('pedido_detalles')
                .update({ estado_producto: estado })
                .eq('id', detalleId);

            if (error) throw error;

            this.pedidos.update((actuales) =>
                actuales.map((pedido) => ({
                    ...pedido,
                    detalles: pedido.detalles.map((d) =>
                        d.id === detalleId ? { ...d, estadoProducto: estado } : d
                    ),
                }))
            );

            return true;
        } catch (error) {
            this.avisarError(error, 'No se pudo actualizar el producto.');

            return false;
        }
    }

    /**
     * Minutos estimados hasta que el pedido esté listo.
     *
     * Es el tiempo del producto más lento, no la suma: cocina y bar preparan
     * en paralelo. Sumarlos daría una espera muy por encima de la real.
     */
    tiempoEstimado(pedido: PedidoInterface): number {
        return pedido.detalles.reduce(
            (mayor, d) => Math.max(mayor, d.tiempoElaboracionMinutos),
            0
        );
    }

    /**
     * Importe final a abonar.
     *
     * El descuento de los juegos y la propina se calculan **ambos sobre el
     * neto**, no encadenados. Aplicar uno sobre el resultado del otro daría
     * un total distinto y equivocado.
     */
    totalConDescuento(pedido: PedidoInterface): number {
        const descuento = pedido.precioTotalNeto * (pedido.descuentoJuego / 100);
        const propina =
            pedido.precioTotalNeto * (pedido.propinaPorcentaje / 100);

        return pedido.precioTotalNeto - descuento + propina;
    }
}
