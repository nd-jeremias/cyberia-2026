import { Component, ElementRef, ViewChild, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonContent } from '@ionic/angular';
import { HeaderComponent } from '../../../components/header/header.component';
import { EncuestasService, EncuestaFila } from '../../../services/encuestas.service';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

@Component({
  selector: 'app-resultados',
  templateUrl: './resultados.page.html',
  styleUrls: ['./resultados.page.scss'],
  standalone: true,
  imports: [IonContent, CommonModule, HeaderComponent]
})
export class ResultadosPage {
  private encuestasService = inject(EncuestasService);

  @ViewChild('canvasGrafico') canvasGrafico?: ElementRef<HTMLCanvasElement>;
  chartInstance?: Chart;

  graficoSeleccionado = signal<'torta' | 'barras' | 'lineas'>('torta');
  encuestas = signal<EncuestaFila[]>([]);
  cargando = signal(true);

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
    setTimeout(() => this.renderizarGrafico(), 50);
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
            legend: { display: true, position: 'top' },
            title: { display: true, text: 'Atención del Personal (Torta)', font: { size: 16 } },
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
            title: { display: true, text: 'Calidad de la Comida (Barras)', font: { size: 16 } },
          },
          scales: {
            x: { grid: { display: false } },
            y: { beginAtZero: true, ticks: { stepSize: 1, precision: 0 } },
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
            title: { display: true, text: 'Tiempos de Espera (Lineal)', font: { size: 16 } },
          },
          scales: {
            x: { grid: { display: false } },
            y: { beginAtZero: true, ticks: { stepSize: 1, precision: 0 } },
          },
        },
      });
    }
  }
}