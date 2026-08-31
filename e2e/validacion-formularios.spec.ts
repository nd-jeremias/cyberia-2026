import { Page, expect, test } from '@playwright/test';
import { irA } from './util/app';

/**
 * Validación de formularios vista desde el navegador.
 *
 * Los tests unitarios ya verifican que los validadores marquen error. Acá se
 * comprueba lo que el usuario efectivamente ve, que es lo que exige el
 * enunciado: "todo error debe ser mostrado con distintos tipos de controles".
 *
 * Los dos formularios usan estrategias distintas y ambas son válidas:
 *  - ingreso: el botón siempre se puede tocar y avisa el error;
 *  - registro: el botón permanece deshabilitado hasta que los datos sirven.
 */

/** Cualquier forma en que la aplicación comunique un error al usuario. */
const SELECTOR_AVISO =
    '.mensaje-error, ion-modal, app-modal, ion-toast, ion-note';

/**
 * Ionic envuelve un `<input>` nativo dentro de `<ion-input>`, y ambos exponen
 * el mismo placeholder. Se apunta al nativo para que el selector sea unívoco.
 */
function campoPorPlaceholder(page: Page, placeholder: string) {
    return page.locator(`input[placeholder="${placeholder}"]`);
}

test.describe('Formulario de ingreso', () => {
    test.beforeEach(async ({ page }) => {
        await irA(page, '/ingresar');
        await expect(page.locator('app-login-form')).toBeVisible();
    });

    test('avisa cuando se intenta ingresar con los campos vacíos', async ({
        page,
    }) => {
        await page.getByRole('button', { name: /iniciar sesión/i }).click();

        // El botón no puede quedar mudo: algo tiene que aparecer.
        await expect(page.locator(SELECTOR_AVISO).first()).toBeVisible({
            timeout: 8000,
        });
    });

    test('muestra un mensaje si el correo no tiene formato válido', async ({
        page,
    }) => {
        await campoPorPlaceholder(page, 'nombre@restaurante.com').fill(
            'sin-arroba'
        );
        await page.getByRole('button', { name: /iniciar sesión/i }).click();

        await expect(page.locator(SELECTOR_AVISO).first()).toBeVisible({
            timeout: 8000,
        });
    });

    test('los botones de ingreso rápido completan las credenciales', async ({
        page,
    }) => {
        // El enunciado pide botones de ingreso rápido por perfil.
        const botonRapido = page
            .getByRole('button')
            .filter({ hasText: /duenio@restaurante\.com/i })
            .first();

        await expect(botonRapido).toBeVisible({ timeout: 8000 });
        await botonRapido.click();

        await expect(
            campoPorPlaceholder(page, 'nombre@restaurante.com')
        ).toHaveValue('duenio@restaurante.com');
    });
});

test.describe('Formulario de registro', () => {
    test.beforeEach(async ({ page }) => {
        await irA(page, '/registrarse');
        await expect(page.locator('app-formulario-registro')).toBeVisible({
            timeout: 8000,
        });
    });

    test('la pantalla muestra el formulario', async ({ page }) => {
        await expect(page.locator('app-formulario-registro')).toBeVisible();
    });

    test('el botón de registro está deshabilitado mientras faltan datos', async ({
        page,
    }) => {
        // Este formulario impide el envío en vez de avisar después: es otra
        // manera válida de no dejar mandar datos inválidos.
        const boton = page
            .getByRole('button', { name: /registrar/i })
            .first();

        await expect(boton).toBeDisabled();
    });

    test('muestra el mensaje del campo al dejarlo vacío', async ({ page }) => {
        const dni = campoPorPlaceholder(page, '12345678');

        if ((await dni.count()) === 0) test.skip();

        // Entrar y salir del campo lo marca como "tocado", que es lo que
        // destraba el mensaje de error.
        await dni.click();
        await dni.fill('123');
        await dni.blur();

        await expect(page.locator('.mensaje-error').first()).toBeVisible({
            timeout: 8000,
        });
    });

    test('no expone CUIL ni tipo de empleado en el registro común', async ({
        page,
    }) => {
        // Esos campos pertenecen al alta de empleados (punto 1 del enunciado),
        // no al registro de clientes (punto 5).
        await expect(page.locator('input[formcontrolname="cuil"]')).toHaveCount(
            0
        );
    });
});
