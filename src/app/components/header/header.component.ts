import { Component, computed, inject, input, OnInit } from '@angular/core';
import { IonHeader, IonToolbar, IonTitle, IonButtons, IonButton } from '@ionic/angular';
import { AuthService } from '../../services/auth.service';
import { NavigationEnd, Router } from '@angular/router';
import { ModalService } from '../../services/modal.service';
import { NotificacionesService } from '../../services/notificaciones.service';
import { BotonAtrasComponent } from '../boton-atras/boton-atras.component';
import { toSignal } from '@angular/core/rxjs-interop';
import { filter, map } from 'rxjs/operators';

@Component({
    selector: 'app-header',
    templateUrl: './header.component.html',
    styleUrls: ['./header.component.scss'],
    imports: [IonButton, IonButtons, IonTitle, IonToolbar, IonHeader, BotonAtrasComponent],
})
export class HeaderComponent implements OnInit {
    private authService = inject(AuthService);
    private router = inject(Router);
    private modal = inject(ModalService);
    private notificaciones = inject(NotificacionesService);

    perfil = computed(() => this.authService.perfil() ?? 'No se encontro perfil.');
    defaultHref = input<string>('/inicio');

    // 1. Convertimos los eventos del router en una Signal que contiene la URL actual
    private urlActual = toSignal(
        this.router.events.pipe(
            filter((event): event is NavigationEnd => event instanceof NavigationEnd),
            map((event) => event.urlAfterRedirects)
        ),
        { initialValue: this.router.url } // 👈 Valor inicial síncrono para evitar 'undefined'
    );

    // 2. Ahora el computed() funciona perfectamente porque lee una Signal (urlActual)
    mostrarBotonVolver = computed(() => {
        const url = this.urlActual();
        console.log('Ruta activa cambiada a:', url);
        return url !== '/inicio';
    });

    constructor() {}

    ngOnInit() {}

    async cerrarSesion() {
        try {
            await this.notificaciones.cerrarSesion();
        } catch (error) {
            console.error('No se pudieron limpiar las notificaciones al cerrar sesión', error);
        }

        try {
            await this.authService.logout();
        } catch (error) {
            const mensaje = error instanceof Error ? error.message : 'No se pudo cerrar sesión.';
            this.modal.setOpen('Error', mensaje);
        } finally {
            this.router.navigate(['/ingresar']);
        }
    }
}
