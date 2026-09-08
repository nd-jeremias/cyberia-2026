import { addIcons } from 'ionicons';
import {
    addCircleOutline,
    alertCircleOutline,
    briefcaseOutline,
    cardOutline,
    cartOutline,
    chatbubblesOutline,
    checkmarkCircle,
    chevronBackOutline,
    chevronDownOutline,
    chevronForwardOutline,
    closeCircle,
    createOutline,
    easelOutline,
    enterOutline,
    fastFoodOutline,
    flashOutline,
    gridOutline,
    handRight,
    imageOutline,
    informationCircleOutline,
    listOutline,
    lockClosedOutline,
    logInOutline,
    mailOutline,
    peopleOutline,
    person,
    personAddOutline,
    personCircleOutline,
    personOutline,
    pricetagOutline,
    qrCodeOutline,
    receiptOutline,
    restaurant,
    restaurantOutline,
    shieldCheckmarkOutline,
    swapHorizontal,
    timeOutline,
    trashOutline,
    wineOutline,
} from 'ionicons/icons';

/**
 * Registro central de iconos.
 *
 * POR QUÉ EXISTE ESTE ARCHIVO
 * ---------------------------
 * `ion-icon` no trae los dibujos incluidos: o se registran a mano con
 * `addIcons`, o el componente sale a buscar el SVG por HTTP a una carpeta que
 * en este proyecto no se copia al compilar (angular.json solo publica
 * `src/assets`).
 *
 * Hasta ahora solo cuatro componentes llamaban a `addIcons`. Todos los demás
 * (tarjetas de producto, tarjetas de usuario, pedidos, asignación de mesas,
 * alta de mesa, gestión de productos...) pedían iconos que nunca se habían
 * registrado, así que en el teléfono se veía el hueco vacío del icono. Buena
 * parte de la sensación de "pantalla plana" venía de ahí: listados y botones
 * sin ningún icono que los acompañe son solo renglones de texto.
 *
 * `addIcons` escribe en un mapa global compartido por toda la aplicación, así
 * que alcanza con llamarlo una vez al arrancar (desde `main.ts`) para que
 * cualquier `ion-icon` de cualquier pantalla encuentre su dibujo.
 *
 * Para sumar un icono nuevo: importarlo arriba y agregarlo al objeto de abajo,
 * usando como clave el mismo nombre que se escribe en el atributo `name`.
 */
export function registrarIconos(): void {
    addIcons({
        'add-circle-outline': addCircleOutline,
        'alert-circle-outline': alertCircleOutline,
        'briefcase-outline': briefcaseOutline,
        'card-outline': cardOutline,
        'cart-outline': cartOutline,
        'chatbubbles-outline': chatbubblesOutline,
        'checkmark-circle': checkmarkCircle,
        'chevron-back-outline': chevronBackOutline,
        'chevron-down-outline': chevronDownOutline,
        'chevron-forward-outline': chevronForwardOutline,
        'close-circle': closeCircle,
        'create-outline': createOutline,
        'easel-outline': easelOutline,
        'enter-outline': enterOutline,
        'fast-food-outline': fastFoodOutline,
        'flash-outline': flashOutline,
        'grid-outline': gridOutline,
        'hand-right': handRight,
        'image-outline': imageOutline,
        'information-circle-outline': informationCircleOutline,
        'list-outline': listOutline,
        'lock-closed-outline': lockClosedOutline,
        'log-in-outline': logInOutline,
        'mail-outline': mailOutline,
        'people-outline': peopleOutline,
        person: person,
        'person-add-outline': personAddOutline,
        'person-circle-outline': personCircleOutline,
        'person-outline': personOutline,
        'pricetag-outline': pricetagOutline,
        'qr-code-outline': qrCodeOutline,
        'receipt-outline': receiptOutline,
        restaurant: restaurant,
        'restaurant-outline': restaurantOutline,
        'shield-checkmark-outline': shieldCheckmarkOutline,
        'swap-horizontal': swapHorizontal,
        'time-outline': timeOutline,
        'trash-outline': trashOutline,
        'wine-outline': wineOutline,
    });
}
