import { Component, inject, input, output } from '@angular/core';
import {
    FormControl,
    FormGroup,
    ReactiveFormsModule,
    Validators,
} from '@angular/forms';
import {
    IonButton,
    IonCard,
    IonCardContent,
    IonCardHeader,
    IonCardTitle,
    IonInput,
    IonItem,
    IonTextarea,
} from '@ionic/angular';
import { Haptics, NotificationType } from '@capacitor/haptics';
import {
    ProductoAltaInterface,
    TipoProducto,
} from '../../interfaces/producto.interface';
import { ModalService } from '../../services/modal.service';

// La tabla `productos` tiene un CHECK que exige exactamente tres fotos. Se
// valida acá también para no llegar a la base con un alta que va a rebotar.
const CANTIDAD_FOTOS_REQUERIDA = 3;

/**
 * Alta de producto: platos, bebidas y postres (puntos 2 y 3 del enunciado).
 *
 * El mismo formulario sirve para los tres tipos. El tipo no lo elige el
 * usuario sino la página, según el perfil que la abrió: el cocinero carga
 * platos y el cantinero bebidas.
 */
@Component({
    selector: 'app-formulario-alta-producto',
    templateUrl: './formulario-alta-producto.component.html',
    styleUrls: ['./formulario-alta-producto.component.scss'],
    imports: [
        IonCard,
        IonCardContent,
        IonCardHeader,
        IonCardTitle,
        IonInput,
        IonItem,
        IonTextarea,
        IonButton,
        ReactiveFormsModule,
    ],
})
export class FormularioAltaProductoComponent {
    private modal = inject(ModalService);

    // El tipo lo define la pagina segun el perfil que la renderiza
    // (cocinero -> Comida/Postre, cantinero -> Bebida), no el usuario.
    tipo = input.required<TipoProducto>();

    productoSubmit = output<ProductoAltaInterface>();

    fotos: File[] = [];

    formulario = new FormGroup({
        nombre: new FormControl('', {
            validators: [Validators.required],
        }),
        descripcion: new FormControl('', {
            validators: [Validators.required],
        }),
        tiempoElaboracionMinutos: new FormControl<number | null>(null, {
            validators: [Validators.required, Validators.min(1)],
        }),
        precio: new FormControl<number | null>(null, {
            validators: [Validators.required, Validators.min(0.01)],
        }),
    });

    onFotosSeleccionadas(event: Event) {
        const input = event.target as HTMLInputElement;
        this.fotos = Array.from(input.files ?? []);
    }

    hayError(control: string, error: string): boolean {
        const campo = this.formulario.get(control);

        return !!campo && campo.touched && campo.hasError(error);
    }

    async onAltaProducto() {
        const faltanFotos = this.fotos.length !== CANTIDAD_FOTOS_REQUERIDA;

        if (this.formulario.invalid || faltanFotos) {
            // Sin markAllAsTouched Ionic no pinta los errores de los campos
            // que el usuario todavia no toco.
            this.formulario.markAllAsTouched();

            await Haptics.notification({ type: NotificationType.Error });

            this.modal.setOpen(
                'Datos inválidos',
                faltanFotos
                    ? `Debe cargar exactamente ${CANTIDAD_FOTOS_REQUERIDA} fotos del producto.`
                    : 'Revise los datos ingresados antes de continuar.'
            );

            return;
        }

        const valores = this.formulario.getRawValue();

        this.productoSubmit.emit({
            nombre: valores.nombre ?? '',
            descripcion: valores.descripcion ?? '',
            tiempoElaboracionMinutos: Number(valores.tiempoElaboracionMinutos),
            precio: Number(valores.precio),
            tipo: this.tipo(),
            fotos: this.fotos,
        });
    }
}
