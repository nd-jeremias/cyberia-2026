import { Component, ElementRef, ViewChild, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonContent } from '@ionic/angular';
import { HeaderComponent } from '../../../components/header/header.component';
import { EncuestasService, EncuestaFila } from '../../../services/encuestas.service';
import { Chart, registerables } from 'chart.js';
import { FaIconLibrary, FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faChevronLeft, faChevronRight } from '@fortawesome/free-solid-svg-icons';

Chart.register(...registerables);

@Component({
  selector: 'app-resultados',
  templateUrl: './resultados.page.html',
  styleUrls: ['./resultados.page.scss'],
  standalone: true,
  imports: [IonContent, CommonModule, HeaderComponent, FontAwesomeModule],
})
export class ResultadosPage {
  private encuestasService = inject(EncuestasService);
  private faLibrary = inject(FaIconLibrary);

  readonly iconoIzquierda = faChevronLeft;
  readonly iconoDerecha = faChevronRight;

  readonly itemsTorta = [
    { etiqueta: 'Excelente', color: '#1b7a4b' },
    { etiqueta: 'Buena', color: '#2372a8' },
    { etiqueta: 'Regular', color: '#d98b14' },
    { etiqueta: 'Mala', color: '#c0392b' },
  ];

  @ViewChild('canvasGrafico') canvasGrafico?: ElementRef<HTMLCanvasElement>;
  chartInstance?: Chart;

  graficoSeleccionado = signal<'torta' | 'barras' | 'lineas'>('torta');
  encuestas = signal<EncuestaFila[]>([]);
  cargando = signal(true);

  readonly tiposGraficos: Array<'torta' | 'barras' | 'lineas'> = ['torta', 'barras', 'lineas'];
  indiceGraficoActual = signal<number>(0);

  async ionViewWillEnter() {
    await this.cargarDatos();
  }

  async cargarDatos() {
    this.cargando.set(true);
    try {
      const data = await this.encuestasService.listarTodas();
      this.encuestas.set(data);
      setTimeout(() => this.renderizarGrafico(), 100);
    } finally {
      this.cargando.set(false);
    }
  }

  cambiarTipoGrafico(tipo: 'torta' | 'barras' | 'lineas') {
    this.graficoSeleccionado.set(tipo);
    this.indiceGraficoActual.set(this.tiposGraficos.indexOf(tipo));
    setTimeout(() => this.renderizarGrafico(), 50);
  }

  get graficoActual(): 'torta' | 'barras' | 'lineas' {
    return this.tiposGraficos[this.indiceGraficoActual()];
  }

  graficoSiguiente() {
    const proximo = (this.indiceGraficoActual() + 1) % this.tiposGraficos.length;
    this.indiceGraficoActual.set(proximo);
    this.cambiarTipoGrafico(this.tiposGraficos[proximo]);
  }

  graficoAnterior() {
    const previo = (this.indiceGraficoActual() - 1 + this.tiposGraficos.length) % this.tiposGraficos.length;
    this.indiceGraficoActual.set(previo);
    this.cambiarTipoGrafico(this.tiposGraficos[previo]);
  }

