import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent } from '@ionic/angular';
import { FormularioAltaMesaComponent } from '../../../components/formulario-alta-mesa/formulario-alta-mesa.component';
import { HeaderComponent } from '../../../components/header/header.component';

@Component({
    selector: 'app-alta-mesa',
    templateUrl: './alta-mesa.page.html',
    styleUrls: ['./alta-mesa.page.scss'],
    imports: [IonContent, CommonModule, FormsModule, FormularioAltaMesaComponent, HeaderComponent],
})
export class AltaMesaPage implements OnInit {
    constructor() {}

    ngOnInit() {}
}
