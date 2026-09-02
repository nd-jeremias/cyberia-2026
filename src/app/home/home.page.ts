import { Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { IonContent, IonButton, IonIcon } from '@ionic/angular';
import { AuthService } from '../services/auth.service';
import { BOTONES_POR_ROL } from './home-botones.config';
import { HeaderComponent } from '../components/header/header.component';

@Component({
    selector: 'app-home',
    templateUrl: 'home.page.html',
    styleUrls: ['home.page.scss'],
    imports: [IonContent, IonButton, IonIcon, RouterLink, HeaderComponent],
})
export class HomePage {
    authService = inject(AuthService);

    // Se recalcula solo cuando cambia el perfil (login/logout/refresh de sesión).
    botonesDelRol = computed(() => {
        const perfil = this.authService.perfil();
        return perfil ? BOTONES_POR_ROL[perfil] : [];
    });
}
