import { Component, input, output } from '@angular/core';
import { IonIcon } from '@ionic/angular';
import { TarjetaProductoComponent } from '../tarjeta-producto/tarjeta-producto.component';
import { Producto } from '../../interfaces/producto.interface';

@Component({
    selector: 'app-tarjeta-listado-producto',
    templateUrl: './tarjeta-listado-producto.component.html',
    styleUrls: ['./tarjeta-listado-producto.component.scss'],
    imports: [IonIcon, TarjetaProductoComponent],
})
export class TarjetaListadoProductoComponent {
    productos = input.required<Producto[]>();
    tituloListado = input<string>('Menú');
    modo = input<'pedido' | 'gestion'>('pedido');

    agregarCarrito = output<Producto>();
    editarProducto = output<Producto>();
    eliminarProducto = output<Producto>();

    onAgregarCarrito(producto: Producto) {
        this.agregarCarrito.emit(producto);
    }

    onEditar(producto: Producto) {
        this.editarProducto.emit(producto);
    }

    onEliminar(producto: Producto) {
        this.eliminarProducto.emit(producto);
    }
}
