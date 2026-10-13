import { EstadoEnResto, PerfilUsuario } from '../interfaces/auth.interface';
import { EstadoPedido } from '../interfaces/pedido.interface';
import { puedeAccederAJuegos, puedeUsarServiciosDeMesa } from '../pages/mi-pedido/mi-pedido.estado';

export interface BotonHome {
    texto: string;
    icono: string;
    ruta: string;
}

// Botones compartidos por dueño y supervisor (mismos permisos en el enunciado).
const BOTONES_GESTION: BotonHome[] = [
    {
        texto: 'Gestión de empleados',
        icono: 'users-viewfinder',
        ruta: '/gestion-empleados',
    },
    {
        texto: 'Gestión de mesas',
        icono: 'border-all',
        ruta: '/gestion-mesas',
    },
    {
        texto: 'Gestión de clientes',
        icono: 'circle-user',
        ruta: '/gestion-clientes',
    },
    {
        texto: 'QR de ingreso al local',
        icono: 'qrcode',
        ruta: '/qr-local',
    },
];

// Cocinero y cantinero comparten las mismas pantallas (el rol decide adentro
// si se gestionan platos o bebidas, y qué sector de pedidos se muestra).
const BOTONES_PEDIDOS: BotonHome[] = [
    {
        texto: 'Pedidos',
        icono: 'receipt',
        ruta: '/pedidos',
    },
];

/**
 * Accesos del cliente, según dónde esté en el circuito del local.
 * ============================================================================
 *
 * Para los empleados el rol alcanza: un cocinero ve siempre lo mismo. El
 * cliente no: es la MISMA pantalla de inicio, pero lo que puede hacer cambia a
 * medida que avanza, y el enunciado dice en qué momento se habilita cada cosa:
 *
 *   - punto 9  : sin mesa sólo puede anotarse en la lista de espera y mirar
 *                los resultados de las encuestas anteriores;
 *   - punto 10 : con la mesa asignada, escanear el QR de esa mesa;
 *   - punto 11 : con la mesa asignada se habilita la consulta al mozo, y
 *                sentado ya ve la carta;
 *   - punto 12 : recién con el pedido enviado puede seguir su estado;
 *   - puntos 14 y 15: los juegos se habilitan con el pedido confirmado, y sólo
 *                para el cliente registrado;
 *   - punto 19 : con el pedido recibido se habilitan la encuesta y la cuenta.
 *
 * Mostrar antes un botón que después rebota sería peor que no mostrarlo: el
 * cliente no sabría por qué no lo dejan entrar. Por eso los accesos se arman
 * con el estado en el local Y el estado de sus pedidos.
 */

const BOTON_ESCANEAR_INGRESO: BotonHome = {
    texto: 'Escanear QR de ingreso',
    icono: 'qrcode',
    ruta: '/escanear-ingreso',
};

const BOTON_ESCANEAR_MESA: BotonHome = {
    texto: 'Escanear QR de mi mesa',
    icono: 'qrcode',
    ruta: '/escanear-mesa',
};

/**
 * Recién terminada la visita, volver a escanear la mesa para comprobar que
 * quedó libre (punto 22). Ya no dice "mi mesa": se liberó al pagar.
 */
const BOTON_VERIFICAR_MESA: BotonHome = {
    texto: 'Escanear QR de la mesa',
    icono: 'qrcode',
    ruta: '/escanear-mesa',
};

const BOTON_CONSULTA_MOZO: BotonHome = {
    texto: 'Consulta al mozo',
    icono: 'comments',
    ruta: '/consulta-mozo',
};

const BOTON_CARTA: BotonHome = {
    texto: 'Carta',
    icono: 'receipt',
    ruta: '/carta',
};

const BOTON_ESTADO_PEDIDO: BotonHome = {
    texto: 'Estado del pedido',
    icono: 'hourglass-half',
    ruta: '/estado-pedido',
};

const BOTON_JUEGOS: BotonHome = {
    texto: 'Juegos',
    icono: 'gamepad',
    ruta: '/juegos',
};

/** Antes de la visita sólo se miran los resultados de encuestas anteriores. */
const BOTON_VER_ENCUESTAS: BotonHome = {
    texto: 'Ver encuestas',
    icono: 'chart-simple',
    ruta: '/encuestas',
};

/** Con el pedido recibido, la encuesta de esta visita (punto 20). */
const BOTON_RESPONDER_ENCUESTA: BotonHome = {
    texto: 'Responder la encuesta',
    icono: 'chart-simple',
    ruta: '/encuestas',
};

const BOTON_PEDIR_CUENTA: BotonHome = {
    texto: 'Pedir la cuenta',
    icono: 'cash-register',
    ruta: '/pedir-cuenta',
};

/** Todo lo que hace falta para saber qué puede hacer el cliente ahora mismo. */
export interface SituacionDelCliente {
    estado: EstadoEnResto;
    perfil: PerfilUsuario | null;
    /** Estados de los pedidos de esta visita (los que no están pagados). */
    estadosDePedidos: readonly EstadoPedido[];
    /** Pagó hace poco y todavía no pasó la ventana entre visitas (utils/visita.ts). */
    acabaDeTerminarSuVisita: boolean;
}

