import { EstadoEnResto, PerfilUsuario } from '../interfaces/auth.interface';

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
 * medida que avanza. Recién entrado sólo puede anotarse; con mesa asignada ya
 * no tiene sentido ofrecerle escanear otra vez el QR de la puerta.
 *
 * Por eso el cliente se resuelve por estado y no por perfil. `estado_en_resto`
 * lo cambian el propio cliente (al escanear) y el metre (al asignarle mesa),
 * así que los accesos se rearman solos cuando eso pasa.
 *
 * Los estados sin accesos todavía no tienen sus pantallas hechas: el inicio
 * muestra en qué situación está y qué sigue, en lugar de un botón que no
 * llevaría a ninguna parte.
 */
export const BOTONES_CLIENTE_POR_ESTADO: Record<EstadoEnResto, BotonHome[]> = {
    // Sin mesa: anotarse, y mirar los resultados de encuestas anteriores, que
    // es lo único a lo que el enunciado le da acceso antes de entrar (punto 9).
    libre: [
        {
            texto: 'Escanear QR de ingreso',
            icono: 'qrcode',
            ruta: '/escanear-ingreso',
        },
        {
            texto: 'Ver encuestas',
            icono: 'chart-simple',
            ruta: '/encuestas',
        },
    ],

    // En la sala de espera no hay nada que tocar: se espera al metre. El
    // cartel del inicio explica qué está pasando.
    esperando_mesa: [
        {
            texto: 'Ver encuestas',
            icono: 'chart-simple',
            ruta: '/encuestas',
        },
    ],

    // Ya tiene mesa: lo que sigue es escanear el código que está sobre ella.
    mesa_asignada: [
        {
            texto: 'Escanear QR de mi mesa',
            icono: 'qrcode',
            ruta: '/escanear-mesa',
        },
        {
            texto: 'Consulta al mozo',
            icono: 'comments',
            ruta: '/consulta-mozo',
        },
    ],

    // Sentado: el juego completo de accesos del boceto.
    sentado: [
        {
            texto: 'Carta',
            icono: 'receipt',
            ruta: '/carta',
        },
        {
            texto: 'Consulta al mozo',
            icono: 'comments',
            ruta: '/consulta-mozo',
        },
        {
            texto: 'Estado del pedido',
            icono: 'hourglass-half',
            ruta: '/estado-pedido',
        },
        {
            texto: 'Juegos',
            icono: 'gamepad',
            ruta: '/juegos',
        },
        {
            texto: 'Encuestas',
            icono: 'chart-simple',
            ruta: '/encuestas',
        },
        {
            texto: 'Pedir la cuenta',
            icono: 'cash-register',
            ruta: '/pedir-cuenta',
        },
    ],

    // Esperando que el mozo confirme el pago: puede seguir su pedido y jugar,
    // pero ya no tiene sentido volver a pedir la cuenta.
    pagando: [
        {
            texto: 'Estado del pedido',
            icono: 'hourglass-half',
            ruta: '/estado-pedido',
        },
        {
            texto: 'Juegos',
            icono: 'gamepad',
            ruta: '/juegos',
        },
        {
            texto: 'Encuestas',
            icono: 'chart-simple',
            ruta: '/encuestas',
        },
    ],
};

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
