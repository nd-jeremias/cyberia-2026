import { Service } from '@angular/core';
import { supabase } from './supabase.service';
import { ClientePendienteInterface } from '../interfaces/cliente.interface';

@Service()
export class ClientesService {
    async getUsuariosPendientes(): Promise<ClientePendienteInterface[]> {
        const { data, error } = await supabase
            .from('usuarios')
            .select('*')
            .eq('estado', 'Pendiente')
            .order('fecha_registro', { ascending: true });

        if (error) throw error;

        return (data ?? []).map((row) => this.mapCliente(row));
    }

    mapCliente(row: any): ClientePendienteInterface {
        return {
            id: row.id,
            nombres: row.nombres,
            apellidos: row.apellidos,
            dni: row.dni,
            correo_electronico: row.correo_electronico,
            foto_url: row.foto_url,
            estado: row.estado,
            fecha_registro: row.fecha_registro,
        };
    }
}
