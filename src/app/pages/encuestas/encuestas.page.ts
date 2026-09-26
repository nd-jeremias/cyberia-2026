import { Component, OnInit, ElementRef, ViewChild, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { IonContent, IonIcon, IonButton, IonRange, IonTextarea } from '@ionic/angular';
import { HeaderComponent } from '../../components/header/header.component';
import { AuthService } from '../../services/auth.service';
import { SalonService } from '../../services/salon.service';
import { PedidoService } from '../../services/pedido.service';
import { ModalService } from '../../services/modal.service';
import { SpinnerService } from '../../services/spinner.service';
import { EncuestasService, EncuestaFila } from '../../services/encuestas.service';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

@Component({
  selector: 'app-encuestas',
  templateUrl: './encuestas.page.html',
  styleUrls: ['./encuestas.page.scss'],
  standalone: true,
  imports: [
    IonContent,
    IonIcon,
    IonButton,
    IonRange,
    IonTextarea,
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    HeaderComponent
  ]
})
export class EncuestasPage implements OnInit {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private salon = inject(SalonService);
  private pedidoService = inject(PedidoService);
  private encuestasService = inject(EncuestasService);
  private modal = inject(ModalService);
  private spinner = inject(SpinnerService);

  @ViewChild('canvasGrafico') canvasGrafico?: ElementRef<HTMLCanvasElement>;
  chartInstance?: Chart;

  vista = signal<'formulario' | 'graficos'>('graficos');
  graficoSeleccionado = signal<'torta' | 'barras' | 'lineas'>('torta');
  yaRespondio = signal<boolean>(false);
  puedeResponder = signal<boolean>(false);

  encuestas = signal<EncuestaFila[]>([]);
  cargando = signal<boolean>(true);

  form = this.fb.group({
    calificacionComida: [5, [Validators.required, Validators.min(1), Validators.max(5)]],
    atencionMozo: ['Excelente', Validators.required],
    tiempoEspera: ['Aceptable', Validators.required],
    recomiendaLugar: [true, Validators.required],
    comentario: ['']
  });

  async ngOnInit() {
    await this.verificarEstadoCliente();
    await this.cargarEncuestas();
  }

  async verificarEstadoCliente() {
    const usuarioId = this.auth.session()?.user.id;
    if (!usuarioId) return;

    const situacion = await this.salon.cargarSituacion(usuarioId);
    if (!situacion?.mesaId) {
      this.puedeResponder.set(false);
      this.vista.set('graficos');
      return;
    }

    // 1. Verificamos si ya respondió en esta estadía
    const respondio = await this.encuestasService.yaCompletoEncuesta(usuarioId, situacion.mesaId);
    this.yaRespondio.set(respondio);

    // 2. Verificar si el pedido fue recibido (Punto 19/20)
    const pedidos = await this.pedidoService.pedidosActivosDelCliente(usuarioId);
    const pedidoRecibido = pedidos.some(p => p.estado === 'Recibido' || p.estado === 'Pagado');

    if (!respondio && pedidoRecibido) {
      this.puedeResponder.set(true);
      this.vista.set('formulario');
    } else {
      this.puedeResponder.set(false);
      this.vista.set('graficos');
    }
  }

  async cargarEncuestas() {
    this.cargando.set(true);
    try {
      const data = await this.encuestasService.listarTodas();
      this.encuestas.set(data);
      if (this.vista() === 'graficos') {
        setTimeout(() => this.renderizarGrafico(), 100);
      }
    } finally {
      this.cargando.set(false);
    }
  }

  cambiarTipoGrafico(tipo: 'torta' | 'barras' | 'lineas') {
    this.graficoSeleccionado.set(tipo);
    this.renderizarGrafico();
  }

  cambiarVista(nuevaVista: 'formulario' | 'graficos') {
    this.vista.set(nuevaVista);
    if (nuevaVista === 'graficos') {
      setTimeout(() => this.renderizarGrafico(), 100);
    }
  }

  renderizarGrafico() {
    if (!this.canvasGrafico?.nativeElement) return;
    if (this.chartInstance) {
      this.chartInstance.destroy();
    }

    const ctx = this.canvasGrafico.nativeElement.getContext('2d');
    if (!ctx) return;

    const tipo = this.graficoSeleccionado();
    const data = this.encuestas();

    if (tipo === 'torta') {
      // Gráfico de torta: Calificación de atención de los mozos
      const conteo: Record<string, number> = { Excelente: 0, Buena: 0, Regular: 0, Mala: 0 };
      data.forEach(e => { if (conteo[e.atencion_mozo] !== undefined) conteo[e.atencion_mozo]++; });

      this.chartInstance = new Chart(ctx, {
        type: 'pie',
        data: {
          labels: Object.keys(conteo),
          datasets: [{
            data: Object.values(conteo),
            backgroundColor: ['#1b7a4b', '#2372a8', '#d98b14', '#c0392b']
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            title: { display: true, text: 'Atención del Personal (Torta)', font: { size: 16 } }
          }
        }
      });
    } else if (tipo === 'barras') {
      // Gráfico de barras: Calificación de comida (1 a 5 estrellas)
      const conteo: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
      data.forEach(e => { if (conteo[e.calificacion_comida] !== undefined) conteo[e.calificacion_comida]++; });

      this.chartInstance = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: ['1 ★', '2 ★', '3 ★', '4 ★', '5 ★'],
          datasets: [{
            label: 'Cantidad de votos',
            data: Object.values(conteo),
            backgroundColor: '#e2571c'
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            title: { display: true, text: 'Calidad de la Comida (Barras)', font: { size: 16 } }
          },
          scales: { y: { beginAtZero: true, ticks: { precision: 0 } } }
        }
      });
    } else if (tipo === 'lineas') {
      // Gráfico lineal: Percepción del tiempo de espera
      const conteo: Record<string, number> = { Rápido: 0, Aceptable: 0, Lento: 0 };
      data.forEach(e => { if (conteo[e.tiempo_espera] !== undefined) conteo[e.tiempo_espera]++; });

      this.chartInstance = new Chart(ctx, {
        type: 'line',
        data: {
          labels: Object.keys(conteo),
          datasets: [{
            label: 'Percepción de demora',
            data: Object.values(conteo),
            borderColor: '#c0430f',
            backgroundColor: 'rgba(226, 87, 28, 0.2)',
            fill: true,
            tension: 0.3
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            title: { display: true, text: 'Tiempos de Espera (Lineal)', font: { size: 16 } }
          },
          scales: { y: { beginAtZero: true, ticks: { precision: 0 } } }
        }
      });
    }
  }

  async enviarEncuesta() {
    if (this.form.invalid) return;

    const usuarioId = this.auth.session()?.user.id;
    const mesaId = this.salon.situacion()?.mesaId;
    if (!usuarioId || !mesaId) return;

    this.spinner.show();
    try {
      const val = this.form.value;
      await this.encuestasService.guardarEncuesta({
        clienteId: usuarioId,
        mesaId: mesaId,
        calificacionComida: Number(val.calificacionComida),
        atencionMozo: val.atencionMozo as any,
        tiempoEspera: val.tiempoEspera as any,
        recomiendaLugar: !!val.recomiendaLugar,
        comentario: val.comentario ?? ''
      });

      this.yaRespondio.set(true);
      this.puedeResponder.set(false);
      this.modal.setOpen('¡Gracias!', 'Tu encuesta fue enviada con éxito.', 'info');
      await this.cargarEncuestas();
      this.cambiarVista('graficos');
    } catch (e: any) {
      this.modal.setOpen('Error', e.message || 'No se pudo registrar la encuesta.');
    } finally {
      this.spinner.hide();
    }
  }
}