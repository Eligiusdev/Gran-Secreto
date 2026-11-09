// datos.js — ÚNICA fuente de datos. Agregar un lugar aquí lo muestra solo en todas las páginas.

// Categorías: id (se usa en el enlace #id y en cada lugar), nombre, descripción corta y foto (si falta, se usa el reemplazo).
const CATEGORIAS = [
  { id: 'naturaleza',  nombre: 'Naturaleza',                  imagen: 'img/naturaleza.jpg',         texto: 'Parques, jardines, bosques y espacios verdes para descansar al aire libre.' },
  { id: 'cafes',       nombre: 'Cafeterías',                  imagen: 'img/cafeterias.jpg',         texto: 'Cafés especiales, espacios acogedores y lugares para compartir.' },
  { id: 'gastronomia', nombre: 'Gastronomía',                 imagen: 'img/gastronomia.jpg',    texto: 'Plazas y zonas para probar la comida tradicional y local.' },
  { id: 'miradores',   nombre: 'Miradores',                   imagen: 'img/mirador-las-palmas.jpg', texto: 'Lugares para contemplar Medellín desde las alturas.' },
  { id: 'arte',        nombre: 'Arte y cultura',              imagen: 'img/arte.png',               texto: 'Museos, murales, galerías, arte urbano y espacios históricos.' },
  { id: 'turismo',     nombre: 'Turismo y sitios históricos', imagen: 'img/pueblito.jpg',           texto: 'Lugares emblemáticos para conocer la historia y las tradiciones de la ciudad.' }
];

