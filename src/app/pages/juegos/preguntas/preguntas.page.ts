import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent } from '@ionic/angular';
import { HeaderComponent } from '../../../components/header/header.component';

@Component({
    selector: 'app-preguntas',
    templateUrl: './preguntas.page.html',
    styleUrls: ['./preguntas.page.scss'],
    imports: [IonContent, HeaderComponent, CommonModule, FormsModule],
})
export class PreguntasPage implements OnInit {
    constructor() {}

    ngOnInit() {}
}
