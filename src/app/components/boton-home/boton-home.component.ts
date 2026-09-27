import { Component, input, OnInit } from '@angular/core';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { BotonHomeInterface } from '../../interfaces/component.interface';
import { RouterLink } from '@angular/router';

@Component({
    selector: 'app-boton-home',
    templateUrl: './boton-home.component.html',
    styleUrls: ['./boton-home.component.scss'],
    imports: [FaIconComponent, RouterLink],
})
export class BotonHomeComponent implements OnInit {
    boton = input.required<BotonHomeInterface>();

    constructor() {}

    ngOnInit() {}
}
