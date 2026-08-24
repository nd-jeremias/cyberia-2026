import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { IonContent, IonHeader, IonToolbar, IonTitle } from '@ionic/angular';
import { LoginFormComponent } from '../../components/login-form/login-form.component';
import { LoginInterface } from '../../interfaces/auth.interface';
import { SpinnerService } from '../../services/spinner.service';
import { ModalService } from '../../services/modal.service';
import { Preferences } from '@capacitor/preferences';

@Component({
  selector: 'app-ingresar',
  templateUrl: './ingresar.page.html',
  imports: [IonHeader, IonToolbar, IonTitle, IonContent, LoginFormComponent],
})
export class IngresarPage {
  private router = inject(Router);
  private spinner = inject(SpinnerService);
  private modal = inject(ModalService);

 
  async handleLogin(credentials: LoginInterface) {
    this.spinner.show();

    // Simular retraso de red
    await new Promise(resolve => setTimeout(resolve, 600));

    this.spinner.hide();

    this.router.navigate(['/home']);
  }
}