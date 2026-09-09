import { FileService } from './../../services/file.service';
import { Component, computed, effect, inject, input, output, signal } from '@angular/core';
import {
    AbstractControl,
    FormControl,
    FormGroup,
    ReactiveFormsModule,
    ValidationErrors,
    Validators,
} from '@angular/forms';
import { IonInput, IonSelect, IonSelectOption, IonInputPasswordToggle, IonButton, IonIcon } from '@ionic/angular';
import { RegisterInterface } from '../../interfaces/auth.interface';
import { DniInterface } from '../../interfaces/dni.interface';
import { QrService } from '../../services/qr.service';
import { ModalService } from '../../services/modal.service';
import { RouterLink } from '@angular/router';
import { SubidaImagenesComponent } from '../subida-imagenes/subida-imagenes.component';
import { toSignal } from '@angular/core/rxjs-interop';
import { EmpleadoInterface } from '../../interfaces/empleado.interface';

/**
 * Validador para comprobar que las contraseñas coincidan.
 *
 * En modo creación:
 * - password es obligatorio
 * - confirmPassword es obligatorio
 *
 * En modo edición:
 * - ambos vacíos = no se modifica la contraseña → válido
 * - ambos completos e iguales = se modifica la contraseña → válido
 * - uno solo completo o diferentes = inválido
 */
const passwordsIguales = (group: AbstractControl): ValidationErrors | null => {
    const password = group.get('password')?.value;
    const confirmPassword = group.get('confirmPassword')?.value;

    // En edición, ambos vacíos significa:
    // "no quiero modificar la contraseña".
    if (!password && !confirmPassword) {
        return null;
    }

    return password === confirmPassword ? null : { passwordsDistintas: true };
};

@Component({
    selector: 'app-formulario-registro',
    templateUrl: './formulario-registro.component.html',
    styleUrls: ['./formulario-registro.component.scss'],
    imports: [
        IonIcon,
        IonButton,
        IonSelect,
        IonSelectOption,
        ReactiveFormsModule,
        RouterLink,
        IonInput,
        SubidaImagenesComponent,
        IonInputPasswordToggle,
    ],
})
export class FormularioRegistroComponent {

    // ============================================================
    // CONFIGURACIÓN
    // ============================================================

    private titulosPorRol = {
        cliente: 'Crear cuenta',
        dueño: 'Registrar empleado',
        metre: 'Registrar cliente',
    };

    tituloEncabezado = computed(() => this.titulosPorRol[this.usuarioRol()]);

    private botonesPorRol = {
        cliente: 'Registrarse',
        dueño: 'Registrar empleado',
        metre: 'Registrar cliente', // Ajusta este texto según tu necesidad
    };

    textoBoton = computed(() => this.botonesPorRol[this.usuarioRol()]);
    fotosIniciales = computed<string[]>(() => {
        const fotoUrl = this.empleadoExistente()?.foto_url;
        console.log('Fotos iniciales:', this.empleadoExistente())
        return fotoUrl ? fotoUrl : [];
    });

    // ============================================================
    // INPUTS / OUTPUTS
    // ============================================================

    usuarioRol = input<'cliente' | 'dueño' | 'metre'>('cliente');

    /**
     * Si existe un empleado, estamos en modo edición.
     * Si es undefined, estamos en modo creación.
     */
    empleadoExistente = input<EmpleadoInterface>();
    direccionCamara = input<'frontal' | 'trasera'>('frontal');
    registroSubmit = output<FormData>();

    // ============================================================
    // SERVICIOS
    // ============================================================

    qrService = inject(QrService);
    modal = inject(ModalService);
    fileService = inject(FileService);

    // ============================================================
    // SIGNALS
    // ============================================================

    cuilPrefijo = signal<string>('');
    cuilSufijo = signal<string>('');

    /**
     * Indica si el formulario está siendo utilizado
     * para modificar un empleado existente.
     */
    esEdicion = computed(() => !!this.empleadoExistente());

    // ============================================================
    // DATOS
    // ============================================================

    tiposEmpleado = ['dueño', 'supervisor', 'metre', 'mozo', 'cocinero', 'cantinero'];
    fotosUrlsExistentes: string[] = [];

    // ============================================================
    // FORMULARIO
    // ============================================================

