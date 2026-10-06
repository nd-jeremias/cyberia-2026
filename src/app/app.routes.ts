import { Routes } from '@angular/router';
import { authGuard, guestGuard } from './guards/auth.guard';

/**
 * Mapa de rutas de la aplicación.
 *
 * Todas las pantallas se cargan con `loadComponent`, es decir, de forma
 * diferida: el código de cada una se descarga recién cuando el usuario navega
 * hacia ella. En una aplicación móvil eso importa, porque acorta el arranque.
 *
 * Los guards controlan quién puede entrar:
 *  - `guestGuard`  evita que alguien con sesión abierta vuelva al login;
 *  - `authGuard`   exige sesión iniciada para las pantallas internas.
 */
export const routes: Routes = [
    // Sin ruta explícita se entra por el login.
    {
        path: '',
        redirectTo: 'ingresar',
        pathMatch: 'full',
    },
    // ---------------------------------------------------------------
    // Acceso: visibles sin sesión iniciada
    // ---------------------------------------------------------------
    {
        path: 'ingresar',
        loadComponent: () => import('./pages/ingresar/ingresar.page').then((m) => m.IngresarPage),
        canActivate: [guestGuard],
    },
    // ---------------------------------------------------------------
    // Pantalla principal, distinta según el perfil del usuario
    // ---------------------------------------------------------------
    {
        path: 'inicio',
        loadComponent: () => import('./home/home.page').then((m) => m.HomePage),
        canActivate: [authGuard],
    },
    {
        path: 'registrarse',
        loadComponent: () => import('./pages/registrarse/registrarse.page').then((m) => m.RegistrarsePage),
    },
    // Punto 9: el cliente escanea el QR de la puerta y entra a la lista de espera.
    {
        path: 'escanear-ingreso',
        loadComponent: () =>
            import('./pages/escanear-ingreso/escanear-ingreso.page').then((m) => m.EscanearIngresoPage),
        canActivate: [authGuard],
    },
    // Puntos 10 y 11: el cliente escanea el QR de su mesa y se sienta.
    {
        path: 'escanear-mesa',
        loadComponent: () => import('./pages/escanear-mesa/escanear-mesa.page').then((m) => m.EscanearMesaPage),
        canActivate: [authGuard],
    },
    // ---------------------------------------------------------------
    // Circuito del cliente sentado. Todas son armazones todavía: existen
    // para que los accesos del inicio lleven a algún lado y se pueda
    // recorrer el flujo completo mientras se completan una por una.
    // ---------------------------------------------------------------
    {
        path: 'carta',
        loadComponent: () => import('./pages/carta/carta.page').then((m) => m.CartaPage),
        canActivate: [authGuard],
    },
    {
        path: 'consulta-mozo',
        loadComponent: () => import('./pages/consulta-mozo/consulta-mozo.page').then((m) => m.ConsultaMozoPage),
        canActivate: [authGuard],
    },
    {
        path: 'estado-pedido',
        loadComponent: () => import('./pages/estado-pedido/estado-pedido.page').then((m) => m.EstadoPedidoPage),
        canActivate: [authGuard],
    },
    {
        path: 'estado-pedido/pedido',
        loadComponent: () => import('./pages/estado-pedido/pedido/pedido.page').then((m) => m.PedidoPage),
    },
    {
        path: 'juegos',
        loadComponent: () => import('./pages/juegos/juegos.page').then((m) => m.JuegosPage),
        canActivate: [authGuard],
    },
    {
        path: 'juegos/memoria',
        loadComponent: () => import('./pages/juegos/memoria/memoria.page').then((m) => m.MemoriaPage),
    },
    {
        path: 'juegos/preguntas',
        loadComponent: () => import('./pages/juegos/preguntas/preguntas.page').then((m) => m.PreguntasPage),
    },
    {
        path: 'juegos/mayor-menor',
        loadComponent: () => import('./pages/juegos/mayor-menor/mayor-menor.page').then((m) => m.MayorMenorPage),
    },
    {
        path: 'encuestas',
        loadComponent: () => import('./pages/encuestas/encuestas.page').then((m) => m.EncuestasPage),
        canActivate: [authGuard],
    },
    // Pantalla 1: Formulario puro
    {
        path: 'encuestas/completar',
        loadComponent: () =>
            import('./pages/encuestas/completar/completar.page').then((m) => m.CompletarPage),
        canActivate: [authGuard],
    },
    // Pantalla 2: Gráficos puros
    {
        path: 'encuestas/resultados',
        loadComponent: () =>
            import('./pages/encuestas/resultados/resultados.page').then((m) => m.ResultadosPage),
        canActivate: [authGuard],
    },
    {
        path: 'pedir-cuenta',
        loadComponent: () => import('./pages/pedir-cuenta/pedir-cuenta.page').then((m) => m.PedirCuentaPage),
        canActivate: [authGuard],
    },
    {
        path: 'pagar',
        loadComponent: () => import('./pages/pedir-cuenta/pagar/pagar.page').then((m) => m.PagarPage),
    },
    // El QR de una mesa, para imprimirlo y pegarlo sobre ella.
    {
        path: 'qr-mesa',
        loadComponent: () => import('./pages/qr-mesa/qr-mesa.page').then((m) => m.QrMesaPage),
        canActivate: [authGuard],
    },
    // Los cinco QR de propina, que el mozo le muestra al cliente (punto 21).
    {
        path: 'qr-propinas',
        loadComponent: () => import('./pages/qr-propinas/qr-propinas.page').then((m) => m.QrPropinasPage),
        canActivate: [authGuard],
    },
    // El QR de ingreso, para imprimirlo y pegarlo en la puerta.
    {
        path: 'qr-local',
        loadComponent: () => import('./pages/qr-local/qr-local.page').then((m) => m.QrLocalPage),
        canActivate: [authGuard],
    },
    // Punto 9: el cliente anónimo entra con nombre y foto, sin aprobación.
    {
        path: 'ingreso-anonimo',
        loadComponent: () => import('./pages/ingreso-anonimo/ingreso-anonimo.page').then((m) => m.IngresoAnonimoPage),
        // Con sesión abierta no tiene sentido: evita que un invitado que ya
        // entró se cree una segunda cuenta anónima y pierda su mesa.
        canActivate: [guestGuard],
    },
    // ---------------------------------------------------------------
    // Altas: puntos 2, 3 y 4 del enunciado
    // ---------------------------------------------------------------
    {
        path: 'alta-producto',
        loadComponent: () => import('./pages/alta-producto/alta-producto.page').then((m) => m.AltaProductoPage),
        canActivate: [authGuard],
    },
    // Puntos 6, 7 y 8: el dueño o supervisor aprueba o rechaza clientes.
    {
        path: 'gestion-clientes',
        loadComponent: () =>
            import('./pages/gestion-clientes/gestion-clientes.page').then((m) => m.GestionClientesPage),
    },
    {
        path: 'gestion-clientes/modificar',
        loadComponent: () => import('./pages/gestion-clientes/modificar/modificar.page').then((m) => m.ModificarPage),
    },
    {
        path: 'gestion-clientes/clientes-pendientes',
        loadComponent: () =>
            import('./pages/gestion-clientes/clientes-pendientes/clientes-pendientes.page').then(
                (m) => m.ClientesPendientesPage
            ),
        canActivate: [authGuard],
    },
    {
        path: 'gestion-productos',
        loadComponent: () =>
            import('./pages/gestion-productos/gestion-productos.page').then((m) => m.GestionProductosPage),
    },
    // ---------------------------------------------------------------
    // Operación diaria: mozo, metre y sectores
    // ---------------------------------------------------------------
    // Pedidos de cocina y barra (puntos 16 y 17). Por ahora muestra la misma
    // pantalla que el mozo, hasta que se implemente la vista de cada sector.
    {
        path: 'pedidos',
        loadComponent: () => import('./pages/pedidos/pedidos.page').then((m) => m.PedidosPage),
    },
    {
        path: 'gestion-empleados',
        loadComponent: () =>
            import('./pages/gestion-empleados/gestion-empleados.page').then((m) => m.GestionEmpleadosPage),
    },
    {
        path: 'gestion-empleados/alta',
        loadComponent: () =>
            import('./pages/gestion-empleados/alta-empleado/alta-empleado.page').then((m) => m.AltaEmpleadoPage),
    },
    {
        path: 'gestion-mesas',
        loadComponent: () => import('./pages/gestion-mesas/gestion-mesas.page').then((m) => m.GestionMesasPage),
    },
    {
        path: 'gestion-mesas/alta',
        loadComponent: () => import('./pages/gestion-mesas/alta-mesa/alta-mesa.page').then((m) => m.AltaMesaPage),
    },

    {
        path: 'consultas-clientes',
        loadComponent: () =>
            import('./pages/consultas-clientes/consultas-clientes.page').then((m) => m.ConsultasClientesPage),
    },
    // Puntos 13, 14 y 19: el mozo confirma, rechaza y entrega pedidos. Es la
    // ruta a la que lleva su botón "Pedidos de clientes" desde el inicio.
    {
        path: 'pedidos-clientes',
        loadComponent: () => import('./pages/pedidos/pedidos.page').then((m) => m.PedidosPage),
        canActivate: [authGuard],
    },
    // Puntos 13 a 15, del lado del cliente: estado de su pedido y acceso a los juegos.
    {
        path: 'mi-pedido',
        loadComponent: () => import('./pages/mi-pedido/mi-pedido.page').then((m) => m.MiPedidoPage),
        canActivate: [authGuard],
    },
    // Punto 10: el metre asigna una mesa a un cliente registrado.
    {
        path: 'asignar-mesas',
        loadComponent: () => import('./pages/asignar-mesas/asignar-mesas.page').then((m) => m.AsignarMesasPage),
    },
    {
        path: 'metre-registrar-cliente',
        loadComponent: () =>
            import('./pages/metre-registrar-cliente/metre-registrar-cliente.page').then(
                (m) => m.MetreRegistrarClientePage
            ),
    },
    //punto 16
    {
        path: 'pedidos-sector',
        loadComponent: () => import('./pages/pedidos-sector/pedidos-sector.page').then((m) => m.PedidosSectorPage),
    },
];
