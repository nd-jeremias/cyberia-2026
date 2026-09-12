import { Component, inject, input, output } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { IonButton, IonIcon, IonInput, IonSelect, IonSelectOption } from '@ionic/angular';
import { MesaAltaInterface, TipoMesa } from '../../interfaces/mesa.interface';
import { ModalService } from '../../services/modal.service';
import { SubidaImagenesComponent } from '../subida-imagenes/subida-imagenes.component';
import { FileService } from '../../services/file.service';
import { QrService } from '../../services/qr.service';

/** Campos que el usuario ve marcados en rojo; la foto se avisa aparte. */
const CAMPOS_DE_DATOS = ['numeroMesa', 'cantidadLugares', 'tipo'] as const;

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
    imports: [IonIcon, IonInput, IonSelect, IonSelectOption, IonButton, ReactiveFormsModule, SubidaImagenesComponent],
})
export class FormularioAltaMesaComponent {
    private modal = inject(ModalService);
    private fileService = inject(FileService);
    qrService = inject(QrService)

    direccionCamara = input<'frontal' | 'trasera'>('frontal');

    /** Se dispara sólo con datos ya validados. */
    mesaSubmit = output<MesaAltaInterface>();

    /** Espeja el ENUM `tipo_mesa` de la base: otro valor sería rechazado. */
    tiposMesa: TipoMesa[] = ['estándar', 'VIP', 'movilidad reducida'];

    /**
     * Fotos elegidas en el componente de subida. También se copian al control
     * `fotos`, que es el que valida que haya al menos una.
     */
    fotos: File[] = [];

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
        fotos: new FormControl<File[]>([], { validators: [this.fileService.minLengthArray(1)] }),
        qr: new FormControl<File | null>(null, ),
    });

    recibirImagenes(imagenes: File[]) {
        this.fotos = imagenes;

        // Almacena el array de Files directamente en el formulario
        this.formulario.patchValue({ fotos: imagenes });

        // Opcional: Marca el control como "dirty" o "touched" para la validación
        this.formulario.get('fotos')?.markAsTouched();
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
        if (this.formulario.invalid) {
            // Sin esto Ionic no muestra el error de los campos que el usuario
            // nunca visitó.
            this.formulario.markAllAsTouched();

            // El modal vibra solo al detectar un título de error.
            this.modal.setOpen('Datos inválidos', this.motivoDelRechazo());

            return;
        }

        const valores = this.formulario.getRawValue();

        const datosMesa = {
            numeroMesa: valores.numeroMesa,
            cantidadLugares: valores.cantidadLugares,
            tipo: valores.tipo,
        };

        const data = JSON.stringify(datosMesa);
        const filename = `mesa_${valores.numeroMesa}_qr.png`;

        const archivo: File = await this.qrService.generateQrFile(data, filename);
        this.formulario.patchValue({ qr: archivo });

        // Los <ion-input type="number"> devuelven texto: se convierte acá para
        // que quien reciba el evento no tenga que desconfiar de los tipos.
        const mesa: MesaAltaInterface = {
            numeroMesa: Number(valores.numeroMesa),
            cantidadLugares: Number(valores.cantidadLugares),
            tipo: valores.tipo as TipoMesa,
            fotos: this.fotos[0],
            qrFile: this.formulario.value.qr!,
        };

        // No se limpia el formulario al emitir: si el guardado falla, la página
        // se queda y el usuario no tiene que volver a cargar todo.
        this.mesaSubmit.emit(mesa);
    }

    /**
     * Explica qué falta corregir.
     *
     * La foto se nombra aparte porque no se marca en rojo como un campo. Antes
     * se preguntaba `!this.fotos`, que nunca es verdadero (un arreglo vacío
     * también es un valor), así que el aviso de la foto no aparecía jamás.
     */
    private motivoDelRechazo(): string {
        const faltaFoto = this.formulario.controls.fotos.invalid;
        const hayDatosInvalidos = CAMPOS_DE_DATOS.some((campo) => this.formulario.controls[campo].invalid);

        if (faltaFoto && hayDatosInvalidos) return 'Revise los campos marcados y cargue la foto de la mesa.';

        if (faltaFoto) return 'Debe cargar la foto de la mesa para continuar.';

        return 'Revise los datos ingresados antes de continuar.';
    }
}
