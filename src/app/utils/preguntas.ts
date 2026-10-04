import { Pregunta } from '../interfaces/games.interface';

export const PREGUNTAS_DATA: Pregunta[] = [
    {
        id: 1,
        pregunta: '¿Cuál es el río más largo del mundo?',
        opciones: [
            { texto: 'Río Amazonas', correcta: true },
            { texto: 'Río Nilo', correcta: false },
            { texto: 'Río Misisipi', correcta: false },
            { texto: 'Río Yangtze', correcta: false },
        ],
    },
    {
        id: 2,
        pregunta: '¿En qué año cayó el Muro de Berlín?',
        opciones: [
            { texto: '1989', correcta: true },
            { texto: '1991', correcta: false },
            { texto: '1985', correcta: false },
            { texto: '1975', correcta: false },
        ],
    },
    {
        id: 3,
        pregunta: '¿Cuál es el país más grande del mundo por extensión territorial?',
        opciones: [
            { texto: 'Rusia', correcta: true },
            { texto: 'Canadá', correcta: false },
            { texto: 'China', correcta: false },
            { texto: 'Estados Unidos', correcta: false },
        ],
    },
    {
        id: 4,
        pregunta: '¿Qué civilización antigua construyó Machu Picchu?',
        opciones: [
            { texto: 'Inca', correcta: true },
            { texto: 'Maya', correcta: false },
            { texto: 'Azteca', correcta: false },
            { texto: 'Olmeca', correcta: false },
        ],
    },
    {
        id: 5,
        pregunta: '¿Cuál es la capital de Australia?',
        opciones: [
            { texto: 'Canberra', correcta: true },
            { texto: 'Sídney', correcta: false },
            { texto: 'Melbourne', correcta: false },
            { texto: 'Brisbane', correcta: false },
        ],
    },
    {
        id: 6,
        pregunta: '¿Quién fue el primer presidente electo en el regreso a la democracia en Argentina en 1983?',
        opciones: [
            { texto: 'Raúl Alfonsín', correcta: true },
            { texto: 'Carlos Menem', correcta: false },
            { texto: 'Ítalo Luder', correcta: false },
            { texto: 'Reynaldo Bignone', correcta: false },
        ],
    },
    {
        id: 7,
        pregunta: '¿Cuál es el elemento más abundante en la atmósfera de la Tierra?',
        opciones: [
            { texto: 'Nitrógeno', correcta: true },
            { texto: 'Oxígeno', correcta: false },
            { texto: 'Dióxido de carbono', correcta: false },
            { texto: 'Hidrógeno', correcta: false },
        ],
    },
    {
        id: 8,
        pregunta: '¿Qué órgano del cuerpo humano consume más energía?',
        opciones: [
            { texto: 'El cerebro', correcta: true },
            { texto: 'El corazón', correcta: false },
            { texto: 'El hígado', correcta: false },
            { texto: 'Los músculos', correcta: false },
        ],
    },
    {
        id: 9,
        pregunta: '¿Cuál es el planeta más cercano al Sol?',
        opciones: [
            { texto: 'Mercurio', correcta: true },
            { texto: 'Venus', correcta: false },
            { texto: 'Marte', correcta: false },
            { texto: 'Tierra', correcta: false },
        ],
    },
    {
        id: 10,
        pregunta: '¿Cuántos huesos tiene el cuerpo humano adulto?',
        opciones: [
            { texto: '206', correcta: true },
            { texto: '215', correcta: false },
            { texto: '198', correcta: false },
            { texto: '300', correcta: false },
        ],
    },
    {
        id: 11,
        pregunta: '¿Qué tipo de animal es la ballena azul?',
        opciones: [
            { texto: 'Mamífero', correcta: true },
            { texto: 'Pez', correcta: false },
            { texto: 'Reptil', correcta: false },
            { texto: 'Anfibio', correcta: false },
        ],
    },
    {
        id: 12,
        pregunta: '¿Cuál es el metal cuyo símbolo químico es Au?',
        opciones: [
            { texto: 'Oro', correcta: true },
            { texto: 'Plata', correcta: false },
            { texto: 'Cobre', correcta: false },
            { texto: 'Aluminio', correcta: false },
        ],
    },
    {
        id: 13,
        pregunta: "¿Quién pintó la famosa obra 'La noche estrellada'?",
        opciones: [
            { texto: 'Vincent van Gogh', correcta: true },
            { texto: 'Leonardo da Vinci', correcta: false },
            { texto: 'Pablo Picasso', correcta: false },
            { texto: 'Claude Monet', correcta: false },
        ],
    },
    {
        id: 14,
        pregunta: '¿Cuál es el libro más vendido de la historia después de la Biblia?',
        opciones: [
            { texto: 'Don Quijote de la Mancha', correcta: true },
            { texto: 'El Señor de los Anillos', correcta: false },
            { texto: 'Historia de dos ciudades', correcta: false },
            { texto: 'El Principito', correcta: false },
        ],
    },
    {
        id: 15,
        pregunta: "¿Qué banda británica lanzó el álbum 'The Dark Side of the Moon'?",
        opciones: [
            { texto: 'Pink Floyd', correcta: true },
            { texto: 'The Beatles', correcta: false },
            { texto: 'Queen', correcta: false },
            { texto: 'Led Zeppelin', correcta: false },
        ],
    },
    {
        id: 16,
        pregunta: "¿Quién escribió la tragedia 'Romeo y Julieta'?",
        opciones: [
            { texto: 'William Shakespeare', correcta: true },
            { texto: 'Miguel de Cervantes', correcta: false },
            { texto: 'Charles Dickens', correcta: false },
            { texto: 'Oscar Wilde', correcta: false },
        ],
    },
    {
        id: 17,
        pregunta: '¿En qué país se originó el arte marcial del Karate?',
        opciones: [
            { texto: 'Japón', correcta: true },
            { texto: 'China', correcta: false },
            { texto: 'Corea del Sur', correcta: false },
            { texto: 'Tailandia', correcta: false },
        ],
    },
    {
        id: 18,
        pregunta: "¿Cuántos premios Óscar ganó la película 'Titanic' (1997)?",
        opciones: [
            { texto: '11', correcta: true },
            { texto: '9', correcta: false },
            { texto: '14', correcta: false },
            { texto: '12', correcta: false },
        ],
    },
    {
        id: 19,
        pregunta: '¿Qué país ha ganado más Copas Mundiales de la FIFA?',
        opciones: [
            { texto: 'Brasil', correcta: true },
            { texto: 'Alemania', correcta: false },
            { texto: 'Italia', correcta: false },
            { texto: 'Argentina', correcta: false },
        ],
    },
    {
        id: 20,
        pregunta: '¿Cada cuántos años se celebran los Juegos Olímpicos de Verano?',
        opciones: [
            { texto: '4 años', correcta: true },
            { texto: '2 años', correcta: false },
            { texto: '5 años', correcta: false },
            { texto: '6 años', correcta: false },
        ],
    },
    {
        id: 21,
        pregunta: '¿Cuál es el nombre del superhéroe cuya identidad secreta es Bruce Wayne?',
        opciones: [
            { texto: 'Batman', correcta: true },
            { texto: 'Superman', correcta: false },
            { texto: 'Spider-Man', correcta: false },
            { texto: 'Iron Man', correcta: false },
        ],
    },
    {
        id: 22,
        pregunta: "¿En qué deporte se utiliza un término llamado 'Home Run'?",
        opciones: [
            { texto: 'Béisbol', correcta: true },
            { texto: 'Fútbol americano', correcta: false },
            { texto: 'Baloncesto', correcta: false },
            { texto: 'Golf', correcta: false },
        ],
    },
    {
        id: 23,
        pregunta: "¿Qué plataforma de streaming produjo la serie 'Stranger Things'?",
        opciones: [
            { texto: 'Netflix', correcta: true },
            { texto: 'HBO Max', correcta: false },
            { texto: 'Amazon Prime Video', correcta: false },
            { texto: 'Disney+', correcta: false },
        ],
    },
    {
        id: 24,
        pregunta: "¿Quién es considerado el 'Rey del Pop'?",
        opciones: [
            { texto: 'Michael Jackson', correcta: true },
            { texto: 'Elvis Presley', correcta: false },
            { texto: 'Prince', correcta: false },
            { texto: 'Freddie Mercury', correcta: false },
        ],
    },
    {
        id: 25,
        pregunta: "¿Qué significa la sigla 'WWW' en las direcciones de internet?",
        opciones: [
            { texto: 'World Wide Web', correcta: true },
            { texto: 'World Wide Windows', correcta: false },
            { texto: 'Web Wide World', correcta: false },
            { texto: 'World Wide Waves', correcta: false },
        ],
    },
    {
        id: 26,
        pregunta: '¿Cuál es la moneda oficial de Japón?',
        opciones: [
            { texto: 'Yen', correcta: true },
            { texto: 'Yuan', correcta: false },
            { texto: 'Won', correcta: false },
            { texto: 'Ringgit', correcta: false },
        ],
    },
    {
        id: 27,
        pregunta: '¿Qué empresa tecnológica desarrolló el sistema operativo Android?',
        opciones: [
            { texto: 'Google', correcta: true },
            { texto: 'Apple', correcta: false },
            { texto: 'Microsoft', correcta: false },
            { texto: 'Samsung', correcta: false },
        ],
    },
    {
        id: 28,
        pregunta: '¿Cuál es el océano más grande del mundo?',
        opciones: [
            { texto: 'Océano Pacífico', correcta: true },
            { texto: 'Océano Atlántico', correcta: false },
            { texto: 'Océano Índico', correcta: false },
            { texto: 'Océano Ártico', correcta: false },
        ],
    },
    {
        id: 29,
        pregunta: '¿Qué gas absorben las plantas para realizar la fotosíntesis?',
        opciones: [
            { texto: 'Dióxido de carbono', correcta: true },
            { texto: 'Oxígeno', correcta: false },
            { texto: 'Nitrógeno', correcta: false },
            { texto: 'Metano', correcta: false },
        ],
    },
    {
        id: 30,
        pregunta: '¿Cuál es el idioma nativo más hablado en el mundo?',
        opciones: [
            { texto: 'Chino mandarín', correcta: true },
            { texto: 'Inglés', correcta: false },
            { texto: 'Español', correcta: false },
            { texto: 'Hindi', correcta: false },
        ],
    },
];
