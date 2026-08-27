// Edge Function que traduce un evento de la base en una notificacion push.
//
// Supabase no envia push por si solo: su canal en tiempo real usa WebSocket,
// que muere cuando la aplicacion se cierra. Esta funcion recibe el aviso de un
// trigger de Postgres y se lo reenvia a Firebase Cloud Messaging.
//
// Despliegue:  supabase functions deploy enviar-notificacion
// Secretos:    supabase secrets set FCM_SERVER_KEY=...

interface CuerpoPeticion {
    // Tokens de los dispositivos que deben recibir el aviso.
    tokens: string[];
    titulo: string;
    cuerpo: string;
    // Debe coincidir con TipoNotificacion del frontend.
    tipo: string;
    datos?: Record<string, string>;
}

const FCM_URL = 'https://fcm.googleapis.com/fcm/send';

Deno.serve(async (peticion: Request) => {
    if (peticion.method !== 'POST') {
        return new Response('Método no permitido', { status: 405 });
    }

    const claveFcm = Deno.env.get('FCM_SERVER_KEY');

    if (!claveFcm) {
        return new Response(
            JSON.stringify({ error: 'Falta configurar FCM_SERVER_KEY' }),
            { status: 500, headers: { 'Content-Type': 'application/json' } }
        );
    }

    const { tokens, titulo, cuerpo, tipo, datos }: CuerpoPeticion =
        await peticion.json();

    const destinatarios = (tokens ?? []).filter((t) => !!t);

    if (destinatarios.length === 0) {
        return new Response(
            JSON.stringify({ enviados: 0, motivo: 'Sin destinatarios' }),
            { status: 200, headers: { 'Content-Type': 'application/json' } }
        );
    }

    const respuesta = await fetch(FCM_URL, {
        method: 'POST',
        headers: {
            Authorization: `key=${claveFcm}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            registration_ids: destinatarios,
            // El bloque notification es lo que permite que Android muestre el
            // aviso con la aplicacion cerrada. Sin el, solo llega si esta abierta.
            notification: {
                title: titulo,
                body: cuerpo,
                sound: 'default',
                android_channel_id: 'avisos-cyberia',
            },
            // data viaja siempre y es lo que usa la app para saber a que
            // pantalla llevar al usuario.
            data: { tipo, ...(datos ?? {}) },
            priority: 'high',
        }),
    });

    const resultado = await respuesta.json();

    return new Response(
        JSON.stringify({ enviados: destinatarios.length, fcm: resultado }),
        {
            status: respuesta.ok ? 200 : 502,
            headers: { 'Content-Type': 'application/json' },
        }
    );
});
