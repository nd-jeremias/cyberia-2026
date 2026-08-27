import { FileService } from './../../services/file.service';
import { Component, effect, inject, input, output } from '@angular/core';
import {
    AbstractControl,
    FormControl,
    FormGroup,
    ReactiveFormsModule,
    ValidationErrors,
    Validators,
} from '@angular/forms';
import {
    IonButton,
    IonCard,
    IonCardContent,
    IonCardHeader,
    IonCardTitle,
    IonInput,
    IonInputPasswordToggle,
    IonItem,
    IonSelect,
    IonSelectOption,
} from '@ionic/angular';
import { RegisterInterface } from '../../interfaces/auth.interface';
import { DniInterface } from '../../interfaces/dni.interface';
import { QrService } from '../../services/qr.service';
import { ModalService } from '../../services/modal.service';
import { SubidaImagenesComponent } from '../subida-imagenes/subida-imagenes.component';
import { RouterLink } from '@angular/router';

const passwordsIguales = (group: AbstractControl): ValidationErrors | null => {
    const password = group.get('password')?.value;
    const confirmPassword = group.get('confirmPassword')?.value;

    return password === confirmPassword ? null : { passwordsDistintas: true };
};

@Component({
    selector: 'app-formulario-registro',
    templateUrl: './formulario-registro.component.html',
    styleUrls: ['./formulario-registro.component.scss'],
    imports: [
        IonCard,
        IonCardContent,
        IonCardHeader,
        IonCardTitle,
        IonInput,
        IonInputPasswordToggle,
        IonItem,
        IonSelect,
        IonSelectOption,
        IonButton,
        ReactiveFormsModule,
        SubidaImagenesComponent,
        RouterLink
    ],
})
export class FormularioRegistroComponent {
    esDueno = input<boolean>(false);

    qrService = inject(QrService);
    modal = inject(ModalService);
    fileService = inject(FileService);

    registroSubmit = output<FormData>();

    tiposEmpleado = ['dueño', 'supervisor', 'metre', 'mozo', 'cocinero', 'cantinero'];

    foto: File[] = [];
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
            tipoEmpleado: new FormControl(''),
            foto: new FormControl<File[]>([], { validators: [this.fileService.minLengthArray(1)] }),
            password: new FormControl('', {
                validators: [Validators.required, Validators.minLength(8)],
            }),
            confirmPassword: new FormControl('', {
                validators: [Validators.required],
            }),
        },
        { validators: [passwordsIguales] }
    );

    constructor() {
        effect(() => {
            const cuil = this.formulario.controls.cuil;
            const tipoEmpleado = this.formulario.controls.tipoEmpleado;

            if (this.esDueno()) {
                cuil.setValidators([Validators.required, Validators.pattern(/^\d{11}$/)]);
                tipoEmpleado.setValidators([Validators.required]);
            } else {
                cuil.clearValidators();
                tipoEmpleado.clearValidators();
                cuil.reset('');
                tipoEmpleado.reset('');
            }

            cuil.updateValueAndValidity();
            tipoEmpleado.updateValueAndValidity();
        });
    }

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

    recibirImagenes(imagenes: File[]) {
        this.foto = imagenes;

        // Almacena el array de Files directamente en el formulario
        this.formulario.patchValue({ foto: imagenes });

        // Opcional: Marca el control como "dirty" o "touched" para la validación
        this.formulario.get('imagenes')?.markAsTouched();
    }

    // onFotoSeleccionada(event: Event) {
    //     const input = event.target as HTMLInputElement;
    //     this.foto = input.files?.[0] ?? null;
    // }

    toCapitalize(word: string): string {
        if (!word || word.length === 0) return '';
        return word[0].toUpperCase() + word.slice(1);
    }

    validateForm(form: FormGroup): boolean {
        if (!this.formulario.valid) {
            this.modal.setOpen(true, 'Datos inválidos', 'Revise los datos ingresados');
            return true;
        }

        return false;
    }

    onRegistro() {
        // if (this.formulario.invalid || !this.foto) return;
        console.log(this.formulario)

        if (this.validateForm(this.formulario) || this.formulario.invalid) return;

        // 1. Forzamos a que los datos extraídos cumplan con la interfaz
        const datosRegistro = this.formulario.value as RegisterInterface;

        const formData = new FormData();

        formData.append('dni', datosRegistro.dni.toString());
        formData.append('cuil', datosRegistro.cuil?.toString() ?? '');
        formData.append('apellidos', this.toCapitalize(datosRegistro.apellidos));
        formData.append('nombres', this.toCapitalize(datosRegistro.nombres));
        formData.append('correo', datosRegistro.correo.toLowerCase().trim());
        formData.append('tipoEmpleado', datosRegistro.tipoEmpleado ?? '');
        formData.append('password', datosRegistro.password);
        formData.append('confirmPassword', datosRegistro.confirmPassword);

        const fotoArchivo = this.formulario.get('foto')?.value;
        if (fotoArchivo) {
            formData.append('foto', fotoArchivo[0]); // Mantiene el nombre 'selfie_12345.jpg'
        }

        this.registroSubmit.emit(formData);
    }
}
