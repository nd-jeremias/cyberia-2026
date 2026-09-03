import { Component, computed, effect, inject, input, signal } from '@angular/core';
import { Router } from '@angular/router';
import {
    IonBackButton,
    IonButtons,
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
} from '@ionic/angular';
import { FormularioAltaProductoComponent } from '../../components/formulario-alta-producto/formulario-alta-producto.component';
import {
    Producto,
    ProductoAltaInterface,
    TipoProducto,
} from '../../interfaces/producto.interface';
import { ModalService } from '../../services/modal.service';
import { SpinnerService } from '../../services/spinner.service';
import { ProductosService } from '../../services/productos.service';

/**
 * Alta de producto (puntos 2 y 3 del enunciado).
 *
 * La página fija el tipo y el formulario sólo pide el resto: el cocinero carga
 * platos y el cantinero bebidas, así que el tipo es una consecuencia del perfil
 * y no una elección del usuario.
 */
@Component({
    selector: 'app-alta-producto',
    templateUrl: './alta-producto.page.html',
    imports: [
        IonHeader,
        IonToolbar,
        IonTitle,
        IonContent,
        IonButtons,
        IonBackButton,
        FormularioAltaProductoComponent,
    ],
})
export class AltaProductoPage {
    private modal = inject(ModalService);
    private spinner = inject(SpinnerService);
    private productosService = inject(ProductosService);
    private router = inject(Router);

    // El cocinero carga platos y el cantinero bebidas; el tipo llega desde
    // gestion-productos por query param, segun el perfil (puntos 2 y 3 del
    // enunciado). Si se entra directo a la pagina, cae en 'Comida'.
    tipo = input<TipoProducto>('Comida');

    // Si viene un id (tambien por query param), la pagina entra en modo
    // edicion: trae el producto y se lo pasa precargado al formulario.
    productoId = input<string | undefined>(undefined);

    productoExistente = signal<Producto | null>(null);

    titulo = computed(() => (this.productoId() ? 'Editar producto' : 'Alta de producto'));

    constructor() {
        effect(() => {
            const id = this.productoId();
            if (id) this.cargarProducto(id);
        });
    }

    private async cargarProducto(id: string) {
        this.spinner.show();

        try {
            const producto = await this.productosService.obtenerPorId(id);
            this.productoExistente.set(producto);
        } catch (error) {
            const mensaje = error instanceof Error ? error.message : 'No se pudo cargar el producto.';
            this.modal.setOpen('Error', mensaje);
        } finally {
            this.spinner.hide();
        }
    }

    async onAltaProducto(datos: ProductoAltaInterface) {
        this.spinner.show();

        try {
            const id = this.productoId();

            if (id) {
                await this.productosService.actualizar(id, datos);
                this.modal.setOpen('Producto actualizado', `"${datos.nombre}" se actualizó correctamente.`);
            } else {
                await this.productosService.crear(datos);
                this.modal.setOpen('Producto cargado', `"${datos.nombre}" se agregó a la carta.`);
            }

            this.router.navigate(['/gestion-productos']);
        } catch (error) {
            const mensaje = error instanceof Error ? error.message : 'No se pudo guardar el producto.';
            this.modal.setOpen('Error', mensaje);
        } finally {
            this.spinner.hide();
        }
    }
}
