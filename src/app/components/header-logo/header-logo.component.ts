import { titulosPorRol } from './../../shared/constants';
import { Component, computed, input, OnInit } from '@angular/core';

@Component({
    selector: 'app-header-logo',
    templateUrl: './header-logo.component.html',
    styleUrls: ['./header-logo.component.scss'],
    imports: [],
})
export class HeaderLogoComponent implements OnInit {
    
    titulosPorRol = titulosPorRol

    usuarioRol = input<'cliente' | 'dueño' | 'metre'>('cliente');

    tituloEncabezado = computed(() => this.titulosPorRol[this.usuarioRol()]);

    constructor() {}

    ngOnInit() {}
}
