import { Component, OnInit, inject } from '@angular/core';
import { IonApp, IonRouterOutlet, ModalController } from '@ionic/angular';
import { SplashComponent } from './components/splash/splash.component';
import { NotificacionesService } from './services/notificaciones.service';
import { ModalComponent } from './components/modal/modal.component';
import { SpinnerComponent } from './components/spinner/spinner.component';

@Component({
    selector: 'app-root',
    templateUrl: 'app.component.html',
    imports: [IonApp, IonRouterOutlet, ModalComponent, SpinnerComponent],
})
export class AppComponent implements OnInit {
    private modalCtrl = inject(ModalController);
    private notificaciones = inject(NotificacionesService);

    ngOnInit() {
        // 1. DISPARAMOS EL MODAL ANIMADO INMEDIATAMENTE
        this.showAnimatedSplash();

        // 2. Registramos el dispositivo para recibir avisos. No bloquea el
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
}
