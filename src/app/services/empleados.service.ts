import { EmpleadoInterface } from './../interfaces/empleado.interface';
import { Service } from '@angular/core';
import { supabase } from './supabase.service';

@Service()
export class EmpleadosService {
    async getEmpleados(): Promise<EmpleadoInterface[]> {
        const { data, error } = await supabase
            .from('usuarios')
            .select('*')
            .filter('perfil', 'isdistinct', 'cliente registrado')
            .filter('perfil', 'isdistinct', 'cliente anónimo');

        if (error) throw error;

        return (data ?? []).map((row) => this.mapEmpleado(row));
    }

    parseFotoUrl(raw: unknown): string[] | null {
        if (!raw) return null;

        // Puede venir como array real (columna jsonb bien tipada)
        if (Array.isArray(raw)) return raw as string[];

        // O como string con JSON adentro
        if (typeof raw === 'string') {
            try {
                const parsed = JSON.parse(raw);
                return Array.isArray(parsed) ? parsed : [parsed];
            } catch {
                // URL plana sin JSON.stringify
                return [raw];
            }
        }

        return null;
    }

    mapEmpleado(row: any): EmpleadoInterface {
        return {
            id: row.id,
            nombres: row.nombres,
            apellidos: row.apellidos,
            dni: row.dni,
            cuil: row.cuil,
            correo_electronico: row.correo_electronico,
            foto_url: this.parseFotoUrl(row.foto_url),
            token_push: row.token_push,
            perfil: row.perfil,
            tipoEmpleado: row.perfil,
        };
    }

    async eliminar(id: string): Promise<void> {
        const { error } = await supabase.from('usuarios').update({ estado: 'Rechazado' }).eq('id', id);

        if (error) throw error;
    }

    async obtenerPorId(id: string): Promise<EmpleadoInterface> {
        const { data, error } = await supabase.from('usuarios').select('*').eq('id', id).single();

        if (error) throw error;

        return this.mapEmpleado(data);
    }
}
