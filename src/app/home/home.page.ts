import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { IonHeader, IonToolbar, IonTitle, IonContent, IonButtons, IonButton, IonIcon } from '@ionic/angular';
import { AuthService } from '../services/auth.service';
import { ModalService } from '../services/modal.service';
import { NotificacionesService } from '../services/notificaciones.service';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  imports: [IonHeader, IonToolbar, IonTitle, IonContent, IonButtons, IonButton, IonIcon],
})
export class HomePage {
  private authService = inject(AuthService);
  private router = inject(Router);
  private modal = inject(ModalService);
  private notificaciones = inject(NotificacionesService);

  async cerrarSesion() {
    try {
      // Primero se sueltan las notificaciones: necesita la sesion viva para
      // poder borrar el token de la base.
      await this.notificaciones.cerrarSesion();

      await this.authService.logout();
    } catch (error) {
      const mensaje = error instanceof Error ? error.message : 'No se pudo cerrar sesión.';
      this.modal.setOpen('Error', mensaje);
    } finally {
      this.router.navigate(['/ingresar']);
    }
  }
}
