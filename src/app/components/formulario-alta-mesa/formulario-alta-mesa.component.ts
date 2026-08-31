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
import { MesaAltaInterface, TipoMesa } from '../../interfaces/mesa.interface';
import { VibracionService } from '../../services/vibracion.service';
import { ModalService } from '../../services/modal.service';

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
    private vibracion = inject(VibracionService);

    mesaSubmit = output<MesaAltaInterface>();

    tiposMesa: TipoMesa[] = ['estándar', 'VIP', 'movilidad reducida'];

    foto: File | null = null;

    formulario = new FormGroup({
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

    onFotoSeleccionada(event: Event) {
        const input = event.target as HTMLInputElement;
        this.foto = input.files?.[0] ?? null;
    }

    hayError(control: string, error: string): boolean {
        const campo = this.formulario.get(control);

        return !!campo && campo.touched && campo.hasError(error);
    }

    async onAltaMesa() {
        if (this.formulario.invalid || !this.foto) {
            this.formulario.markAllAsTouched();

            await this.vibracion.error();

            this.modal.setOpen(
                'Datos inválidos',
                !this.foto
                    ? 'Debe cargar una foto de la mesa para continuar.'
                    : 'Revise los datos ingresados antes de continuar.'
            );

            return;
        }

        const valores = this.formulario.getRawValue();

        this.mesaSubmit.emit({
            numeroMesa: Number(valores.numeroMesa),
            cantidadLugares: Number(valores.cantidadLugares),
            tipo: valores.tipo as TipoMesa,
            foto: this.foto,
        });
    }
}
