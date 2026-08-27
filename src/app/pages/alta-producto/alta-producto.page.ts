import { Component, inject, signal } from '@angular/core';
import { IonContent, IonHeader, IonTitle, IonToolbar } from '@ionic/angular';
import { FormularioAltaProductoComponent } from '../../components/formulario-alta-producto/formulario-alta-producto.component';
import {
    ProductoAltaInterface,
    TipoProducto,
} from '../../interfaces/producto.interface';
import { ModalService } from '../../services/modal.service';
import { SpinnerService } from '../../services/spinner.service';

@Component({
    selector: 'app-alta-producto',
    templateUrl: './alta-producto.page.html',
    imports: [
        IonHeader,
        IonToolbar,
        IonTitle,
        IonContent,
        FormularioAltaProductoComponent,
    ],
})
export class AltaProductoPage {
    private modal = inject(ModalService);
    private spinner = inject(SpinnerService);

    // El cocinero carga platos y el cantinero bebidas; el tipo lo define la
    // pagina segun el perfil, no el usuario (puntos 2 y 3 del enunciado).
    tipo = signal<TipoProducto>('Comida');

    async onAltaProducto(producto: ProductoAltaInterface) {
        this.spinner.show();

        try {
            // TODO: persistir en Supabase junto con la subida de las 3 fotos.
            await new Promise((resolve) => setTimeout(resolve, 400));

            this.modal.setOpen(
                true,
                'Producto cargado',
                `"${producto.nombre}" se agregó a la carta.`
            );
        } finally {
            this.spinner.hide();
        }
    }
}
