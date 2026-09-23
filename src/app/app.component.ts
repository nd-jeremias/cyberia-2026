import { BackgroundTask } from '@capawesome/capacitor-background-task';
import { Component, OnInit, inject } from '@angular/core';
import { IonApp, IonRouterOutlet, ModalController, Platform } from '@ionic/angular';
import { SplashComponent } from './components/splash/splash.component';
import { NotificacionesService } from './services/notificaciones.service';
import { ModalComponent } from './components/modal/modal.component';
import { SpinnerComponent } from './components/spinner/spinner.component';
import { AudioService } from './services/audio.service';
import { App } from '@capacitor/app';

@Component({
    selector: 'app-root',
    templateUrl: 'app.component.html',
    imports: [IonApp, IonRouterOutlet, ModalComponent, SpinnerComponent],
})
export class AppComponent implements OnInit {
    private modalCtrl = inject(ModalController);
    private notificaciones = inject(NotificacionesService);
    private sound = inject(AudioService);
    private platform = inject(Platform);

    ngOnInit() {
        this.platform.ready().then(() => {
            this.sound.reproducir('intro');

            // DISPARAMOS EL MODAL ANIMADO INMEDIATAMENTE
            this.showAnimatedSplash();

            this.escucharEstadoDeAplicacion();
        });

        // Registramos el dispositivo para recibir avisos. No bloquea el
        // arranque: en web sale de inmediato y en nativo pide el permiso.
        this.notificaciones.inicializar();
    }

    async showAnimatedSplash() {
        const modal = await this.modalCtrl.create({
            component: SplashComponent,
            cssClass: 'full-screen-modal',
            backdropDismiss: false,
        });

        await modal.present();
    }

    async escucharEstadoDeAplicacion() {
        if (this.platform.is('hybrid')) {
            // Escuchamos el cambio de estado nativo mediante Capacitor
            await App.addListener('appStateChange', async ({ isActive }) => {
                if (!isActive) {
                    // Iniciamos una tarea de background segura para que Android no mate el proceso antes de tiempo
                    const taskId = await BackgroundTask.beforeExit(async () => {
                        // Lanzamos nuestro audio nativo precargado
                        await this.sound.reproducir('success');

                        // Le damos un pequeño margen de tiempo para asegurar que suene el efecto
                        await new Promise((resolve) => setTimeout(resolve, 1500));

                        // Notificamos al sistema operativo que terminamos la tarea de cierre seguro
                        BackgroundTask.finish({ taskId });
                    });
                }
            });
        }
    }
}
