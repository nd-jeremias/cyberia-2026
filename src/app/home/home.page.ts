import { Component, computed, effect, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { IonContent } from '@ionic/angular';
import { AuthService } from '../services/auth.service';
import { MesaService } from '../services/mesa.service';
import { PedidoService } from '../services/pedido.service';
import { EstadoPedido } from '../interfaces/pedido.interface';
import { BOTONES_CLIENTE_POR_ESTADO, BOTONES_POR_ROL } from './home-botones.config';
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
    imports: [FaIconComponent, IonContent, RouterLink, HeaderComponent, FooterComponent],
})
export class HomePage {
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

        return this.esCliente() ? BOTONES_CLIENTE_POR_ESTADO[this.estadoCliente()] : BOTONES_POR_ROL[perfil];
    });

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
        });
    }

    ngOnDestroy() {
        void this.salonService.dejarDeEscuchar();
    }
}
