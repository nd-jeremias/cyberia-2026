import { Component, input, output } from '@angular/core';
import { TarjetaProductoComponent } from '../tarjeta-producto/tarjeta-producto.component';
import { Producto } from '../../interfaces/producto.interface';

@Component({
    selector: 'app-tarjeta-listado-producto',
    templateUrl: './tarjeta-listado-producto.component.html',
    styleUrls: ['./tarjeta-listado-producto.component.scss'],
    imports: [TarjetaProductoComponent],
})
export class TarjetaListadoProductoComponent {
    productos = input.required<Producto[]>();
    tituloListado = input<string>('Menú');

    agregarCarrito = output<Producto>();

    onAgregarCarrito(producto: Producto) {
        this.agregarCarrito.emit(producto);
    }
}
