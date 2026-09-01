import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

// Protege rutas que requieren sesión (ej. home): sin sesión, redirige a ingresar.
export const authGuard: CanActivateFn = async () => {
    const authService = inject(AuthService);
    const router = inject(Router);

    try {
        const session = await authService.restoreSession();
        if (session) return true;
    } catch {
        // Sesión inválida o error de red: se trata igual que "sin sesión"
    }

    return router.createUrlTree(['/ingresar']);
};

// Protege rutas de invitado (ej. ingresar): con sesión activa, redirige a home.
export const guestGuard: CanActivateFn = async () => {
    const authService = inject(AuthService);
    const router = inject(Router);

    try {
        const session = await authService.restoreSession();
        if (!session) return true;
    } catch {
        return true;
    }

    return router.createUrlTree(['/inicio']);
};
