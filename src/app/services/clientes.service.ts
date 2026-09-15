import { Service } from '@angular/core';
import { supabase } from './supabase.service';
import { ClienteInterface, EstadoCliente } from '../interfaces/cliente.interface';

@Service()
export class ClientesService {
    async getUsuarios(estado: EstadoCliente): Promise<ClienteInterface[]> {
        const { data, error } = await supabase
            .from('usuarios')
            .select('*')
            .in('perfil', ['cliente registrado']) // Aca se puede agregar 'cliente anónimo' si es necesario
            .eq('estado', estado)
            .order('fecha_registro', { ascending: true });

        if (error) throw error;

        return (data ?? []).map((row) => this.mapCliente(row));
    }

    mapCliente(row: any): ClienteInterface {
        return {
            id: row.id,
            nombres: row.nombres,
            apellidos: row.apellidos,
            dni: row.dni,
            correo_electronico: row.correo_electronico,
            foto_url: [row.foto_url], // Aca se convierte de nuevo en array para coincidir con el componente subir-imagenes
            estado: row.estado,
            fecha_registro: row.fecha_registro,
        };
    }

    async eliminar(id: string): Promise<void> {
        const { error } = await supabase.from('usuarios').update({ estado: 'Rechazado' }).eq('id', id);
        if (error) throw error;
    }

    async actualizar(id: string, datos: Partial<ClienteInterface>): Promise<void> {
        const { error } = await supabase.from('usuarios').update(datos).eq('id', id);
        if (error) throw error;
    }

    
    async obtenerPorId(id: string): Promise<ClienteInterface> {
        const { data, error } = await supabase.from('usuarios').select('*').eq('id', id).single();

        if (error) throw error;

        return this.mapCliente(data);
    }
}
