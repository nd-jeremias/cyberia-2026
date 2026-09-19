import { Component, inject, output, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { IonInput, IonInputPasswordToggle } from '@ionic/angular';
import { RouterLink } from '@angular/router';
import { LoginInterface } from '../../interfaces/auth.interface';
import { ModalService } from '../../services/modal.service';

/** Ficha de ingreso rápido. `clave` es la que elige el color en el SCSS. */
interface PerfilRapido {
    email: string;
    pass: string;
    rol: string;
    clave: string;
    icono: string;
}

/**
 * Formulario de ingreso.
 *
 * Valida y emite las credenciales, pero no autentica: de eso se ocupa la
 * página, que conoce el servicio de autenticación. Así el formulario se puede
 * probar y reutilizar sin arrastrar la sesión.
 */
@Component({
    selector: 'app-login-form',
    templateUrl: './login-form.component.html',
    styleUrls: ['./login-form.component.scss'],
    imports: [FaIconComponent, IonInput, IonInputPasswordToggle, ReactiveFormsModule, RouterLink],
})
export class LoginFormComponent {
    private modal = inject(ModalService);

    loginSubmit = output<LoginInterface>();
    loginAnonimo = output<void>();

    formulario = new FormGroup({
        email: new FormControl('', { validators: [Validators.required, Validators.email] }),
        password: new FormControl('', { validators: [Validators.required, Validators.minLength(8)] }),
    });

    /**
     * Credenciales de los botones de ingreso rápido.
     *
     * El enunciado los exige para agilizar la demostración con varios perfiles.
     * Son datos de prueba: no deberían quedar en una versión de producción.
     *
     * Los ocho perfiles del enunciado, en el orden en que se demuestran: primero
     * quienes administran, después el salón, después la cocina y al final los dos
     * clientes. Son ocho a propósito, para que la grilla de dos columnas cierre en
     * cuatro filas parejas y no quede un hueco en la última.
     *
     * El último NO es un rol: es una cuenta en estado 'Rechazado'. Sirve para
     * demostrar el punto 7 sin tener que rechazar a alguien en el momento: al
     * intentar entrar, `AuthService` cierra la sesión recién abierta y la pantalla
     * muestra el modal con el motivo (y la vibración de error que lo acompaña).
     */
    usuariosValidos: PerfilRapido[] = [
        {
            email: 'duenio@restaurante.com',
            pass: '12345678',
            rol: 'Dueño',
            clave: 'duenio',
            icono: 'shield-checkmark-outline',
        },
        {
            email: 'supervisor@restaurante.com',
            pass: '12345678',
            rol: 'Supervisor',
            clave: 'supervisor',
            icono: 'ribbon-outline',
        },
        { email: 'metre@restaurante.com', pass: '12345678', rol: 'Maître', clave: 'metre', icono: 'people-outline' },
        { email: 'mozo@restaurante.com', pass: '12345678', rol: 'Mozo', clave: 'mozo', icono: 'restaurant-outline' },
        {
            email: 'cocinero@restaurante.com',
            pass: '12345678',
            rol: 'Cocinero',
            clave: 'cocinero',
            icono: 'fast-food-outline',
        },
        {
            email: 'cantinero@restaurante.com',
            pass: '12345678',
            rol: 'Cantinero',
            clave: 'cantinero',
            icono: 'wine-outline',
        },
        {
            email: 'cliente@restaurante.com',
            pass: '12345678',
            rol: 'Cliente',
            clave: 'cliente',
            icono: 'person-outline',
        },
        {
            email: 'rechazado@restaurante.com',
            pass: '12345678',
            rol: 'Rechazado',
            clave: 'rechazado',
            icono: 'close-circle-outline',
        },
    ];

    /**
     * Panel de accesos rápidos: abierto o cerrado.
     *
     * El enunciado pide que los botones de ingreso rápido NO sean fijos. Por eso
     * viven dentro de un panel que se despliega al tocar "Acceso rápido": en
     * reposo la pantalla muestra sólo el formulario, y los perfiles aparecen
     * cuando se los pide.
     */
    accesosAbiertos = signal(false);

    alternarAccesos() {
        this.accesosAbiertos.update((abierto) => !abierto);
    }

    /**
     * Completa el formulario con un perfil de prueba y cierra el panel.
     *
     * Se cierra a propósito: una vez elegido el perfil, lo que importa es ver el
     * formulario ya cargado y el botón de ingresar.
     */
    cargarCredenciales(correo: string, clave: string) {
        this.formulario.setValue({ email: correo, password: clave });
        this.accesosAbiertos.set(false);
    }

    /**
     * Indica si un campo debe mostrar cierto error.
     *
     * Exige que el campo esté "tocado" para no marcar en rojo un formulario
     * recién abierto.
     */
    hayError(control: string, error: string): boolean {
        const campo = this.formulario.get(control);

        return !!campo && campo.touched && campo.hasError(error);
    }

    /**
     * Valida y emite las credenciales.
     *
     * Ante datos inválidos avisa en lugar de salir en silencio: sin ese aviso el
     * botón parece no responder, que era el comportamiento anterior.
     */
    async onLogin() {
        if (this.formulario.invalid) {
            // Ionic solo pinta el error si el control esta "tocado".
            this.formulario.markAllAsTouched();

            // El modal vibra solo al detectar un título de error.
            this.modal.setOpen('Datos inválidos', 'Revise el correo y la contraseña antes de continuar.');

            return;
        }

        this.loginSubmit.emit(this.formulario.value as LoginInterface);
    }

    /** Punto 9: el cliente anónimo entra sin credenciales ni aprobación. */
    ingresoAnonimo() {
        this.loginAnonimo.emit();
    }
}
