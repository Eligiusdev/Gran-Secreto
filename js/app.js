// app.js — lógica de todo el sitio. Se ejecuta en las 3 páginas y cada bloque solo actúa si su HTML existe.
(() => {
  // ---------- Utilidades ----------
  const $ = (sel) => document.querySelector(sel);                    // atajo para buscar un elemento
  const raiz = document.body.dataset.raiz || '';                     // '' en index.html, '../' en /pages
  const pagina = document.body.dataset.pagina;                       // nombre de la página, para marcar el menú
  const limpiar = (t) => t.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase(); // sin tildes ni mayúsculas (HU-05)
  const maps = (l) => `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(l.nombre + ' Medellín')}`; // enlace "cómo llegar"
  const categoria = (id) => CATEGORIAS.find((c) => c.id === id);     // busca una categoría por id

  // ---------- Encabezado y pie (se escriben una sola vez para las 3 páginas) ----------
  const MENU = [['inicio', 'index.html', 'Inicio'], ['categorias', 'pages/categorias.html', 'Categorías'],
                ['explorar', 'pages/explorar.html', 'Explorar'], ['favoritos', 'pages/explorar.html?categoria=favoritos', 'Favoritos']];
  $('#encabezado').className = 'sticky top-0 z-40 bg-emerald-900 text-white shadow';
  $('#encabezado').innerHTML = `
    <nav class="mx-auto flex max-w-6xl flex-wrap items-center justify-between px-6 py-4" aria-label="Navegación principal">
      <a href="${raiz}index.html" class="marca text-xl font-bold"><i class="bi bi-bicycle mr-2"></i>Gran Secreto</a>
      <button id="botonMenu" class="rounded border border-white px-3 py-1 md:hidden" aria-controls="menu" aria-expanded="false" aria-label="Abrir o cerrar menú"><i class="bi bi-list text-2xl"></i></button>
      <ul id="menu" class="hidden w-full space-y-2 pt-4 md:flex md:w-auto md:gap-6 md:space-y-0 md:pt-0">
        ${MENU.map(([clave, ruta, texto]) => `<li><a href="${raiz}${ruta}" class="block hover:underline ${clave === pagina ? 'font-bold underline' : ''}">${texto}</a></li>`).join('')}
      </ul>
    </nav>`;
  $('#pie').className = 'bg-emerald-900 p-6 text-center text-white';
  $('#pie').innerHTML = '<p>&copy; 2026 Gran Secreto — Descubre los lugares escondidos de Medellín.</p>';
  $('#botonMenu').addEventListener('click', () => {                  // menú móvil: muestra/oculta la lista
    const oculto = $('#menu').classList.toggle('hidden');
    $('#botonMenu').setAttribute('aria-expanded', String(!oculto));
  });

  // ---------- Página CATEGORÍAS: una tarjeta por categoría, generada desde datos.js ----------
  if ($('#listaCategorias')) {
    $('#listaCategorias').innerHTML = CATEGORIAS.map((c) => {
      const total = LUGARES.filter((l) => l.categoria === c.id).length; // cuántos lugares tiene
      return `<a href="explorar.html?categoria=${c.id}" class="group overflow-hidden rounded-xl bg-white shadow-md transition hover:-translate-y-1 hover:shadow-xl">
        <div class="flex h-32 items-center justify-center bg-gradient-to-br ${c.color} text-white"><i class="bi ${c.icono} text-6xl"></i></div>
        <div class="p-5"><h2 class="text-xl font-bold text-emerald-900">${c.nombre}</h2>
          <p class="mb-3 text-gray-600">${c.texto}</p><span class="text-sm font-semibold text-emerald-700">${total} lugares →</span></div></a>`;
    }).join('');
  }

  // ---------- Página EXPLORAR: catálogo, filtros, buscador, favoritos y ventana emergente ----------
  if (!$('#catalogo')) return;                                       // si no es Explorar, terminamos aquí

  const CLAVE = 'gran-secreto-favoritos';                            // nombre con el que se guarda en LocalStorage (HU-06)
  let favs;                                                          // lista de ids favoritos
  try { favs = JSON.parse(localStorage.getItem(CLAVE)) || []; } catch { favs = []; } // si el dato está dañado, empieza vacío
  let filtro = new URLSearchParams(location.search).get('categoria') || 'todos'; // filtro inicial desde la URL
  let texto = '';                                                    // texto actual del buscador
  const modal = $('#modal');                                         // el <dialog> de la ventana emergente

  const alternarFav = (id) => {                                      // agrega o quita un favorito y lo guarda
    favs = favs.includes(id) ? favs.filter((f) => f !== id) : [...favs, id];
    localStorage.setItem(CLAVE, JSON.stringify(favs));
    pintar();
  };
  const botonFav = (id, extra = '') => {                             // botón corazón reutilizado en tarjeta y modal
    const activo = favs.includes(id);
    return `<button data-fav="${id}" aria-pressed="${activo}" aria-label="${activo ? 'Quitar de' : 'Agregar a'} favoritos"
      class="${extra} rounded-full p-2 text-xl ${activo ? 'bg-rose-100 text-rose-600' : 'bg-white/90 text-gray-500'} shadow hover:scale-110 transition">
      <i class="bi ${activo ? 'bi-heart-fill' : 'bi-heart'}"></i></button>`;
  };
  const tarjeta = (l) => `
    <article class="relative overflow-hidden rounded-xl bg-white shadow-md">
      <img src="${raiz}${l.imagen}" alt="${l.nombre}" loading="lazy" class="h-44 w-full object-cover">
      ${botonFav(l.id, 'absolute right-3 top-3')}
      <div class="p-5">
        <span class="text-xs font-bold uppercase text-emerald-700">${categoria(l.categoria).nombre}</span>
        <h2 class="text-lg font-bold text-emerald-900">${l.nombre}</h2>
        <p class="mb-2 text-sm text-gray-500"><i class="bi bi-geo-alt"></i> ${l.zona}</p>
        <p class="mb-4 text-gray-600">${l.descripcion}</p>
        <button data-detalle="${l.id}" class="rounded bg-emerald-900 px-4 py-2 text-white hover:bg-emerald-700">Conocer más</button>
      </div></article>`;

  function pintar() {                                                // dibuja filtros + tarjetas según el estado actual
    const chips = [{ id: 'todos', nombre: 'Todos' }, ...CATEGORIAS, { id: 'favoritos', nombre: `Favoritos (${favs.length})` }];
    $('#filtros').innerHTML = chips.map((c) => `<button data-filtro="${c.id}" class="rounded-full border px-4 py-1 text-sm font-semibold ${c.id === filtro ? 'border-emerald-900 bg-emerald-900 text-white' : 'border-emerald-900 text-emerald-900 hover:bg-emerald-50'}">${c.nombre}</button>`).join('');
    const visibles = LUGARES.filter((l) =>
      (filtro === 'todos' || (filtro === 'favoritos' ? favs.includes(l.id) : l.categoria === filtro)) && // categoría o favoritos
      limpiar(l.nombre).includes(limpiar(texto)));                   // y coincide con el buscador
    $('#catalogo').innerHTML = visibles.map(tarjeta).join('');
    $('#sinResultados').classList.toggle('hidden', visibles.length > 0); // mensaje si no hay nada (HU-05.5)
    if (modal.open) abrirModal(modal.dataset.id);                    // si el modal está abierto, refresca su corazón
  }

  function abrirModal(id) {                                          // llena y abre la ventana emergente (HU-04)
    const l = LUGARES.find((x) => x.id === id);
    modal.dataset.id = id;
    modal.innerHTML = `
      <img src="${raiz}${l.imagen}" alt="${l.nombre}" class="h-56 w-full object-cover">
      <div class="space-y-3 p-6">
        <div class="flex items-start justify-between gap-3"><h2 class="text-2xl font-bold text-emerald-900">${l.nombre}</h2>${botonFav(l.id)}</div>
        <p class="text-sm text-gray-500"><i class="bi bi-tag"></i> ${categoria(l.categoria).nombre} &nbsp; <i class="bi bi-geo-alt"></i> ${l.zona}, Medellín</p>
        <p class="text-gray-700">${l.detalle}</p>
        <ul class="flex flex-wrap gap-2">${l.tags.map((t) => `<li class="rounded-full bg-emerald-50 px-3 py-1 text-sm text-emerald-800">${t}</li>`).join('')}</ul>
        <div class="flex flex-wrap gap-3 pt-2">
          <a href="${maps(l)}" target="_blank" rel="noopener" class="rounded bg-emerald-900 px-4 py-2 text-white hover:bg-emerald-700"><i class="bi bi-map"></i> Cómo llegar</a>
          <button data-cerrar class="rounded border border-emerald-900 px-4 py-2 text-emerald-900 hover:bg-emerald-50">Volver al catálogo</button>
        </div></div>`;
    if (!modal.open) { modal.showModal(); document.body.classList.add('overflow-hidden'); } // showModal: fondo oscuro, foco atrapado y ESC gratis
  }

  // Un solo "oyente" para clics en toda la página (delegación): evita un listener por botón.
  document.addEventListener('click', (e) => {
    const b = e.target.closest('[data-fav],[data-detalle],[data-filtro],[data-cerrar]'); // ¿se pulsó algún botón nuestro?
    if (b) {
      if (b.dataset.fav) alternarFav(b.dataset.fav);
      else if (b.dataset.detalle) abrirModal(b.dataset.detalle);
      else if (b.dataset.filtro) { filtro = b.dataset.filtro; pintar(); }
      else modal.close();
    } else if (e.target === modal) modal.close();                    // clic en el fondo oscuro cierra el modal
  });
  modal.addEventListener('close', () => document.body.classList.remove('overflow-hidden')); // devuelve el scroll al cerrar
  $('#buscador').addEventListener('input', (e) => { texto = e.target.value; pintar(); });    // buscar mientras se escribe
  document.addEventListener('error', (e) => {                        // si una foto no existe, usa la imagen de reemplazo
    if (e.target.tagName === 'IMG' && !e.target.src.endsWith('placeholder.svg')) e.target.src = `${raiz}img/placeholder.svg`;
  }, true);                                                          // true: los errores de imagen no "burbujean", se captura

  pintar();                                                          // primer dibujo al cargar
})();
