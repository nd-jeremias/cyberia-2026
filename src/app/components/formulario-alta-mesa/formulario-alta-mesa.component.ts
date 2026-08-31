import { Component, inject, output } from '@angular/core';
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
} from '@ionic/angular';
import { Haptics, NotificationType } from '@capacitor/haptics';
import { MesaAltaInterface, TipoMesa } from '../../interfaces/mesa.interface';
import { ModalService } from '../../services/modal.service';

/**
 * Formulario de alta de mesa (punto 4 del enunciado).
 *
 * Es un componente de presentación: valida y emite, pero no guarda nada. De la
 * persistencia y del código QR se ocupa la página que lo contiene, así el
 * formulario se puede reutilizar sin arrastrar dependencias de la base.
 */
@Component({
    selector: 'app-formulario-alta-mesa',
    templateUrl: './formulario-alta-mesa.component.html',
    styleUrls: ['./formulario-alta-mesa.component.scss'],
    imports: [
        IonCard,
        IonCardContent,
        IonCardHeader,
        IonCardTitle,
        IonInput,
        IonItem,
        IonSelect,
        IonSelectOption,
        IonButton,
        ReactiveFormsModule,
    ],
})
export class FormularioAltaMesaComponent {
    private modal = inject(ModalService);

    /** Se dispara sólo con datos ya validados. */
    mesaSubmit = output<MesaAltaInterface>();

    /** Espeja el ENUM `tipo_mesa` de la base: otro valor sería rechazado. */
    tiposMesa: TipoMesa[] = ['estándar', 'VIP', 'movilidad reducida'];

    /**
     * La foto se maneja aparte del FormGroup: un `<input type="file">` no se
     * integra bien con Reactive Forms, así que se valida a mano en el submit.
     */
    foto: File | null = null;

    formulario = new FormGroup({
        // Los mínimos replican los CHECK (> 0) que ya impone la tabla `mesas`.
        // Validar acá evita un viaje a la base para recibir un rechazo.
        numeroMesa: new FormControl<number | null>(null, {
            validators: [Validators.required, Validators.min(1)],
        }),
        cantidadLugares: new FormControl<number | null>(null, {
            validators: [Validators.required, Validators.min(1)],
        }),
        tipo: new FormControl<TipoMesa | null>(null, {
            validators: [Validators.required],
        }),
    });

    /** Guarda la foto elegida; si el usuario cancela, queda en null. */
    onFotoSeleccionada(event: Event) {
        const input = event.target as HTMLInputElement;
        this.foto = input.files?.[0] ?? null;
    }

    /**
     * Indica si un campo debe mostrar cierto error.
     *
     * Se exige que esté "tocado" para no pintar de rojo un formulario que el
     * usuario todavía no completó.
     */
    hayError(control: string, error: string): boolean {
        const campo = this.formulario.get(control);

        return !!campo && campo.touched && campo.hasError(error);
    }

    /**
     * Valida y, si todo está bien, emite los datos de la mesa.
     *
     * Ante un error no alcanza con no emitir: el enunciado exige avisarle al
     * usuario. Sin este aviso el botón parecería estar roto.
     */
    async onAltaMesa() {
        if (this.formulario.invalid || !this.foto) {
            // Sin esto Ionic no muestra el error de los campos que el usuario
            // nunca visitó.
            this.formulario.markAllAsTouched();

            await Haptics.notification({ type: NotificationType.Error });

            this.modal.setOpen(
                'Datos inválidos',
                !this.foto
                    ? 'Debe cargar una foto de la mesa para continuar.'
                    : 'Revise los datos ingresados antes de continuar.'
            );

            return;
        }

        const valores = this.formulario.getRawValue();

        // Los <ion-input type="number"> devuelven texto: se convierte acá para
        // que quien reciba el evento no tenga que desconfiar de los tipos.
        this.mesaSubmit.emit({
            numeroMesa: Number(valores.numeroMesa),
            cantidadLugares: Number(valores.cantidadLugares),
            tipo: valores.tipo as TipoMesa,
            foto: this.foto,
        });
    }
}
