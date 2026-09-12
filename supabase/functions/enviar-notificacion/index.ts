// Edge Function que traduce un evento de la base en una notificación push.
//
// Supabase no envía push por sí solo: su canal en tiempo real usa WebSocket,
// que muere cuando la aplicación se cierra. Esta función recibe el aviso de un
// disparador de Postgres y se lo reenvía a Firebase Cloud Messaging.
//
// Usa la API HTTP v1 de FCM. La versión anterior usaba la API "legacy"
// (fcm/send con FCM_SERVER_KEY), que Google dio de baja en 2024: con ella los
// envíos fallan aunque todo lo demás esté bien configurado.
//
// Despliegue:
//   supabase functions deploy enviar-notificacion
//   supabase secrets set FIREBASE_SERVICE_ACCOUNT="$(cat cuenta-servicio.json)"
//
// El JSON de la cuenta de servicio se descarga en Firebase Console >
// Configuración del proyecto > Cuentas de servicio > Generar nueva clave
// privada. Es secreto: no se sube al repositorio.

interface CuerpoPeticion {
    // Tokens de los dispositivos que deben recibir el aviso.
    tokens: string[];
    titulo: string;
    cuerpo: string;
    // Debe coincidir con TipoNotificacion del frontend.
    tipo: string;
    datos?: Record<string, unknown>;
}

interface CuentaServicio {
    project_id: string;
    client_email: string;
    private_key: string;
}

// Mismo id que crea la aplicación en NotificacionesService: si no coincide,
// Android muestra el aviso sin sonido ni vibración.
const CANAL_ANDROID = 'avisos-cyberia';

const ALCANCE_FCM = 'https://www.googleapis.com/auth/firebase.messaging';
const URL_TOKEN_GOOGLE = 'https://oauth2.googleapis.com/token';

function responder(cuerpo: unknown, status = 200): Response {
    return new Response(JSON.stringify(cuerpo), {
        status,
        headers: { 'Content-Type': 'application/json' },
    });
}

/** base64url sin relleno, que es lo que exige un JWT. */
function base64url(bytes: Uint8Array): string {
    let binario = '';
    for (const byte of bytes) binario += String.fromCharCode(byte);
    return btoa(binario).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function textoABase64url(texto: string): string {
    return base64url(new TextEncoder().encode(texto));
}

/** Convierte la clave privada PEM de la cuenta de servicio en una CryptoKey. */
async function importarClavePrivada(pem: string): Promise<CryptoKey> {
    const contenido = pem
        .replace('-----BEGIN PRIVATE KEY-----', '')
        .replace('-----END PRIVATE KEY-----', '')
        .replace(/\s+/g, '');

    const der = Uint8Array.from(atob(contenido), (caracter) => caracter.charCodeAt(0));

    return await crypto.subtle.importKey(
        'pkcs8',
        der,
        { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
        false,
        ['sign']
    );
}

/**
 * Pide a Google un token de acceso firmando un JWT con la cuenta de servicio.
 *
 * FCM v1 no acepta una clave fija: cada envío necesita un token OAuth2 de una
 * hora de vida, que se obtiene acá.
 */
async function obtenerTokenAcceso(cuenta: CuentaServicio): Promise<string> {
    const ahora = Math.floor(Date.now() / 1000);

    const encabezado = textoABase64url(JSON.stringify({ alg: 'RS256', typ: 'JWT' }));
    const reclamos = textoABase64url(
        JSON.stringify({
            iss: cuenta.client_email,
            scope: ALCANCE_FCM,
            aud: URL_TOKEN_GOOGLE,
            iat: ahora,
            exp: ahora + 3600,
        })
    );

    const sinFirmar = `${encabezado}.${reclamos}`;
    const clave = await importarClavePrivada(cuenta.private_key);
    const firma = await crypto.subtle.sign('RSASSA-PKCS1-v1_5', clave, new TextEncoder().encode(sinFirmar));

    const respuesta = await fetch(URL_TOKEN_GOOGLE, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
            grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
            assertion: `${sinFirmar}.${base64url(new Uint8Array(firma))}`,
        }),
    });

    const datos = await respuesta.json();

    if (!respuesta.ok || !datos.access_token) {
        throw new Error(`Google rechazó la cuenta de servicio: ${JSON.stringify(datos)}`);
    }

    return datos.access_token as string;
}

Deno.serve(async (peticion: Request) => {
    if (peticion.method !== 'POST') {
        return new Response('Método no permitido', { status: 405 });
    }

    const credenciales = Deno.env.get('FIREBASE_SERVICE_ACCOUNT');

    if (!credenciales) {
        return responder({ error: 'Falta configurar FIREBASE_SERVICE_ACCOUNT' }, 500);
    }

    try {
        const { tokens, titulo, cuerpo, tipo, datos }: CuerpoPeticion = await peticion.json();

        // Un mismo dispositivo puede figurar dos veces si lo usaron dos perfiles.
        const destinatarios = [...new Set((tokens ?? []).filter((token) => !!token))];

        if (destinatarios.length === 0) {
            return responder({ enviados: 0, motivo: 'Sin destinatarios' });
        }

        const cuenta: CuentaServicio = JSON.parse(credenciales);
        const tokenAcceso = await obtenerTokenAcceso(cuenta);

        // En FCM v1 todos los valores de `data` tienen que ser texto.
        const datosTexto: Record<string, string> = { tipo };
        for (const [clave, valor] of Object.entries(datos ?? {})) {
            datosTexto[clave] = String(valor);
        }

        const urlEnvio = `https://fcm.googleapis.com/v1/projects/${cuenta.project_id}/messages:send`;

        // v1 no admite varios destinatarios en una llamada: va una por token.
        const resultados = await Promise.all(
            destinatarios.map(async (token) => {
                const respuesta = await fetch(urlEnvio, {
                    method: 'POST',
                    headers: {
                        Authorization: `Bearer ${tokenAcceso}`,
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        message: {
                            token,
                            // El bloque notification es lo que permite que Android
                            // muestre el aviso con la aplicación cerrada.
                            notification: { title: titulo, body: cuerpo },
                            // data viaja siempre y le dice a la app a qué
                            // pantalla llevar al usuario.
                            data: datosTexto,
                            android: {
                                priority: 'HIGH',
                                notification: {
                                    channel_id: CANAL_ANDROID,
                                    sound: 'default',
                                    default_vibrate_timings: true,
                                },
                            },
                        },
                    }),
                });

                return respuesta.ok ? { ok: true } : { ok: false, detalle: await respuesta.json() };
            })
        );

        const enviados = resultados.filter((resultado) => resultado.ok).length;

        return responder(
            {
                enviados,
                fallidos: resultados.length - enviados,
                errores: resultados.filter((resultado) => !resultado.ok),
            },
            enviados > 0 ? 200 : 502
        );
    } catch (error) {
        const mensaje = error instanceof Error ? error.message : String(error);

        return responder({ error: mensaje }, 500);
    }
});
