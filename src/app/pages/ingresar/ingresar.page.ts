import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { IonContent, IonHeader, IonToolbar, IonTitle } from '@ionic/angular';
import { LoginFormComponent } from '../../components/login-form/login-form.component';
import { LoginInterface } from '../../interfaces/auth.interface';
import { SpinnerService } from '../../services/spinner.service';
import { ModalService } from '../../services/modal.service';
import { AuthService } from '../../services/auth.service';
import { NotificacionesService } from '../../services/notificaciones.service';

@Component({
  selector: 'app-ingresar',
  templateUrl: './ingresar.page.html',
  imports: [IonHeader, IonToolbar, IonTitle, IonContent, LoginFormComponent],
})
export class IngresarPage {
  private router = inject(Router);
  private spinner = inject(SpinnerService);
  private modal = inject(ModalService);
  private authService = inject(AuthService);
  private notificaciones = inject(NotificacionesService);

  async handleLogin(credentials: LoginInterface) {
    this.spinner.show();

    try {
      await this.authService.login(credentials);

      await this.notificaciones.sincronizarToken();

      this.router.navigate(['/home']);
    } catch (error) {
      const mensaje = error instanceof Error ? error.message : 'No se pudo iniciar sesión. Intente nuevamente.';
      this.modal.setOpen(true, 'Error al ingresar', mensaje);
    } finally {
      this.spinner.hide();
    }

    
  }
}