import { PerfilUsuario } from '../interfaces/auth.interface';

export interface BotonHome {
    texto: string;
    icono: string;
    ruta: string;

    /**
     * Renglón de apoyo que se muestra bajo el título en la pantalla de inicio.
     *
     * No cambia el comportamiento de nada: es contenido. Está para que cada
     * acceso ocupe el alto de una tarjeta y explique qué hace, en lugar de ser
     * un renglón suelto. Sin él la pantalla de inicio quedaba con dos o tres
     * botones arriba y media pantalla vacía abajo, que es justo lo que el
     * enunciado no admite ("NO debe haber espacios neutros").
     */
    descripcion?: string;
}

// Botones compartidos por dueño y supervisor (mismos permisos en el enunciado).
const BOTONES_GESTION: BotonHome[] = [
    {
        texto: 'Gestión de empleados',
        icono: 'people-outline',
        ruta: '/gestion-empleados',
        descripcion: 'Dar de alta al personal del local y asignarle su perfil',
    },
    {
        texto: 'Gestión de mesas',
        icono: 'grid-outline',
        ruta: '/gestion-mesas',
        descripcion: 'Crear mesas, definir su tipo y generar el código QR',
    },
    {
        texto: 'Gestión de clientes',
        icono: 'person-circle-outline',
        ruta: '/gestion-clientes',
        descripcion: 'Aprobar o rechazar las solicitudes de registro',
    },
];

// Cocinero y cantinero comparten las mismas pantallas (el rol decide adentro
// si se gestionan platos o bebidas, y qué sector de pedidos se muestra).
const BOTONES_PEDIDOS: BotonHome[] = [
    {
        texto: 'Pedidos',
        icono: 'list-outline',
        ruta: '/pedidos',
        descripcion: 'Ver los pedidos pendientes del sector y marcarlos listos',
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
            descripcion: 'Ubicar a los clientes de la lista de espera en una mesa',
        },
        {
            texto: 'Registrar cliente',
            icono: 'person-add-outline',
            ruta: '/metre-registrar-cliente',
            descripcion: 'Cargar un cliente nuevo desde el mostrador',
        },
    ],

    mozo: [
        {
            texto: 'Consultas de clientes',
            icono: 'chatbubbles-outline',
            ruta: '/consultas-clientes',
            descripcion: 'Responder las consultas que llegan desde las mesas',
        },
        {
            texto: 'Pedidos de clientes',
            icono: 'receipt-outline',
            ruta: '/pedidos-clientes',
            descripcion: 'Confirmar, rechazar y entregar los pedidos del salón',
        },
    ],

    cocinero: [
        {
            texto: 'Gestión de platos',
            icono: 'restaurant-outline',
            ruta: '/gestion-productos',
            descripcion: 'Cargar platos nuevos con sus fotos, precio y tiempo',
        },
        ...BOTONES_PEDIDOS,
    ],

    cantinero: [
        {
            texto: 'Gestión de bebidas',
            icono: 'wine-outline',
            ruta: '/gestion-productos',
            descripcion: 'Cargar bebidas nuevas con sus fotos, precio y tiempo',
        },
        ...BOTONES_PEDIDOS,
    ],

    // Pendiente de definir (ver bocetos de pantallas de cliente): por ahora
    // sin botones propios en este home compartido.
    'cliente registrado': [],
    'cliente anónimo': [],
};
