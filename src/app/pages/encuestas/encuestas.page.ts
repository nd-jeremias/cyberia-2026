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
import { star, starOutline } from 'ionicons/icons';
import { addIcons } from 'ionicons';

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
    addIcons({ star, 'star-outline': starOutline });
  }

  seleccionarEstrellas(valor: number) {
    this.form.get('calificacionComida')?.setValue(valor);
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

        // 1. Destruir la instancia previa si existe
        if (this.chartInstance) {
            this.chartInstance.destroy();
            this.chartInstance = undefined;
        }

        const canvas = this.canvasGrafico.nativeElement;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Limpiar el mapa de píxeles del canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        const tipo = this.graficoSeleccionado();
        const data = this.encuestas();

        if (tipo === 'torta') {
            const conteo: Record<string, number> = { Excelente: 0, Buena: 0, Regular: 0, Mala: 0 };
            data.forEach(e => {
            const val = e.atencion_mozo?.trim();
            if (conteo[val] !== undefined) conteo[val]++;
            });

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
                legend: { display: true, position: 'top' },
                title: { display: true, text: 'Atención del Personal (Torta)', font: { size: 16 } }
                }
            }
            });

        } else if (tipo === 'barras') {
            const conteo: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
            data.forEach(e => {
            const nota = Number(e.calificacion_comida);
            if (conteo[nota] !== undefined) conteo[nota]++;
            });

            this.chartInstance = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: ['1 ★', '2 ★', '3 ★', '4 ★', '5 ★'],
                datasets: [{
                label: 'Votos',
                data: [conteo[1], conteo[2], conteo[3], conteo[4], conteo[5]],
                backgroundColor: '#e2571c',
                borderRadius: 6
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                legend: { display: false },
                title: { display: true, text: 'Calidad de la Comida (Barras)', font: { size: 16 } }
                },
                scales: {
                x: {
                    grid: { display: false }
                },
                y: {
                    beginAtZero: true,
                    ticks: {
                    stepSize: 1,
                    precision: 0
                    }
                }
                }
            }
            });

        } else if (tipo === 'lineas') {
            const conteo: Record<string, number> = { Rápido: 0, Aceptable: 0, Lento: 0 };
            data.forEach(e => {
            const demora = e.tiempo_espera?.trim();
            if (conteo[demora] !== undefined) conteo[demora]++;
            });

            this.chartInstance = new Chart(ctx, {
            type: 'line',
            data: {
                labels: ['Rápido', 'Aceptable', 'Lento'],
                datasets: [{
                label: 'Demora percibida',
                data: [conteo['Rápido'], conteo['Aceptable'], conteo['Lento']],
                borderColor: '#c0430f',
                backgroundColor: 'rgba(226, 87, 28, 0.25)',
                fill: true,
                tension: 0.35,
                pointBackgroundColor: '#e2571c',
                pointRadius: 6
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                legend: { display: false },
                title: { display: true, text: 'Tiempos de Espera (Lineal)', font: { size: 16 } }
                },
                scales: {
                x: {
                    grid: { display: false }
                },
                y: {
                    beginAtZero: true,
                    ticks: {
                    stepSize: 1,
                    precision: 0
                    }
                }
                }
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