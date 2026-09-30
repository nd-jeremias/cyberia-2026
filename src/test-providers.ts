import { EnvironmentProviders, Provider, inject, provideEnvironmentInitializer } from '@angular/core';
import { FaIconLibrary } from '@fortawesome/angular-fontawesome';
import { fab } from '@fortawesome/free-brands-svg-icons';
import { far } from '@fortawesome/free-regular-svg-icons';
import { fas } from '@fortawesome/free-solid-svg-icons';

/**
 * Proveedores que reciben todos los tests unitarios.
 *
 * Lo carga el builder de tests por la opción `providersFile` de angular.json:
 * se suman al TestBed de cada test, sin que cada spec tenga que declararlos.
 *
 * La aplicación registra los íconos de FontAwesome recién al arrancar, en
 * main.ts, y los tests no pasan por main.ts. Sin este registro, cualquier
 * componente con `<fa-icon>` falla al crearse con "Could not find icon", y ese
 * error tapa lo que el test quería verificar.
 */
const proveedores: (Provider | EnvironmentProviders)[] = [
    provideEnvironmentInitializer(() => {
        // Los mismos paquetes que main.ts: un ícono que existe en la
        // aplicación tiene que existir también en los tests.
        inject(FaIconLibrary).addIconPacks(fas, far, fab);
    }),
];

export default proveedores;
