import { Component, output } from '@angular/core';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import {
  IonInput,
  IonInputPasswordToggle,
  IonItem,
} from '@ionic/angular';
import { RouterLink } from '@angular/router';
import { LoginInterface } from '../../interfaces/auth.interface';

@Component({
  selector: 'app-login-form',
  templateUrl: './login-form.component.html',
  styleUrls: ['./login-form.component.scss'],
  imports: [
    IonInput,
    IonItem,
    IonInputPasswordToggle,
    ReactiveFormsModule,
    RouterLink,
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

  usuariosValidos = [
    { email: 'duenio@restaurante.com', pass: '12345678', rol: 'Dueño', color: '#d97706' },
    { email: 'supervisor@restaurante.com', pass: '12345678', rol: 'Supervisor', color: '#0d9488' },
    { email: 'metre@restaurante.com', pass: '12345678', rol: 'Metre', color: '#7c3aed' },
    { email: 'mozo@restaurante.com', pass: '12345678', rol: 'Mozo', color: '#e11d48' },
    { email: 'cocinero@restaurante.com', pass: '12345678', rol: 'Cocinero', color: '#ea580c' },
    { email: 'cliente@restaurante.com', pass: '12345678', rol: 'Cliente', color: '#16a34a' },
  ];

  cargarCredenciales(correo: string, clave: string) {
    this.formulario.setValue({ email: correo, password: clave });
  }

  onLogin() {
    if (this.formulario.invalid) return;
    this.loginSubmit.emit(this.formulario.value as LoginInterface);
  }
}