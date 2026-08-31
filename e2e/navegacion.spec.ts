import { expect, test } from '@playwright/test';
import { esperarFinDelSplash, irA } from './util/app';

/**
 * Recorrido de las pantallas públicas.
 *
 * Verifica que la aplicación arranque y que cada ruta cargue su componente sin
 * errores de consola. Es la red de seguridad más barata que existe: detecta
 * imports rotos, rutas mal declaradas y fallos de arranque, que son los errores
 * que dejan la aplicación inutilizable para todo el equipo.
 */

test.describe('Arranque de la aplicación', () => {
    test('muestra la pantalla de presentación con los integrantes', async ({
        page,
    }) => {
        await page.goto('/');

        // El enunciado exige una pantalla de presentación con los nombres.
        const presentacion = page.locator('app-splash');

        await expect(presentacion).toBeVisible();
        await expect(presentacion).toContainText('Plucci');
    });

    test('la raíz redirige a la pantalla de ingreso', async ({ page }) => {
        await irA(page, '/');

        await expect(page).toHaveURL(/\/ingresar/, { timeout: 15_000 });
    });

    test('no hay errores de consola al arrancar', async ({ page }) => {
        const errores: string[] = [];

        page.on('console', (mensaje) => {
            if (mensaje.type() === 'error') errores.push(mensaje.text());
        });
        page.on('pageerror', (error) => errores.push(error.message));

        await irA(page, '/ingresar');

        expect(errores).toEqual([]);
    });

    test('la pantalla de ingreso muestra el formulario', async ({ page }) => {
        await irA(page, '/ingresar');

        await expect(page.locator('app-login-form')).toBeVisible();
        // Ionic duplica el placeholder entre <ion-input> y el <input> nativo;
        // se apunta al nativo para que el selector sea unívoco.
        await expect(
            page.locator('input[placeholder="nombre@restaurante.com"]')
        ).toBeVisible();
    });
});

test.describe('Rutas públicas', () => {
    const RUTAS_PUBLICAS = ['/ingresar', '/registrarse'];

    for (const ruta of RUTAS_PUBLICAS) {
        test(`${ruta} carga sin fallar`, async ({ page }) => {
            const respuesta = await page.goto(ruta);

            expect(respuesta?.status()).toBeLessThan(400);

            await esperarFinDelSplash(page);

            // El shell de Ionic tiene que haberse montado.
            await expect(page.locator('ion-app')).toBeVisible();
        });
    }
});

test.describe('Protección de rutas', () => {
    // El enunciado exige que un usuario sin sesión no acceda a las pantallas
    // internas.
    const RUTAS_PRIVADAS = ['/home', '/alta-mesa', '/alta-producto'];

    for (const ruta of RUTAS_PRIVADAS) {
        test(`${ruta} redirige a ingresar si no hay sesión`, async ({
            page,
        }) => {
            await irA(page, ruta);

            await expect(page).toHaveURL(/\/ingresar/, { timeout: 15_000 });
        });
    }
});
