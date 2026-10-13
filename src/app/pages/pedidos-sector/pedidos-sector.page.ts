import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonContent } from '@ionic/angular';
import { HeaderComponent } from '../../components/header/header.component';
import { PedidoService } from '../../services/pedido.service';
import { AuthService } from '../../services/auth.service';
import { DetallePedidoInterface, EstadoItem, PedidoInterface } from '../../interfaces/pedido.interface';
import { TipoProducto } from '../../interfaces/producto.interface';
import { formatearFechaHora } from '../../utils/fecha';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { NotificacionesService } from '../../services/notificaciones.service';

export interface GrupoMesaSector {
  numeroMesa: number;
  pedidos: {
    pedidoOriginal: PedidoInterface;
    fecha: string;
    itemsSector: DetallePedidoInterface[];
  }[];
}

@Component({
  selector: 'app-pedidos-sector',
  standalone: true,
  templateUrl: './pedidos-sector.page.html',
  styleUrls: ['./pedidos-sector.page.scss'],
  imports: [IonContent, CommonModule, HeaderComponent, FaIconComponent]
})
export class PedidosSectorPage implements OnInit {
  private pedidoService = inject(PedidoService);
  private authService = inject(AuthService);
  private notificaciones = inject(NotificacionesService);

  cargando = this.pedidoService.cargando;
  perfil = computed(() => this.authService.perfil());

  // Define qué tipo de producto elabora este sector
  tiposPermitidos = computed<TipoProducto[]>(() => {
    const rol = this.perfil();
    if (rol === 'cantinero') return ['Bebida'];
    return ['Comida', 'Postre']; // Cocinero elabora comidas y postres
  });

  tituloSector = computed(() => 
    this.perfil() === 'cantinero' ? 'Sector Barra' : 'Sector Cocina'
  );

  // Agrupación por mesa con filtrado de productos exclusivos del sector
  mesasAgrupadas = computed<GrupoMesaSector[]>(() => {
    const pedidos = this.pedidoService.pedidos();
    const tipos = this.tiposPermitidos();
    const gruposMap = new Map<number, GrupoMesaSector>();

    for (const pedido of pedidos) {
      // 1. Filtrar solo los ítems que le corresponden a este sector
      const itemsSector = pedido.detalles.filter(d => 
        d.tipoProducto ? tipos.includes(d.tipoProducto) : true
      );

      // Si este pedido no tiene productos para este sector, o ya están todos listos, no lo mostramos
      const tienePendientes = itemsSector.some(i => i.estadoProducto !== 'Listo');
      if (itemsSector.length === 0 || !tienePendientes) continue;

      if (!gruposMap.has(pedido.numeroMesa)) {
        gruposMap.set(pedido.numeroMesa, {
          numeroMesa: pedido.numeroMesa,
          pedidos: []
        });
      }

      gruposMap.get(pedido.numeroMesa)!.pedidos.push({
        pedidoOriginal: pedido,
        fecha: formatearFechaHora(pedido.fecha),
        itemsSector
      });
    }

    return Array.from(gruposMap.values()).sort((a, b) => a.numeroMesa - b.numeroMesa);
  });

  ngOnInit() {
    void this.recargar();
  }

  async recargar() {
    // Cocina solo debe recibir lo que el mozo ya confirmó
    await this.pedidoService.listar(['Confirmado', 'En Preparación']);
  }

  async cambiarEstadoItem(item: DetallePedidoInterface, nuevoEstado: EstadoItem, pedidoId: string) {
    const exito = await this.pedidoService.cambiarEstadoItem(item.id, nuevoEstado);
    if (!exito) return;
    
    // Si el pedido estaba solo "Confirmado", al empezar la preparación pasa a "En Preparación"
    const pedido = this.pedidoService.pedidos().find(p => p.id === pedidoId);

    if (pedido && pedido.estado === 'Confirmado' && nuevoEstado === 'En Preparación') {
      await (this.pedidoService as any).cambiarEstado(pedidoId, 'En Preparación');
    }

      // // 1. Notificar al cliente que su producto cambió de estado
      //   if (pedido?.clienteId) {
      //       void this.notificaciones.enviarAvisoAUsuario(
      //           pedido.clienteId,
      //           'Actualización de tu pedido',
      //           `${item.nombreProducto} está ${nuevoEstado.toLowerCase()}.`,
      //           'pedido-estado'
      //       );
      //   }

    // Guardamos el estado previo antes de chequear si se completó
    const estadoPrevio = pedido?.estado;

    // 2. Verificar si con este cambio se terminó TODO el pedido (cocina + bar)
    await this.pedidoService.actualizarEstadoGeneralSiListo(pedidoId);

    // Volvemos a buscar el pedido actualizado en la lista
    const pedidoActualizado = this.pedidoService.pedidos().find((p) => p.id === pedidoId);
    // Solo se informa si el pedido PASÓ a estar listo en este preciso momento
    if (estadoPrevio !== 'Listo para Entregar' && pedidoActualizado?.estado === 'Listo para Entregar') {
      void this.notificaciones.enviarAvisos(
        ['mozo'],
        `Pedido listo - Mesa ${pedidoActualizado.numeroMesa}`,
        'El pedido está completo y listo para ser entregado.',
        'pedido-estado'
      );
    }
  }
}