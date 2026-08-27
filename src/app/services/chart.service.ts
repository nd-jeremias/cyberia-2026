import { Preferences } from '@capacitor/preferences';
import { Producto, ProductoCarrito } from './../interfaces/producto.interface';
import { computed, effect, Service, signal } from '@angular/core';

@Service()
export class ChartService {
    carrito = signal<ProductoCarrito[]>([]);

    constructor() {
        // 2. Cargamos el carrito de forma asíncrona al iniciar el servicio
        this.cargarCarrito();

        // 3. El effect sigue funcionando igual: guarda automáticamente al cambiar
        effect(async () => {
            await Preferences.set({
                key: 'carrito',
                value: JSON.stringify(this.carrito()),
            });
        });
    }

    private async cargarCarrito() {
        const { value } = await Preferences.get({ key: 'carrito' });
        if (value) {
            this.carrito.set(JSON.parse(value));
        }
    }

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
