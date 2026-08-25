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
    loadComponent: () => import('./pages/ingresar/ingresar.page').then( m => m.IngresarPage),
    canActivate: [guestGuard],
  },
  {
    path: 'home',
    loadComponent: () => import('./home/home.page').then((m) => m.HomePage),
    canActivate: [authGuard],
  },
  {
    path: 'registrarse',
    loadComponent: () => import('./pages/registrarse/registrarse.page').then( m => m.RegistrarsePage)
  }


];