  renderizarGrafico() {
    if (!this.canvasGrafico?.nativeElement) return;

    if (this.chartInstance) {
      this.chartInstance.destroy();
      this.chartInstance = undefined;
    }

    const canvas = this.canvasGrafico.nativeElement;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const tipo = this.graficoSeleccionado();
    const data = this.encuestas();

    if (tipo === 'torta') {
      const conteo: Record<string, number> = { Excelente: 0, Buena: 0, Regular: 0, Mala: 0 };
      data.forEach((e) => {
        const val = e.atencion_mozo?.trim();
        if (conteo[val] !== undefined) conteo[val]++;
      });

      this.chartInstance = new Chart(ctx, {
        type: 'pie',
        data: {
          labels: Object.keys(conteo),
          datasets: [
            {
              data: Object.values(conteo),
              backgroundColor: ['#1b7a4b', '#2372a8', '#d98b14', '#c0392b'],
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            title: {
              display: false,
              text: 'Atención del Personal',
              color: '#2b1b17', // var(--tinta)
              font: {
                size: 18,
                weight: 'bold',
              },
              padding: {
                top: 8,
                bottom: 14,
              },
            },
            legend: {
              display: false,
              position: 'bottom',
              align: 'center',
              labels: {
                color: '#2b1b17',
                usePointStyle: true,
                pointStyle: 'circle',
                boxWidth: 16,   // Antes 10: agranda el círculo coloreado
                padding: 16,    // Espaciado vertical más cómodo
                font: {
                  size: 15,     // Antes 13: texto más nítido
                  weight: 'bold',
                },
              },
              
            },
          },
        },
      });
    } else if (tipo === 'barras') {
      const conteo: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
      data.forEach((e) => {
        const nota = Number(e.calificacion_comida);
        if (conteo[nota] !== undefined) conteo[nota]++;
      });

      this.chartInstance = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: ['1 ★', '2 ★', '3 ★', '4 ★', '5 ★'],
          datasets: [
            {
              label: 'Votos',
              data: [conteo[1], conteo[2], conteo[3], conteo[4], conteo[5]],
              backgroundColor: '#e2571c',
              borderRadius: 6,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false },
            title: {
              display: false,
              text: 'Calidad de la Comida',
              color: '#2b1b17', // var(--tinta)
              font: {
                size: 18,
                weight: 'bold',
              },
              padding: {
                top: 8,
                bottom: 16,
              },
            },
          },
          scales: {
            x: {
              grid: { display: false },
              ticks: {
                color: '#2b1b17',
                font: {
                  size: 14,
                  weight: 'bold',
                },
                padding: 6,
              },
            },
            y: {
              beginAtZero: true,
              ticks: {
                color: '#70655c', // var(--tinta-suave)
                stepSize: 1,
                precision: 0,
                font: {
                  size: 13,
                  weight: 'bold',
                },
                padding: 8,
              },
              grid: {
                color: 'rgba(0, 0, 0, 0.06)',
              },
            },
          },
        },
      });
    } else if (tipo === 'lineas') {
      const conteo: Record<string, number> = { Rápido: 0, Aceptable: 0, Lento: 0 };
      data.forEach((e) => {
        const demora = e.tiempo_espera?.trim();
        if (conteo[demora] !== undefined) conteo[demora]++;
      });

      this.chartInstance = new Chart(ctx, {
        type: 'line',
        data: {
          labels: ['Rápido', 'Aceptable', 'Lento'],
          datasets: [
            {
              label: 'Demora percibida',
              data: [conteo['Rápido'], conteo['Aceptable'], conteo['Lento']],
              borderColor: '#c0430f',
              backgroundColor: 'rgba(226, 87, 28, 0.25)',
              fill: true,
              tension: 0.35,
              pointBackgroundColor: '#e2571c',
              pointRadius: 6,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false },
            title: {
              display: false,
              text: 'Tiempos de Espera',
              color: '#2b1b17', // Color tinta oscuro de la app
              font: {
                size: 18,
                weight: 'bold',
              },
              padding: {
                top: 8,
                bottom: 16,
              },
            },
          },
          scales: {
            x: {
              grid: { display: false },
              ticks: {
                color: '#2b1b17',
                font: {
                  size: 14,
                  weight: 'bold',
                },
                padding: 6,
              },
            },
            y: {
              beginAtZero: true,
              ticks: {
                color: '#70655c', // Tinta suave legible
                stepSize: 1,
                precision: 0,
                font: {
                  size: 13,
                  weight: 'bold',
                },
                padding: 8,
              },
              grid: {
                color: 'rgba(0, 0, 0, 0.06)',
              },
            },
          },
        },
      });
    }
  }
}