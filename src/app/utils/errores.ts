/**
 * Mensajes de error en español, en un solo lugar.
 *
 * El enunciado exige que TODO texto esté en español, pero los errores no los
 * escribimos nosotros: Supabase Auth, el almacenamiento y el lector de códigos
 * contestan en inglés ("Invalid login credentials", "User already registered").
 * Cuando una pantalla muestra `error.message` tal cual, ese inglés llega al
 * usuario.
 *
 * Acá se traducen los que pueden aparecer de verdad en la aplicación. Lo que no
 * esté en la lista cae en el mensaje alternativo que pasa cada pantalla, que ya
 * está escrito en español y dice qué se estaba intentando hacer.
 */

/** Trozo de texto a buscar (en minúsculas) y qué decir en su lugar. */
const TRADUCCIONES: readonly [string, string][] = [
    ['invalid login credentials', 'El correo o la contraseña no son correctos.'],
    ['email not confirmed', 'Todavía no confirmaste tu correo electrónico.'],
    ['user already registered', 'Ya existe una cuenta con ese correo electrónico.'],
    ['already been registered', 'Ya existe una cuenta con ese correo electrónico.'],
    ['password should be at least', 'La contraseña es demasiado corta.'],
    ['unable to validate email address', 'El correo electrónico no tiene un formato válido.'],
    ['email rate limit exceeded', 'Se hicieron demasiados intentos. Esperá unos minutos.'],
    ['over_request_rate_limit', 'Se hicieron demasiados intentos. Esperá unos minutos.'],
    ['for security purposes', 'Esperá unos segundos antes de volver a intentarlo.'],
    ['jwt expired', 'Tu sesión venció. Volvé a iniciar sesión.'],
    ['invalid refresh token', 'Tu sesión venció. Volvé a iniciar sesión.'],
    ['duplicate key value', 'Ese dato ya está cargado.'],
    ['violates foreign key', 'No se puede guardar: falta un dato relacionado.'],
    ['violates row-level security', 'Tu usuario no tiene permiso para hacer esa operación.'],
    ['payload too large', 'La imagen es demasiado grande.'],
    ['failed to fetch', 'No hay conexión con el servidor. Revisá tu internet.'],
    ['network', 'No hay conexión con el servidor. Revisá tu internet.'],
    ['timeout', 'El servidor tardó demasiado en responder. Probá de nuevo.'],
];

/**
 * Devuelve el mensaje a mostrar en el modal.
 *
 * @param error       Lo que vino del `catch`.
 * @param alternativa Qué decir si el error no se reconoce. Siempre en español
 *                    y contando qué se estaba haciendo ("No se pudo guardar el
 *                    producto."), que es más útil que el texto técnico.
 */
export function mensajeDeError(error: unknown, alternativa: string): string {
    const original = error instanceof Error ? error.message : typeof error === 'string' ? error : '';
    const buscado = original.toLowerCase();

    for (const [ingles, espanol] of TRADUCCIONES) {
        if (buscado.includes(ingles)) return espanol;
    }

    // Si el mensaje ya está en español (los escribimos nosotros), se respeta:
    // dice más que cualquier alternativa genérica. Se detecta por los
    // caracteres que el inglés no usa y por palabras nuestras frecuentes.
    if (original && /[áéíóúñ¿¡]|\b(no|se|pudo|debe|tiene|falta|ya)\b/i.test(original)) {
        return original;
    }

    return alternativa;
}
