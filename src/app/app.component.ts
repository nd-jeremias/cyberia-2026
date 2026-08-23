import { Component } from '@angular/core';
import { IonApp, IonRouterOutlet } from '@ionic/angular';
import { SplashScreen } from '@capacitor/splash-screen';

@Component({
    selector: 'app-root',
    templateUrl: 'app.component.html',
    imports: [IonApp, IonRouterOutlet],
})
export class AppComponent {
    constructor() {
        this.showSplash()
    }

    async showSplash() {
        await SplashScreen.show({
            showDuration: 3000,
            autoHide: true,
        });
    }
}
