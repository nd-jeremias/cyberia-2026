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
import { BOTONES_POR_ROL, GUIA_POR_ROL } from './home-botones.config';
import { HeaderComponent } from '../components/header/header.component';

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
        // la configuración por rol, no del HTML: sin registrarlos, Ionic no
        // encuentra el dibujo y el medallón sale vacío.
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

    /**
     * Nombre para el saludo de bienvenida.
     *
     * Sale de los metadatos de la sesión, que es donde el registro guarda el
     * nombre de la persona. Si la cuenta no los tiene (por ejemplo, los
     * usuarios de prueba creados a mano), se saluda de forma genérica en lugar
     * de usar la parte anterior a la arroba del correo: eso mostraba textos
     * como "duenio" o "cliente", que se leen como un dato técnico y no como el
     * nombre de alguien. El rol ya se ve en la insignia de al lado.
     */
    nombreUsuario = computed(() => {
        const metadatos = this.authService.session()?.user?.user_metadata ?? {};
        const nombre = (metadatos['nombre'] ?? metadatos['nombres'] ?? '').toString().trim();

        return nombre || '¡Bienvenido!';
    });

    /** Saludo según la hora, como hacen las aplicaciones de delivery. */
    saludo = computed(() => {
        const hora = new Date().getHours();

        if (hora < 6) return 'Buenas madrugadas';
        if (hora < 13) return 'Buen día';
        if (hora < 20) return 'Buenas tardes';

        return 'Buenas noches';
    });

    /** Pasos del circuito de trabajo que le tocan al rol de la sesión. */
    guiaDelRol = computed(() => {
        const perfil = this.authService.perfil();
        return perfil ? GUIA_POR_ROL[perfil] : [];
    });

    /** Perfil listo para mostrar, con la primera letra en mayúscula. */
    perfilVisible = computed(() => {
        const perfil = this.authService.perfil();

        if (!perfil) return 'Sin perfil asignado';

        return perfil.charAt(0).toUpperCase() + perfil.slice(1);
    });
}
