import { PerfilUsuario } from './auth.interface';

export interface PushTokenInterface {
    user_id: string;
    token_push: string | null;
    perfil: PerfilUsuario;
}