    formulario = new FormGroup(
        {
            nombres: new FormControl('', {
                validators: [Validators.required],
            }),
            apellidos: new FormControl('', {
                validators: [Validators.required],
            }),
            dni: new FormControl('', {
                validators: [Validators.required, Validators.pattern(/^\d{7,8}$/)],
            }),
            cuil: new FormControl(''),
            correo: new FormControl('', {
                validators: [Validators.required, Validators.email],
            }),
            perfil: new FormControl(''),

            /**
             * IMPORTANTE:
             *
             * El control contiene únicamente Files nuevos.
             *
             * Si estamos editando y el empleado ya tiene una
             * foto en Supabase, NO intentamos convertir la URL
             * en File.
             */
            foto: new FormControl<File[]>([]),

            /**
             * En creación se agregan:
             * required + minLength(8)
             *
             * En edición son opcionales.
             */
            password: new FormControl('', {
                validators: [Validators.required, Validators.minLength(8)],
            }),

            confirmPassword: new FormControl('', {
                validators: [Validators.required],
            }),
        },
        {
            validators: [passwordsIguales],
        }
    );

    // ============================================================
    // SIGNALS DERIVADOS
    // ============================================================

    dniSignal = toSignal(this.formulario.controls.dni.valueChanges, { initialValue: '' });
    cuilCentral = computed(() => this.dniSignal() || '');

    // ============================================================
    // CONSTRUCTOR
    // ============================================================

    constructor() {
        // Registramos los íconos
        addIcons({
            personAddOutline,
            personOutline,
            cardOutline,
            qrCodeOutline,
            briefcaseOutline,
            peopleOutline,
            mailOutline,
            lockClosedOutline,
        });

        /**
         * Este effect se ejecuta cuando cambia:
         *
         * - empleadoExistente()
         * - usuarioRol()
         *
         * Por lo tanto sirve tanto para crear como para editar.
         */
        effect(() => {
            const empleado = this.empleadoExistente();

            const cuil = this.formulario.controls.cuil;
            const perfil = this.formulario.controls.perfil;
            const foto = this.formulario.controls.foto;
            const password = this.formulario.controls.password;
            const confirmPassword = this.formulario.controls.confirmPassword;

            // ====================================================
            // MODO EDICIÓN
            // ====================================================

            if (empleado) {
                this.formulario.patchValue({
                    nombres: empleado.nombres ?? '',
                    apellidos: empleado.apellidos ?? '',
                    dni: empleado.dni ?? '',
                    cuil: empleado.cuil ?? '',
                    correo: empleado.correo_electronico ?? '',
                    perfil: empleado.perfil ?? '',

                    /**
                     * NO colocamos empleado.fotoUrl acá.
                     *
                     * El FormControl espera File[] y
                     * Supabase nos devuelve un string.
                     *
                     * La foto existente debe utilizarse
                     * únicamente para el preview.
                     */
                    foto: [],

                    /**
                     * Nunca intentamos recuperar la contraseña
                     * almacenada.
                     */
                    password: '',
                    confirmPassword: '',
                });

                // ------------------------------------------------
                // FOTO OPCIONAL EN EDICIÓN
                // ------------------------------------------------

                foto.clearValidators();

                // ------------------------------------------------
                // PASSWORD OPCIONAL EN EDICIÓN
                // ------------------------------------------------

                password.clearValidators();
                confirmPassword.clearValidators();

                // ------------------------------------------------
                // Actualizamos validaciones
                // ------------------------------------------------

                foto.updateValueAndValidity();
                password.updateValueAndValidity();
                confirmPassword.updateValueAndValidity();
            }

            // ====================================================
            // MODO CREACIÓN
            // ====================================================
            else {
                /**
                 * La foto es obligatoria al registrarse.
                 */
                foto.setValidators([this.fileService.minLengthArray(1)]);

                /**
                 * La contraseña es obligatoria al registrarse.
                 */
                password.setValidators([Validators.required, Validators.minLength(8)]);
                confirmPassword.setValidators([Validators.required]);

                // Actualizamos validaciones

                foto.updateValueAndValidity();
                password.updateValueAndValidity();
                confirmPassword.updateValueAndValidity();
            }

            // ====================================================
            // VALIDACIONES SEGÚN ROL
            // ====================================================

            if (this.usuarioRol() === 'dueño') {
                cuil.setValidators([Validators.required, Validators.pattern(/^\d{11}$/)]);

                perfil.setValidators([Validators.required]);
            } else {
                cuil.clearValidators();

                perfil.clearValidators();

                /**
                 * No necesitamos conservar estos valores
                 * cuando el rol no los utiliza.
                 */
                cuil.reset('');

                perfil.reset('');
            }

            cuil.updateValueAndValidity();
            perfil.updateValueAndValidity();
        });
    }

