// Edge Function para enviar emails transaccionales mediante Brevo.
//
// Flujo:
//   Angular -> Supabase Edge Function -> Brevo -> destinatario
//
// Despliegue:
//   supabase functions deploy enviar-email
//
// Secret requerido:
//   BREVO_API_KEY
//
// La API key NO debe estar en Angular ni en el código.
// Debe estar configurada como secret de Supabase.
const TU_EMAIL_VERIFICADO_EN_BREVO = 'cyberia.2026@outlook.com';

// Interface que mapea exactamente lo que enviamos desde Angular

interface CuerpoPeticion {
    correo: string;
    templateId: number;
    asunto?: string;
    params?: Record<string, any>;
}

export const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

function responder(cuerpo: unknown, status = 200): Response {
    return new Response(JSON.stringify(cuerpo), {
        status,
        headers: {
            'Content-Type': 'application/json',
            ...corsHeaders,
        },
    });
}

Deno.serve(async (peticion: Request) => {
    // ------------------------------------------------------------
    // CORS
    // ------------------------------------------------------------
    if (peticion.method === 'OPTIONS') {
        return new Response('ok', {
            headers: corsHeaders,
        });
    }

    // ------------------------------------------------------------
    // Método HTTP
    // ------------------------------------------------------------
    if (peticion.method !== 'POST') {
        return responder({ error: 'Método no permitido' }, 405);
    }

    // ------------------------------------------------------------
    // API KEY DE BREVO
    // ------------------------------------------------------------
    const apiKey = Deno.env.get('BREVO_API_KEY');

    if (!apiKey) {
        return responder({ error: 'Falta configurar BREVO_API_KEY' }, 500);
    }

    try {
        // --------------------------------------------------------
        // Datos recibidos
        // --------------------------------------------------------
        const { correo, templateId, asunto, params = {} }: CuerpoPeticion = await peticion.json();

        if (!correo) {
            return responder({ error: 'El campo correo es obligatorio' }, 400);
        }

        if (!templateId) {
            return responder({ error: 'El campo templateId es obligatorio' }, 400);
        }

        // --------------------------------------------------------
        // PAYLOAD PARA BREVO
        // --------------------------------------------------------

        const payloadBrevo: Record<string, any> = {
            sender: {
                name: 'Cyberia',
                email: TU_EMAIL_VERIFICADO_EN_BREVO,
            },
            to: [
                {
                    email: correo,
                    name: params.nombre || 'Usuario',
                },
            ],
            templateId: Number(templateId),
            params: params,
        };

        // Si desde Angular mandamos un asunto, se lo inyectamos a Brevo para que pise el de la plantilla
        if (asunto) {
            payloadBrevo.subject = asunto;
        }

        // --------------------------------------------------------
        // PETICIÓN A BREVO UTILIZANDO PLANTILLAS
        // --------------------------------------------------------
        const respuesta = await fetch('https://api.brevo.com/v3/smtp/email', {
            method: 'POST',
            headers: {
                'accept': 'application/json',
                'api-key': apiKey,
                'content-type': 'application/json',
            },
            body: JSON.stringify(payloadBrevo),
        });

        // --------------------------------------------------------
        // RESPUESTA DE BREVO
        // --------------------------------------------------------
        const datos = await respuesta.json();

        if (!respuesta.ok) {
            return responder(
                {
                    error: 'Brevo rechazó el envío de la plantilla',
                    detalle: datos,
                },
                respuesta.status
            );
        }

        return responder({
            enviado: true,
            mensaje: 'Email de plantilla enviado correctamente',
            brevo: datos,
        });
    } catch (error) {
        const mensaje = error instanceof Error ? error.message : String(error);
        return responder({ error: mensaje }, 500);
    }
});
