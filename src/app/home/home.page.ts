import { Component, computed, effect, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { IonContent, IonIcon } from '@ionic/angular';
import { AuthService } from '../services/auth.service';
import { MesaService } from '../services/mesa.service';
import { PedidoService } from '../services/pedido.service';
import { EstadoPedido } from '../interfaces/pedido.interface';
import { BOTONES_POR_ROL } from './home-botones.config';
import { HeaderComponent } from '../components/header/header.component';

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

// Quiénes miran el salón y quiénes su sector de producción.
const ROLES_SALON = ['dueño', 'supervisor', 'metre', 'mozo'];
const ROLES_SECTOR = ['cocinero', 'cantinero'];

// Un pedido "en curso" es el que ya se confirmó y todavía no se entregó.
const PEDIDOS_EN_CURSO: EstadoPedido[] = [
    'Confirmado',
    'En Preparación',
    'Listo para Entregar',
];

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
    imports: [IonContent, IonIcon, RouterLink, HeaderComponent],
})
export class HomePage {
    authService = inject(AuthService);
    private mesaService = inject(MesaService);
    private pedidoService = inject(PedidoService);

    // Se recalcula solo cuando cambia el perfil (login/logout/refresh de sesión).
    botonesDelRol = computed(() => {
        const perfil = this.authService.perfil();
        return perfil ? BOTONES_POR_ROL[perfil] : [];
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
    }
}
