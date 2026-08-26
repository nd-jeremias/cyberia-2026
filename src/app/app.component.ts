import { Component, inject } from '@angular/core';
import { IonApp, IonRouterOutlet, ModalController } from '@ionic/angular';
import { SplashComponent } from './components/splash/splash.component';
import { ModalComponent } from './components/modal/modal.component';
import { SpinnerComponent } from './components/spinner/spinner.component';

@Component({
    selector: 'app-root',
    templateUrl: 'app.component.html',
    imports: [IonApp, IonRouterOutlet, ModalComponent,SpinnerComponent],
})
export class AppComponent {
    private modalCtrl = inject(ModalController);

  ngOnInit() {
    // 1. DISPARAMOS EL MODAL ANIMADO INMEDIATAMENTE
    this.showAnimatedSplash();
  }

  async showAnimatedSplash() {
    const modal = await this.modalCtrl.create({
      component: SplashComponent,
      cssClass: 'full-screen-modal',
      backdropDismiss: false
    });
    
    await modal.present();
  }
}
