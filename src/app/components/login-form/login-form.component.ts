import { Component, inject, output } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { IonIcon, IonInput, IonInputPasswordToggle } from '@ionic/angular';
import { RouterLink } from '@angular/router';
import { addIcons } from 'ionicons';
import { 
  restaurantOutline, 
  mailOutline, 
  lockClosedOutline, 
  shieldCheckmarkOutline, 
  peopleOutline, 
  wineOutline, 
  fastFoodOutline, 
  personOutline 
} from 'ionicons/icons';
import { LoginInterface } from '../../interfaces/auth.interface';
import { VibracionService } from '../../services/vibracion.service';
import { ModalService } from '../../services/modal.service';

@Component({
  selector: 'app-login-form',
  templateUrl: './login-form.component.html',
  styleUrls: ['./login-form.component.scss'],
  imports: [IonIcon, IonInput, IonInputPasswordToggle, ReactiveFormsModule, RouterLink],
})
export class LoginFormComponent {
  private modal = inject(ModalService);
  private vibracion = inject(VibracionService);

  loginSubmit = output<LoginInterface>();
  loginAnonimo = output<void>();

  constructor() {
    addIcons({
      'restaurant-outline': restaurantOutline,
      'mail-outline': mailOutline,
      'lock-closed-outline': lockClosedOutline,
      'shield-checkmark-outline': shieldCheckmarkOutline,
      'people-outline': peopleOutline,
      'wine-outline': wineOutline,
      'fast-food-outline': fastFoodOutline,
      'person-outline': personOutline,
    });
  }

  formulario = new FormGroup({
    email: new FormControl('', { validators: [Validators.required, Validators.email] }),
    password: new FormControl('', { validators: [Validators.required, Validators.minLength(8)] }),
  });

  usuariosValidos = [
    { email: 'duenio@restaurante.com', pass: '12345678', rol: 'Dueño', icono: 'shield-checkmark-outline' },
    { email: 'supervisor@restaurante.com', pass: '12345678', rol: 'Supervisor', icono: 'shield-checkmark-outline' },
    { email: 'metre@restaurante.com', pass: '12345678', rol: 'Maître', icono: 'people-outline' },
    { email: 'mozo@restaurante.com', pass: '12345678', rol: 'Mozo', icono: 'restaurant-outline' },
    { email: 'cocinero@restaurante.com', pass: '12345678', rol: 'Cocinero', icono: 'fast-food-outline' },
    { email: 'cliente@restaurante.com', pass: '12345678', rol: 'Cliente', icono: 'person-outline' },
  ];

  cargarCredenciales(correo: string, clave: string) {
    this.formulario.setValue({ email: correo, password: clave });
  }

  hayError(control: string, error: string): boolean {
    const campo = this.formulario.get(control);

    return !!campo && campo.touched && campo.hasError(error);
  }

  async onLogin() {
    if (this.formulario.invalid) {
      // Ionic solo pinta el error si el control esta "tocado".
      this.formulario.markAllAsTouched();

      await this.vibracion.error();

      this.modal.setOpen(
        'Datos inválidos',
        'Revise el correo y la contraseña antes de continuar.'
      );

      return;
    }

    this.loginSubmit.emit(this.formulario.value as LoginInterface);
  }

  ingresoAnonimo() {
    this.loginAnonimo.emit();
  }
}