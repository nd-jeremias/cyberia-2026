import { Component, computed, inject, input } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { NavigationEnd, Router } from '@angular/router';
import { ModalService } from '../../services/modal.service';
import { NotificacionesService } from '../../services/notificaciones.service';
import { BotonAtrasComponent } from '../boton-atras/boton-atras.component';
import { toSignal } from '@angular/core/rxjs-interop';
import { filter, map } from 'rxjs/operators';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { remixLogoutCircleLine } from '@ng-icons/remixicon';

/**
 * Cabecera de la aplicación.
 *
 * Es la banda naranja que encabeza TODAS las pantallas. Tiene dos partes
 * pegadas entre sí:
 *
 *   - la barra, con volver / marca / cerrar sesión, idéntica en todos lados;
 *   - la tarjeta de contexto, que cambia según el modo.
 *
 * Modos:
 *   'usuario'  → inicio: foto, nombre y perfil de quien entró.
 *   'pantalla' → resto: título de la sección y, si hace falta, su botón de
 *                acción, que la página proyecta con el atributo `accion`:
 *
 *                  <app-header tituloHeader="Platos">
 *                      <button accion class="btn-banda">Nuevo plato</button>
 *                  </app-header>
 */
@Component({
    selector: 'app-header',
    templateUrl: './header.component.html',
    styleUrls: ['./header.component.scss'],
    providers: [provideIcons({ remixLogoutCircleLine })],
    imports: [BotonAtrasComponent, NgIcon],
})
export class HeaderComponent {
    private authService = inject(AuthService);
    private router = inject(Router);
    private modal = inject(ModalService);
    private notificaciones = inject(NotificacionesService);

    defaultHref = input<string>('/inicio');
    tituloHeader = input<string>('Inicio');

    /** 'usuario' muestra la identidad; 'pantalla', el título de la sección. */
    modo = input<'usuario' | 'pantalla'>('pantalla');

    /**
     * Si hay sesión abierta.
     *
     * Registro e ingreso anónimo también llevan esta cabecera, pero ahí no hay
     * nada que cerrar: sin esta comprobación mostrarían un botón de "cerrar
     * sesión" que no puede hacer nada.
     */
    haySesion = computed(() => this.authService.session() !== null);

    // --- Identidad -----------------------------------------------------------

    fotoUsuario = computed(() => this.authService.fotoUrl());

    nombreCompleto = computed(() => {
        const nombres = (this.authService.nombres() ?? '').trim();
        const apellidos = (this.authService.apellidos() ?? '').trim();
        const completo = [nombres, apellidos].filter(Boolean).join(' ');

        if (completo) return completo;

        // Los usuarios de prueba cargados a mano no tienen nombre en la tabla;
        // antes de mostrar la parte anterior de la arroba (que se lee como un
        // dato técnico), se saluda de forma genérica.
        const porMetadatos = (this.authService.session()?.user?.user_metadata?.['nombre'] ?? '').toString().trim();

        return porMetadatos || 'Bienvenido';
    });

    /**
     * Iniciales para el avatar cuando la persona no tiene foto cargada.
     *
     * Un círculo vacío se lee como una imagen que no cargó; con las iniciales
     * se lee como una decisión.
     */
    iniciales = computed(() => {
        const partes = this.nombreCompleto().split(/\s+/).filter(Boolean);

        if (partes.length === 0) return '?';
        if (partes.length === 1) return partes[0].charAt(0).toUpperCase();

        return (partes[0].charAt(0) + partes[partes.length - 1].charAt(0)).toUpperCase();
    });

    perfilVisible = computed(() => {
        const perfil = this.authService.perfil();

        if (!perfil) return 'Sin perfil';

        return perfil.charAt(0).toUpperCase() + perfil.slice(1);
    });

    /** Saludo según la hora, como hacen las aplicaciones de gastronomía. */
    saludo = computed(() => {
        const hora = new Date().getHours();

        if (hora < 6) return 'Buenas madrugadas';
        if (hora < 13) return 'Buen día';
        if (hora < 20) return 'Buenas tardes';

        return 'Buenas noches';
    });

    // --- Navegación ----------------------------------------------------------

    private urlActual = toSignal(
        this.router.events.pipe(
            filter((event): event is NavigationEnd => event instanceof NavigationEnd),
            map((event) => event.urlAfterRedirects)
        ),
        { initialValue: this.router.url }
    );

    mostrarBotonVolver = computed(() => this.urlActual() !== '/inicio');

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
