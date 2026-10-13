import { Component, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { IonContent } from '@ionic/angular';
import { HeaderComponent } from '../../components/header/header.component';
import { EstadoPedido, ItemNuevoPedido, PedidoInterface } from '../../interfaces/pedido.interface';
import { AuthService } from '../../services/auth.service';
import { ChartService } from '../../services/chart.service';
import { ModalService } from '../../services/modal.service';
import { PedidoService } from '../../services/pedido.service';
import { SalonService } from '../../services/salon.service';
import { SpinnerService } from '../../services/spinner.service';
import { formatearImporte } from '../../utils/importe';
import {
    LEYENDA_PAGANDO,
    LEYENDA_PEDIDO,
    puedeConfirmarRecepcion,
    puedeEnviarPedido,
} from './mi-pedido.estado';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { NotificacionesService } from '../../services/notificaciones.service';

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
    private spinner = inject(SpinnerService);
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
    puedeEnviar = computed(() => puedeEnviarPedido(this.pedidos().map((p) => p.estado)));

    /**
     * El borrador se muestra si se puede mandar, o si hay que corregir uno
     * rechazado (reenviarlo no es "otro" pedido). Con un pedido confirmado y
     * nada que corregir, lo que quedó en el carrito ya no se puede mandar.
     */
    mostrarBorrador = computed(() => this.hayBorrador() && (this.puedeEnviar() || this.rechazado()));

    /**
     * El pedido ya enviado se muestra sólo cuando no hay un borrador en
     * pantalla.
     *
     * Con un pedido rechazado pasaban las dos cosas a la vez: arriba lo que el
     * cliente está corrigiendo y abajo el pedido rechazado, con los mismos
     * productos repetidos. Lo que importa es lo que va a reenviar; el motivo ya
     * lo explica el aviso de arriba.
     */
    mostrarEnviados = computed(() => this.hayEnviados() && !this.mostrarBorrador());

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
                'Ya tenés un pedido',
                'Sólo se puede tener un pedido por visita. Seguí el tuyo desde esta misma pantalla.'
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
    /**
     * Cierra el envío y devuelve al cliente al inicio.
     *
     * Con el pedido mandado, esta pantalla ya no tiene nada que ofrecer: no se
     * puede armar otro (una visita, un pedido) y el seguimiento vive en
     * "Estado del pedido", que está en el inicio. `replaceUrl` saca "Mi
     * pedido" del historial, así el botón de atrás del teléfono no trae de
     * vuelta un carrito que ya se envió.
     */
    private async terminarEnvio(titulo: string, mensaje: string) {
        this.carrito.vaciarCarrito();

        await this.recargar();

        this.modal.setOpen(titulo, mensaje, 'info');

        void this.router.navigate(['/inicio'], { replaceUrl: true });
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

        const usuarioId = this.authService.session()?.user.id;

        // Punto 14: el mozo confirma desde otro teléfono. Cuando eso pasa, esta
        // pantalla ya no sirve —no se puede agregar nada más al pedido— así que
        // se lleva al cliente al inicio, donde están los accesos que sí puede
        // usar ahora (estado del pedido, juegos).
        if (usuarioId && !this.dejarDeEscuchar) {
            this.dejarDeEscuchar = this.pedidoService.escucharPedidosDelCliente(usuarioId, (estado) =>
                this.alCambiarUnPedido(estado)
            );
        }
    }

    ionViewWillLeave() {
        this.dejarDeEscuchar?.();
        this.dejarDeEscuchar = null;
    }

    private dejarDeEscuchar: (() => void) | null = null;

    private alCambiarUnPedido(estado: EstadoPedido) {
        // Los otros cambios de estado (rechazado, en preparación) se siguen
        // viendo acá mismo: sólo la confirmación cierra esta pantalla.
        if (estado !== 'Confirmado') {
            void this.recargar();
            return;
        }

        this.modal.setOpen('Pedido confirmado', 'El mozo confirmó tu pedido y ya pasó a cocina y barra.', 'info');

        // `replaceUrl` saca esta pantalla del historial: el botón de volver del
        // teléfono ya no trae de nuevo al pedido, que es lo que se quiere.
        void this.router.navigate(['/inicio'], { replaceUrl: true });
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
        this.spinner.show();

        try {
            this.pedidos.set(await this.pedidoService.pedidosActivosDelCliente(usuarioId));
        } catch (error) {
            const mensaje = error instanceof Error ? error.message : 'No se pudo consultar tu pedido.';

            this.modal.setOpen('Error', mensaje, 'error');
        } finally {
            this.cargando.set(false);
            this.spinner.hide();
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
}
