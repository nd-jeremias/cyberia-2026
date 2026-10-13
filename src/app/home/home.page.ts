import { Component, ElementRef, computed, effect, inject, signal, viewChild } from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { RouterLink } from '@angular/router';
import { IonContent } from '@ionic/angular';
import { AuthService } from '../services/auth.service';
import { MesaService } from '../services/mesa.service';
import { PedidoService } from '../services/pedido.service';
import { EstadoPedido } from '../interfaces/pedido.interface';
import { BOTONES_POR_ROL, BotonHome, botonesDelCliente } from './home-botones.config';
import { SalonService } from '../services/salon.service';
import { EstadoEnResto } from '../interfaces/auth.interface';
import { HeaderComponent } from '../components/header/header.component';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { FooterComponent } from '../components/footer/footer.component';

/** Una ficha del mapa: el número de mesa y si está en verde o en naranja. */
interface FichaMapa {
    numero: number;
    enVerde: boolean;
}

/** El panel de estado, ya resuelto para el rol que entró. */
interface PanelEstado {
    titulo: string;
    cifras: { valor: number; rotulo: string; tono: 'verde' | 'naranja' | 'neutro' }[];
    fichas: FichaMapa[];
    /** Qué decir cuando no hay nada que mostrar: "sin pedidos" también informa. */
    vacio: string;
    leyendaVerde: string;
    leyendaNaranja: string;
}

// Los dos perfiles de cliente: sus accesos salen del estado, no del rol.
const ROLES_CLIENTE = ['cliente registrado', 'cliente anónimo'];

/** Qué le dice el inicio al cliente en cada tramo del circuito. */
const SITUACION_CLIENTE: Record<EstadoEnResto, { titulo: string; detalle: string }> = {
    libre: {
        titulo: 'Todavía no pediste mesa',
        detalle: 'Escaneá el código QR de la entrada para anotarte en la lista de espera.',
    },
    esperando_mesa: {
        titulo: 'Estás en la lista de espera',
        detalle: 'El metre te va a asignar una mesa. Esta pantalla se actualiza sola cuando pase.',
    },
    mesa_asignada: {
        titulo: 'Ya tenés mesa',
        detalle: 'Acercate a tu mesa y escaneá su código QR para ver la carta.',
    },
    sentado: {
        titulo: 'Estás en tu mesa',
        detalle: 'Desde acá podés ver la carta, consultar al mozo y seguir tu pedido.',
    },
    pagando: {
        titulo: 'Pediste la cuenta',
        detalle: 'Esperá la confirmación del mozo para terminar tu visita.',
    },
};

// Quiénes miran el salón y quiénes su sector de producción.
const ROLES_SALON = ['dueño', 'supervisor', 'metre', 'mozo'];
const ROLES_SECTOR = ['cocinero', 'cantinero'];

// Un pedido "en curso" es el que ya se confirmó y todavía no se entregó.
const PEDIDOS_EN_CURSO: EstadoPedido[] = ['Confirmado', 'En Preparación', 'Listo para Entregar'];

/**
 * Medidas del reel de accesos. Tienen que coincidir con home.page.scss
 * (`$alto-acceso` y `$separacion`): son las mismas dos cifras, pero el
 * reparto en pantallas se hace acá porque el CSS no sabe contar elementos.
 */
const ALTO_ACCESO = 100;
const SEPARACION_ACCESO = 12;

/**
 * Alto del panel de estado cuando comparte pantalla con los accesos.
 *
 * Coincide con `$alto-maximo-panel` de la hoja: el panel comparte pantalla
 * sólo si entra ENTERO. Apretado no sirve —se ve el título y poco más—, así
 * que en ese caso es preferible darle una pantalla propia.
 */
const ALTO_PANEL = 240;

/**
 * Pantalla de inicio.
 *
 * Lista los accesos del rol y, debajo, un panel con el estado de lo que a ese
 * rol le importa: el mapa del salón para quien lo atiende, y los pedidos en
 * curso para cocina y barra. Es el patrón de las aplicaciones de restaurante
 * (Toast, TouchBistro, Square): la pantalla principal muestra las mesas.
 *
 * El saludo, la foto y el perfil viven en `app-header` (modo 'usuario').
 */
@Component({
    selector: 'app-home',
    templateUrl: 'home.page.html',
    styleUrls: ['home.page.scss'],
    imports: [FaIconComponent, IonContent, NgTemplateOutlet, RouterLink, HeaderComponent, FooterComponent],
})
export class HomePage {
    /**
     * El área de accesos que se desplaza.
     *
     * Hace falta por una sola cosa: medir su alto. De esa medida sale cuántos
     * accesos entran en una pantalla, que es lo único que el CSS no puede
     * averiguar solo.
     */
    private lista = viewChild<ElementRef<HTMLElement>>('lista');

