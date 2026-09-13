import { bootstrapApplication } from '@angular/platform-browser';
import {
    RouteReuseStrategy,
    provideRouter,
    withComponentInputBinding,
    withPreloading,
    PreloadAllModules,
} from '@angular/router';
import { IonicRouteStrategy, provideIonicAngular } from '@ionic/angular';
import { defineCustomElements } from '@ionic/pwa-elements/loader';
import { routes } from './app/app.routes';
import { AppComponent } from './app/app.component';
import { registrarIconos } from './app/iconos';

// 1. Importa la librería y los prefijos/iconos que quieras de forma masiva
import { FaIconLibrary } from '@fortawesome/angular-fontawesome';
import { fas } from '@fortawesome/free-solid-svg-icons';
import { far } from '@fortawesome/free-regular-svg-icons';
import { fab } from '@fortawesome/free-brands-svg-icons';

defineCustomElements(window);

// Los iconos se registran una sola vez al arrancar: `addIcons` escribe en un
// mapa global, así que desde acá quedan disponibles para toda la aplicación.
registrarIconos();

bootstrapApplication(AppComponent, {
    providers: [
        { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
        provideIonicAngular(),
        provideRouter(routes, withPreloading(PreloadAllModules), withComponentInputBinding()),
    ],
}).then((appRef) => {
    // 2. Inyecta la librería de font awesome y añade los prefijos completos de forma global
    const library = appRef.injector.get(FaIconLibrary);
    library.addIconPacks(fas, far, fab);
});