// Lugares: id único (lo que se guarda en favoritos), categoría (debe existir arriba),
// zona (ubicación), descripcion (tarjeta), detalle (ventana emergente), tags y foto.
const LUGARES = [
  { id: 'jardin-botanico', categoria: 'naturaleza', nombre: 'Jardín Botánico', zona: 'Sevilla',
    descripcion: 'Un oasis verde en el centro de la ciudad, con orquidiario, lago y senderos para caminar.',
    detalle: 'Un jardín con colecciones de plantas, orquidiario y lago, ideal para una caminata tranquila y para tomar fotografías.',
    tags: ['Entrada libre', 'Ideal en familia', 'Fotografía'] },
  { id: 'parque-arvi', categoria: 'naturaleza', nombre: 'Parque Arví', zona: 'Santa Elena',
    descripcion: 'Reserva natural en las montañas, a la que se llega en Metrocable, con caminatas y mercado campesino.',
    detalle: 'Se llega en Metrocable (Línea L). Tiene senderos ecológicos y un mercado campesino; conviene reservar el día completo.',
    tags: ['Metrocable', 'Senderismo', 'Todo el día'] },
  { id: 'cerro-el-volador', categoria: 'miradores', nombre: 'Cerro El Volador', zona: 'Robledo',
    descripcion: 'Cerro con bosque y senderos que ofrece una vista amplia del valle de Aburrá.',
    detalle: 'Un cerro con bosque y senderos desde cuya cima se ve gran parte del valle. Muy buen sitio para ver el atardecer.',
    tags: ['Vista panorámica', 'Gratis', 'Atardeceres'] },
  { id: 'cafes-laureles', categoria: 'cafes', nombre: 'Cafeterías de Laureles', zona: 'Laureles',
    descripcion: 'Cafés especiales y espacios acogedores para compartir en un barrio tranquilo.',
    detalle: 'Un barrio residencial con cafés de especialidad en casas y calles arboladas, perfecto para conversar sin afán.',
    tags: ['Café especial', 'Ambiente tranquilo', 'Para compartir'] },
  { id: 'cafes-poblados', categoria: 'cafes', nombre: 'Cafeterías de El Poblado', zona: 'El Poblado',
    descripcion: 'Cafés con buen ambiente para encontrarse con amigos o trabajar un rato.',
    detalle: 'Cafés con terrazas y buena conexión, pensados para reunirse con amigos o trabajar unas horas.',
    tags: ['Café especial', 'Terrazas', 'Para trabajar'] },
  { id: 'cafes-manila', categoria: 'cafes', nombre: 'Cafeterías de Manila', zona: 'Manila, El Poblado',
    descripcion: 'Cafés con carácter en una de las zonas más animadas de El Poblado.',
    detalle: 'Una zona joven y movida de El Poblado, con cafés de diseño y mucha vida de barrio.',
    tags: ['Café especial', 'Ambiente joven', 'Para compartir'] },
  { id: 'comuna-13', categoria: 'arte', nombre: 'Comuna 13', zona: 'San Javier',
    descripcion: 'Barrio transformado por el arte urbano, con murales, grafitis, música y escaleras eléctricas.',
    detalle: 'Un barrio que cambió su historia con arte urbano. Se recomienda recorrerlo con un guía local.',
    tags: ['Murales', 'Tour guiado', 'Historia viva'] },
  { id: 'casa-de-la-memoria', categoria: 'arte', nombre: 'Museo Casa de la Memoria', zona: 'Boston',
    descripcion: 'Espacio que reconoce las historias del conflicto en Colombia y promueve la reflexión y la paz.',
    detalle: 'Un museo con exposiciones sobre la memoria del conflicto armado colombiano, pensado para reflexionar sobre la paz.',
    tags: ['Museo', 'Exposiciones', 'Reflexión'] },
  { id: 'mirador-las-palmas', categoria: 'miradores', nombre: 'Miradores de Las Palmas', zona: 'Vía Las Palmas',
    descripcion: 'Paradas a lo largo de la vía con vistas de Medellín desde las alturas.',
    detalle: 'Varias paradas sobre la vía con restaurantes y vistas de la ciudad; lo mejor es ir al atardecer.',
    tags: ['Vista de la ciudad', 'Gastronomía', 'Atardeceres'] },
  { id: 'pueblito-paisa', categoria: 'turismo', nombre: 'Pueblito Paisa', zona: 'Cerro Nutibara',
    descripcion: 'Réplica de un pueblo antioqueño tradicional, con plaza, iglesia y vista a la ciudad.',
    detalle: 'Una réplica de pueblo antioqueño en la cima del Cerro Nutibara, con artesanías y vista a la ciudad.',
    tags: ['Tradición paisa', 'Artesanías', 'Vista a la ciudad'] },
  { id: 'centro-historico', categoria: 'turismo', nombre: 'Lugares históricos del centro', zona: 'Centro',
    descripcion: 'Plazas, edificios y esculturas, como la Plaza Botero, que cuentan la historia de la ciudad.',
    detalle: 'Un recorrido a pie por plazas, edificios y esculturas que resumen la historia de Medellín.',
    tags: ['Plaza Botero', 'Esculturas', 'A pie'] },
  // NUEVOS (la HU-02 pide mínimo 12 y la HU-03 pide Gastronomía): revisar textos antes de entregar.
  { id: 'plaza-minorista', categoria: 'gastronomia', nombre: 'Plaza Minorista', zona: 'Guayabal',
    descripcion: 'Plaza de mercado con frutas, productos del campo y comida tradicional antioqueña.',
    detalle: 'Una plaza de mercado donde se prueban frutas, jugos y platos típicos a precios populares.',
    tags: ['Comida típica', 'Frutas', 'Económico'] },
  { id: 'provenza', categoria: 'gastronomia', nombre: 'Provenza', zona: 'El Poblado',
    descripcion: 'Zona de restaurantes y bares con propuestas de cocina local e internacional.',
    detalle: 'Una zona de El Poblado con muchos restaurantes de cocina local e internacional, para ir en plan de cena.',
    tags: ['Restaurantes', 'Cocina variada', 'Noche'] }
];

// Todas las fotos siguen la misma regla: img/<id>.jpg (si no existe, se usa img/placeholder.svg).
LUGARES.forEach((l) => { l.imagen = `img/${l.id}.jpg`; });
