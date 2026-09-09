import { EmpleadoInterface } from './../interfaces/empleado.interface';
import { Service } from '@angular/core';
import { supabase } from './supabase.service';

@Service()
export class EmpleadosService {
    async getEmpleados() {
        const { data, error } = await supabase
            .from('usuarios')
            .select('*')
            .filter('perfil', 'isdistinct', 'cliente registrado')
            .filter('perfil', 'isdistinct', 'cliente anónimo');
        if (error) throw error;

        return data;
    }

    async eliminar(id: string): Promise<void> {
        const { error } = await supabase.from('usuarios').update({ estado: 'Rechazado' }).eq('id', id);

        if (error) throw error;
    }

    async obtenerPorId(id: string): Promise<EmpleadoInterface> {
        const { data, error } = await supabase
            .from('usuarios')
            .select('*')
            .eq('id', id)
            .single();

        if (error) throw error;

        return data;
    }
}
