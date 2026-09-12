import { Component, computed, input, output, signal } from '@angular/core';
import { IonBadge, IonButton, IonIcon } from '@ionic/angular';
import { Producto, TipoProducto } from '../../interfaces/producto.interface';

const ETIQUETAS_TIPO: Record<TipoProducto, string> = {
    Comida: 'Comida',
    Bebida: 'Bebida',
    Postre: 'Postre',
};

const COLORES_TIPO: Record<TipoProducto, string> = {
    Comida: 'warning',
    Bebida: 'tertiary',
    Postre: 'success',
};

@Component({
    selector: 'app-tarjeta-producto',
    templateUrl: './tarjeta-producto.component.html',
    styleUrls: ['./tarjeta-producto.component.scss'],
    imports: [IonBadge, IonButton, IonIcon],
})
export class TarjetaProductoComponent {
    producto = input.required<Producto>();

    // 'pedido' (default): cliente arma su pedido -> agregar al carrito.
    // 'gestion': cocinero/cantinero administran la carta -> editar/eliminar.
    modo = input<'pedido' | 'gestion'>('pedido');

    agregarCarrito = output<Producto>();
    editar = output<Producto>();
    eliminar = output<Producto>();

    fotoActual = signal(0);
    fotosConError = signal<ReadonlySet<number>>(new Set());

    etiquetaTipo = computed(() => ETIQUETAS_TIPO[this.producto().tipo]);
    colorTipo = computed(() => COLORES_TIPO[this.producto().tipo]);

    // Placeholder si no hay fotos cargadas o si todas las que hay fallaron al cargar.
    sinFotoValida = computed(() => {
        const fotos = this.producto().fotosUrls;
        const errores = this.fotosConError();
        return fotos.length === 0 || fotos.every((_, i) => errores.has(i));
    });

    precioFormateado = computed(() =>
        this.producto().precio.toLocaleString('es-AR', {
            style: 'currency',
            currency: 'ARS',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        })
    );

    private inicioToqueX = 0;

    irAFoto(indice: number) {
        this.fotoActual.set(indice);
    }

    fotoAnterior() {
        const total = this.producto().fotosUrls.length;
        this.fotoActual.update((actual) => (actual - 1 + total) % total);
    }

    fotoSiguiente() {
        const total = this.producto().fotosUrls.length;
        this.fotoActual.update((actual) => (actual + 1) % total);
    }

    fotoTieneError(indice: number): boolean {
        return this.fotosConError().has(indice);
    }

    onErrorFoto(indice: number) {
        this.fotosConError.update((actuales) => new Set(actuales).add(indice));
    }

    onToqueInicio(evento: TouchEvent) {
        this.inicioToqueX = evento.changedTouches[0].clientX;
    }

    onToqueFin(evento: TouchEvent) {
        const deltaX = evento.changedTouches[0].clientX - this.inicioToqueX;
        const umbral = 40;

        if (deltaX > umbral) {
            this.fotoAnterior();
        } else if (deltaX < -umbral) {
            this.fotoSiguiente();
        }
    }

    onAgregarCarrito() {
        this.agregarCarrito.emit(this.producto());
    }

    onEditar() {
        this.editar.emit(this.producto());
    }

    onEliminar() {
        this.eliminar.emit(this.producto());
    }
}
