import { Component, output } from '@angular/core';
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
    IonSelect,
    IonSelectOption,
    IonTextarea,
} from '@ionic/angular';
import {
    ProductoAltaInterface,
    TipoProducto,
} from '../../interfaces/producto.interface';

const CANTIDAD_FOTOS_REQUERIDA = 3;

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
        IonSelect,
        IonSelectOption,
        IonTextarea,
        IonButton,
        ReactiveFormsModule,
    ],
})
export class FormularioAltaProductoComponent {
    productoSubmit = output<ProductoAltaInterface>();

    tiposProducto: TipoProducto[] = ['Comida', 'Bebida', 'Postre'];

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
        tipo: new FormControl<TipoProducto | null>(null, {
            validators: [Validators.required],
        }),
    });

    onFotosSeleccionadas(event: Event) {
        const input = event.target as HTMLInputElement;
        this.fotos = Array.from(input.files ?? []);
    }

    onAltaProducto() {
        if (
            this.formulario.invalid ||
            this.fotos.length !== CANTIDAD_FOTOS_REQUERIDA
        )
            return;

        const valores = this.formulario.getRawValue();

        this.productoSubmit.emit({
            nombre: valores.nombre ?? '',
            descripcion: valores.descripcion ?? '',
            tiempoElaboracionMinutos: Number(valores.tiempoElaboracionMinutos),
            precio: Number(valores.precio),
            tipo: valores.tipo as TipoProducto,
            fotos: this.fotos,
        });
    }
}
