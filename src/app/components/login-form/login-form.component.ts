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
    IonIcon,
    IonInput,
    IonInputPasswordToggle,
    IonItem,
} from '@ionic/angular';
import { LoginInterface } from '../../interfaces/auth.interface';

@Component({
    selector: 'app-login-form',
    templateUrl: './login-form.component.html',
    styleUrls: ['./login-form.component.scss'],
    imports: [
        IonCard,
        IonCardContent,
        IonCardHeader,
        IonInput,
        IonItem,
        IonInputPasswordToggle,
        IonCardTitle,
        IonIcon,
        IonButton,
        ReactiveFormsModule,
    ],
})
export class LoginFormComponent {
    loginSubmit = output<LoginInterface>();

    formulario = new FormGroup({
        email: new FormControl('', {
            validators: [Validators.required, Validators.email],
        }),
        password: new FormControl('', {
            validators: [Validators.required, Validators.minLength(8)],
        }),
    });

    // Lista harcodeada de usuarios válidos para pruebas
    usuariosValidos = [
        { email: 'duenio@restaurante.com', pass: '12345678', rol: 'dueño' },
        { email: 'supervisor@restaurante.com', pass: '12345678', rol: 'supervisor' },
        { email: 'metre@restaurante.com', pass: '12345678', rol: 'metre' },
        { email: 'mozo@restaurante.com', pass: '12345678', rol: 'mozo' },
        { email: 'cocinero@restaurante.com', pass: '12345678', rol: 'cocinero' },
        { email: 'cliente@restaurante.com', pass: '12345678', rol: 'cliente registrado' },
    ];


    cargarCredenciales(correo: string, clave: string) {
        this.formulario.setValue({ email: correo, password: clave });
    }

    validateForm(form: FormGroup): boolean {
        const emailErrors = form.controls['email'].errors;
        const passwordErrors = form.controls['password'].errors;

        if (emailErrors || passwordErrors) {
            // this.modal.openModal({title:"Datos inválidos", message:"Revise los datos ingresados", type:"error"})
            return true;
        }

        return false;
    }

    onLogin() {
        if (this.validateForm(this.formulario)) return;

        this.loginSubmit.emit(this.formulario.value as LoginInterface);
    }
}
