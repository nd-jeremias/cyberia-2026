import { Component, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { IonContent } from '@ionic/angular';
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
    puedeEnviarOtroPedido,
    puedeUsarServiciosDeMesa,
} from './mi-pedido.estado';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { NotificacionesService } from '../../services/notificaciones.service';

/**
 * Secciones del cliente que se desarrollan en otra rama (eze-dev), con las
 * mismas rutas que tienen allá. Mientras la ruta no exista en esta rama, el
 * botón avisa en lugar de no hacer nada.
 */
const SECCIONES = {
    estado: {
        ruta: 'estado-pedido',
        titulo: 'Estado del pedido',
        aviso: 'El seguimiento del pedido todavía no está habilitado.',
    },
    juegos: { ruta: 'juegos', titulo: 'Juegos', aviso: 'La sección de juegos todavía no está habilitada.' },
    encuesta: { ruta: 'encuestas', titulo: 'Encuesta', aviso: 'La encuesta todavía no está habilitada.' },
    cuenta: { ruta: 'pedir-cuenta', titulo: 'Cuenta', aviso: 'El pedido de la cuenta todavía no está habilitado.' },
} as const;

export type SeccionCliente = keyof typeof SECCIONES;

/**
 * Pedido del cliente: lo que está armando y lo que ya mandó.
 *
 * La pantalla muestra DOS cosas a la vez, porque pueden convivir:
 *
 *  - BORRADOR: lo que el cliente eligió en la carta, todavía en su teléfono.
 *    Se ajusta cantidad por cantidad y se envía desde el pie (punto 12). Es
 *    también donde se reenvía un pedido que el mozo rechazó (punto 13).
 *  - ENVIADOS: los pedidos que ya están en la base y mueven el mozo y los
 *    sectores. Acá se sigue el estado de cada uno y se confirma la recepción
 *    (puntos 14 y 19).
 *
 * Antes eran excluyentes: con un pedido enviado se escondía el borrador entero,
 * incluido el botón de enviar. Si el cliente seguía eligiendo en la carta, no
 * veía lo que armaba y la pantalla mostraba otro pedido, con otros productos y
 * otro total. Ahora el borrador aparece siempre que tenga algo.
 *
 * Puede haber varios enviados: el punto 21 habla de "los pedidos realizados" y
 * la cuenta los suma a todos, así que el cliente puede pedir más de una vez.
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
    imports: [FaIconComponent, IonContent, HeaderComponent],
})
export class MiPedidoPage {
    private authService = inject(AuthService);
    private pedidoService = inject(PedidoService);
    private salonService = inject(SalonService);
    private modal = inject(ModalService);
    private router = inject(Router);
    private notificaciones = inject(NotificacionesService);

    carrito = inject(ChartService);

    /** Pedidos ya enviados en esta visita, del primero al último. */
    pedidos = signal<PedidoInterface[]>([]);
    cargando = signal(true);

    /** Bloquea "Confirmar recepción" mientras se guarda. */
    procesando = this.pedidoService.cargando;

    /** El pedido que el mozo devolvió para corregir, si hay alguno. */
    pedidoRechazado = computed(() => this.pedidos().find((p) => p.estado === 'Rechazado') ?? null);

    rechazado = computed(() => this.pedidoRechazado() !== null);

    hayEnviados = computed(() => this.pedidos().length > 0);

    /** Líneas del borrador, con su cantidad y subtotal. */
    lineas = this.carrito.carrito;

    unidades = computed(() => this.lineas().reduce((suma, item) => suma + item.cantidad, 0));

    hayBorrador = computed(() => this.unidades() > 0);

    /** Si todavía se puede mandar un pedido nuevo: no, con alguno ya confirmado. */
    puedeEnviar = computed(() => puedeEnviarOtroPedido(this.pedidos().map((p) => p.estado)));

    /** Algún pedido ya bajó a cocina: se puede seguir su preparación (punto 14). */
    hayConfirmado = computed(() => !this.puedeEnviar());

    /**
     * El borrador se muestra si se puede mandar, o si hay que corregir uno
     * rechazado (reenviarlo no es "otro" pedido). Con un pedido confirmado y
     * nada que corregir, lo que quedó en el carrito ya no se puede mandar.
     */
    mostrarBorrador = computed(() => this.hayBorrador() && (this.puedeEnviar() || this.rechazado()));

    /** Quedaron productos elegidos que ya no se pueden mandar. */
    borradorBloqueado = computed(() => this.hayBorrador() && !this.mostrarBorrador());

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
        // La pantalla ya no ofrece el botón en este caso; se vuelve a verificar
        // acá para que la regla no dependa sólo de lo que se dibuja.
        if (!this.pedidoRechazado() && !this.puedeEnviar()) {
            this.modal.setOpen(
                'Pedido ya confirmado',
                'Tu pedido ya pasó a cocina y barra. No se pueden agregar más productos en esta visita.'
            );

            return;
        }

        const items: ItemNuevoPedido[] = this.lineas().map((item) => ({
            productoId: item.id,
            cantidad: item.cantidad,
            precioUnitario: item.precioUnitario,
        }));

        await this.notificaciones.enviarAvisos(
            ['mozo'],
            'Pedido realizado.',
            'Nuevo pedido para verificar. ',
            'pedido-nuevo'
        );

        const aCorregir = this.pedidoRechazado();

        if (aCorregir) {
            const reenviado = await this.pedidoService.reenviar(aCorregir.id, items);

            if (!reenviado) return;

            await this.terminarEnvio('Pedido reenviado', 'El mozo va a revisar los cambios.');
            return;
        }

        const clienteId = this.authService.session()?.user.id;
        const mesaId = this.salonService.situacion()?.mesaId;

        if (!clienteId || !mesaId) {
            this.modal.setOpen('Falta la mesa', 'Escaneá el código QR de tu mesa antes de enviar el pedido.');

            return;
        }

        const creado = await this.pedidoService.crear({ mesaId, clienteId, items });

        if (!creado) return;

        await this.terminarEnvio('Pedido enviado', 'El mozo lo va a revisar en un momento.');
    }

    /** Vacía el borrador y vuelve a leer los pedidos enviados. */
    private async terminarEnvio(titulo: string, mensaje: string) {
        this.carrito.vaciarCarrito();

        await this.recargar();

        this.modal.setOpen(titulo, mensaje, 'info');
    }

    /** Descarta lo que quedó en el carrito y ya no se puede mandar. */
    descartarBorrador() {
        this.carrito.vaciarCarrito();
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

    /** Punto 15: alcanza con que alguno de sus pedidos ya esté confirmado. */
    puedeJugar = computed(() => this.pedidos().some((p) => puedeAccederAJuegos(p.estado, this.authService.perfil())));

    /**
     * Punto 19: la encuesta y la cuenta se habilitan cuando recibió TODO lo que
     * pidió. Con un solo pedido pendiente todavía no tiene sentido pagar.
     */
    serviciosHabilitados = computed(() => {
        const pedidos = this.pedidos();

        return pedidos.length > 0 && pedidos.every((p) => puedeUsarServiciosDeMesa(p.estado, p.estadoCliente));
    });

    /** Qué decirle al cliente sobre un pedido en particular. */
    leyendaDe(pedido: PedidoInterface): string {
        return pedido.estadoCliente === 'pagando' ? LEYENDA_PAGANDO : LEYENDA_PEDIDO[pedido.estado];
    }

    /** Punto 19: la recepción se confirma pedido por pedido. */
    puedeConfirmarDe(pedido: PedidoInterface): boolean {
        return puedeConfirmarRecepcion(pedido.estado);
    }

    /** Se consulta cada vez que se entra: el estado cambia mientras el cliente espera. */
    ionViewWillEnter() {
        void this.recargar();
    }

    /** Punto 14: vuelve a pedir los pedidos a la base, para ver si el mozo ya los confirmó. */
    async recargar() {
        const usuarioId = this.authService.session()?.user.id;

        if (!usuarioId) {
            this.cargando.set(false);
            this.modal.setOpen('Sesión no encontrada', 'Volvé a iniciar sesión para ver tu pedido.');
            return;
        }

        this.cargando.set(true);

        try {
            this.pedidos.set(await this.pedidoService.pedidosActivosDelCliente(usuarioId));
        } catch (error) {
            const mensaje = error instanceof Error ? error.message : 'No se pudo consultar tu pedido.';

            this.modal.setOpen('Error', mensaje, 'error');
        } finally {
            this.cargando.set(false);
        }
    }

    /** Punto 19: el cliente confirma que el mozo le entregó el pedido. */
    async confirmarRecepcion(pedido: PedidoInterface) {
        const usuarioId = this.authService.session()?.user.id;

        if (!usuarioId) {
            this.modal.setOpen(
                'Error con el usuario.',
                'Hubo un error al obtener el usuario actual. Por favor, cierre sesión y vuelva a ingresar.',
                'error'
            );
            return;
        }

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
     * Lleva al estado del pedido o a los juegos (punto 14), a la encuesta o a
     * pedir la cuenta (punto 19).
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
