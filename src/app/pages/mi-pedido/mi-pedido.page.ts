import { Component, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { IonContent, IonIcon } from '@ionic/angular';
import { HeaderComponent } from '../../components/header/header.component';
import { PedidoInterface } from '../../interfaces/pedido.interface';
import { AuthService } from '../../services/auth.service';
import { ModalService } from '../../services/modal.service';
import { PedidoService } from '../../services/pedido.service';
import {
    LEYENDA_PAGANDO,
    LEYENDA_PEDIDO,
    puedeAccederAJuegos,
    puedeConfirmarRecepcion,
    puedeUsarServiciosDeMesa,
} from './mi-pedido.estado';

/**
 * Secciones del cliente que se desarrollan en otra rama (eze-dev), con las
 * mismas rutas que tienen allá. Mientras la ruta no exista en esta rama, el
 * botón avisa en lugar de no hacer nada.
 */
const SECCIONES = {
    juegos: { ruta: 'juegos', titulo: 'Juegos', aviso: 'La sección de juegos todavía no está habilitada.' },
    encuesta: { ruta: 'encuestas', titulo: 'Encuesta', aviso: 'La encuesta todavía no está habilitada.' },
    cuenta: { ruta: 'pedir-cuenta', titulo: 'Cuenta', aviso: 'El pedido de la cuenta todavía no está habilitado.' },
} as const;

export type SeccionCliente = keyof typeof SECCIONES;

/**
 * Pedido del cliente: en qué estado está y qué puede hacer mientras espera.
 *
 * Cubre, del lado del cliente, los puntos 13 a 15 y 19: ver si el mozo todavía
 * lo revisa, si lo rechazó o si ya lo confirmó; volver a consultarlo sin salir
 * de la pantalla; entrar a los juegos; confirmar la recepción cuando el mozo lo
 * entrega, y desde ahí ir a la encuesta o pedir la cuenta.
 *
 * La única escritura es la confirmación de recepción: el resto del pedido lo
 * cambian el mozo y los sectores.
 */
@Component({
    selector: 'app-mi-pedido',
    templateUrl: './mi-pedido.page.html',
    // La tarjeta se ve igual que la del mozo: se reutilizan sus estilos en vez
    // de copiarlos.
    styleUrls: ['../pedidos/pedidos.page.scss', './mi-pedido.page.scss'],
    imports: [IonContent, IonIcon, HeaderComponent],
})
export class MiPedidoPage {
    private authService = inject(AuthService);
    private pedidoService = inject(PedidoService);
    private modal = inject(ModalService);
    private router = inject(Router);

    pedido = signal<PedidoInterface | null>(null);
    cargando = signal(true);

    /** Bloquea "Confirmar recepción" mientras se guarda. */
    procesando = this.pedidoService.cargando;

    leyenda = computed(() => {
        const pedido = this.pedido();

        if (!pedido) return '';

        return pedido.estadoCliente === 'pagando' ? LEYENDA_PAGANDO : LEYENDA_PEDIDO[pedido.estado];
    });

    rechazado = computed(() => this.pedido()?.estado === 'Rechazado');

    puedeJugar = computed(() => puedeAccederAJuegos(this.pedido()?.estado ?? null, this.authService.perfil()));

    puedeConfirmar = computed(() => puedeConfirmarRecepcion(this.pedido()?.estado ?? null));

    serviciosHabilitados = computed(() => {
        const pedido = this.pedido();

        return puedeUsarServiciosDeMesa(pedido?.estado ?? null, pedido?.estadoCliente ?? null);
    });

    /** Se consulta cada vez que se entra: el estado cambia mientras el cliente espera. */
    ionViewWillEnter() {
        void this.recargar();
    }

    /** Punto 14: vuelve a pedir el pedido a la base, para ver si el mozo ya lo confirmó. */
    async recargar() {
        const usuarioId = this.authService.session()?.user.id;

        if (!usuarioId) {
            this.cargando.set(false);
            this.modal.setOpen('Sesión no encontrada', 'Volvé a iniciar sesión para ver tu pedido.');
            return;
        }

        this.cargando.set(true);

        try {
            this.pedido.set(await this.pedidoService.pedidoActualDelCliente(usuarioId));
        } catch (error) {
            const mensaje = error instanceof Error ? error.message : 'No se pudo consultar tu pedido.';

            this.modal.setOpen('Error', mensaje);
        } finally {
            this.cargando.set(false);
        }
    }

    /** Punto 19: el cliente confirma que el mozo le entregó el pedido. */
    async confirmarRecepcion() {
        const pedido = this.pedido();
        const usuarioId = this.authService.session()?.user.id;

        if (!pedido || !usuarioId) return;

        const confirmado = await this.pedidoService.confirmarRecepcion(pedido.id, usuarioId);

        // Se vuelve a leer también si falló: puede que el estado haya cambiado.
        await this.recargar();

        if (confirmado) {
            this.modal.setOpen('Pedido recibido', 'Ya podés responder la encuesta y pedir la cuenta.', 'info');
        }
    }

    tiempoEstimado(pedido: PedidoInterface): number {
        return this.pedidoService.tiempoEstimado(pedido);
    }

    totalFormateado(pedido: PedidoInterface): string {
        return this.pedidoService.totalConDescuento(pedido).toLocaleString('es-AR', {
            style: 'currency',
            currency: 'ARS',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        });
    }

    /**
     * Lleva a los juegos (punto 15), a la encuesta o a pedir la cuenta
     * (punto 19).
     */
    irA(seccion: SeccionCliente) {
        const { ruta, titulo, aviso } = SECCIONES[seccion];
        const existe = this.router.config.some((definicion) => definicion.path === ruta);

        if (!existe) {
            this.modal.setOpen(titulo, aviso, 'info');
            return;
        }

        void this.router.navigate(['/', ruta]);
    }
}
