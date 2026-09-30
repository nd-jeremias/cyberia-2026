export const environment = {
    production: true,

    /** Misma cuenta de empresa que en desarrollo (ver environment.ts). */
    emailjs: {
        serviceId: 'service_ek7jpdd',
        publicKey: 'RLbRJhW8Gk9IN-Z3Z',
        // Plantillas: una por tipo de aviso, porque el enunciado (puntos 5, 7 y
        // 8) pide que se distingan entre sí.
        plantillaSolicitud: 'template_8fl84ys',
        plantillaRespuesta: 'template_t44g5mr',
    },
};
