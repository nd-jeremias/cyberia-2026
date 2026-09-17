// This file can be replaced during build by using the `fileReplacements` array.
// `ng build` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
    production: false,

    /**
     * Cuenta de EmailJS desde la que salen los correos automáticos.
     *
     * El enunciado exige que los avisos de registro salgan de una cuenta de la
     * empresa y no de la cuenta personal de un integrante. Vive acá y no dentro
     * del servicio para poder cambiar de cuenta sin tocar el código, y para que
     * al armar la entrega se vea de un vistazo qué credenciales viajan en el
     * APK. La clave pública de EmailJS está pensada para usarse desde el
     * navegador: no es un secreto.
     */
    emailjs: {
        serviceId: 'service_ek7jpdd',
        publicKey: 'RLbRJhW8Gk9IN-Z3Z',
        // Plantillas: una por tipo de aviso, porque el enunciado (puntos 5, 7 y
        // 8) pide que se distingan entre sí.
        plantillaPendiente: 'template_8fl84ys',
        plantillaAprobado: 'template_8fl84ys',
        plantillaRechazado: 'template_t44g5mr',
    },
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/plugins/zone-error';  // Included with Angular CLI.