    authService = inject(AuthService);
    private mesaService = inject(MesaService);
    private pedidoService = inject(PedidoService);
    private salonService = inject(SalonService);

    esCliente = computed(() => {
        const perfil = this.authService.perfil();

        return perfil ? ROLES_CLIENTE.includes(perfil) : false;
    });

    /** Tramo del circuito en el que está el cliente. */
    estadoCliente = computed<EstadoEnResto>(() => this.salonService.situacion()?.estado ?? 'libre');

    /**
     * Accesos de la pantalla.
     *
     * Para los empleados salen del rol; para el cliente, de su estado en el
     * local. Es la misma pantalla de inicio: lo que cambia es lo que puede
     * hacer según dónde esté en el circuito.
     */
    botonesDelRol = computed(() => {
        const perfil = this.authService.perfil();

        if (!perfil) return [];

        if (!this.esCliente()) return BOTONES_POR_ROL[perfil];

        // El cliente no se resuelve sólo por su estado en el local: los juegos,
        // la encuesta y la cuenta dependen de en qué anda su pedido.
        return botonesDelCliente({
            estado: this.estadoCliente(),
            perfil,
            estadosDePedidos: this.estadosDePedidos(),
            acabaDeTerminarSuVisita: this.salonService.acabaDeTerminarSuVisita(),
        });
    });

    /**
     * Alto del área que se desplaza, en píxeles. 0 mientras no se midió.
     *
     * Lo publica el efecto del constructor y lo vuelve a publicar cada vez que
     * cambia: girar el teléfono, agrandar la letra del sistema, o aparecer y
     * desaparecer el cartel de situación del cliente.
     */
    private altoLista = signal(0);

    /**
     * ¿El panel de estado comparte pantalla con los accesos?
     *
     * El panel está para llenar el hueco que dejan los roles con pocos accesos
     * (cocinero, cantinero, metre). Pero cuando los accesos ya ocupan buena
     * parte de la pantalla, meterlo igual lo deja apretado contra el borde: ahí
     * conviene darle una pantalla propia, que es lo que se ve bien en mozo
     * (3 accesos) y en dueño y supervisor (4).
     *
     * Las dos condiciones dicen justamente eso:
     *
     *   - a los accesos les tiene que sobrar al menos media pantalla, y
     *   - lo que sobre le tiene que alcanzar al panel ENTERO.
     */
    panelComparte = computed(() => {
        const alto = this.altoLista();

        if (!alto || !this.panel()) return false;

        const cantidad = this.botonesDelRol().length;

        // Sin accesos no hay nada con qué competir: el panel llena la pantalla.
        if (cantidad === 0) return true;

        const altoAccesos = cantidad * ALTO_ACCESO + (cantidad - 1) * SEPARACION_ACCESO;

        return altoAccesos <= alto / 2 && alto - altoAccesos - SEPARACION_ACCESO >= ALTO_PANEL;
    });

    /**
     * Cuántos accesos entran en una pantalla.
     *
     * Si el panel comparte pantalla hay que descontarle su lugar; si tiene
     * pantalla propia, los accesos se quedan con todo el alto.
     *
     * `floor` y no `round`: el que no entra entero va a la pantalla siguiente,
     * que es lo que evita que quede uno asomando abajo. El mínimo es 1 para que
     * la cuenta siga teniendo sentido en una pantalla muy baja (teclado
     * abierto, por ejemplo).
     *
     * Devuelve 0 mientras no haya medida: ahí todavía no se puede repartir.
     */
    private accesosPorPantalla = computed(() => {
        const alto = this.altoLista();

        if (!alto) return 0;

        const reserva = this.panelComparte() ? ALTO_PANEL + SEPARACION_ACCESO : 0;

        // La última fila no lleva separación debajo, por eso se le suma una al
        // alto antes de dividir.
        return Math.max(1, Math.floor((alto - reserva + SEPARACION_ACCESO) / (ALTO_ACCESO + SEPARACION_ACCESO)));
    });

