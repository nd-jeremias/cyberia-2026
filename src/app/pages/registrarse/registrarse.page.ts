import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { IonContent, IonHeader, IonToolbar, IonTitle, IonButtons, IonBackButton } from '@ionic/angular';
import { SpinnerService } from '../../services/spinner.service';
import { ModalService } from '../../services/modal.service';

@Component({
  selector: 'app-registrarse',
  template: `
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button defaultHref="/ingresar"></ion-back-button>
        </ion-buttons>
        <ion-title>Crear Cuenta</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content class="ion-padding">
      <app-formulario-registro (registroSubmit)="handleRegistro($event)"></app-formulario-registro>
    </ion-content>
  `,
  imports: [IonHeader, IonToolbar, IonTitle, IonButtons, IonBackButton, IonContent],
})
export class RegistrarsePage {
  private router = inject(Router);
  private spinner = inject(SpinnerService);
  private modal = inject(ModalService);

  async handleRegistro(formData: FormData) {
    this.spinner.show();
    // Lógica para enviar formData a Supabase (Auth + Storage + Tabla usuarios)
    this.spinner.hide();
    this.modal.setOpen(true, 'Registro', 'Solicitud enviada correctamente');
    this.router.navigate(['/ingresar']);
  }
}