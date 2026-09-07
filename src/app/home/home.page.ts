import { Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { IonContent, IonIcon } from '@ionic/angular';
import { addIcons } from 'ionicons';
import {
    peopleOutline,
    gridOutline,
    personCircleOutline,
    listOutline,
    easelOutline,
    personAddOutline,
    chatbubblesOutline,
    receiptOutline,
    restaurantOutline,
    wineOutline,
    chevronForwardOutline,
    alertCircleOutline,
} from 'ionicons/icons';
import { AuthService } from '../services/auth.service';
import { BOTONES_POR_ROL } from './home-botones.config';
import { HeaderComponent } from '../components/header/header.component';

/**
 * Pantalla de inicio.
 *
 * Sólo lista los accesos que le corresponden al rol. El saludo, la foto y el
 * perfil de quien entró viven en `app-header` (modo 'usuario'), que los
 * muestra pegados a la barra: son datos de la sesión, no de esta pantalla, y
 * así la misma cabecera sirve para todas las demás.
 */
@Component({
    selector: 'app-home',
    templateUrl: 'home.page.html',
    styleUrls: ['home.page.scss'],
    imports: [IonContent, IonIcon, RouterLink, HeaderComponent],
})
export class HomePage {
    authService = inject(AuthService);

    constructor() {
        // Los iconos de los accesos se declaran acá porque los nombres salen de
        // la configuración por rol, no del HTML.
        addIcons({
            'people-outline': peopleOutline,
            'grid-outline': gridOutline,
            'person-circle-outline': personCircleOutline,
            'list-outline': listOutline,
            'easel-outline': easelOutline,
            'person-add-outline': personAddOutline,
            'chatbubbles-outline': chatbubblesOutline,
            'receipt-outline': receiptOutline,
            'restaurant-outline': restaurantOutline,
            'wine-outline': wineOutline,
            'chevron-forward-outline': chevronForwardOutline,
            'alert-circle-outline': alertCircleOutline,
        });
    }

    // Se recalcula solo cuando cambia el perfil (login/logout/refresh de sesión).
    botonesDelRol = computed(() => {
        const perfil = this.authService.perfil();
        return perfil ? BOTONES_POR_ROL[perfil] : [];
    });
}