    /**
     * Los accesos repartidos en pantallas, para el desplazamiento tipo reel.
     *
     * Partir la lista en el código es lo único que garantiza que una pantalla
     * nunca corte un acceso por la mitad: el CSS puede fijar el alto, pero no
     * sabe dónde termina un grupo y empieza el otro.
     *
     * El reparto recorre TODOS los accesos y no descarta ninguno: la última
     * pantalla queda incompleta si sobran lugares, y eso está bien.
     */
    paginasDeAccesos = computed<BotonHome[][]>(() => {
        const botones = this.botonesDelRol();

        // Una pantalla vacía y no ninguna: ahí va el cartel que explica por qué
        // este perfil no tiene accesos, y con ella el panel de estado sigue
        // teniendo dónde apoyarse.
        if (botones.length === 0) return [[]];

        const porPantalla = this.accesosPorPantalla();

        // Sin medida todavía: una sola pantalla con todo. Repartir con un
        // número inventado haría parpadear la lista en el primer cuadro.
        if (!porPantalla) return [botones];

        const pantallas: BotonHome[][] = [];

        for (let desde = 0; desde < botones.length; desde += porPantalla) {
            pantallas.push(botones.slice(desde, desde + porPantalla));
        }

        return pantallas;
    });

    /** Hay al menos un acceso dibujado (y no sólo el cartel de "sin accesos"). */
    hayAccesos = computed(() => this.botonesDelRol().length > 0);

    // --- Indicador de deslizar ------------------------------------------------
    //
    // Un reel no avisa que hay más abajo: la pantalla entra justa y nada asoma,
    // que es lo que se buscaba, pero también lo que lo deja oculto. La flecha es
    // la única pista de que el gesto existe.

    /** Queda pantalla hacia abajo. */
    puedeBajar = signal(false);

    /** Ya se bajó: hay pantalla hacia arriba. */
    puedeSubir = signal(false);

    /**
     * Mira dónde está parado el desplazamiento.
     *
     * El margen de 8px es por los redondeos del navegador: al final del todo,
     * `scrollTop + clientHeight` queda a una fracción de píxel de `scrollHeight`
     * y sin ese margen la flecha de abajo nunca se apagaba.
     */
    private revisarDesplazamiento(): void {
        const lista = this.lista()?.nativeElement;

        if (!lista) return;

        const margen = 8;

        this.puedeSubir.set(lista.scrollTop > margen);
        this.puedeBajar.set(lista.scrollTop + lista.clientHeight < lista.scrollHeight - margen);
    }

    alDesplazar(): void {
        this.revisarDesplazamiento();
    }

    /** Estados de los pedidos de la visita, para decidir qué accesos mostrar. */
    private estadosDePedidos = signal<EstadoPedido[]>([]);

    /** Cartel de situación del cliente, con la mesa si ya la tiene. */
    situacionCliente = computed(() => {
        if (!this.esCliente()) return null;

        const mesaId = this.salonService.situacion()?.mesaId ?? null;
        const mesa = mesaId ? this.mesaService.mesas().find((m) => m.id === mesaId) ?? null : null;

        return {
            ...SITUACION_CLIENTE[this.estadoCliente()],
            numeroMesa: mesa?.numeroMesa ?? null,
        };
    });

    private tipoPanel = computed(() => {
        const perfil = this.authService.perfil();

        if (!perfil) return null;
        if (ROLES_SALON.includes(perfil)) return 'salon' as const;

        return ROLES_SECTOR.includes(perfil) ? ('sector' as const) : null;
    });

    /**
     * Devuelve null sólo mientras carga: una vez que hay respuesta el panel se
     * dibuja igual aunque venga vacío, porque "no hay pedidos en curso" también
     * es información útil, y es justo cuando se mira la pantalla.
     */
    panel = computed<PanelEstado | null>(() => {
        const tipo = this.tipoPanel();
        if (!tipo) return null;

        if (tipo === 'salon') {
            const mesas = this.mesaService.mesas();
            if (mesas.length === 0 && this.mesaService.cargando()) return null;

            // "Ocupadas" cuenta todo lo que no está libre (incluidas las
            // reservadas): así las tres cifras suman y coinciden con el mapa,
            // donde el naranja significa "no se puede sentar a nadie".
            const libres = this.mesaService.disponibles().length;

            return {
                titulo: 'Estado del salón',
                cifras: [
                    { valor: libres, rotulo: 'Libres', tono: 'verde' },
                    { valor: mesas.length - libres, rotulo: 'Ocupadas', tono: 'naranja' },
                    { valor: mesas.length, rotulo: 'Mesas en total', tono: 'neutro' },
                ],
                fichas: mesas.map((mesa) => ({
                    numero: mesa.numeroMesa,
                    enVerde: mesa.disponibilidad === 'Disponible',
                })),
                vacio: 'Todavía no hay mesas cargadas.',
                leyendaVerde: 'Libre',
                leyendaNaranja: 'Ocupada',
            };
        }

        const pedidos = this.pedidoService.pedidos();
        if (pedidos.length === 0 && this.pedidoService.cargando()) return null;

        const listos = this.pedidoService.listosParaEntregar().length;

        return {
            titulo: 'Pedidos en curso',
            cifras: [
                { valor: pedidos.length - listos, rotulo: 'En preparación', tono: 'naranja' },
                { valor: listos, rotulo: 'Listos', tono: 'verde' },
                { valor: pedidos.length, rotulo: 'En curso', tono: 'neutro' },
            ],
            fichas: pedidos.map((pedido) => ({
                numero: pedido.numeroMesa,
                enVerde: pedido.estado === 'Listo para Entregar',
            })),
            vacio: 'No hay pedidos en curso: el sector está al día.',
            leyendaVerde: 'Listo',
            leyendaNaranja: 'En preparación',
        };
    });