export function botonesDelCliente({
    estado,
    perfil,
    estadosDePedidos,
    acabaDeTerminarSuVisita,
}: SituacionDelCliente): BotonHome[] {
    // Punto 22: acaba de pagar y su visita terminó. Puede volver a escanear la
    // mesa para comprobar que quedó libre, y escanear el ingreso lo lleva a las
    // encuestas. Pasada la ventana entre visitas es un cliente libre más.
    if (estado === 'libre' && acabaDeTerminarSuVisita) {
        return [BOTON_VERIFICAR_MESA, BOTON_ESCANEAR_INGRESO, BOTON_VER_ENCUESTAS];
    }

    // Punto 9: sin mesa, anotarse y ver las encuestas anteriores. En la lista
    // de espera ya no hay nada que escanear: decide el metre.
    if (estado === 'libre') return [BOTON_ESCANEAR_INGRESO, BOTON_VER_ENCUESTAS];
    if (estado === 'esperando_mesa') return [BOTON_VER_ENCUESTAS];

    // Punto 10: le asignaron mesa pero todavía no se sentó. Punto 11: la
    // consulta al mozo se habilita al tener la mesa asignada.
    if (estado === 'mesa_asignada') return [BOTON_ESCANEAR_MESA, BOTON_CONSULTA_MOZO];

    // "Mi pedido" no está en el inicio a propósito: es el paso siguiente de la
    // carta (se repasa lo elegido y se envía), no un destino en sí mismo. Desde
    // el inicio se sigue el pedido ya enviado, que es otra cosa.
    const hayPedidoEnviado = estadosDePedidos.length > 0;
    const puedeJugar = estadosDePedidos.some((estadoPedido) => puedeAccederAJuegos(estadoPedido, perfil));

    // Punto 21: ya pidió la cuenta. Sigue su pedido y juega, pero no vuelve a
    // pedirla ni a cargar nada más.
    if (estado === 'pagando') {
        return [
            BOTON_ESTADO_PEDIDO,
            ...(puedeJugar ? [BOTON_JUEGOS] : []),
            BOTON_VER_ENCUESTAS,
        ];
    }

    // Sentado en su mesa: acá se va habilitando el resto a medida que avanza
    // el pedido.
    const serviciosDeMesa = estadosDePedidos.some((estadoPedido) => puedeUsarServiciosDeMesa(estadoPedido, estado));

    return [
        BOTON_CARTA,
        BOTON_CONSULTA_MOZO,
        ...(hayPedidoEnviado ? [BOTON_ESTADO_PEDIDO] : []),
        ...(puedeJugar ? [BOTON_JUEGOS] : []),
        ...(serviciosDeMesa ? [BOTON_RESPONDER_ENCUESTA, BOTON_PEDIR_CUENTA] : []),
    ];
}

// Mapa único rol -> botones. Para agregar un botón nuevo alcanza con sumarlo
// al array del rol correspondiente, no hace falta tocar el HTML del home.
export const BOTONES_POR_ROL: Record<PerfilUsuario, BotonHome[]> = {
    dueño: BOTONES_GESTION,
    supervisor: BOTONES_GESTION,

    metre: [
        {
            texto: 'Asignar mesas',
            icono: 'person-chalkboard',
            ruta: '/asignar-mesas',
        },
        {
            texto: 'Registrar cliente',
            icono: 'user-plus',
            ruta: '/metre-registrar-cliente',
        },
    ],

    mozo: [
        {
            texto: 'Consultas de clientes',
            icono: 'comment-dots',
            ruta: '/consultas-clientes',
        },
        {
            texto: 'Pedidos de clientes',
            icono: 'receipt',
            ruta: '/pedidos-clientes',
        },
        // Punto 21: el cliente sólo puede dejar propina escaneando uno de los
        // cinco códigos, y es el mozo quien se los muestra en la mesa.
        {
            texto: 'QR de propinas',
            icono: 'circle-dollar-to-slot',
            ruta: '/qr-propinas',
        },
    ],

    cocinero: [
        {
            texto: 'Gestión de platos',
            icono: 'utensils',
            ruta: '/gestion-productos',
        },
        // ...BOTONES_PEDIDOS,
        {
            texto: 'Pedidos de cocina', // <-- Mejor nombre
            icono: 'list-check',
            ruta: '/pedidos-sector',    // <-- Ruta a la nueva página
        },
    ],

    cantinero: [
        {
            texto: 'Gestión de bebidas',
            icono: 'wine-bottle',
            ruta: '/gestion-productos',
        },
        //...BOTONES_PEDIDOS,
        {
            texto: 'Pedidos de barra',
            icono: 'list-check',
            ruta: '/pedidos-sector', // <-- Ruta reutilizada
        },
    ],

    // Los accesos de los dos perfiles de cliente no salen de acá, sino de
    // BOTONES_CLIENTE_POR_ESTADO: dependen de su estado en el local.
    'cliente registrado': [],
    'cliente anónimo': [],
};
