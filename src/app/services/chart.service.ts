import { Preferences } from '@capacitor/preferences';
import { Producto, ProductoCarrito } from './../interfaces/producto.interface';
import { computed, effect, Service, signal } from '@angular/core';

/**
 * Carrito de compras del cliente.
 *
 * El contenido se guarda en el dispositivo, no en memoria: si el cliente cierra
 * la aplicación mientras arma el pedido, al volver lo encuentra intacto.
 */
@Service()
export class ChartService {
    /** Productos elegidos, con su cantidad y subtotal. */
    carrito = signal<ProductoCarrito[]>([]);

    constructor() {
        // Se recupera lo que hubiera quedado de una sesión anterior.
        this.cargarCarrito();

        // El effect persiste ante cada cambio del carrito, sin que quien lo
        // modifica tenga que acordarse de guardar.
        effect(async () => {
            await Preferences.set({
                key: 'carrito',
                value: JSON.stringify(this.carrito()),
            });
        });
    }

    /** Restaura el carrito guardado en el dispositivo, si existe. */
    private async cargarCarrito() {
        const { value } = await Preferences.get({ key: 'carrito' });
        if (value) {
            this.carrito.set(JSON.parse(value));
        }
    }

    /** Importe acumulado. El enunciado pide que esté siempre visible. */
    total = computed(() => this.carrito().reduce((acc, item) => acc + item.precioTotal, 0));

    tiempoEstimado = computed(() =>
        this.carrito().reduce((max, item) => Math.max(max, item.tiempoElaboracionMinutos), 0)
    );

    agregar(producto: Producto) {
        let encontrado = false;

        this.carrito.update((items) => {
            const carritoActualizado = items.map((p) => {
                if (p.id === producto.id) {
                    encontrado = true;
                    const nuevaCantidad = p.cantidad + 1;
                    return {
                        ...p,
                        cantidad: nuevaCantidad,
                        precioTotal: p.precioUnitario * nuevaCantidad,
                    };
                }
                return p;
            });

            if (encontrado) return carritoActualizado;

            const nuevoProducto: ProductoCarrito = {
                id: producto.id,
                nombre: producto.nombre,
                precioUnitario: producto.precio,
                precioTotal: producto.precio,
                tiempoElaboracionMinutos: producto.tiempoElaboracionMinutos,
                tipo: producto.tipo,
                cantidad: 1,
            };
            return [...items, nuevoProducto];
        });
    }

    quitar(productoId: string) {
        this.carrito.update((items) => {
            const carritoModificado = items.map((p) => {
                if (p.id === productoId) {
                    const nuevaCantidad = p.cantidad - 1;
                    return {
                        ...p,
                        cantidad: nuevaCantidad,
                        precioTotal: p.precioUnitario * nuevaCantidad,
                    };
                }
                return p;
            });

            return carritoModificado.filter((p) => p.cantidad > 0);
        });
    }

    eliminar(productoId: string) {
        this.carrito.update((items) => items.filter((p) => p.id !== productoId));
    }

    vaciarCarrito() {
        this.carrito.set([]);
    }
}
