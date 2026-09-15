import { Component, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { IonContent, IonIcon } from '@ionic/angular';
import { HeaderComponent } from '../../components/header/header.component';
import { TarjetaListadoProductoComponent } from '../../components/tarjeta-listado-producto/tarjeta-listado-producto.component';
import { Producto, TipoProducto } from '../../interfaces/producto.interface';
import { PedidoInterface } from '../../interfaces/pedido.interface';
import { AuthService } from '../../services/auth.service';
import { ChartService } from '../../services/chart.service';
import { ModalService } from '../../services/modal.service';
import { PedidoService } from '../../services/pedido.service';
import { ProductosService } from '../../services/productos.service';
import { formatearImporte } from '../../utils/importe';
import { puedeEnviarOtroPedido } from '../mi-pedido/mi-pedido.estado';

/** Las tres solapas de la carta, en el orden en que se come. */
const SOLAPAS: { tipo: TipoProducto; etiqueta: string; icono: string }[] = [
    { tipo: 'Comida', etiqueta: 'Comidas', icono: 'restaurant-outline' },
    { tipo: 'Bebida', etiqueta: 'Bebidas', icono: 'wine-outline' },
    { tipo: 'Postre', etiqueta: 'Postres', icono: 'ice-cream-outline' },
];

/**
 * Carta y armado del pedido (puntos 11 y 12).
 *
 * La carta se trae entera en una sola consulta y se filtra por solapa en
 * pantalla: el cliente va y viene entre comidas, bebidas y postres mientras
 * arma el pedido, y no tiene sentido volver a la base en cada cambio.
 *
 * El pie queda fijo con el importe acumulado porque el enunciado pide que esté
 * visible en todo momento: si viviera al final de la lista, desaparecería
 * apenas el cliente empieza a recorrer la carta.
 *
 * Acá sólo se arma el pedido: el envío al mozo vive en "Mi pedido", que es
 * donde el cliente repasa lo elegido antes de mandarlo. Separarlo evita el
 * enredo de tener dos pantallas capaces de crear pedidos.
 *
 * Si el mozo rechazó un pedido, el carrito arranca con lo que ya había pedido
 * para poder corregirlo (punto 13).
 */
@Component({
    selector: 'app-carta',
    templateUrl: './carta.page.html',
    styleUrls: ['./carta.page.scss'],
    imports: [IonContent, IonIcon, HeaderComponent, TarjetaListadoProductoComponent],
})
export class CartaPage {
    private productosService = inject(ProductosService);
    private pedidoService = inject(PedidoService);
    private authService = inject(AuthService);
    private modal = inject(ModalService);
    private router = inject(Router);

    carrito = inject(ChartService);

    solapas = SOLAPAS;
    solapaActiva = signal<TipoProducto>('Comida');

    private productos = signal<Producto[]>([]);
    cargando = signal(true);

    /**
     * Pedido que el cliente ya tiene abierto en esta estadía, si hay alguno.
     *
     * De él salen los dos modos de la pantalla: si está rechazado se corrige;
     * si está en cualquier otro estado, no se puede pedir de nuevo encima.
     */
    pedidoEnCurso = signal<PedidoInterface | null>(null);

    /** Todos los pedidos de la visita que todavía no se pagaron. */
    private pedidosActivos = signal<PedidoInterface[]>([]);

    pedidoACorregir = computed(() =>
        this.pedidoEnCurso()?.estado === 'Rechazado' ? this.pedidoEnCurso() : null
    );

    corrigiendo = computed(() => this.pedidoACorregir() !== null);

    /**
     * Con un pedido ya confirmado no se arma otro: la comanda bajó a cocina.
     * Corregir uno rechazado sí se permite, porque no es un pedido nuevo.
     * Es la misma regla que aplica "Mi pedido", para que no se contradigan.
     */
    puedePedir = computed(
        () => this.corrigiendo() || puedeEnviarOtroPedido(this.pedidosActivos().map((p) => p.estado))
    );

    productosVisibles = computed(() =>
        this.productos().filter((p) => p.tipo === this.solapaActiva())
    );

    tituloListado = computed(
        () => this.solapas.find((s) => s.tipo === this.solapaActiva())?.etiqueta ?? 'Carta'
    );

    /** Unidades por producto, para que cada tarjeta muestre su contador. */
    cantidades = computed<Record<string, number>>(() => {
        const mapa: Record<string, number> = {};

        for (const item of this.carrito.carrito()) {
            mapa[item.id] = item.cantidad;
        }

        return mapa;
    });

    /** Unidades totales del pedido, para el pie. */
    unidades = computed(() =>
        this.carrito.carrito().reduce((suma, item) => suma + item.cantidad, 0)
    );

    hayPedido = computed(() => this.unidades() > 0);

    totalFormateado = computed(() => formatearImporte(this.carrito.total()));

    /** Cuántos productos tiene cada tipo, para rotular las solapas. */
    cantidadPorTipo = computed<Record<string, number>>(() => {
        const mapa: Record<string, number> = {};

        for (const producto of this.productos()) {
            mapa[producto.tipo] = (mapa[producto.tipo] ?? 0) + 1;
        }

        return mapa;
    });

    /** Cuántos productos tiene una solapa. */
    cuentaDe(tipo: TipoProducto): number {
        return this.cantidadPorTipo()[tipo] ?? 0;
    }

    async ionViewWillEnter() {
        // En secuencia y no en paralelo: la corrección necesita la carta ya
        // cargada para saber de qué tipo es cada producto del pedido viejo.
        await this.cargarCarta();
        await this.prepararCorreccion();
    }

    private async cargarCarta() {
        this.cargando.set(true);

        try {
            this.productos.set(await this.productosService.listarTodos());
        } catch (error) {
            const mensaje = error instanceof Error ? error.message : 'No se pudo cargar la carta.';

            this.modal.setOpen('Error', mensaje);
        } finally {
            this.cargando.set(false);
        }
    }

    /**
     * Si el cliente tiene un pedido rechazado, la pantalla pasa a modo
     * corrección y el carrito arranca con lo que ya había pedido: así puede
     * agregar, quitar o cambiar cantidades sobre eso (punto 13).
     */
    private async prepararCorreccion() {
        const clienteId = this.authService.session()?.user.id;

        if (!clienteId) return;

        const activos = await this.pedidoService.pedidosActivosDelCliente(clienteId);

        this.pedidosActivos.set(activos);

        // El rechazado se busca por estado y no tomando el último: con varios
        // pedidos en la visita, el que hay que corregir puede no ser el más nuevo.
        const pedido = activos.find((p) => p.estado === 'Rechazado') ?? null;
        const yaEstabaCorrigiendo = this.pedidoACorregir()?.id === pedido?.id;

        this.pedidoEnCurso.set(pedido);

        if (!pedido || pedido.estado !== 'Rechazado') return;

        // Ya se estaba corrigiendo: no se pisa lo que el cliente venía editando.
        if (yaEstabaCorrigiendo) return;
        this.carrito.reemplazar(
            pedido.detalles.map((detalle) => ({
                id: detalle.productoId,
                nombre: detalle.nombreProducto,
                precioUnitario: detalle.precioUnitario,
                precioTotal: detalle.precioUnitario * detalle.cantidad,
                tiempoElaboracionMinutos: detalle.tiempoElaboracionMinutos,
                tipo: this.tipoDelProducto(detalle.productoId),
                cantidad: detalle.cantidad,
            }))
        );
    }

    /** El tipo sale de la carta ya cargada; si no está, se asume comida. */
    private tipoDelProducto(productoId: string): TipoProducto {
        return this.productos().find((p) => p.id === productoId)?.tipo ?? 'Comida';
    }

    cambiarSolapa(tipo: TipoProducto) {
        this.solapaActiva.set(tipo);
    }

    agregar(producto: Producto) {
        if (!this.puedePedir()) {
            this.modal.setOpen(
                'Pedido ya confirmado',
                'Tu pedido ya pasó a cocina y barra. No se pueden agregar más productos en esta visita.'
            );

            return;
        }

        this.carrito.agregar(producto);
    }

    quitar(producto: Producto) {
        this.carrito.quitar(producto.id);
    }

    /** El envío se hace en "Mi pedido"; desde acá sólo se pasa a repasarlo. */
    irAlResumen() {
        this.router.navigate(['/mi-pedido']);
    }

}
