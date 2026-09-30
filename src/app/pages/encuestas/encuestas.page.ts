import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { IonContent, IonIcon } from '@ionic/angular';
import { HeaderComponent } from '../../components/header/header.component';
import { AuthService } from '../../services/auth.service';
import { SalonService } from '../../services/salon.service';
import { PedidoService } from '../../services/pedido.service';
import { EncuestasService } from '../../services/encuestas.service';
import { BotonHome } from '../../home/home-botones.config';
import { BotonHomeComponent } from '../../components/boton-home/boton-home.component'; 

@Component({
  selector: 'app-encuestas',
  templateUrl: './encuestas.page.html',
  styleUrls: ['./encuestas.page.scss'],
  standalone: true,
  imports: [IonContent, IonIcon, CommonModule, HeaderComponent, BotonHomeComponent]
})
export class EncuestasPage {
  private auth = inject(AuthService);
  private salon = inject(SalonService);
  private pedidoService = inject(PedidoService);
  private encuestasService = inject(EncuestasService);
  private router = inject(Router);

  cargando = signal(true);
  puedeResponder = signal(false);

  // Objetos de botones con icono, texto y navegación
  botonCompletar: BotonHome = {
    texto: 'Completar Encuesta',
    icono: 'pen-to-square',
    ruta: '/encuestas/completar'
  };

  botonResultados: BotonHome = {
    texto: 'Ver Resultados',
    icono: 'chart-simple',
    ruta: '/encuestas/resultados'
  };

  async ionViewWillEnter() {
    await this.verificarAcceso();
  }

  async verificarAcceso() {
    this.cargando.set(true);
    const usuarioId = this.auth.session()?.user.id;
    if (!usuarioId) {
      this.puedeResponder.set(false);
      this.cargando.set(false);
      return;
    }

    // 1. Verificar si tiene mesa asignada
    const situacion = await this.salon.cargarSituacion(usuarioId);
    if (!situacion?.mesaId) {
      this.puedeResponder.set(false);
      this.cargando.set(false);
      return;
    }

    // 2. Verificar si tiene pedido recibido en esta visita
    const pedidoActual = await this.pedidoService.pedidoActualDelCliente(usuarioId);
    const estadosValidos = ['Recibido', 'Pagado'];
    if (!pedidoActual || !estadosValidos.includes(pedidoActual.estado)) {
      this.puedeResponder.set(false);
      this.cargando.set(false);
      return;
    }

    // 3. Verificar si ya respondió en esta estadía
    const yaRespondio = await this.encuestasService.yaCompletoEncuestaDeEstadia(usuarioId, pedidoActual.id);
    this.puedeResponder.set(!yaRespondio);
    this.cargando.set(false);
  }

  navegar(ruta: string) {
    this.router.navigate([ruta]);
  }
}