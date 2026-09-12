import { PerfilUsuario } from '../interfaces/auth.interface';

export interface BotonHome {
    texto: string;
    icono: string;
    ruta: string;
}

// Botones compartidos por dueño y supervisor (mismos permisos en el enunciado).
const BOTONES_GESTION: BotonHome[] = [
    {
        texto: 'Gestión de empleados',
        icono: 'people-outline',
        ruta: '/gestion-empleados',
    },
    {
        texto: 'Gestión de mesas',
        icono: 'grid-outline',
        ruta: '/gestion-mesas',
    },
    {
        texto: 'Gestión de clientes',
        icono: 'person-circle-outline',
        ruta: '/gestion-clientes',
    },
    {
        texto: 'QR de ingreso al local',
        icono: 'qr-code-outline',
        ruta: '/qr-local',
    },
];

// Cocinero y cantinero comparten las mismas pantallas (el rol decide adentro
// si se gestionan platos o bebidas, y qué sector de pedidos se muestra).
const BOTONES_PEDIDOS: BotonHome[] = [
    {
        texto: 'Pedidos',
        icono: 'list-outline',
        ruta: '/pedidos',
    },
];

// Los dos perfiles de cliente comparten botones: anotarse en la lista de espera
// escaneando el QR de la puerta y, una vez sentados, seguir su pedido.
const BOTONES_CLIENTE: BotonHome[] = [
    {
        texto: 'Escanear QR de ingreso',
        icono: 'qr-code-outline',
        ruta: '/escanear-ingreso',
    },
    {
        texto: 'Mi pedido',
        icono: 'receipt-outline',
        ruta: '/mi-pedido',
    },
];

// Mapa único rol -> botones. Para agregar un botón nuevo alcanza con sumarlo
// al array del rol correspondiente, no hace falta tocar el HTML del home.
export const BOTONES_POR_ROL: Record<PerfilUsuario, BotonHome[]> = {
    dueño: BOTONES_GESTION,
    supervisor: BOTONES_GESTION,

    metre: [
        {
            texto: 'Asignar mesas',
            icono: 'easel-outline',
            ruta: '/asignar-mesas',
        },
        {
            texto: 'Registrar cliente',
            icono: 'person-add-outline',
            ruta: '/metre-registrar-cliente',
        },
    ],

    mozo: [
        {
            texto: 'Consultas de clientes',
            icono: 'chatbubbles-outline',
            ruta: '/consultas-clientes',
        },
        {
            texto: 'Pedidos de clientes',
            icono: 'receipt-outline',
            ruta: '/pedidos-clientes',
        },
    ],

    cocinero: [
        {
            texto: 'Gestión de platos',
            icono: 'restaurant-outline',
            ruta: '/gestion-productos',
        },
        ...BOTONES_PEDIDOS,
    ],

    cantinero: [
        {
            texto: 'Gestión de bebidas',
            icono: 'wine-outline',
            ruta: '/gestion-productos',
        },
        ...BOTONES_PEDIDOS,
    ],

    'cliente registrado': BOTONES_CLIENTE,
    'cliente anónimo': BOTONES_CLIENTE,
};
