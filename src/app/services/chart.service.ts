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

    /** Hasta que no termina la lectura inicial no se guarda nada. */
    private restaurado = false;

    /** Cola de escrituras, para que se apliquen en orden. */
    private escrituras: Promise<unknown> = Promise.resolve();

    constructor() {
        // Se recupera lo que hubiera quedado de una sesión anterior.
        void this.cargarCarrito();

        // El effect persiste ante cada cambio del carrito, sin que quien lo
        // modifica tenga que acordarse de guardar.
        effect(() => {
            const items = this.carrito();

            // La primera pasada del effect ve el carrito vacío, todavía sin
            // restaurar. Guardarlo ahí borraría del dispositivo justo lo que
            // se está terminando de leer.
            if (!this.restaurado) return;

            this.guardar(items);
        });
    }

    /** Restaura el carrito guardado en el dispositivo, si existe. */
    private async cargarCarrito() {
        try {
            const { value } = await Preferences.get({ key: 'carrito' });

            // Si el cliente ya empezó a elegir mientras se leía, gana lo que
            // tiene en pantalla: lo guardado es más viejo.
            if (value && this.carrito().length === 0) {
                this.carrito.set(JSON.parse(value));
            }
        } catch (error) {
            // Un carrito ilegible no puede dejar al cliente sin poder pedir:
            // se arranca vacío y se sigue.
            console.error('No se pudo recuperar el carrito guardado', error);
        } finally {
            this.restaurado = true;
        }
    }

    /**
     * Guarda el carrito, encadenando las escrituras.
     *
     * Sin la cola, tocar "+" varias veces seguidas dispara varios `set` a la
     * vez, y el almacenamiento del dispositivo no garantiza en qué orden los
     * resuelve: podía quedar guardado un carrito viejo y, al volver a entrar,
     * aparecían menos productos de los que el cliente había elegido.
     */
    private guardar(items: ProductoCarrito[]) {
        this.escrituras = this.escrituras
            .catch(() => undefined)
            .then(() => Preferences.set({ key: 'carrito', value: JSON.stringify(items) }));
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

    /**
     * Suma una unidad de algo que ya está en el carrito.
     *
     * Existe además de `agregar` porque el resumen del pedido trabaja con
     * líneas del carrito y no tiene el producto entero a mano para pasarlo.
     */
    sumar(productoId: string) {
        this.carrito.update((items) =>
            items.map((p) => {
                if (p.id !== productoId) return p;

                const nuevaCantidad = p.cantidad + 1;

                return {
                    ...p,
                    cantidad: nuevaCantidad,
                    precioTotal: p.precioUnitario * nuevaCantidad,
                };
            })
        );
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

    /**
     * Pisa el carrito con una lista ya armada.
     *
     * Lo usa la corrección de un pedido rechazado (punto 13): el carrito
     * arranca con lo que el cliente ya había pedido para que pueda ajustarlo,
     * en vez de obligarlo a cargar todo de nuevo.
     */
    reemplazar(items: ProductoCarrito[]) {
        this.carrito.set(items);
    }

    vaciarCarrito() {
        this.carrito.set([]);
    }
}