    constructor() {
        // Mide el área de accesos, y la vuelve a medir cada vez que cambia
        // (girar el teléfono, cambiar la letra del sistema, aparecer o
        // desaparecer el cartel de situación del cliente).
        effect((alLimpiar) => {
            const lista = this.lista()?.nativeElement;

            if (!lista) return;

            // Medir no puede provocar un bucle: `.lista-accesos` es `flex: 1`
            // dentro de una columna de alto fijo, así que su alto lo decide la
            // pantalla y no lo que tenga adentro. Repartir los accesos de nuevo
            // nunca la hace crecer.
            const medir = () => {
                this.altoLista.set(lista.clientHeight);
                this.revisarDesplazamiento();
            };
            const observador = new ResizeObserver(medir);

            observador.observe(lista);
            medir();

            alLimpiar(() => observador.disconnect());
        });

        // Las pantallas cambian cuando llega el perfil o cuando el cliente
        // avanza en el circuito, y ahí la flecha puede tener que aparecer o
        // desaparecer. El `setTimeout` espera a que Angular haya dibujado: antes
        // de eso `scrollHeight` todavía es el de las pantallas viejas.
        effect(() => {
            this.paginasDeAccesos();
            this.panelComparte();

            setTimeout(() => this.revisarDesplazamiento(), 0);
        });

        // El perfil llega después de la sesión, así que la carga espera a
        // conocerlo. La bandera evita repetir el pedido en cada recálculo.
        let yaPedido = false;

        effect(() => {
            const tipo = this.tipoPanel();
            if (!tipo || yaPedido) return;

            yaPedido = true;

            if (tipo === 'salon') this.mesaService.listar();
            else this.pedidoService.listar(PEDIDOS_EN_CURSO);
        });

        // El cliente necesita su situación y, sobre todo, quedar escuchando:
        // el metre le asigna la mesa desde otro teléfono, y sin esto la
        // pantalla se quedaría mostrando "esperando mesa" para siempre.
        let yaEscucha = false;

        effect(() => {
            if (!this.esCliente() || yaEscucha) return;

            const usuarioId = this.authService.session()?.user.id;
            if (!usuarioId) return;

            yaEscucha = true;

            void this.salonService.cargarSituacion(usuarioId);
            this.salonService.escucharSituacion(usuarioId);

            // Para poder mostrarle el número de su mesa cuando se la asignen.
            this.mesaService.listar();

            void this.cargarPedidosDelCliente(usuarioId);
        });
    }

    /**
     * Vuelve a mirar los pedidos al entrar al inicio.
     *
     * Ionic mantiene viva la pantalla, así que al volver de la carta o de "Mi
     * pedido" este es el momento en el que los accesos se rearman: el cliente
     * mandó su pedido, o el mozo se lo confirmó mientras estaba en otra
     * pantalla.
     */
    ionViewWillEnter() {
        const usuarioId = this.authService.session()?.user.id;

        if (this.esCliente() && usuarioId) void this.cargarPedidosDelCliente(usuarioId);
    }

    private async cargarPedidosDelCliente(usuarioId: string) {
        try {
            const pedidos = await this.pedidoService.pedidosActivosDelCliente(usuarioId);

            this.estadosDePedidos.set(pedidos.map((pedido) => pedido.estado));
        } catch (error) {
            // Un fallo acá no puede dejar la pantalla en blanco: se muestran
            // los accesos básicos del estado en el que está.
            console.error('No se pudieron consultar los pedidos del cliente', error);
        }
    }

    ngOnDestroy() {
        void this.salonService.dejarDeEscuchar();
    }
}
