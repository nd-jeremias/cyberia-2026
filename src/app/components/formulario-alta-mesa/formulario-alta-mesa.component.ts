import { Component, computed, effect, inject, input, output, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { IonInput, IonSelect, IonSelectOption } from '@ionic/angular';
import { MesaAltaInterface, MesaInterface, TipoMesa } from '../../interfaces/mesa.interface';
import { ModalOption, ModalService } from '../../services/modal.service';
import { SubidaImagenesComponent } from '../subida-imagenes/subida-imagenes.component';
import { FileService } from '../../services/file.service';
import { QrService } from '../../services/qr.service';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';

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
    imports: [FaIconComponent, IonInput, IonSelect, IonSelectOption, ReactiveFormsModule, SubidaImagenesComponent],
})
export class FormularioAltaMesaComponent {
    private modal = inject(ModalService);
    private fileService = inject(FileService);
    qrService = inject(QrService);

    tipoSeleccionado = signal<string>('Seleccionar');

    direccionCamara = input<'frontal' | 'trasera'>('frontal');
    mesaExistente = input<MesaInterface>();

    /** Se dispara sólo con datos ya validados. */
    mesaSubmit = output<MesaAltaInterface>();

    /** Espeja el ENUM `tipo_mesa` de la base: otro valor sería rechazado. */
    tiposMesa: TipoMesa[] = ['Estándar', 'VIP', 'Movilidad reducida'];
    disponibilidad: string[] = ['Disponible', 'Ocupada', 'Reservada'];

    /**
     * Fotos elegidas en el componente de subida. También se copian al control
     * `fotos`, que es el que valida que haya al menos una.
     */
    fotos: File[] = [];
    fotosUrlsExistentes: string[] = [];

    fotosIniciales = computed<string[]>(() => {
        const fotoUrl = this.mesaExistente()?.fotoUrl;
        return fotoUrl ? [fotoUrl] : [];
    });

    constructor() {
        effect(() => {
            const mesa = this.mesaExistente();
            const fotos = this.formulario.controls.fotos;

            if (mesa) {
                this.formulario.patchValue({
                    numeroMesa: mesa.numeroMesa,
                    cantidadLugares: mesa.cantidadLugares,
                    tipo: mesa.tipo,
                    disponibilidad: mesa.disponibilidad,
                    fotos: [],
                });

                fotos.clearValidators();
                fotos.updateValueAndValidity();
            } else {
                fotos.setValidators([this.fileService.minLengthArray(1)]);
                fotos.updateValueAndValidity();
            }
        });
    }

    formulario = new FormGroup({
        // Los mínimos replican los CHECK (> 0) que ya impone la tabla `mesas`.
        // Validar acá evita un viaje a la base para recibir un rechazo.
        numeroMesa: new FormControl<number | null>(null, {
            validators: [Validators.required, Validators.min(1), Validators.max(100)],
        }),
        cantidadLugares: new FormControl<number | null>(null, {
            validators: [Validators.required, Validators.min(1), Validators.max(20)],
        }),
        tipo: new FormControl<TipoMesa | null>(null, {
            validators: [Validators.required],
        }),
        disponibilidad: new FormControl<string>('Disponible'),
        fotos: new FormControl<File[]>([], { validators: [this.fileService.minLengthArray(1)] }),
        qr: new FormControl<File | null>(null),
    });

    recibirImagenes(imagenes: File[]) {
        this.fotos = imagenes;

        // Almacena el array de Files directamente en el formulario
        this.formulario.patchValue({ fotos: imagenes });

        // Opcional: Marca el control como "dirty" o "touched" para la validación
        this.formulario.get('fotos')?.markAsTouched();
    }

    onUrlsExistentes(urls: string[]) {
        this.fotosUrlsExistentes = urls;
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

    async seleccionarTipoMesa() {
        // 1. Definimos las opciones con su texto, icono de FontAwesome y valor real
        const opciones: ModalOption[] = [
            { texto: 'Estándar', icono: 'users', value: 'Estándar' },
            { texto: 'Movilidad reducida', icono: 'wheelchair', value: 'Movilidad reducida' },
            { texto: 'VIP', icono: 'star', value: 'VIP' },
        ];

        // 2. Abrimos el modal y ESPERAMOS a que el empleado toque una opción
        const seleccion = await this.modal.setOpenSelect('Tipo de Mesa', opciones);

        // 3. Si el usuario seleccionó algo (no cerró el modal en blanco), lo guardamos en el formulario
        if (seleccion) {
            this.formulario.get('tipo')?.setValue(seleccion);
            this.tipoSeleccionado.set(seleccion);
        }
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
            disponibilidad: valores.disponibilidad,
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
            disponibilidad: valores.disponibilidad as string,
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
