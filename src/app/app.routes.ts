import { Routes } from '@angular/router';
import { authGuard, guestGuard } from './guards/auth.guard';

export const routes: Routes = [
    {
        path: '',
        redirectTo: 'ingresar',
        pathMatch: 'full',
    },
    {
        path: 'ingresar',
        loadComponent: () => import('./pages/ingresar/ingresar.page').then((m) => m.IngresarPage),
        canActivate: [guestGuard],
    },
    {
        path: 'home',
        loadComponent: () => import('./home/home.page').then((m) => m.HomePage),
        canActivate: [authGuard],
    },
    {
        path: 'registrarse',
        loadComponent: () => import('./pages/registrarse/registrarse.page').then((m) => m.RegistrarsePage),
    },
    {
        path: 'ingreso-anonimo',
        loadComponent: () => import('./pages/ingreso-anonimo/ingreso-anonimo.page').then((m) => m.IngresoAnonimoPage),
    },
    {
        path: 'alta-producto',
        loadComponent: () => import('./pages/alta-producto/alta-producto.page').then((m) => m.AltaProductoPage),
        canActivate: [authGuard],
    },
    {
        path: 'alta-mesa',
        loadComponent: () => import('./pages/alta-mesa/alta-mesa.page').then((m) => m.AltaMesaPage),
        canActivate: [authGuard],
    },
    {
        path: 'clientes-pendientes',
        loadComponent: () =>
            import('./pages/clientes-pendientes/clientes-pendientes.page').then((m) => m.ClientesPendientesPage),
        canActivate: [authGuard],
    },
    {
        path: 'gestion-productos',
        loadComponent: () =>
            import('./pages/gestion-productos/gestion-productos.page').then((m) => m.GestionProductosPage),
    },
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
        path: 'gestion-mesas',
        loadComponent: () => import('./pages/gestion-mesas/gestion-mesas.page').then((m) => m.GestionMesasPage),
    },
    {
        path: 'gestion-clientes',
        loadComponent: () =>
            import('./pages/gestion-clientes/gestion-clientes.page').then((m) => m.GestionClientesPage),
    },
    {
        path: 'consultas-clientes',
        loadComponent: () =>
            import('./pages/consultas-clientes/consultas-clientes.page').then((m) => m.ConsultasClientesPage),
    },
    {
        path: 'pedidos-clientes',
        loadComponent: () =>
            import('./pages/pedidos-clientes/pedidos-clientes.page').then((m) => m.PedidosClientesPage),
    },
    {
        path: 'asignar-mesas',
        loadComponent: () => import('./pages/asignar-mesas/asignar-mesas.page').then((m) => m.AsignarMesasPage),
    },
];
