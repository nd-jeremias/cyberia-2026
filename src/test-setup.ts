/**
 * Preparación del entorno de pruebas unitarias.
 *
 * Los tests corren sobre jsdom, que implementa sólo una parte de las APIs del
 * navegador. Acá se completan las piezas que los componentes de Ionic dan por
 * sentadas; sin esto, componentes perfectamente correctos fallarían por
 * limitaciones del entorno y no por errores propios.
 */

// ---------------------------------------------------------------------------
// matchMedia
// ---------------------------------------------------------------------------
// Componentes como ion-menu e ion-split-pane consultan `window.matchMedia`
// para decidir su modo de presentación. jsdom no lo implementa.
if (!window.matchMedia) {
    window.matchMedia = (query: string): MediaQueryList =>
        ({
            matches: false,
            media: query,
            onchange: null,
            addListener: () => undefined,
            removeListener: () => undefined,
            addEventListener: () => undefined,
            removeEventListener: () => undefined,
            dispatchEvent: () => false,
        }) as MediaQueryList;
}

// ---------------------------------------------------------------------------
// Ionicons
// ---------------------------------------------------------------------------
// ion-icon resuelve la ruta de cada SVG contra la URL base del documento. En
// jsdom esa base no es una URL valida y la construccion falla con
// "Invalid URL", tumbando la corrida entera.
//
// Registrando cada nombre con datos SVG en linea, ion-icon los toma del
// registro y nunca intenta resolver una ruta. Los tests verifican
// comportamiento, no el dibujo del icono, asi que alcanza con un SVG vacio.
import { addIcons } from 'ionicons';
import { setAssetPath } from 'ionicons/components';
import { setAssetPath as setAssetPathIonic } from '@ionic/core/components';

// Stencil construye cada ruta con `new URL(ruta, base)`. Si la base no es
// una URL absoluta valida, la llamada lanza. Se fija una base concreta.
setAssetPath('http://localhost/');
setAssetPathIonic('http://localhost/');

const SVG_VACIO = '<svg xmlns="http://www.w3.org/2000/svg"></svg>';

const NOMBRES_ICONOS = [
    'briefcase-outline',
    'camera',
    'card-outline',
    'cart-outline',
    'checkmark-circle',
    'chevron-back-outline',
    'chevron-forward-outline',
    'close-circle',
    'crescent',
    'hand-right',
    'lock-closed-outline',
    'log-out-outline',
    'mail-outline',
    'people-outline',
    'person',
    'person-outline',
    'qr-code-outline',
    'restaurant',
    'restaurant-outline',
    'swap-horizontal',
    'time-outline',
];

addIcons(
    Object.fromEntries(NOMBRES_ICONOS.map((nombre) => [nombre, SVG_VACIO]))
);

// ---------------------------------------------------------------------------
// Animate API
// ---------------------------------------------------------------------------
// Las transiciones de Ionic llaman a Element.animate, ausente en jsdom.
if (!Element.prototype.animate) {
    Element.prototype.animate = function animate() {
        return {
            play: () => undefined,
            pause: () => undefined,
            cancel: () => undefined,
            finish: () => undefined,
            addEventListener: () => undefined,
            removeEventListener: () => undefined,
            onfinish: null,
            finished: Promise.resolve(),
        } as unknown as Animation;
    };
}
