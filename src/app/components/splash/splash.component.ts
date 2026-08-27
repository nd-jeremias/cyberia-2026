import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonContent, ModalController } from '@ionic/angular';

@Component({
  selector: 'app-splash',
  templateUrl: './splash.component.html',
  styleUrls: ['./splash.component.scss'],
  standalone: true,
  imports: [CommonModule, IonContent]
})
export class SplashComponent implements OnInit {

  private modalCtrl = inject(ModalController);

  async ngOnInit() {
    setTimeout(() => {
      this.modalCtrl.dismiss();
    }, 4800); 
  }
}
