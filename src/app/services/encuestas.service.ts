import { Injectable } from '@angular/core';
import { supabase } from './supabase.service';

export interface EncuestaAlta {
  clienteId: string;
  mesaId: string;
  pedidoId?: string;
  calificacionComida: number; // 1 - 5
  atencionMozo: 'Excelente' | 'Buena' | 'Regular' | 'Mala';
  tiempoEspera: 'Rápido' | 'Aceptable' | 'Lento';
  recomiendaLugar: boolean;
  comentario?: string;
}

export interface EncuestaFila {
  id: string;
  cliente_id: string;
  mesa_id: string;
  calificacion_comida: number;
  atencion_mozo: string;
  tiempo_espera: string;
  recomienda_lugar: boolean;
  comentario: string;
  fecha: string;
}

@Injectable({
  providedIn: 'root'
})
export class EncuestasService {
  /** Verifica si el cliente ya completó una encuesta en su mesa actual */

  async yaCompletoEncuestaDeEstadia(clienteId: string, pedidoId: string): Promise<boolean> {
  const { data, error } = await supabase
    .from('encuestas')
    .select('id')
    .eq('cliente_id', clienteId)
    .eq('pedido_id', pedidoId)
    .maybeSingle();

  if (error || !data) return false;
  return true;
}

  async guardarEncuesta(encuesta: EncuestaAlta): Promise<void> {
    const { error } = await supabase.from('encuestas').insert({
      cliente_id: encuesta.clienteId,
      mesa_id: encuesta.mesaId,
      pedido_id: encuesta.pedidoId ?? null,
      calificacion_comida: encuesta.calificacionComida,
      atencion_mozo: encuesta.atencionMozo,
      tiempo_espera: encuesta.tiempoEspera,
      recomienda_lugar: encuesta.recomiendaLugar,
      comentario: encuesta.comentario ?? ''
    });

    if (error) throw error;
  }

  async listarTodas(): Promise<EncuestaFila[]> {
    const { data, error } = await supabase
      .from('encuestas')
      .select('*')
      .order('fecha', { ascending: false });

    if (error) throw error;
    return data ?? [];
  }
}