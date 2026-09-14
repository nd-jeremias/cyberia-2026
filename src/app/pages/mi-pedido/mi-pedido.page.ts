import { Component, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { IonContent, IonIcon } from '@ionic/angular';
import { HeaderComponent } from '../../components/header/header.component';
import { ItemNuevoPedido, PedidoInterface } from '../../interfaces/pedido.interface';
import { AuthService } from '../../services/auth.service';
import { ChartService } from '../../services/chart.service';
import { ModalService } from '../../services/modal.service';
import { PedidoService } from '../../services/pedido.service';
import { SalonService } from '../../services/salon.service';
import { formatearImporte } from '../../utils/importe';
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
 * La pantalla tiene dos caras, según haya o no un pedido enviado:
 *
 *  - BORRADOR: lo que el cliente eligió en la carta, todavía en su teléfono.
 *    Se puede ajustar cantidad por cantidad y se envía desde acá (punto 12).
 *    Es también donde se reenvía un pedido que el mozo rechazó (punto 13).
 *  - ENVIADO: el pedido ya está en la base y lo mueven el mozo y los sectores.
 *    Acá sólo se sigue su estado y se confirma la recepción (puntos 14 y 19).
 *
 * El envío vive acá y no en la carta a propósito: el cliente repasa lo elegido
 * y recién ahí manda, en vez de que la carta cree pedidos mientras navega.
 */
@Component({
    selector: 'app-mi-pedido',
    templateUrl: './mi-pedido.page.html',
    // La tarjeta se ve igual que la del mozo y el pie igual que el de la carta:
    // se reutilizan esos estilos en vez de copiarlos.
    styleUrls: ['../pedidos/pedidos.page.scss', '../carta/carta.page.scss', './mi-pedido.page.scss'],
    imports: [IonContent, IonIcon, HeaderComponent],
})
export class MiPedidoPage {
    private authService = inject(AuthService);
    private pedidoService = inject(PedidoService);
    private salonService = inject(SalonService);
    private modal = inject(ModalService);
    private router = inject(Router);

    carrito = inject(ChartService);

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

    /** Líneas del borrador, con su cantidad y subtotal. */
    lineas = this.carrito.carrito;

    unidades = computed(() => this.lineas().reduce((suma, item) => suma + item.cantidad, 0));

    hayBorrador = computed(() => this.unidades() > 0);

    /**
     * La pantalla muestra el borrador cuando no hay nada enviado, o cuando el
     * mozo rechazó el pedido y el cliente lo está corrigiendo.
     */
    modoBorrador = computed(() => this.pedido() === null || this.rechazado());

    totalBorrador = computed(() => formatearImporte(this.carrito.total()));

    /** Bloquea el botón de enviar mientras la operación está en curso. */
    enviando = this.pedidoService.cargando;

    sumar(productoId: string) {
        this.carrito.sumar(productoId);
    }

    restar(productoId: string) {
        this.carrito.quitar(productoId);
    }

    importeDeLinea(precioTotal: number): string {
        return formatearImporte(precioTotal);
    }

    /**
     * Punto 12: manda el pedido al mozo. Si se está corrigiendo uno rechazado,
     * reemplaza sus líneas en lugar de crear otro (punto 13).
     */
    async enviarPedido() {
        const items: ItemNuevoPedido[] = this.lineas().map((item) => ({
            productoId: item.id,
            cantidad: item.cantidad,
            precioUnitario: item.precioUnitario,
        }));

        const aCorregir = this.pedido();

        if (this.rechazado() && aCorregir) {
            const reenviado = await this.pedidoService.reenviar(aCorregir.id, items);

            if (!reenviado) return;

            await this.terminarEnvio('Pedido reenviado', 'El mozo va a revisar los cambios.');
            return;
        }

        const clienteId = this.authService.session()?.user.id;
        const mesaId = this.salonService.situacion()?.mesaId;

        if (!clienteId || !mesaId) {
            this.modal.setOpen(
                'Falta la mesa',
                'Escaneá el código QR de tu mesa antes de enviar el pedido.'
            );

            return;
        }

        const creado = await this.pedidoService.crear({ mesaId, clienteId, items });

        if (!creado) return;

        await this.terminarEnvio('Pedido enviado', 'El mozo lo va a revisar en un momento.');
    }

    /** Vacía el borrador y vuelve a leer el pedido ya enviado. */
    private async terminarEnvio(titulo: string, mensaje: string) {
        this.carrito.vaciarCarrito();

        await this.recargar();

        this.modal.setOpen(titulo, mensaje, 'info');
    }

    /** Lleva a la carta para seguir eligiendo. */
    irALaCarta() {
        void this.router.navigate(['/carta']);
    }

    /**
     * Punto 13: lleva a la carta para corregir el pedido rechazado.
     *
     * La carta detecta sola que hay un pedido en ese estado y arranca con lo
     * ya pedido cargado, así que desde acá alcanza con navegar.
     */
    corregirPedido() {
        this.router.navigate(['/carta']);
    }

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
        return formatearImporte(this.pedidoService.totalConDescuento(pedido));
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
