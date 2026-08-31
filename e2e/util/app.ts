import { Page, expect } from '@playwright/test';

/**
 * La aplicación abre una pantalla de presentación a pantalla completa durante
 * unos segundos, sin posibilidad de cerrarla tocando el fondo. Hasta que se
 * cierra, nada de lo que hay debajo es visible ni se puede tocar.
 *
 * Todo test que interactúe con la interfaz tiene que esperarla primero.
 */
const ESPERA_SPLASH = 15_000;

/** Abre una ruta y espera a que la pantalla de presentación se cierre. */
export async function irA(page: Page, ruta: string): Promise<void> {
    await page.goto(ruta);
    await esperarFinDelSplash(page);
}

/** Espera a que la pantalla de presentación termine su animación. */
export async function esperarFinDelSplash(page: Page): Promise<void> {
    const splash = page.locator('app-splash');

    // Si llegó a montarse, se aguarda a que desaparezca.
    if ((await splash.count()) > 0) {
        await expect(splash).toHaveCount(0, { timeout: ESPERA_SPLASH });
    }

    // El modal de Ionic tarda un instante más en desmontarse del DOM.
    await page
        .locator('ion-modal')
        .first()
        .waitFor({ state: 'detached', timeout: ESPERA_SPLASH })
        .catch(() => {
            // Si nunca hubo modal, no hay nada que esperar.
        });
}