    // ============================================================
    // DNI
    // ============================================================

    async scanearDNI() {
        const dniData: DniInterface | null = await this.qrService.scanDNI();

        if (dniData) {
            this.formulario.patchValue({
                nombres: dniData.nombres,
                apellidos: dniData.apellidos,
                dni: dniData.dni,
            });
        }
    }

    // ============================================================
    // IMÁGENES
    // ============================================================

    /**
     * Recibe los archivos emitidos por
     * SubidaImagenesComponent.
     *
     * El componente puede manejar una o varias imágenes,
     * por eso mantenemos File[].
     *
     * En este formulario utilizamos solamente la primera.
     */
    recibirImagenes(imagenes: File[]) {
        this.formulario.patchValue({
            foto: imagenes,
        });

        /**
         * Marca el control para mostrar errores.
         */
        this.formulario.controls.foto.markAsTouched();
        this.formulario.controls.foto.markAsDirty();
    }

    onUrlsExistentes(urls: string[]) {
        this.fotosUrlsExistentes = urls;
    }

    // ============================================================
    // UTILIDADES
    // ============================================================

    toCapitalize(word: string): string {
        if (!word || word.length === 0) {
            return '';
        }

        return word[0].toUpperCase() + word.slice(1);
    }

    // ============================================================
    // VALIDACIÓN
    // ============================================================

    validateForm(form: FormGroup): boolean {
        // --------------------------------------------------------
        // CUIL
        // --------------------------------------------------------

        if (this.usuarioRol() === 'dueño') {
            const cuilCompleto = `${this.cuilPrefijo()}${this.cuilCentral()}${this.cuilSufijo()}`;

            this.formulario.controls.cuil.setValue(cuilCompleto);
        }

        // --------------------------------------------------------
        // Mostrar errores
        // --------------------------------------------------------

        form.markAllAsTouched();

        // --------------------------------------------------------
        // Formulario inválido
        // --------------------------------------------------------

        if (!form.valid) {
            this.modal.setOpen('Datos inválidos', 'Revise los datos ingresados');

            return true;
        }

        return false;
    }

    // ============================================================
    // SUBMIT
    // ============================================================

    onRegistro() {
        // Validamos
        if (this.validateForm(this.formulario) || this.formulario.invalid) {
            return;
        }

        const datosRegistro = this.formulario.getRawValue();
        const formData = new FormData();

        // ========================================================
        // DATOS GENERALES
        // ========================================================

        formData.append('dni', datosRegistro.dni?.toString() ?? '');
        formData.append('cuil', datosRegistro.cuil?.toString() ?? '');
        formData.append('apellidos', this.toCapitalize(datosRegistro.apellidos ?? ''));
        formData.append('nombres', this.toCapitalize(datosRegistro.nombres ?? ''));
        formData.append('correo', (datosRegistro.correo ?? '').toLowerCase().trim());
        formData.append('perfil', datosRegistro.perfil ?? '');

        // ========================================================
        // PASSWORD
        // ========================================================

        /**
         * En creación:
         * password siempre está presente.
         *
         * En edición:
         * solamente lo enviamos si el usuario escribió
         * una nueva contraseña.
         */
        if (datosRegistro.password) {
            formData.append('password', datosRegistro.password);
            formData.append('confirmPassword', datosRegistro.confirmPassword ?? '');
        }

        // ========================================================
        // FOTO
        // ========================================================

        /**
         * El control contiene solamente imágenes nuevas.
         *
         * Si estamos creando:
         *   → debe existir una imagen porque el validator
         *     la hizo obligatoria.
         *
         * Si estamos editando:
         *   → puede estar vacío.
         *   → eso significa "mantener la foto actual".
         *
         * Si contiene un File:
         *   → significa "reemplazar la foto actual".
         */
        const fotosArray = datosRegistro.foto as File[] | null;

        if (fotosArray && fotosArray.length > 0) {
            const archivoReal = fotosArray[0];
            formData.append('foto', archivoReal);
        }

        // ========================================================
        // EMIT
        // ========================================================

        this.registroSubmit.emit(formData);
    }
}
