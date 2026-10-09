import { Component, input, output } from '@angular/core';
import { TarjetaProductoComponent } from '../tarjeta-producto/tarjeta-producto.component';
import { Producto } from '../../interfaces/producto.interface';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';

@Component({
    selector: 'app-tarjeta-listado-producto',
    templateUrl: './tarjeta-listado-producto.component.html',
    styleUrls: ['./tarjeta-listado-producto.component.scss'],
    imports: [FaIconComponent, TarjetaProductoComponent],
})
export class TarjetaListadoProductoComponent {
    productos = input.required<Producto[]>();
    tituloListado = input<string>('Menú');
    modo = input<'pedido' | 'gestion'>('pedido');

    /**
     * Unidades elegidas por producto, indexadas por id.
     *
     * Un mapa y no una lista: la tarjeta necesita su número al dibujarse, y
     * buscarlo en un arreglo en cada una haría un recorrido por tarjeta.
     */
    cantidades = input<Record<string, number>>({});

    agregarCarrito = output<Producto>();
    quitarCarrito = output<Producto>();
    editarProducto = output<Producto>();
    eliminarProducto = output<Producto>();

    /** Cuántas unidades de este producto ya están en el pedido. */
    cantidadDe(productoId: string): number {
        return this.cantidades()[productoId] ?? 0;
    }

    onAgregarCarrito(producto: Producto) {
        this.agregarCarrito.emit(producto);
    }

    onQuitarCarrito(producto: Producto) {
        this.quitarCarrito.emit(producto);
    }

    onEditar(producto: Producto) {
        this.editarProducto.emit(producto);
    }

    onEliminar(producto: Producto) {
        this.eliminarProducto.emit(producto);
    }
}
