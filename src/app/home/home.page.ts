import { Component, computed, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { IonHeader, IonToolbar, IonTitle, IonContent, IonButtons, IonButton, IonIcon } from '@ionic/angular';
import { AuthService } from '../services/auth.service';
import { ModalService } from '../services/modal.service';
import { NotificacionesService } from '../services/notificaciones.service';
import { BOTONES_POR_ROL } from './home-botones.config';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  imports: [IonHeader, IonToolbar, IonTitle, IonContent, IonButtons, IonButton, IonIcon, RouterLink],
})
export class HomePage {
  private authService = inject(AuthService);
  private router = inject(Router);
  private modal = inject(ModalService);
  private notificaciones = inject(NotificacionesService);

  perfil = computed(() => this.authService.perfil());

  // Se recalcula solo cuando cambia el perfil (login/logout/refresh de sesión).
  botonesDelRol = computed(() => {
    const perfil = this.authService.perfil();
    return perfil ? BOTONES_POR_ROL[perfil] : [];
  });

  async cerrarSesion() {
    // Desactivado temporalmente: rompía el logout si fallaba (push
    // notifications no configuradas en el dispositivo). Reactivar dentro
    // de su propio try/catch para que un fallo acá nunca bloquee el logout.
    try {
      await this.notificaciones.cerrarSesion();
    } catch (error) {
      console.error('No se pudieron limpiar las notificaciones al cerrar sesión', error);
    }

    try {
      await this.authService.logout();
    } catch (error) {
      const mensaje = error instanceof Error ? error.message : 'No se pudo cerrar sesión.';
      this.modal.setOpen(true, 'Error', mensaje);
    } finally {
      this.router.navigate(['/ingresar']);
    }
  }
}
