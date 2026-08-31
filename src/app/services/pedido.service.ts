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

// Filas crudas tal como las devuelve Supabase, antes de mapearlas a la interfaz.
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
    cliente_registrado_id: string | null;
    cliente_anonimo_id: string | null;
    estado: EstadoPedido;
    precio_total_neto: number;
    descuento_juego: number;
    propina_porcentaje: number;
    fecha: string;
    mesas: { numero_mesa: number } | null;
    pedido_detalles: FilaDetalle[] | null;
}

const SELECT_PEDIDO =
    'id, mesa_id, cliente_registrado_id, cliente_anonimo_id, estado, ' +
    'precio_total_neto, descuento_juego, propina_porcentaje, fecha, ' +
    'mesas ( numero_mesa ), ' +
    'pedido_detalles ( id, pedido_id, producto_id, cantidad, precio_unitario, ' +
    'precio_total_parcial, estado_producto, ' +
    'productos ( nombre, tiempo_elaboracion_minutos ) )';

@Service()
export class PedidoService {
    private modal = inject(ModalService);

    pedidos = signal<PedidoInterface[]>([]);
    cargando = signal<boolean>(false);

    // El mozo necesita ver primero lo que espera su confirmacion (punto 12).
    pendientesDeConfirmacion = computed(() =>
        this.pedidos().filter((p) => p.estado === 'Pendiente de Confirmación')
    );

    listosParaEntregar = computed(() =>
        this.pedidos().filter((p) => p.estado === 'Listo para Entregar')
    );

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
            clienteRegistradoId: fila.cliente_registrado_id,
            clienteAnonimoId: fila.cliente_anonimo_id,
            estado: fila.estado,
            precioTotalNeto: Number(fila.precio_total_neto),
            descuentoJuego: Number(fila.descuento_juego),
            propinaPorcentaje: Number(fila.propina_porcentaje),
            fecha: fila.fecha,
            detalles,
        };
    }

    private avisarError(error: unknown, alternativa: string): void {
        const mensaje = error instanceof Error ? error.message : alternativa;

        this.modal.setOpen('Error', mensaje);
    }

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
                    cliente_registrado_id: nuevo.clienteRegistradoId ?? null,
                    cliente_anonimo_id: nuevo.clienteAnonimoId ?? null,
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

            return data.id;
        } catch (error) {
            this.avisarError(error, 'No se pudo registrar el pedido.');

            return null;
        } finally {
            this.cargando.set(false);
        }
    }

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

    // Punto 22: el mozo confirma el pago y se libera la mesa.
    async marcarPagado(pedidoId: string, mesaId: string): Promise<boolean> {
        const actualizado = await this.cambiarEstado(pedidoId, 'Pagado');

        if (!actualizado) return false;

        const { error } = await supabase
            .from('mesas')
            .update({
                disponibilidad: 'disponible',
                cliente_registrado_id: null,
                cliente_anonimo_id: null,
            })
            .eq('id', mesaId);

        if (error) {
            this.avisarError(error, 'No se pudo liberar la mesa.');

            return false;
        }

        return true;
    }

    // Puntos 16 a 18: cocina y bar avisan producto por producto.
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

    // El tiempo estimado es el del producto mas lento: los sectores trabajan
    // en paralelo, no uno despues del otro.
    tiempoEstimado(pedido: PedidoInterface): number {
        return pedido.detalles.reduce(
            (mayor, d) => Math.max(mayor, d.tiempoElaboracionMinutos),
            0
        );
    }

    totalConDescuento(pedido: PedidoInterface): number {
        const descuento = pedido.precioTotalNeto * (pedido.descuentoJuego / 100);
        const propina =
            pedido.precioTotalNeto * (pedido.propinaPorcentaje / 100);

        return pedido.precioTotalNeto - descuento + propina;
    }
}
