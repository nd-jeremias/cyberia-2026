import { EmpleadoInterface } from './../interfaces/empleado.interface';
import { inject, Service } from '@angular/core';
import { supabase } from './supabase.service';
import { GaleriaService } from './galeria.service';

@Service()
export class EmpleadosService {
    galeriaService = inject(GaleriaService);

    async getEmpleados(): Promise<EmpleadoInterface[]> {
        const { data, error } = await supabase
            .from('usuarios')
            .select('*')
            .eq('estado', 'Activo')
            .filter('perfil', 'isdistinct', 'cliente registrado')
            .filter('perfil', 'isdistinct', 'cliente anónimo')
            .order('fecha_registro', { ascending: false });

        if (error) throw error;

        return (data ?? []).map((row) => this.mapEmpleado(row));
    }

    mapEmpleado(row: any): EmpleadoInterface {
        return {
            id: row.id,
            nombres: row.nombres,
            apellidos: row.apellidos,
            dni: row.dni,
            cuil: row.cuil,
            correo_electronico: row.correo_electronico,
            foto_url: [row.foto_url],
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
