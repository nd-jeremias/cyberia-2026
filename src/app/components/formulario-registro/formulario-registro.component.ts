import { Component, output } from '@angular/core';
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
    ],
})
export class FormularioRegistroComponent {
    registroSubmit = output<RegisterInterface>();

    tiposEmpleado = [
        'dueño',
        'supervisor',
        'metre',
        'mozo',
        'cocinero',
        'cantinero',
    ];

    foto: File | null = null;

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
            cuil: new FormControl('', {
                validators: [Validators.pattern(/^\d{11}$/)],
            }),
            correo: new FormControl('', {
                validators: [Validators.required, Validators.email],
            }),
            tipoEmpleado: new FormControl(''),
            password: new FormControl('', {
                validators: [Validators.required, Validators.minLength(8)],
            }),
            confirmPassword: new FormControl('', {
                validators: [Validators.required],
            }),
        },
        { validators: [passwordsIguales] }
    );

    onFotoSeleccionada(event: Event) {
        const input = event.target as HTMLInputElement;
        this.foto = input.files?.[0] ?? null;
    }

    onRegistro() {
        if (this.formulario.invalid || !this.foto) return;

        const valores = this.formulario.getRawValue();

        this.registroSubmit.emit({
            nombres: valores.nombres ?? '',
            apellidos: valores.apellidos ?? '',
            dni: valores.dni ?? '',
            cuil: valores.cuil || undefined,
            correo: valores.correo ?? '',
            tipoEmpleado: valores.tipoEmpleado || undefined,
            foto: this.foto,
            password: valores.password ?? '',
            confirmPassword: valores.confirmPassword ?? '',
        });
    }
}
