import { defineConfig, devices } from '@playwright/test';

/**
 * Configuración de las pruebas de extremo a extremo (E2E).
 *
 * A diferencia de los tests unitarios, que verifican piezas aisladas, estos
 * levantan la aplicación real en un navegador y recorren la pantalla como lo
 * haría una persona.
 *
 * Se ejecutan con `npm run e2e`.
 */
export default defineConfig({
    testDir: './e2e',

    // Cada archivo corre en paralelo; los tests dentro de uno, en orden.
    fullyParallel: true,

    // En integración continua no se admiten tests marcados como "solo".
    forbidOnly: !!process.env['CI'],

    // Un reintento en CI absorbe fallos intermitentes de red o de arranque.
    retries: process.env['CI'] ? 1 : 0,

    reporter: process.env['CI'] ? 'list' : [['html', { open: 'never' }]],

    use: {
        baseURL: 'http://localhost:4200',

        // Sólo se guarda evidencia de lo que falla, para no llenar el disco.
        trace: 'on-first-retry',
        screenshot: 'only-on-failure',
        video: 'retain-on-failure',
    },

    projects: [
        {
            name: 'escritorio',
            use: { ...devices['Desktop Chrome'] },
        },
        {
            // La aplicación es móvil: conviene verificarla en ese tamaño.
            name: 'movil',
            use: { ...devices['Pixel 7'] },
        },
    ],

    // Playwright levanta la aplicación por su cuenta y espera a que responda.
    webServer: {
        command: 'npm start -- --port 4200',
        url: 'http://localhost:4200',
        reuseExistingServer: !process.env['CI'],
        timeout: 180 * 1000,
    },
});
